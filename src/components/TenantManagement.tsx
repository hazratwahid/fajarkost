import React, { useState } from 'react';
import { Tenant, Room } from '../types';
import { formatIDR, formatDateIndo } from '../lib/storage';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  CreditCard, 
  Calendar, 
  ArrowRightLeft, 
  LogOut, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  UserCheck,
  Lock,
  Trash2,
  Archive,
  Info
} from 'lucide-react';

interface TenantManagementProps {
  tenants: Tenant[];
  rooms: Room[];
  onAddTenant: (newTenant: Omit<Tenant, 'id'>) => void;
  onCheckoutTenant: (tenantId: string, notes: string) => void;
  onTransferRoom: (tenantId: string, newRoomId: string) => void;
  onUpdateAutoRenew: (tenantId: string, isAutoRenew: boolean) => void;
  onDeleteTenant?: (tenantId: string, deleteRelatedData?: boolean) => void;
}

export const TenantManagement: React.FC<TenantManagementProps> = ({
  tenants,
  rooms,
  onAddTenant,
  onCheckoutTenant,
  onTransferRoom,
  onUpdateAutoRenew,
  onDeleteTenant,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'graduated'>('all');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [deleteRelatedData, setDeleteRelatedData] = useState<boolean>(false);

  // Transfer form state
  const [targetRoomId, setTargetRoomId] = useState('');

  // Checkout form state
  const [checkoutNotes, setCheckoutNotes] = useState('Kamar rapi, kunci dikembalikan, deposit dikembalikan penuh.');

  // Check-in form state
  const [newTenantForm, setNewTenantForm] = useState({
    name: '',
    nik: '',
    phone: '',
    email: '',
    occupation: '',
    institution: '',
    emergencyName: '',
    emergencyRel: 'Orang Tua',
    emergencyPhone: '',
    roomId: '',
    startDate: '2026-11-01',
    durationMonths: 6,
    rentDueDay: 1,
    depositAmount: 2500000,
    isAutoRenew: true,
    notes: '',
  });

  const vacantRooms = rooms.filter(r => r.status === 'vacant');

  const filteredTenants = tenants.filter(t => {
    if (statusTab === 'active' && t.status !== 'active') return false;
    if (statusTab === 'graduated' && t.status !== 'graduated') return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const room = rooms.find(r => r.id === t.roomId);
    return (
      t.name.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      t.nik.includes(q) ||
      t.occupation.toLowerCase().includes(q) ||
      room?.number.includes(q)
    );
  });

  const handleRequestDelete = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setDeleteRelatedData(false);
  };

  const handleConfirmDelete = () => {
    if (!tenantToDelete) return;
    onDeleteTenant?.(tenantToDelete.id, deleteRelatedData);
    if (selectedTenant?.id === tenantToDelete.id) {
      setSelectedTenant(null);
    }
    setTenantToDelete(null);
  };

  const handleOpenCheckIn = (preselectedRoomId?: string) => {
    setNewTenantForm(prev => ({
      ...prev,
      roomId: preselectedRoomId || (vacantRooms[0]?.id ?? ''),
    }));
    setIsCheckInOpen(true);
  };

  const handleCreateCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantForm.name || !newTenantForm.phone || !newTenantForm.roomId) {
      alert('Mohon lengkapi nama penyewa, nomor WhatsApp, dan pilihan kamar.');
      return;
    }

    const start = new Date(newTenantForm.startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + Number(newTenantForm.durationMonths));

    const selectedRoom = rooms.find(r => r.id === newTenantForm.roomId);

    onAddTenant({
      name: newTenantForm.name,
      nik: newTenantForm.nik || '3171' + Math.floor(100000000000 + Math.random() * 900000000000),
      phone: newTenantForm.phone,
      email: newTenantForm.email || `${newTenantForm.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      occupation: newTenantForm.occupation || 'Karyawan Swasta',
      institution: newTenantForm.institution || 'Kantor BSD',
      emergencyContact: {
        name: newTenantForm.emergencyName || 'Keluarga',
        relationship: newTenantForm.emergencyRel,
        phone: newTenantForm.emergencyPhone || '08120000000',
      },
      roomId: newTenantForm.roomId,
      startDate: newTenantForm.startDate,
      endDate: end.toISOString().split('T')[0],
      rentDueDay: Number(newTenantForm.rentDueDay) || 1,
      depositAmount: Number(newTenantForm.depositAmount) || (selectedRoom?.basePrice ?? 2000000),
      isAutoRenew: newTenantForm.isAutoRenew,
      status: 'active',
      notes: newTenantForm.notes,
    });

    setIsCheckInOpen(false);
  };

  const handleExecuteTransfer = () => {
    if (!selectedTenant || !targetRoomId) return;
    onTransferRoom(selectedTenant.id, targetRoomId);
    setIsTransferOpen(false);
    setSelectedTenant(null);
  };

  const handleExecuteCheckout = () => {
    if (!selectedTenant) return;
    onCheckoutTenant(selectedTenant.id, checkoutNotes);
    setIsCheckoutOpen(false);
    setSelectedTenant(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Data Penghuni & Kontrak Sewa
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola profil digital penghuni, verifikasi KTP, kontak darurat, serta perpanjangan sewa otomatis
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari penghuni, NIK, kamar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            
            <button
              onClick={() => handleOpenCheckIn()}
              className="py-1.5 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Check-in Penghuni Baru
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-xs">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setStatusTab('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusTab === 'all'
                  ? 'bg-white dark:bg-slate-700 font-semibold text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua ({tenants.length})
            </button>
            <button
              onClick={() => setStatusTab('active')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusTab === 'active'
                  ? 'bg-white dark:bg-slate-700 font-semibold text-emerald-700 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Penghuni Aktif ({tenants.filter(t => t.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusTab('graduated')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                statusTab === 'graduated'
                  ? 'bg-white dark:bg-slate-700 font-semibold text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Archive className="w-3 h-3 text-slate-400" />
              Riwayat Check-out ({tenants.filter(t => t.status === 'graduated').length})
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            <Trash2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Opsi Hapus Aktif: Data penghuni & kontrak sewa dapat dihapus kapan saja agar data valid.</span>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-3 px-4">Kamar</th>
                <th className="py-3 px-4">Nama Penghuni</th>
                <th className="py-3 px-4">Kontak (WhatsApp)</th>
                <th className="py-3 px-4">Status Sewa</th>
                <th className="py-3 px-4">Periode Kontrak</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4">Deposit</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data penghuni pada kategori ini.
                  </td>
                </tr>
              ) : (
                filteredTenants.map(tenant => {
                  const room = rooms.find(r => r.id === tenant.roomId);
                  const isGraduated = tenant.status === 'graduated';

                  return (
                    <tr 
                      key={tenant.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          isGraduated 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' 
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          {room?.number || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {tenant.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          NIK: {tenant.nik}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <a 
                          href={`https://wa.me/${tenant.phone.replace(/^0/, '62')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <Phone className="w-3 h-3" />
                          {tenant.phone}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        {isGraduated ? (
                          <span 
                            title="Penyewa telah check-out (selesai sewa). Klik ikon tempat sampah untuk menghapus data jika perlu."
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                          >
                            <Archive className="w-2.5 h-2.5 text-slate-400" />
                            Sudah Checkout
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            Aktif
                          </span>
                        )}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{tenant.occupation}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px]">
                          {formatDateIndo(tenant.startDate)} - {formatDateIndo(tenant.endDate)}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${tenant.isAutoRenew ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {tenant.isAutoRenew ? 'Auto-perpanjang' : 'Tanpa auto-renew'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                        {isGraduated ? '-' : `Tgl ${tenant.rentDueDay} / bln`}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200">
                        {formatIDR(tenant.depositAmount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTenant(tenant)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                          >
                            Detail
                          </button>

                          {/* Delete Button available for ALL tenants */}
                          <button
                            onClick={() => handleRequestDelete(tenant)}
                            title={isGraduated ? "Hapus Riwayat Sewa (Data Check-out)" : "Batalkan / Hapus Data Penghuni & Kontrak"}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Profile Modal / Detail View */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm ${
                  selectedTenant.status === 'graduated'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {selectedTenant.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedTenant.name}
                    </h2>
                    {selectedTenant.status === 'graduated' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        <Lock className="w-2.5 h-2.5" />
                        Sudah Checkout (Arsip Terkunci)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kamar {rooms.find(r => r.id === selectedTenant.roomId)?.number || '-'} · {selectedTenant.status === 'graduated' ? 'Alumni Kost (Masa Sewa Selesai)' : 'Penyewa Aktif'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTenant(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Archive Notice if Graduated */}
            {selectedTenant.status === 'graduated' && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg flex items-start gap-2.5 text-xs">
                <Archive className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <strong className="block font-semibold text-slate-900 dark:text-white">
                    Riwayat Sewa (Alumni Selesai Check-out)
                  </strong>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Penghuni ini telah menyelesaikan masa sewa. Anda dapat menyimpan data ini sebagai riwayat arsip atau menghapusnya secara permanen untuk memvalidasi database kost.
                  </p>
                </div>
              </div>
            )}

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">Identitas Pribadi (KTP)</span>
                <div><span className="text-slate-500">NIK:</span> <span className="font-mono">{selectedTenant.nik}</span></div>
                <div><span className="text-slate-500">WhatsApp:</span> <span className="font-mono">{selectedTenant.phone}</span></div>
                <div><span className="text-slate-500">Email:</span> {selectedTenant.email}</div>
                <div><span className="text-slate-500">Profesi:</span> {selectedTenant.occupation} ({selectedTenant.institution})</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">Kontak Darurat (Wajib)</span>
                <div><span className="text-slate-500">Nama:</span> {selectedTenant.emergencyContact.name}</div>
                <div><span className="text-slate-500">Hubungan:</span> {selectedTenant.emergencyContact.relationship}</div>
                <div><span className="text-slate-500">Telepon:</span> <span className="font-mono">{selectedTenant.emergencyContact.phone}</span></div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">Kontrak & Finansial Sewa</span>
                <div><span className="text-slate-500">Mulai:</span> {formatDateIndo(selectedTenant.startDate)}</div>
                <div><span className="text-slate-500">Berakhir:</span> {formatDateIndo(selectedTenant.endDate)}</div>
                <div><span className="text-slate-500">Deposit Jaminan:</span> <span className="font-mono">{formatIDR(selectedTenant.depositAmount)}</span></div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Auto-Perpanjang:</span>
                  {selectedTenant.status === 'graduated' ? (
                    <span className="text-[10px] text-slate-400 font-mono">Selesai (Off)</span>
                  ) : (
                    <button
                      onClick={() => onUpdateAutoRenew(selectedTenant.id, !selectedTenant.isAutoRenew)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        selectedTenant.isAutoRenew 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {selectedTenant.isAutoRenew ? 'Aktif (On)' : 'Non-aktif (Off)'}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">Catatan Tambahan & Kendaraan</span>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  {selectedTenant.notes || 'Tidak ada catatan khusus.'}
                </p>
              </div>

            </div>

            {/* Operational Workflow Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {selectedTenant.status === 'active' && (
                  <>
                    <button
                      onClick={() => setIsTransferOpen(true)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md flex items-center gap-1.5"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Pindah Kamar (Transfer)
                    </button>
                    <button
                      onClick={() => setIsCheckoutOpen(true)}
                      className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-md flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Check-out / Selesai Sewa
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    const t = selectedTenant;
                    setSelectedTenant(null);
                    handleRequestDelete(t);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-md flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {selectedTenant.status === 'graduated' ? 'Hapus Riwayat Sewa' : 'Hapus Data & Kontrak'}
                </button>
              </div>

              <button
                onClick={() => setSelectedTenant(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Transfer Room Modal */}
      {isTransferOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Pindah Kamar: {selectedTenant.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pindahkan penyewa dari Kamar {rooms.find(r => r.id === selectedTenant.roomId)?.number} ke kamar kosong lain. Kamar lama akan otomatis ditandai untuk dibersihkan.
            </p>

            <div className="space-y-2 text-xs">
              <label className="block font-medium text-slate-700 dark:text-slate-300">Pilih Kamar Tujuan Kosong:</label>
              <select
                value={targetRoomId}
                onChange={(e) => setTargetRoomId(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="">-- Pilih Kamar Siap Huni --</option>
                {vacantRooms.map(r => (
                  <option key={r.id} value={r.id}>
                    Kamar {r.number} (Lt {r.floor} · {r.type} · {formatIDR(r.basePrice)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsTransferOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                Batal
              </button>
              <button
                disabled={!targetRoomId}
                onClick={handleExecuteTransfer}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-50"
              >
                Konfirmasi Pindah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Tenant Modal */}
      {isCheckoutOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Proses Check-out Sewa: {selectedTenant.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kamar {rooms.find(r => r.id === selectedTenant.roomId)?.number} akan dialihkan ke status Perbaikan/Pembersihan. Deposit yang dikembalikan: <span className="font-mono font-semibold">{formatIDR(selectedTenant.depositAmount)}</span>.
            </p>

            {/* Checkout Information Notice */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Konfirmasi Check-out Selesai Sewa:</strong>
                <span>Setelah check-out diselesaikan, kamar akan dialihkan untuk pembersihan, dan data penghuni disimpan di tab <strong>Riwayat Check-out</strong>. Anda tetap dapat menghapus data ini sewaktu-waktu jika diperlukan untuk validasi database.</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-medium text-slate-700 dark:text-slate-300">Catatan Kondisi Kamar & Pengembalian Deposit:</label>
              <textarea
                rows={3}
                value={checkoutNotes}
                onChange={(e) => setCheckoutNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteCheckout}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md"
              >
                Selesaikan Check-out Sewa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Modal Form */}
      {isCheckInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Formulir Check-in Penghuni Baru
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Input data identitas digital, kontak darurat, serta kontrak sewa awal
                </p>
              </div>
              <button 
                onClick={() => setIsCheckInOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCheckIn} className="space-y-4 text-xs">
              
              {/* Room Choice */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Kamar yang Siap Huni:
                </label>
                <select
                  required
                  value={newTenantForm.roomId}
                  onChange={(e) => {
                    const r = rooms.find(rm => rm.id === e.target.value);
                    setNewTenantForm(prev => ({
                      ...prev,
                      roomId: e.target.value,
                      depositAmount: r?.basePrice ?? prev.depositAmount,
                    }));
                  }}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">-- Pilih Kamar --</option>
                  {vacantRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Kamar {r.number} (Lt {r.floor} · {r.type} · {formatIDR(r.basePrice)}/bln)
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Sesuai KTP:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rizki"
                    value={newTenantForm.name}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp Aktif:</label>
                  <input
                    type="text"
                    required
                    placeholder="0812xxxxxxxx"
                    value={newTenantForm.phone}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">NIK (KTP):</label>
                  <input
                    type="text"
                    placeholder="3171xxxxxxxxxxxx (16 digit)"
                    value={newTenantForm.nik}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, nik: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email:</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={newTenantForm.email}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Pekerjaan / Mahasiswa:</label>
                  <input
                    type="text"
                    placeholder="Software Engineer / Mahasiswa"
                    value={newTenantForm.occupation}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, occupation: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Perusahaan / Universitas:</label>
                  <input
                    type="text"
                    placeholder="PT Telkom / Univ Prasetiya Mulya"
                    value={newTenantForm.institution}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, institution: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">Kontak Darurat (Emergency Contact):</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Kontak"
                    value={newTenantForm.emergencyName}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, emergencyName: e.target.value })}
                    className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                  <select
                    value={newTenantForm.emergencyRel}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, emergencyRel: e.target.value })}
                    className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  >
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Saudara Kandung">Saudara Kandung</option>
                    <option value="Suami / Istri">Suami / Istri</option>
                    <option value="Kerabat">Kerabat</option>
                  </select>
                  <input
                    type="text"
                    placeholder="No. Telp Darurat"
                    value={newTenantForm.emergencyPhone}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, emergencyPhone: e.target.value })}
                    className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Lease & Financial info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai Masuk:</label>
                  <input
                    type="date"
                    value={newTenantForm.startDate}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, startDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Durasi Sewa Awal:</label>
                  <select
                    value={newTenantForm.durationMonths}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, durationMonths: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value={1}>1 Bulan</option>
                    <option value={3}>3 Bulan</option>
                    <option value={6}>6 Bulan</option>
                    <option value={12}>12 Bulan (1 Tahun)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Uang Deposit Jaminan (Rp):</label>
                  <input
                    type="number"
                    value={newTenantForm.depositAmount}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, depositAmount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autorenew"
                  checked={newTenantForm.isAutoRenew}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, isAutoRenew: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="autorenew" className="text-slate-700 dark:text-slate-300 cursor-pointer">
                  Perpanjang kontrak sewa otomatis setiap bulan (Auto-Renew)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCheckInOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs"
                >
                  Konfirmasi Check-In
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Tenants & Contracts */}
      {tenantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Hapus Data Penghuni & Kontrak?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tindakan ini akan menghapus data dari sistem agar database lebih valid
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Nama Penghuni:</span>
                <span className="font-bold text-slate-900 dark:text-white">{tenantToDelete.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Kamar:</span>
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  Kamar {rooms.find(r => r.id === tenantToDelete.roomId)?.number || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status Saat Ini:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  tenantToDelete.status === 'graduated' 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' 
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                }`}>
                  {tenantToDelete.status === 'graduated' ? 'Riwayat Check-out (Alumni)' : 'Penghuni Aktif'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Periode Sewa:</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  {formatDateIndo(tenantToDelete.startDate)} - {formatDateIndo(tenantToDelete.endDate)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {tenantToDelete.status === 'active' ? (
                <span>
                  Penghuni ini masih berstatus <strong>Aktif</strong>. Menghapus data ini akan membatalkan kontrak sewa dan secara otomatis <strong>mengembalikan status kamar menjadi Kosong (Siap Huni)</strong>.
                </span>
              ) : (
                <span>
                  Penghuni ini berada di <strong>Riwayat Check-out</strong>. Menghapus data ini akan membersihkan arsip lama atau data uji coba agar database kost tetap akurat dan valid.
                </span>
              )}
            </p>

            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-lg">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-amber-900 dark:text-amber-200">
                <input
                  type="checkbox"
                  checked={deleteRelatedData}
                  onChange={(e) => setDeleteRelatedData(e.target.checked)}
                  className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 mt-0.5"
                />
                <span>
                  <strong>Hapus juga tagihan & tiket terkait</strong> (disarankan jika ini adalah data testing / salah input agar tidak ada data yatim).
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setTenantToDelete(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
