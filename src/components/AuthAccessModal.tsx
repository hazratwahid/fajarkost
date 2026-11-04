import React, { useState } from 'react';
import { UserRole, CurrentUserSession, Tenant, Room, StaffMember, OwnerProfile, KostProfile } from '../types';
import { STAFF_MEMBERS, DEFAULT_OWNER_PROFILE, KOST_INFO } from '../data/mockData';
import { authenticateUser } from '../lib/api';
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
  Info,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  LogOut
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
  onLogout?: () => void;
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
  onLogout,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<UserRole>(currentSession.role);

  // Form states per role
  // 1. Owner
  const [ownerUsername, setOwnerUsername] = useState('owner');
  const [ownerPassword, setOwnerPassword] = useState('admin123');
  const [showOwnerPass, setShowOwnerPass] = useState(false);

  // 2. Staff
  const [staffUsername, setStaffUsername] = useState(staffList[0]?.phone || '081298812300');
  const [staffPassword, setStaffPassword] = useState('penjaga123');
  const [showStaffPass, setShowStaffPass] = useState(false);

  // 3. Tenant
  const activeTenants = tenants.filter(t => t.status === 'active');
  const firstTenant = activeTenants[0];
  const firstTenantRoom = rooms.find(r => r.id === firstTenant?.roomId);
  const [tenantUsername, setTenantUsername] = useState(firstTenantRoom?.number || '101');
  const [tenantPassword, setTenantPassword] = useState(firstTenantRoom?.doorPin || '419280');
  const [showTenantPass, setShowTenantPass] = useState(false);

  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Clear errors when changing tab
  const handleTabChange = (tab: UserRole) => {
    setActiveTab(tab);
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    let usernameInput = '';
    let passwordInput = '';

    if (activeTab === 'owner') {
      usernameInput = ownerUsername;
      passwordInput = ownerPassword;
    } else if (activeTab === 'staff') {
      usernameInput = staffUsername;
      passwordInput = staffPassword;
    } else {
      usernameInput = tenantUsername;
      passwordInput = tenantPassword;
    }

    if (!usernameInput.trim()) {
      setErrorMessage('Username atau identitas wajib diisi.');
      setIsLoading(false);
      return;
    }

    if (!passwordInput.trim()) {
      setErrorMessage('Password atau PIN wajib diisi.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authenticateUser(activeTab, usernameInput, passwordInput);

      if (result.success && result.session) {
        setSuccessToast(`Berhasil masuk sebagai ${result.session.name}`);
        setTimeout(() => {
          onSelectAccess(result.session!);
          onClose();
        }, 600);
      } else {
        setErrorMessage(result.message || 'Username atau password tidak sesuai kriteria.');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan jaringan saat proses verifikasi login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Autentikasi Akses Pengguna SiKost Pro
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gunakan Username dan Password sesuai kriteria peran (Owner, Penjaga, atau Penghuni).
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Current Session Chip & Logout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700/80 gap-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <span className="text-slate-500 dark:text-slate-400">Sesi Aktif: </span>
              <strong className="text-slate-900 dark:text-white">{currentSession.name}</strong>
              <span className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                {currentSession.role}
              </span>
              <span className="ml-1.5 text-slate-500 dark:text-slate-400 hidden sm:inline">
                ({currentSession.title})
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi</span>
            </button>
          )}
        </div>

        {/* 3 Role Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => handleTabChange('owner')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'owner'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>1. Owner</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('staff')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'staff'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4 text-blue-600 shrink-0" />
            <span>2. Penjaga</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('tenant')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'tenant'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-purple-600 shrink-0" />
            <span>3. Penghuni</span>
          </button>
        </div>

        {/* Error and Success Banners */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200 animate-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{errorMessage}</p>
              <p className="text-[11px] opacity-80 mt-0.5">
                Pastikan username dan password sesuai dengan petunjuk kredensial di bawah.
              </p>
            </div>
          </div>
        )}

        {successToast && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* TAB 1: OWNER */}
          {activeTab === 'owner' && (
            <div className="space-y-4 p-4.5 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border border-emerald-200/70 dark:border-emerald-800/40 rounded-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Kriteria Login Pemilik Kost (Owner / Super Admin)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Memiliki hak akses penuh: Laporan Laba Bersih, Pengaturan Tarif & Kamar, Kelola Data Staf & Penghuni.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username atau Email Owner:
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerUsername}
                    onChange={(e) => setOwnerUsername(e.target.value)}
                    placeholder="Contoh: owner atau fajar@kostfajar.com"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password atau PIN Owner:
                  </label>
                  <div className="relative">
                    <input
                      type={showOwnerPass ? 'text' : 'password'}
                      required
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="Masukkan password / PIN"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white pr-9 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOwnerPass(!showOwnerPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showOwnerPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Preset Badges */}
              <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Kredensial Default Owner:
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">
                    User: <strong className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">owner</strong>
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    Pass: <strong className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">admin123</strong> / <strong className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">1234</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerUsername('owner');
                      setOwnerPassword('admin123');
                    }}
                    className="text-emerald-700 dark:text-emerald-300 underline font-semibold hover:text-emerald-800 ml-auto"
                  >
                    Isi Otomatis
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STAFF / PENJAGA */}
          {activeTab === 'staff' && (
            <div className="space-y-4 p-4.5 bg-gradient-to-br from-blue-50/40 via-white to-slate-50 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 border border-blue-200/70 dark:border-blue-800/40 rounded-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    Kriteria Login Penjaga Kost & Tim Lapangan (Caretaker)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fokus pada operasional harian: Pencatatan Meteran Listrik KWh, Penanganan Tiket Perbaikan, Bantuan Pintu.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username / No. Handphone Petugas:
                  </label>
                  <input
                    type="text"
                    required
                    value={staffUsername}
                    onChange={(e) => setStaffUsername(e.target.value)}
                    placeholder="Contoh: 081298812300 atau budi"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password Petugas:
                  </label>
                  <div className="relative">
                    <input
                      type={showStaffPass ? 'text' : 'password'}
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="Masukkan password petugas"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white pr-9 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPass(!showStaffPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showStaffPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Staff Preset Selection */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                  Pilih Cepat Akun Petugas Terdaftar:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {staffList.slice(0, 4).map((stf) => (
                    <button
                      key={stf.id}
                      type="button"
                      onClick={() => {
                        setStaffUsername(stf.phone);
                        setStaffPassword('penjaga123');
                      }}
                      className={`px-2 py-1.5 text-[11px] rounded-lg border text-left flex items-center justify-between transition-colors ${
                        staffUsername === stf.phone
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                      }`}
                    >
                      <span className="truncate">{stf.name}</span>
                      <span className="text-[9px] opacity-80">{stf.role.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Preset Badges */}
              <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300 text-[11px]">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Kredensial Default Penjaga Kost:
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">
                    User: <strong className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">081298812300</strong> atau <strong className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">budi</strong>
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    Pass: <strong className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">penjaga123</strong> / <strong className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">1234</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TENANT / PENGHUNI */}
          {activeTab === 'tenant' && (
            <div className="space-y-4 p-4.5 bg-gradient-to-br from-purple-50/40 via-white to-slate-50 dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-900 border border-purple-200/70 dark:border-purple-800/40 rounded-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-600" />
                    Kriteria Login Penghuni Kost (Tenant Self-Service)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Portal mandiri anak kost: Cek Tagihan & Bayar QRIS/Transfer, Buat Tiket Keluhan, Akses PIN Pintu.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Kamar atau No. WhatsApp Penghuni:
                  </label>
                  <input
                    type="text"
                    required
                    value={tenantUsername}
                    onChange={(e) => setTenantUsername(e.target.value)}
                    placeholder="Contoh: 101 atau 081234567890"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password atau PIN Smart Lock Pintu Kamar:
                  </label>
                  <div className="relative">
                    <input
                      type={showTenantPass ? 'text' : 'password'}
                      required
                      value={tenantPassword}
                      onChange={(e) => setTenantPassword(e.target.value)}
                      placeholder="Masukkan PIN smart lock atau password penghuni"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white pr-9 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTenantPass(!showTenantPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showTenantPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Tenant Room Selection */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                  Pilih Cepat Kamar Penghuni Aktif:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {activeTenants.slice(0, 4).map((t) => {
                    const r = rooms.find(rm => rm.id === t.roomId);
                    const isSelected = tenantUsername === r?.number;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTenantUsername(r?.number || '101');
                          setTenantPassword(r?.doorPin || 'penghuni123');
                        }}
                        className={`p-1.5 text-[11px] rounded-lg border text-left transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 font-bold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400'
                        }`}
                      >
                        <div className="font-bold">Kamar {r?.number}</div>
                        <div className="text-[9px] opacity-80 truncate">{t.name.split(' ')[0]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Preset Badges */}
              <div className="p-2.5 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/40 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-purple-800 dark:text-purple-300 text-[11px]">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Kriteria Login Penghuni Kost:
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300">
                    User: <strong className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">101</strong> (Nomor Kamar)
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    Pass: <strong className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">419280</strong> (PIN Pintu) / <strong className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">penghuni123</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Verifikasi tersinkronisasi langsung ke database server.</span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className={`px-5 py-2 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors ${
                  activeTab === 'owner'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : activeTab === 'staff'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk sebagai {activeTab === 'owner' ? 'Owner' : activeTab === 'staff' ? 'Penjaga' : 'Penghuni'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
