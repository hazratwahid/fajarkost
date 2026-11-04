import React, { useState } from 'react';
import { UserRole, CurrentUserSession, Tenant, Room, StaffMember, OwnerProfile, KostProfile } from '../types';
import { STAFF_MEMBERS, DEFAULT_OWNER_PROFILE, KOST_INFO } from '../data/mockData';
import { 
  Shield, 
  Wrench, 
  User, 
  Key, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Phone, 
  Building2, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

interface AuthAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: CurrentUserSession;
  onSelectAccess: (session: CurrentUserSession) => void;
  tenants: Tenant[];
  rooms: Room[];
  staffList?: StaffMember[];
  ownerProfile?: OwnerProfile;
  kostProfile?: KostProfile;
}

export const AuthAccessModal: React.FC<AuthAccessModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onSelectAccess,
  tenants,
  rooms,
  staffList = STAFF_MEMBERS,
  ownerProfile = DEFAULT_OWNER_PROFILE,
  kostProfile = KOST_INFO,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<UserRole>(currentSession.role);

  // Owner state
  const [ownerPin, setOwnerPin] = useState('');
  const [ownerPinError, setOwnerPinError] = useState(false);

  // Penjaga/Staff state
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || 'stf-1');

  // Tenant state
  const activeTenants = tenants.filter(t => t.status === 'active');
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    currentSession.tenantId || activeTenants[0]?.id || ''
  );
  const [searchTenantQuery, setSearchTenantQuery] = useState('');

  const handleLoginOwner = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetPin = ownerProfile?.pin || '1234';
    if (ownerPin && ownerPin !== targetPin) {
      setOwnerPinError(true);
      return;
    }
    setOwnerPinError(false);

    onSelectAccess({
      role: 'owner',
      userId: ownerProfile.id,
      name: ownerProfile.name,
      title: ownerProfile.title,
      emailOrPhone: `${ownerProfile.email} · ${ownerProfile.phone}`,
    });
    onClose();
  };

  const handleLoginStaff = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId) || staffList[0];
    onSelectAccess({
      role: 'staff',
      userId: staff.id,
      name: staff.name,
      title: `${staff.role} (Caretaker On-Site)`,
      emailOrPhone: staff.phone,
      staffRole: staff.role,
      shift: 'Shift Lapangan On-Site',
    });
    onClose();
  };

  const handleLoginTenant = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;
    const room = rooms.find(r => r.id === tenant.roomId);

    onSelectAccess({
      role: 'tenant',
      userId: tenant.id,
      name: tenant.name,
      title: `Penghuni Kamar ${room?.number || '-'}`,
      emailOrPhone: tenant.phone,
      tenantId: tenant.id,
      tenantRoomNumber: room?.number,
    });
    onClose();
  };

  const filteredTenants = activeTenants.filter(t => {
    const r = rooms.find(rm => rm.id === t.roomId);
    const search = searchTenantQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(search) ||
      (r && r.number.toLowerCase().includes(search)) ||
      t.phone.includes(search)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Pilih Akses Pengguna SiKost Pro
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sistem manajemen kost bulanan dengan hak akses multi-peran: Pemilik Kost (Owner), Petugas Lapangan (Penjaga), dan Penghuni.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Current Active Session Alert */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-slate-500 dark:text-slate-400">Sedang Aktif: </span>
              <span className="font-semibold text-slate-900 dark:text-white">{currentSession.name}</span>
              <span className="ml-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                {currentSession.title}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Pilih peran di bawah untuk beralih</span>
        </div>

        {/* 3 Role Selection Tabs */}
        <div className="grid grid-cols-3 gap-2.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80">
          
          <button
            type="button"
            onClick={() => setActiveTab('owner')}
            className={`flex flex-col items-center sm:flex-row sm:items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'owner'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>1. Owner (Pemilik)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`flex flex-col items-center sm:flex-row sm:items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'staff'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4 text-blue-600" />
            <span>2. Penjaga Kost</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tenant')}
            className={`flex flex-col items-center sm:flex-row sm:items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tenant'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-purple-600" />
            <span>3. Penghuni Kost</span>
          </button>

        </div>

        {/* Tab 1: Owner Access */}
        {activeTab === 'owner' && (
          <div className="space-y-4 p-5 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    <Shield className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Akses Super Admin / Pemilik Kost
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Akses tertinggi dengan wewenang penuh atas operasional, keuangan rahasia, audit laba bersih, dan pengaturan tarif sewa.
                </p>
              </div>
            </div>

            {/* Permissions list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Monitoring Omset & Laporan Laba Bersih</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ubah Nomor Kamar & Penyesuaian Tarif</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Manajemen Kontrak Penghuni & Check-in/out</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Kelola Akses Petugas & Reset Data Demo</span>
              </div>
            </div>

            {/* Quick Demo PIN / Direct Login */}
            <div className="pt-2 border-t border-emerald-100 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-500">
                  Profil: <strong className="text-slate-800 dark:text-slate-200">{ownerProfile.name}</strong> (Owner)
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLoginOwner()}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Masuk sebagai Owner
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Staff / Penjaga Access */}
        {activeTab === 'staff' && (
          <div className="space-y-4 p-5 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 border border-blue-200/60 dark:border-blue-800/40 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    <Wrench className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Akses Penjaga Kost & Tim Lapangan (Caretaker)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Dikhususkan untuk operasional fisik kost harian. Dashboard dirancang praktis untuk pencatatan meteran listrik, penanganan keluhan fasilitas, dan bantuan kunci pintu.
                </p>
              </div>
            </div>

            {/* Scope explanation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="space-y-1.5 bg-blue-50/60 dark:bg-blue-950/30 p-2.5 rounded-lg border border-blue-200/60 dark:border-blue-800/50">
                <span className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Wewenang Operasional Penjaga:
                </span>
                <ul className="text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc text-[11px]">
                  <li>Pencatatan meteran listrik KWh per kamar</li>
                  <li>Cek & reset PIN kunci pintu darurat anak kost</li>
                  <li>Tangani tiket perbaikan & catat biaya riil nota</li>
                  <li>Inspeksi kamar kosong siap huni / pembersihan</li>
                </ul>
              </div>

              <div className="space-y-1.5 bg-amber-50/60 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-800/50">
                <span className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  Batasan Hak Akses:
                </span>
                <ul className="text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc text-[11px]">
                  <li>Laporan laba bersih & omzet kost dirahasiakan</li>
                  <li>Tidak dapat mengubah tarif sewa pokok kamar</li>
                  <li>Data penghuni yang sudah checkout terkunci</li>
                </ul>
              </div>
            </div>

            {/* Select Staff Member Profile */}
            <div className="space-y-2 pt-2 border-t border-blue-100 dark:border-blue-800/40">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Pilih Profil Petugas Lapangan:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {staffList.map((stf) => (
                  <button
                    key={stf.id}
                    type="button"
                    onClick={() => setSelectedStaffId(stf.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedStaffId === stf.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{stf.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        selectedStaffId === stf.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {stf.role}
                      </span>
                    </div>
                    <div className={`text-[11px] font-mono flex items-center gap-1 ${
                      selectedStaffId === stf.id ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      <Phone className="w-3 h-3" />
                      {stf.phone}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleLoginStaff(selectedStaffId)}
                className="w-full sm:w-auto px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Wrench className="w-3.5 h-3.5" />
                Masuk sebagai {staffList.find(s => s.id === selectedStaffId)?.name || 'Penjaga'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Tenant / Penghuni Access */}
        {activeTab === 'tenant' && (
          <div className="space-y-4 p-5 bg-gradient-to-br from-purple-50/50 via-white to-slate-50 dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-900 border border-purple-200/60 dark:border-purple-800/40 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                    <User className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Akses Portal Mandiri Penghuni Kost (Tenant Portal)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Portal khusus anak kost untuk melihat rincian tagihan sewa, upload bukti transfer bank/QRIS, membuat tiket keluhan, dan melihat PIN pintu kamar.
                </p>
              </div>
            </div>

            {/* Tenant Selection search */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pilih Akun Penghuni Aktif ({activeTenants.length} Penghuni):
                </label>
                <input
                  type="text"
                  placeholder="Cari nama atau nomor kamar..."
                  value={searchTenantQuery}
                  onChange={(e) => setSearchTenantQuery(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {filteredTenants.map((t) => {
                  const room = rooms.find(r => r.id === t.roomId);
                  const isSelected = selectedTenantId === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTenantId(t.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-purple-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate">{t.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                        }`}>
                          Kamar {room?.number || '-'}
                        </span>
                      </div>
                      <div className={`text-[10px] mt-1 flex items-center justify-between ${
                        isSelected ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        <span>{t.occupation}</span>
                        <span className="font-mono">Jatuh Tempo: Tgl {t.rentDueDay}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-purple-100 dark:border-purple-800/40 flex justify-end">
              <button
                type="button"
                onClick={() => handleLoginTenant(selectedTenantId)}
                className="w-full sm:w-auto px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Masuk ke Portal Penghuni ({tenants.find(t => t.id === selectedTenantId)?.name || 'Penghuni'})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Hak akses diamankan berbasis role-based security.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
