/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Room, 
  Tenant, 
  Invoice, 
  MaintenanceTicket, 
  FinancialRecord, 
  MeterLog, 
  UserRole, 
  RoomStatus,
  RoomType,
  TicketStatus,
  StaffMember,
  CurrentUserSession,
  OwnerProfile,
  KostProfile
} from './types';
import { STAFF_MEMBERS, DEFAULT_OWNER_PROFILE, KOST_INFO } from './data/mockData';
import { 
  fetchKostData, 
  pushSyncUpdate, 
  subscribeToRealtimeSync, 
  forceSyncNow,
  SyncStatus 
} from './lib/api';
import { 
  getInitialAppState, 
  saveStoredData, 
  loadStoredData,
  resetAllData, 
  generateWhatsAppMessage, 
  formatIDR 
} from './lib/storage';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { RoomGrid } from './components/RoomGrid';
import { RoomConfigModal } from './components/RoomConfigModal';
import { TenantManagement } from './components/TenantManagement';
import { BillingManagement } from './components/BillingManagement';
import { MaintenanceSystem } from './components/MaintenanceSystem';
import { RoomControl } from './components/RoomControl';
import { TenantPortalView } from './components/TenantPortalView';
import { CaretakerDashboardView } from './components/CaretakerDashboardView';
import { AuthAccessModal } from './components/AuthAccessModal';
import { StaffAccessModal } from './components/StaffAccessModal';
import { UserManagementModal } from './components/UserManagementModal';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { ReceiptModal } from './components/ReceiptModal';
import { RoomDetailModal } from './components/RoomDetailModal';
import { Send, Copy, ExternalLink, RotateCcw } from 'lucide-react';

export default function App() {
  const [initialData] = useState(getInitialAppState);

  const [rooms, setRooms] = useState<Room[]>(initialData.rooms);
  const [tenants, setTenants] = useState<Tenant[]>(initialData.tenants);
  const [invoices, setInvoices] = useState<Invoice[]>(initialData.invoices);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(initialData.tickets);
  const [expenses, setExpenses] = useState<FinancialRecord[]>(initialData.expenses);
  const [meterLogs, setMeterLogs] = useState<MeterLog[]>(initialData.meterLogs);

  // Owner Profile state (H. Fajar Nugraha)
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>(() => {
    return loadStoredData<OwnerProfile>('sikost_owner_profile_v1', DEFAULT_OWNER_PROFILE);
  });

  // Kost Profile state (Kost Fajar Balikpapan)
  const [kostProfile, setKostProfile] = useState<KostProfile>(() => {
    return loadStoredData<KostProfile>('sikost_kost_profile_v1', KOST_INFO);
  });

  // Staff Members list (Pak Budi, Pak Joko, etc.)
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    return loadStoredData<StaffMember[]>('sikost_staff_v1', STAFF_MEMBERS);
  });

  // Active Authenticated Session (Owner, Penjaga, or Penghuni)
  const [currentSession, setCurrentSession] = useState<CurrentUserSession>(() => {
    return loadStoredData<CurrentUserSession>('sikost_session_v1', {
      role: 'owner',
      userId: ownerProfile.id,
      name: ownerProfile.name,
      title: ownerProfile.title,
      emailOrPhone: `${ownerProfile.email} · ${ownerProfile.phone}`,
    });
  });

  // App Navigation & Role
  const [role, setRole] = useState<UserRole>(currentSession.role);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (currentSession.role === 'staff') return 'caretaker_dashboard';
    if (currentSession.role === 'tenant') return 'tenant_portal';
    return 'dashboard';
  });
  const [activeTenantId, setActiveTenantId] = useState<string>(
    currentSession.tenantId || initialData.tenants[0]?.id || 'tenant-1'
  );

  // Dark Mode Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Real-time Multi-Device Sync Status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const isReceivingRemoteUpdate = useRef(false);
  const isInitialSynced = useRef(false);

  // Subscribe to central server real-time SSE & fetch initial snapshot
  useEffect(() => {
    let isMounted = true;

    fetchKostData().then(serverData => {
      if (serverData && isMounted) {
        isReceivingRemoteUpdate.current = true;
        if (serverData.rooms) setRooms(serverData.rooms);
        if (serverData.tenants) setTenants(serverData.tenants);
        if (serverData.invoices) setInvoices(serverData.invoices);
        if (serverData.tickets) setTickets(serverData.tickets);
        if (serverData.expenses) setExpenses(serverData.expenses);
        if (serverData.meterLogs) setMeterLogs(serverData.meterLogs);
        if (serverData.staffList) setStaffList(serverData.staffList);
        if (serverData.ownerProfile) setOwnerProfile(serverData.ownerProfile);
        if (serverData.kostProfile) setKostProfile(serverData.kostProfile);
        isInitialSynced.current = true;
        setTimeout(() => {
          isReceivingRemoteUpdate.current = false;
        }, 300);
      } else if (isMounted) {
        isInitialSynced.current = true;
      }
    });

    const unsubscribe = subscribeToRealtimeSync(
      (freshData) => {
        if (!isMounted) return;
        isReceivingRemoteUpdate.current = true;
        if (freshData.rooms) setRooms(freshData.rooms);
        if (freshData.tenants) setTenants(freshData.tenants);
        if (freshData.invoices) setInvoices(freshData.invoices);
        if (freshData.tickets) setTickets(freshData.tickets);
        if (freshData.expenses) setExpenses(freshData.expenses);
        if (freshData.meterLogs) setMeterLogs(freshData.meterLogs);
        if (freshData.staffList) setStaffList(freshData.staffList);
        if (freshData.ownerProfile) setOwnerProfile(freshData.ownerProfile);
        if (freshData.kostProfile) setKostProfile(freshData.kostProfile);
        isInitialSynced.current = true;
        setTimeout(() => {
          isReceivingRemoteUpdate.current = false;
        }, 300);
      },
      (status) => {
        if (isMounted) setSyncStatus(status);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Debounced push to server whenever local state changes, broadcasting to other devices
  useEffect(() => {
    // DO NOT push until this device has successfully received central data from the server
    if (!isInitialSynced.current) {
      return;
    }
    // DO NOT push back updates that were just received from another device
    if (isReceivingRemoteUpdate.current) {
      return;
    }

    const timer = setTimeout(() => {
      pushSyncUpdate({
        rooms,
        tenants,
        invoices,
        tickets,
        expenses,
        meterLogs,
        staffList,
        ownerProfile,
        kostProfile,
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [rooms, tenants, invoices, tickets, expenses, meterLogs, staffList, ownerProfile, kostProfile]);

  // Persist State Changes
  useEffect(() => {
    saveStoredData('sikost_rooms_v1', rooms);
  }, [rooms]);

  useEffect(() => {
    saveStoredData('sikost_tenants_v1', tenants);
  }, [tenants]);

  useEffect(() => {
    saveStoredData('sikost_invoices_v1', invoices);
  }, [invoices]);

  useEffect(() => {
    saveStoredData('sikost_tickets_v1', tickets);
  }, [tickets]);

  useEffect(() => {
    saveStoredData('sikost_expenses_v1', expenses);
  }, [expenses]);

  useEffect(() => {
    saveStoredData('sikost_meter_logs_v1', meterLogs);
  }, [meterLogs]);

  useEffect(() => {
    saveStoredData('sikost_staff_v1', staffList);
  }, [staffList]);

  useEffect(() => {
    saveStoredData('sikost_owner_profile_v1', ownerProfile);
  }, [ownerProfile]);

  useEffect(() => {
    saveStoredData('sikost_kost_profile_v1', kostProfile);
  }, [kostProfile]);

  useEffect(() => {
    saveStoredData('sikost_session_v1', currentSession);
  }, [currentSession]);

  // Modals state
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [userManagementTab, setUserManagementTab] = useState<'owner' | 'staff' | 'kost'>('owner');
  const [receiptModalInvoice, setReceiptModalInvoice] = useState<Invoice | null>(null);
  const [selectedRoomDetailId, setSelectedRoomDetailId] = useState<string | null>(null);
  const [isRoomConfigOpen, setIsRoomConfigOpen] = useState(false);
  const [roomConfigTargetId, setRoomConfigTargetId] = useState<string | null>(null);

  // WhatsApp quick sender modal
  const [waModalInvoice, setWaModalInvoice] = useState<Invoice | null>(null);
  const [copiedWA, setCopiedWA] = useState(false);

  // Unverified invoices & open tickets count
  const unverifiedCount = invoices.filter(i => i.status === 'verifying').length;
  const openTicketsCount = tickets.filter(t => t.status === 'open').length;

  // Handlers: Tenant Management
  const handleAddTenant = (newTenantData: Omit<Tenant, 'id'>) => {
    const newId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      ...newTenantData,
      id: newId,
    };

    setTenants(prev => [newTenant, ...prev]);

    // Update Room to occupied
    setRooms(prev => prev.map(r => {
      if (r.id === newTenantData.roomId) {
        return {
          ...r,
          status: 'occupied',
          currentTenantId: newId,
        };
      }
      return r;
    }));
  };

  const handleCheckoutTenant = (tenantId: string, notes: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    // Mark tenant graduated
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, status: 'graduated', notes: `${t.notes || ''} [Checkout: ${notes}]` };
      }
      return t;
    }));

    // Update room to maintenance / cleaning
    setRooms(prev => prev.map(r => {
      if (r.id === tenant.roomId) {
        return {
          ...r,
          status: 'maintenance',
          currentTenantId: undefined,
        };
      }
      return r;
    }));
  };

  const handleTransferRoom = (tenantId: string, newRoomId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;
    const oldRoomId = tenant.roomId;

    // Update tenant room
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, roomId: newRoomId };
      }
      return t;
    }));

    // Update rooms
    setRooms(prev => prev.map(r => {
      if (r.id === oldRoomId) {
        return { ...r, status: 'maintenance', currentTenantId: undefined };
      }
      if (r.id === newRoomId) {
        return { ...r, status: 'occupied', currentTenantId: tenantId };
      }
      return r;
    }));
  };

  const handleUpdateAutoRenew = (tenantId: string, isAutoRenew: boolean) => {
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, isAutoRenew } : t));
  };

  const handleDeleteTenant = (tenantId: string, deleteRelatedData: boolean = false) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    // Jika kamar sedang ditempati penghuni ini, kembalikan kamar menjadi kosong (vacant)
    setRooms(prev => prev.map(r => {
      if (r.currentTenantId === tenantId) {
        return { ...r, status: 'vacant', currentTenantId: undefined };
      }
      return r;
    }));

    // Hapus data penghuni & kontrak sewa dari daftar
    setTenants(prev => prev.filter(t => t.id !== tenantId));

    // Jika dipilih, hapus juga data transaksi/tagihan dan tiket terkait untuk pembersihan data valid
    if (deleteRelatedData) {
      setInvoices(prev => prev.filter(inv => inv.tenantId !== tenantId));
      setTickets(prev => prev.filter(tkt => tkt.tenantId !== tenantId));
    }

    // Perbarui activeTenantId bila penghuni yang sedang aktif di portal dihapus
    if (activeTenantId === tenantId) {
      const remaining = tenants.filter(t => t.id !== tenantId);
      if (remaining.length > 0) {
        setActiveTenantId(remaining[0].id);
      }
    }
  };

  const handleUpdateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status } : r));
  };

  // Handlers: Room Configuration (Number, Price, Facilities, Add Unit, Batch Adjustment)
  const handleUpdateRoom = (roomId: string, updatedData: Partial<Room>) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          ...updatedData,
        };
      }
      return r;
    }));
  };

  const handleAddRoom = (newRoomData: Omit<Room, 'id'>) => {
    const newId = `room-${Date.now()}`;
    const newRoom: Room = {
      ...newRoomData,
      id: newId,
    };
    setRooms(prev => [...prev, newRoom]);
  };

  const handleBatchUpdatePrice = (
    filterType: RoomType | 'all',
    adjustmentType: 'fixed' | 'delta' | 'percentage',
    value: number
  ) => {
    setRooms(prev => prev.map(r => {
      if (filterType !== 'all' && r.type !== filterType) {
        return r;
      }

      let newPrice = r.basePrice;
      if (adjustmentType === 'fixed') {
        newPrice = value;
      } else if (adjustmentType === 'delta') {
        newPrice = r.basePrice + value;
      } else if (adjustmentType === 'percentage') {
        newPrice = Math.round((r.basePrice * (1 + value / 100)) / 10000) * 10000;
      }

      newPrice = Math.max(500000, newPrice);

      return {
        ...r,
        basePrice: newPrice,
      };
    }));
  };

  // Handlers: Billing & Invoices
  const handleCreateInvoice = (newInvoiceData: Omit<Invoice, 'id'>) => {
    const newId = `inv-${Date.now()}`;
    const newInvoice: Invoice = {
      ...newInvoiceData,
      id: newId,
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Update room status to pending_payment if not occupied
    setRooms(prev => prev.map(r => {
      if (r.id === newInvoiceData.roomId && r.status === 'occupied') {
        return { ...r, status: 'pending_payment' };
      }
      return r;
    }));
  };

  const handleVerifyPayment = (invoiceId: string, verified: boolean, notes?: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    if (verified) {
      setInvoices(prev => prev.map(i => {
        if (i.id === invoiceId) {
          return {
            ...i,
            status: 'paid',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: i.paymentMethod || 'Transfer BCA',
            verifiedBy: role === 'owner' ? 'Owner (Super Admin)' : 'Pak Budi (Caretaker)',
            notes,
          };
        }
        return i;
      }));

      // Update Room back to occupied
      setRooms(prev => prev.map(r => {
        if (r.id === inv.roomId) {
          return { ...r, status: 'occupied' };
        }
        return r;
      }));

      // Automatically log to Financial Ledger as Income
      const newIncomeRecord: FinancialRecord = {
        id: `exp-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: 'Sewa Kamar',
        description: `Pembayaran Sewa Kamar ${rooms.find(r => r.id === inv.roomId)?.number} (${inv.periodMonth})`,
        amount: inv.totalAmount,
        roomId: inv.roomId,
        invoiceId: inv.id,
      };

      setExpenses(prev => [newIncomeRecord, ...prev]);
    } else {
      setInvoices(prev => prev.map(i => {
        if (i.id === invoiceId) {
          return {
            ...i,
            status: 'overdue',
            notes: notes || 'Bukti transfer tidak valid atau ditolak admin.',
          };
        }
        return i;
      }));
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.filter(i => i.id !== invoiceId));
  };

  const handleAddExpense = (newExpenseData: Omit<FinancialRecord, 'id'>) => {
    const newId = `exp-${Date.now()}`;
    const newExpense: FinancialRecord = {
      ...newExpenseData,
      id: newId,
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  // Handlers: Maintenance Tickets
  const handleCreateTicket = (ticketData: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'reportedAt'>) => {
    const ticketNum = `TCK-202611-${(tickets.length + 1).toString().padStart(2, '0')}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    const newTicket: MaintenanceTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      ticketNumber: ticketNum,
      reportedAt: formattedDate,
    };

    setTickets(prev => [newTicket, ...prev]);
  };

  const handleUpdateTicketStatus = (
    ticketId: string, 
    status: TicketStatus, 
    assignedStaff?: string, 
    expenseAmount?: number, 
    notes?: string
  ) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status,
          assignedStaff: assignedStaff || t.assignedStaff,
          expenseAmount: expenseAmount !== undefined ? expenseAmount : t.expenseAmount,
          resolutionNotes: notes || t.resolutionNotes,
          resolvedAt: status === 'resolved' ? new Date().toISOString().split('T')[0] : t.resolvedAt,
          expenseLoggedToFinance: expenseAmount && expenseAmount > 0 ? true : t.expenseLoggedToFinance,
        };
      }
      return t;
    }));

    // If there is an expense logged and not already added to finance, add it
    if (expenseAmount && expenseAmount > 0 && !ticket.expenseLoggedToFinance) {
      const room = rooms.find(r => r.id === ticket.roomId);
      const repairExpense: FinancialRecord = {
        id: `exp-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: 'Maintenance',
        description: `Perbaikan: ${ticket.title} (Kamar ${room?.number || '-'})`,
        amount: expenseAmount,
        roomId: ticket.roomId,
      };
      setExpenses(prev => [repairExpense, ...prev]);
    }
  };

  // Handlers: Meter & PIN
  const handleUpdateMeter = (roomId: string, newKwh: number, recordedBy: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const previousKwh = room.currentMeterKwh;
    const consumed = Math.max(0, newKwh - previousKwh);

    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          lastMeterKwh: previousKwh,
          currentMeterKwh: newKwh,
        };
      }
      return r;
    }));

    // Log to meterLogs
    const newLog: MeterLog = {
      id: `mlog-${Date.now()}`,
      roomId,
      date: new Date().toISOString().split('T')[0],
      previousKwh,
      currentKwh: newKwh,
      consumedKwh: consumed,
      recordedBy,
      billed: false,
    };

    setMeterLogs(prev => [newLog, ...prev]);
  };

  const handleGenerateNewPin = (roomId: string) => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, doorPin: newPin } : r));
  };

  // Handlers: Tenant Portal Proof Upload
  const handleTenantUploadProof = (invoiceId: string, proofUrl: string, method: any) => {
    setInvoices(prev => prev.map(i => {
      if (i.id === invoiceId) {
        return {
          ...i,
          status: 'verifying',
          paymentMethod: method,
          proofReceiptUrl: proofUrl,
          notes: 'Penghuni telah mengunggah bukti bayar transfer. Menunggu verifikasi admin.',
        };
      }
      return i;
    }));
  };

  // Handlers: Authentication & Role Switcher
  const handleSelectAccess = (newSession: CurrentUserSession) => {
    setCurrentSession(newSession);
    setRole(newSession.role);

    if (newSession.role === 'tenant' && newSession.tenantId) {
      setActiveTenantId(newSession.tenantId);
      setActiveTab('tenant_portal');
    } else if (newSession.role === 'staff') {
      setActiveTab('caretaker_dashboard');
    } else if (newSession.role === 'owner') {
      setActiveTab('dashboard');
    }
  };

  const handleAddStaff = (newStaffData: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...newStaffData,
      id: `stf-${Date.now()}`,
    };
    setStaffList(prev => [...prev, newStaff]);
  };

  const handleUpdateStaff = (staffId: string, updatedData: Partial<StaffMember>) => {
    setStaffList(prev => prev.map(s => s.id === staffId ? { ...s, ...updatedData } : s));
    if (currentSession.userId === staffId) {
      setCurrentSession(prev => ({
        ...prev,
        name: updatedData.name || prev.name,
        title: updatedData.role ? `${updatedData.role} (Caretaker On-Site)` : prev.title,
        emailOrPhone: updatedData.phone || prev.emailOrPhone,
        staffRole: updatedData.role || prev.staffRole,
        shift: updatedData.shift || prev.shift,
      }));
    }
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaffList(prev => prev.filter(s => s.id !== staffId));
  };

  const handleUpdateOwnerProfile = (updated: OwnerProfile) => {
    setOwnerProfile(updated);
    if (currentSession.role === 'owner') {
      setCurrentSession(prev => ({
        ...prev,
        name: updated.name,
        title: updated.title,
        emailOrPhone: `${updated.email} · ${updated.phone}`,
      }));
    }
  };

  const handleUpdateKostProfile = (updated: KostProfile) => {
    setKostProfile(updated);
  };

  const handleSwitchStaffSession = (staff: StaffMember) => {
    handleSelectAccess({
      role: 'staff',
      userId: staff.id,
      name: staff.name,
      title: `${staff.role} (Caretaker On-Site)`,
      emailOrPhone: staff.phone,
      staffRole: staff.role,
      shift: staff.shift || 'Shift Lapangan On-Site',
    });
  };

  // Reset to default mock data
  const handleResetData = () => {
    if (confirm(`Apakah Anda yakin ingin mengatur ulang data demo ${kostProfile.name} ke kondisi awal?`)) {
      resetAllData();
      window.location.reload();
    }
  };

  // Selected room for detail modal
  const selectedRoomForDetail = rooms.find(r => r.id === selectedRoomDetailId) || null;
  const tenantForSelectedRoom = tenants.find(t => t.id === selectedRoomForDetail?.currentTenantId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        currentSession={currentSession}
        kostName={kostProfile.name}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenUserManagement={(tab) => {
          setUserManagementTab(tab || 'owner');
          setIsUserManagementOpen(true);
        }}
        onOpenStaffModal={() => {
          setUserManagementTab('staff');
          setIsUserManagementOpen(true);
        }}
        onOpenRoomConfig={() => {
          setRoomConfigTargetId(null);
          setIsRoomConfigOpen(true);
        }}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        isDark={isDark}
        toggleDark={() => setIsDark(!isDark)}
        unverifiedCount={unverifiedCount}
        openTicketsCount={openTicketsCount}
        syncStatus={syncStatus}
        onLogout={() => setIsAuthModalOpen(true)}
        onForceSync={() => forceSyncNow()}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* 1. Akses Penghuni (Tenant Portal) */}
        {role === 'tenant' ? (
          <TenantPortalView
            tenants={tenants}
            rooms={rooms}
            invoices={invoices}
            tickets={tickets}
            activeTenantId={activeTenantId}
            setActiveTenantId={setActiveTenantId}
            onUploadPaymentProof={handleTenantUploadProof}
            onSubmitMaintenance={handleCreateTicket}
          />
        ) : role === 'staff' ? (
          /* 2. Akses Penjaga Kost (Caretaker & Staf Lapangan) */
          <>
            {activeTab === 'rooms' && (
              <RoomGrid
                rooms={rooms}
                tenants={tenants}
                onSelectRoom={(roomId) => setSelectedRoomDetailId(roomId)}
                onOpenRoomConfig={undefined}
                onOpenCheckInModal={() => setActiveTab('rooms')}
                onOpenMeterModal={() => setActiveTab('control')}
                onOpenTicketModal={() => setActiveTab('tickets')}
                onOpenBillModal={() => setActiveTab('control')}
                onUpdateRoomStatus={handleUpdateRoomStatus}
              />
            )}

            {activeTab === 'tickets' && (
              <MaintenanceSystem
                tickets={tickets}
                rooms={rooms}
                tenants={tenants}
                onCreateTicket={handleCreateTicket}
                onUpdateTicketStatus={handleUpdateTicketStatus}
              />
            )}

            {activeTab === 'control' && (
              <RoomControl
                rooms={rooms}
                meterLogs={meterLogs}
                onUpdateMeter={handleUpdateMeter}
                onGenerateNewPin={handleGenerateNewPin}
              />
            )}

            {(activeTab === 'caretaker_dashboard' || (activeTab !== 'rooms' && activeTab !== 'tickets' && activeTab !== 'control')) && (
              <CaretakerDashboardView
                rooms={rooms}
                tenants={tenants}
                tickets={tickets}
                meterLogs={meterLogs}
                currentStaffName={currentSession.name}
                kostName={kostProfile.name}
                onUpdateMeter={handleUpdateMeter}
                onGenerateNewPin={handleGenerateNewPin}
                onUpdateTicketStatus={handleUpdateTicketStatus}
                onSelectRoomDetail={(roomId) => setSelectedRoomDetailId(roomId)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}
          </>
        ) : (
          /* 3. Akses Owner (Pemilik Kost / Super Admin) */
          <>
            {activeTab === 'dashboard' && (
              <DashboardOverview
                rooms={rooms}
                tenants={tenants}
                invoices={invoices}
                tickets={tickets}
                expenses={expenses}
                onOpenWhatsAppModal={(inv) => setWaModalInvoice(inv)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onSelectRoom={(roomId) => setSelectedRoomDetailId(roomId)}
              />
            )}

            {activeTab === 'rooms' && (
              <RoomGrid
                rooms={rooms}
                tenants={tenants}
                onSelectRoom={(roomId) => setSelectedRoomDetailId(roomId)}
                onOpenRoomConfig={(roomId) => {
                  setRoomConfigTargetId(roomId || null);
                  setIsRoomConfigOpen(true);
                }}
                onOpenCheckInModal={(room) => {
                  setActiveTab('tenants');
                }}
                onOpenMeterModal={(room) => {
                  setActiveTab('control');
                }}
                onOpenTicketModal={(room) => {
                  setActiveTab('tickets');
                }}
                onOpenBillModal={(room) => {
                  setActiveTab('billing');
                }}
                onUpdateRoomStatus={handleUpdateRoomStatus}
              />
            )}

            {activeTab === 'tenants' && (
              <TenantManagement
                tenants={tenants}
                rooms={rooms}
                onAddTenant={handleAddTenant}
                onCheckoutTenant={handleCheckoutTenant}
                onTransferRoom={handleTransferRoom}
                onUpdateAutoRenew={handleUpdateAutoRenew}
                onDeleteTenant={handleDeleteTenant}
              />
            )}

            {activeTab === 'billing' && (
              <BillingManagement
                invoices={invoices}
                rooms={rooms}
                tenants={tenants}
                expenses={expenses}
                onVerifyPayment={handleVerifyPayment}
                onCreateInvoice={handleCreateInvoice}
                onOpenReceipt={(inv) => setReceiptModalInvoice(inv)}
                onAddExpense={handleAddExpense}
                onDeleteInvoice={handleDeleteInvoice}
              />
            )}

            {activeTab === 'tickets' && (
              <MaintenanceSystem
                tickets={tickets}
                rooms={rooms}
                tenants={tenants}
                onCreateTicket={handleCreateTicket}
                onUpdateTicketStatus={handleUpdateTicketStatus}
              />
            )}

            {activeTab === 'control' && (
              <RoomControl
                rooms={rooms}
                meterLogs={meterLogs}
                onUpdateMeter={handleUpdateMeter}
                onGenerateNewPin={handleGenerateNewPin}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 bg-white dark:bg-slate-900 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">SiKost Pro</span>
            <span>·</span>
            <span>PropTech Kost Bulanan {kostProfile.name}</span>
            <span>·</span>
            <span>All systems operational</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-mono"
            >
              Schema Prisma & SQL
            </button>
            <button
              onClick={handleResetData}
              title="Kembalikan data ke awal"
              className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Data Demo
            </button>
          </div>
        </div>
      </footer>

      {/* WhatsApp Quick Reminder Modal */}
      {waModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Kirim Pengingat WhatsApp
                </h3>
              </div>
              <button 
                onClick={() => setWaModalInvoice(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {(() => {
              const tenant = tenants.find(t => t.id === waModalInvoice.tenantId);
              const room = rooms.find(r => r.id === waModalInvoice.roomId);
              if (!tenant || !room) return null;

              const message = generateWhatsAppMessage(tenant, room, waModalInvoice, kostProfile);

              return (
                <>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Format pesan siap kirim untuk <span className="font-semibold text-slate-800 dark:text-slate-200">{tenant.name}</span> (Kamar {room.number}):
                  </p>

                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 rounded-lg">
                    <pre className="text-xs font-mono whitespace-pre-wrap text-slate-800 dark:text-slate-200 max-h-56 overflow-y-auto leading-relaxed">
                      {message}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(message);
                        setCopiedWA(true);
                        setTimeout(() => setCopiedWA(false), 2000);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedWA ? 'Tersalin!' : 'Salin Pesan'}
                    </button>

                    <button
                      onClick={() => {
                        const cleanPhone = tenant.phone.replace(/^0/, '62');
                        const encoded = encodeURIComponent(message);
                        window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
                      }}
                      className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Kirim via WhatsApp
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        invoice={receiptModalInvoice}
        room={rooms.find(r => r.id === receiptModalInvoice?.roomId)}
        tenant={tenants.find(t => t.id === receiptModalInvoice?.tenantId)}
        onClose={() => setReceiptModalInvoice(null)}
      />

      {/* Room Detail Modal */}
      <RoomDetailModal
        room={selectedRoomForDetail}
        tenant={tenantForSelectedRoom}
        invoices={invoices}
        tickets={tickets}
        onClose={() => setSelectedRoomDetailId(null)}
        onUpdateStatus={handleUpdateRoomStatus}
        onOpenRoomConfig={(roomId) => {
          setSelectedRoomDetailId(null);
          setRoomConfigTargetId(roomId);
          setIsRoomConfigOpen(true);
        }}
        onOpenCheckIn={(room) => {
          setActiveTab('tenants');
        }}
        onOpenMeter={(room) => {
          setActiveTab('control');
        }}
        onOpenTicket={(room) => {
          setActiveTab('tickets');
        }}
        onOpenBill={(room) => {
          setActiveTab('billing');
        }}
      />

      {/* Room Number & Price Configuration Modal */}
      <RoomConfigModal
        isOpen={isRoomConfigOpen}
        onClose={() => {
          setIsRoomConfigOpen(false);
          setRoomConfigTargetId(null);
        }}
        rooms={rooms}
        onUpdateRoom={handleUpdateRoom}
        onAddRoom={handleAddRoom}
        onBatchUpdatePrice={handleBatchUpdatePrice}
        initialSelectedRoomId={roomConfigTargetId}
      />

      {/* Role Selection & Authentication Switcher Modal */}
      <AuthAccessModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentSession={currentSession}
        onSelectAccess={handleSelectAccess}
        tenants={tenants}
        rooms={rooms}
        staffList={staffList}
        ownerProfile={ownerProfile}
        kostProfile={kostProfile}
        onLogout={() => {
          setCurrentSession({
            role: 'owner',
            userId: ownerProfile.id,
            name: ownerProfile.name,
            title: ownerProfile.title,
            emailOrPhone: `${ownerProfile.email} · ${ownerProfile.phone}`,
          });
          setRole('owner');
          setActiveTab('dashboard');
        }}
      />

      {/* Staff Management & Permissions Matrix Modal (Owner Only) */}
      <StaffAccessModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        staffList={staffList}
        onAddStaff={handleAddStaff}
        onDeleteStaff={handleDeleteStaff}
        onSwitchStaffSession={handleSwitchStaffSession}
      />

      {/* Dedicated Menu: Edit Owner & Penjaga Kost Modal */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        ownerProfile={ownerProfile}
        onUpdateOwnerProfile={handleUpdateOwnerProfile}
        staffList={staffList}
        onUpdateStaff={handleUpdateStaff}
        onAddStaff={handleAddStaff}
        onDeleteStaff={handleDeleteStaff}
        onSwitchStaffSession={handleSwitchStaffSession}
        kostProfile={kostProfile}
        onUpdateKostProfile={handleUpdateKostProfile}
        initialTab={userManagementTab}
      />

      {/* Production Database Schema & DDL Modal */}
      <DatabaseSchemaModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />

    </div>
  );
}
