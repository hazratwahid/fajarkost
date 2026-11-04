import React, { useState } from 'react';
import { StaffMember, OwnerProfile, KostProfile, CurrentUserSession } from '../types';
import { 
  Shield, 
  Wrench, 
  User, 
  Plus, 
  Phone, 
  Mail,
  MapPin,
  CheckCircle2, 
  Lock, 
  Key, 
  Zap, 
  Building2,
  Edit3,
  UserCheck,
  Trash2,
  Save,
  Wifi,
  CreditCard,
  FileText,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerProfile: OwnerProfile;
  onUpdateOwnerProfile: (updated: OwnerProfile) => void;
  staffList: StaffMember[];
  onUpdateStaff: (staffId: string, updated: Partial<StaffMember>) => void;
  onAddStaff: (newStaff: Omit<StaffMember, 'id'>) => void;
  onDeleteStaff: (staffId: string) => void;
  onSwitchStaffSession: (staff: StaffMember) => void;
  kostProfile: KostProfile;
  onUpdateKostProfile: (updated: KostProfile) => void;
  initialTab?: 'owner' | 'staff' | 'kost';
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  ownerProfile,
  onUpdateOwnerProfile,
  staffList,
  onUpdateStaff,
  onAddStaff,
  onDeleteStaff,
  onSwitchStaffSession,
  kostProfile,
  onUpdateKostProfile,
  initialTab = 'owner',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'owner' | 'staff' | 'kost' | 'matrix'>(initialTab);

  // Owner form state
  const [ownerForm, setOwnerForm] = useState<OwnerProfile>({ ...ownerProfile });
  const [ownerSavedToast, setOwnerSavedToast] = useState(false);

  // Staff editing state
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffEditForm, setStaffEditForm] = useState<Partial<StaffMember>>({});
  const [isAddingNewStaff, setIsAddingNewStaff] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState<Omit<StaffMember, 'id'>>({
    name: '',
    role: 'Penjaga Kost',
    phone: '',
    email: '',
    shift: 'Shift Pagi - Sore (07:00 - 16:00)',
    active: true,
    permissions: {
      canRecordMeter: true,
      canHandleTickets: true,
      canViewDoorPin: true,
      canVerifyPayment: true,
    },
  });
  const [staffSuccessToast, setStaffSuccessToast] = useState<string | null>(null);

  // Kost profile state
  const [kostForm, setKostForm] = useState<KostProfile>({ ...kostProfile });
  const [kostSavedToast, setKostSavedToast] = useState(false);

  // Handle Owner Save
  const handleSaveOwner = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOwnerProfile(ownerForm);
    setOwnerSavedToast(true);
    setTimeout(() => setOwnerSavedToast(false), 3000);
  };

  // Handle Staff Edit Save
  const handleSaveStaffEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffId) return;

    onUpdateStaff(editingStaffId, staffEditForm);
    setEditingStaffId(null);
    setStaffEditForm({});
    setStaffSuccessToast('Data petugas berhasil diperbarui.');
    setTimeout(() => setStaffSuccessToast(null), 3000);
  };

  // Handle Add New Staff
  const handleAddNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name || !newStaffForm.phone) return;

    onAddStaff(newStaffForm);
    setIsAddingNewStaff(false);
    setNewStaffForm({
      name: '',
      role: 'Penjaga Kost',
      phone: '',
      email: '',
      shift: 'Shift Pagi - Sore (07:00 - 16:00)',
      active: true,
      permissions: {
        canRecordMeter: true,
        canHandleTickets: true,
        canViewDoorPin: true,
        canVerifyPayment: true,
      },
    });
    setStaffSuccessToast('Petugas baru berhasil ditambahkan.');
    setTimeout(() => setStaffSuccessToast(null), 3000);
  };

  // Handle Kost Profile Save
  const handleSaveKost = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateKostProfile(kostForm);
    setKostSavedToast(true);
    setTimeout(() => setKostSavedToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Kelola & Edit Owner, Penjaga Kost
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Konfigurasi profil pemilik, petugas operasional lapangan, dan identitas {kostProfile.name}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('owner')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'owner'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Edit Profil Owner</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'staff'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Edit Penjaga Kost ({staffList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kost')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'kost'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>3. Identitas Kost Fajar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'matrix'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-purple-600" />
            <span>Matriks Wewenang</span>
          </button>
        </div>

        {/* TAB 1: EDIT PROFIL OWNER */}
        {activeTab === 'owner' && (
          <form onSubmit={handleSaveOwner} className="space-y-4">
            
            {ownerSavedToast && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profil Owner berhasil disimpan dan langsung diperbarui di sistem!</span>
              </div>
            )}

            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                  {ownerForm.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {ownerForm.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {ownerForm.title} · {ownerForm.phone}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 self-start sm:self-auto">
                Pemilik Utama Kost Fajar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Lengkap Pemilik (Owner):
                </label>
                <input
                  type="text"
                  value={ownerForm.name}
                  onChange={(e) => setOwnerForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Misal: H. Fajar Nugraha"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Gelar / Jabatan:
                </label>
                <input
                  type="text"
                  value={ownerForm.title}
                  onChange={(e) => setOwnerForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Misal: Pemilik Kost & Super Admin"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nomor WhatsApp / Telepon:
                </label>
                <input
                  type="text"
                  value={ownerForm.phone}
                  onChange={(e) => setOwnerForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="0811xxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Resmi:
                </label>
                <input
                  type="email"
                  value={ownerForm.email}
                  onChange={(e) => setOwnerForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="owner@kostfajar.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Alamat Domisili / Kantor:
                </label>
                <input
                  type="text"
                  value={ownerForm.address || ''}
                  onChange={(e) => setOwnerForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Jl. MT Haryono No. 45, Balikpapan Selatan"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
                  <span>PIN Masuk Cepat Owner:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Default: 1234</span>
                </label>
                <input
                  type="text"
                  value={ownerForm.pin || '1234'}
                  onChange={(e) => setOwnerForm(prev => ({ ...prev, pin: e.target.value }))}
                  placeholder="4-6 digit angka"
                  maxLength={6}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan Profil Owner
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: EDIT & KELOLA PENJAGA KOST */}
        {activeTab === 'staff' && (
          <div className="space-y-4">
            
            {staffSuccessToast && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>{staffSuccessToast}</span>
              </div>
            )}

            {/* Top Toolbar */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Daftar Petugas Lapangan & Caretaker ({staffList.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Ubah data nama, nomor kontak WhatsApp, jam kerja, atau hak izin petugas
                </p>
              </div>

              {!isAddingNewStaff && !editingStaffId && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewStaff(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Petugas
                </button>
              )}
            </div>

            {/* Form Mode 1: Edit Existing Staff */}
            {editingStaffId && (
              <form onSubmit={handleSaveStaffEdit} className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200 dark:border-blue-800">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Data Petugas: {staffEditForm.name}
                  </h4>
                  <button
                    type="button"
                    onClick={() => { setEditingStaffId(null); setStaffEditForm({}); }}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Batal Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nama Petugas:
                    </label>
                    <input
                      type="text"
                      value={staffEditForm.name || ''}
                      onChange={(e) => setStaffEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Jabatan / Peran:
                    </label>
                    <select
                      value={staffEditForm.role || 'Penjaga Kost'}
                      onChange={(e) => setStaffEditForm(prev => ({ ...prev, role: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="Penjaga Kost">Penjaga Kost (Caretaker)</option>
                      <option value="Teknisi">Teknisi (AC, Listrik, Pipa)</option>
                      <option value="Cleaning">Cleaning Service / Housekeeping</option>
                      <option value="Pengelola">Pengelola Operasional</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nomor WhatsApp:
                    </label>
                    <input
                      type="text"
                      value={staffEditForm.phone || ''}
                      onChange={(e) => setStaffEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Shift Jam Kerja:
                    </label>
                    <input
                      type="text"
                      value={staffEditForm.shift || ''}
                      onChange={(e) => setStaffEditForm(prev => ({ ...prev, shift: e.target.value }))}
                      placeholder="Shift Pagi - Sore (07:00 - 16:00)"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Permissions checkboxes */}
                <div className="space-y-2 pt-2 border-t border-blue-200 dark:border-blue-800 text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Hak Izin Operasional:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={staffEditForm.permissions?.canRecordMeter ?? true}
                        onChange={(e) => setStaffEditForm(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions!, canRecordMeter: e.target.checked }
                        }))}
                        className="rounded text-blue-600"
                      />
                      <span>Pencatatan Meteran Listrik KWh</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={staffEditForm.permissions?.canHandleTickets ?? true}
                        onChange={(e) => setStaffEditForm(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions!, canHandleTickets: e.target.checked }
                        }))}
                        className="rounded text-blue-600"
                      />
                      <span>Tangani Tiket Perbaikan & Nota Biaya</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={staffEditForm.permissions?.canViewDoorPin ?? true}
                        onChange={(e) => setStaffEditForm(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions!, canViewDoorPin: e.target.checked }
                        }))}
                        className="rounded text-blue-600"
                      />
                      <span>Bantuan Kunci Pintu / PIN Smart Lock</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={staffEditForm.permissions?.canVerifyPayment ?? false}
                        onChange={(e) => setStaffEditForm(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions!, canVerifyPayment: e.target.checked }
                        }))}
                        className="rounded text-blue-600"
                      />
                      <span>Verifikasi Pembayaran Tunai / Transfer</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setEditingStaffId(null); setStaffEditForm({}); }}
                    className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan Perubahan Petugas
                  </button>
                </div>
              </form>
            )}

            {/* Form Mode 2: Add New Staff */}
            {isAddingNewStaff && (
              <form onSubmit={handleAddNewStaff} className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    Tambah Petugas Penjaga Baru
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewStaff(false)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nama Lengkap:
                    </label>
                    <input
                      type="text"
                      placeholder="Misal: Pak Anton Wahyudi"
                      value={newStaffForm.name}
                      onChange={(e) => setNewStaffForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Jabatan / Peran:
                    </label>
                    <select
                      value={newStaffForm.role}
                      onChange={(e) => setNewStaffForm(prev => ({ ...prev, role: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="Penjaga Kost">Penjaga Kost (Caretaker)</option>
                      <option value="Teknisi">Teknisi (AC, Listrik & Pipa)</option>
                      <option value="Cleaning">Cleaning Service / Housekeeping</option>
                      <option value="Pengelola">Pengelola Operasional</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nomor WhatsApp:
                    </label>
                    <input
                      type="text"
                      placeholder="0812xxxxxxxx"
                      value={newStaffForm.phone}
                      onChange={(e) => setNewStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Shift Jadwal Tugas:
                    </label>
                    <input
                      type="text"
                      placeholder="Shift Pagi - Sore (07:00 - 16:00)"
                      value={newStaffForm.shift || ''}
                      onChange={(e) => setNewStaffForm(prev => ({ ...prev, shift: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewStaff(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Simpan Petugas Baru
                  </button>
                </div>
              </form>
            )}

            {/* Staff Cards List */}
            <div className="grid grid-cols-1 gap-2.5">
              {staffList.map((stf) => (
                <div
                  key={stf.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {stf.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {stf.role}
                      </span>
                      {stf.active === false && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                          Non-aktif
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {stf.phone}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {stf.shift || 'Shift Lapangan On-Site'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-slate-500">
                      {stf.permissions?.canRecordMeter && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60">
                          ✓ Meter Listrik
                        </span>
                      )}
                      {stf.permissions?.canHandleTickets && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60">
                          ✓ Tiket Perbaikan
                        </span>
                      )}
                      {stf.permissions?.canViewDoorPin && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60">
                          ✓ Kunci Smart Lock
                        </span>
                      )}
                      {stf.permissions?.canVerifyPayment && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/60">
                          ✓ Verifikasi Bayar
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStaffId(stf.id);
                        setStaffEditForm({ ...stf });
                        setIsAddingNewStaff(false);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg flex items-center gap-1.5 transition-colors"
                      title="Edit nama, kontak, atau hak izin penjaga"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSwitchStaffSession(stf);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Masuk sebagai akun petugas ini"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Login Akun Ini
                    </button>

                    {staffList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus ${stf.name} dari daftar petugas?`)) {
                            onDeleteStaff(stf.id);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                        title="Hapus petugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: IDENTITAS KOST FAJAR BALIKPAPAN */}
        {activeTab === 'kost' && (
          <form onSubmit={handleSaveKost} className="space-y-4">
            
            {kostSavedToast && (
              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-semibold text-teal-800 dark:text-teal-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Identitas Kost Fajar Balikpapan berhasil disimpan dan diterapkan!</span>
              </div>
            )}

            <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 rounded-xl space-y-1">
              <span className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                Informasi & Identitas Properti Kost
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Data ini dicetak otomatis pada Kwitansi Resmi, Pesan Pengingat WhatsApp ke Penghuni, dan Portal Anak Kost.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Kost:
                </label>
                <input
                  type="text"
                  value={kostForm.name}
                  onChange={(e) => setKostForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Kost Fajar Balikpapan"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Slogan / Tagline:
                </label>
                <input
                  type="text"
                  value={kostForm.tagline}
                  onChange={(e) => setKostForm(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Kost Eksklusif Bulanan Balikpapan"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Alamat Lengkap di Balikpapan:
                </label>
                <input
                  type="text"
                  value={kostForm.address}
                  onChange={(e) => setKostForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Jl. MT Haryono No. 45, Gunung Bahagia, Balikpapan Selatan, Kota Balikpapan"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kota / Wilayah:
                </label>
                <input
                  type="text"
                  value={kostForm.city || 'Balikpapan'}
                  onChange={(e) => setKostForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Balikpapan"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Penjaga Utama (Emergency Contact):
                </label>
                <input
                  type="text"
                  value={kostForm.caretakerName}
                  onChange={(e) => setKostForm(prev => ({ ...prev, caretakerName: e.target.value }))}
                  placeholder="Pak Budi Santoso"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Bank Accounts Section */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                Rekening Pembayaran Sewa Kost Fajar:
              </label>

              <div className="space-y-2">
                {kostForm.bankAccounts.map((b, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Bank:</span>
                      <input
                        type="text"
                        value={b.bank}
                        onChange={(e) => {
                          const updated = [...kostForm.bankAccounts];
                          updated[idx].bank = e.target.value;
                          setKostForm(prev => ({ ...prev, bankAccounts: updated }));
                        }}
                        className="w-full font-bold bg-white dark:bg-slate-900 p-1 rounded border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Nomor Rekening / NMID:</span>
                      <input
                        type="text"
                        value={b.number}
                        onChange={(e) => {
                          const updated = [...kostForm.bankAccounts];
                          updated[idx].number = e.target.value;
                          setKostForm(prev => ({ ...prev, bankAccounts: updated }));
                        }}
                        className="w-full font-mono bg-white dark:bg-slate-900 p-1 rounded border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Atas Nama:</span>
                      <input
                        type="text"
                        value={b.holder}
                        onChange={(e) => {
                          const updated = [...kostForm.bankAccounts];
                          updated[idx].holder = e.target.value;
                          setKostForm(prev => ({ ...prev, bankAccounts: updated }));
                        }}
                        className="w-full bg-white dark:bg-slate-900 p-1 rounded border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                Simpan Identitas Kost Fajar Balikpapan
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: MATRIKS WEWENANG HAK AKSES */}
        {activeTab === 'matrix' && (
          <div className="space-y-4 text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Modul & Tindakan Operasional</th>
                    <th className="py-2.5 px-3 text-emerald-600 font-bold">👑 1. Owner (Pemilik)</th>
                    <th className="py-2.5 px-3 text-blue-600 font-bold">🛠️ 2. Penjaga Kost</th>
                    <th className="py-2.5 px-3 text-purple-600 font-bold">👤 3. Penghuni Kost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="py-2 px-3 font-semibold">Laporan Omset & Laba Bersih Kost</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Penuh</td>
                    <td className="py-2 px-3 text-slate-400">✗ Terkunci (Rahasia Owner)</td>
                    <td className="py-2 px-3 text-slate-400">✗ Terkunci</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Ubah Nomor & Tarif Kamar</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Penuh</td>
                    <td className="py-2 px-3 text-slate-400">✗ Terkunci</td>
                    <td className="py-2 px-3 text-slate-400">✗ Terkunci</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Edit Data Owner & Penjaga Kost</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Penuh</td>
                    <td className="py-2 px-3 text-slate-400">✗ Terkunci</td>
                    <td className="py-2 px-3 text-slate-400">✗ Terkunci</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Pencatatan Meteran Listrik KWh</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Monitor</td>
                    <td className="py-2 px-3 text-blue-600 font-bold">✓ Input Harian</td>
                    <td className="py-2 px-3 text-purple-600 font-bold">✓ Pantau Pemakaian</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Penanganan Tiket Keluhan & Nota Biaya</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Audit Pengeluaran</td>
                    <td className="py-2 px-3 text-blue-600 font-bold">✓ Eksekusi & Catat Nota</td>
                    <td className="py-2 px-3 text-purple-600 font-bold">✓ Lapor Kerusakan</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Kunci Smart Lock & PIN Darurat</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Generate PIN Baru</td>
                    <td className="py-2 px-3 text-blue-600 font-bold">✓ Bantuan Anak Terkunci</td>
                    <td className="py-2 px-3 text-purple-600 font-bold">✓ PIN Kamar Pribadi</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Tagihan & Kwitansi Resmi</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Rekonsiliasi Kas</td>
                    <td className="py-2 px-3 text-blue-600 font-bold">✓ Catat Bayar Tunai</td>
                    <td className="py-2 px-3 text-purple-600 font-bold">✓ Bayar & Upload Bukti</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
