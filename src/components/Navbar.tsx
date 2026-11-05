import React from 'react';
import { UserRole, CurrentUserSession } from '../types';
import { 
  Building2, 
  Moon, 
  Sun, 
  Shield, 
  Wrench, 
  User, 
  Settings, 
  Users, 
  UserCog,
  LogOut,
  ChevronDown,
  Layers,
  KeyRound,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  currentSession: CurrentUserSession;
  kostName?: string;
  onOpenAuthModal: () => void;
  onOpenStaffModal?: () => void;
  onOpenUserManagement?: (tab?: 'owner' | 'staff' | 'kost') => void;
  onOpenRoomConfig?: () => void;
  onOpenDbModal: () => void;
  isDark: boolean;
  toggleDark: () => void;
  unverifiedCount: number;
  openTicketsCount: number;
  syncStatus?: 'connected' | 'syncing' | 'offline';
  onLogout?: () => void;
  onForceSync?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  role,
  currentSession,
  kostName,
  onOpenAuthModal,
  onOpenStaffModal,
  onOpenUserManagement,
  onOpenRoomConfig,
  onOpenDbModal,
  isDark,
  toggleDark,
  unverifiedCount,
  openTicketsCount,
  syncStatus = 'connected',
  onLogout,
  onForceSync,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          
          {/* Zone 1: Branding Logo & Kost Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  SiKost<span className="text-emerald-600 dark:text-emerald-400">Pro</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold font-mono uppercase ${
                  role === 'owner'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : role === 'staff'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                }`}>
                  {role}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block font-medium">
                {kostName || 'Kost Fajar Balikpapan'}
              </p>
            </div>
          </div>

          {/* Zone 2: Role-Tailored Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {role === 'owner' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Monitoring Center
                </button>
                <button
                  onClick={() => setActiveTab('rooms')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    activeTab === 'rooms'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Denah Kamar
                </button>
                <button
                  onClick={() => setActiveTab('tenants')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    activeTab === 'tenants'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Data Penghuni
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors relative ${
                    activeTab === 'billing'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tagihan & Kas
                  {unverifiedCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-amber-500 text-white rounded-full font-mono">
                      {unverifiedCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors relative ${
                    activeTab === 'tickets'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tiket Keluhan
                  {openTicketsCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-rose-500 text-white rounded-full font-mono">
                      {openTicketsCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('control')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    activeTab === 'control'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Meteran & Kunci
                </button>
              </>
            )}

            {role === 'staff' && (
              <>
                <button
                  onClick={() => setActiveTab('caretaker_dashboard')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    activeTab === 'caretaker_dashboard'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Pusat Tugas Penjaga
                </button>
                <button
                  onClick={() => setActiveTab('rooms')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    activeTab === 'rooms'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Denah Kamar
                </button>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors relative ${
                    activeTab === 'tickets'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tiket Perbaikan
                  {openTicketsCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-rose-500 text-white rounded-full font-mono">
                      {openTicketsCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('control')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    activeTab === 'control'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Meteran & Kunci
                </button>
              </>
            )}

            {role === 'tenant' && (
              <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-md text-purple-700 dark:text-purple-300">
                Portal Mandiri Penghuni Kost
              </span>
            )}
          </nav>

          {/* Zone 3: Active Profile Session Chip & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Active User Session Chip & Switch Access Trigger */}
            <button
              type="button"
              onClick={onOpenAuthModal}
              title="Klik untuk beralih antara Owner, Penjaga, atau Penghuni"
              className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs transition-all ${
                role === 'owner'
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                  : role === 'staff'
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-900 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-200 border-blue-200 dark:border-blue-800'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-900 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 dark:text-purple-200 border-purple-200 dark:border-purple-800'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                role === 'owner' 
                  ? 'bg-emerald-600 text-white' 
                  : role === 'staff' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-purple-600 text-white'
              }`}>
                {role === 'owner' ? (
                  <Shield className="w-3.5 h-3.5" />
                ) : role === 'staff' ? (
                  <Wrench className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="text-left hidden sm:block">
                <div className="font-bold text-[11px] leading-tight flex items-center gap-1">
                  <span>{currentSession.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] opacity-75">
                  {role === 'owner' ? 'Owner / Super Admin' : role === 'staff' ? (currentSession.staffRole || 'Penjaga Kost') : (currentSession.title || 'Penghuni')}
                </div>
              </div>

              <span className="hidden xl:inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/70 dark:bg-slate-900/70 border border-current opacity-80">
                Ganti Akses
              </span>
            </button>

            {/* Owner Specific Operations */}
            {role === 'owner' && (
              <>
                {/* Menu Edit Owner & Penjaga Kost */}
                {onOpenUserManagement && (
                  <button
                    onClick={() => onOpenUserManagement('owner')}
                    title="Menu Edit Owner, Penjaga Kost & Identitas Kost Fajar"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
                  >
                    <UserCog className="w-3.5 h-3.5" />
                    <span>Edit Owner & Penjaga</span>
                  </button>
                )}

                {/* Tarif & Kamar Config */}
                {onOpenRoomConfig && (
                  <button
                    onClick={onOpenRoomConfig}
                    title="Ubah Nomor Kamar & Tarif Sewa"
                    className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span className="hidden 2xl:inline">Tarif & Kamar</span>
                  </button>
                )}

                {/* DB Schema View */}
                <button
                  onClick={onOpenDbModal}
                  title="Lihat Skema Database (Prisma/SQL)"
                  className="hidden 2xl:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                >
                  Schema DB
                </button>
              </>
            )}

            {/* Real-time Multi-Device Sync Indicator & Manual Sync Button */}
            <button
              type="button"
              onClick={onForceSync}
              title={
                syncStatus === 'connected' 
                  ? 'Real-Time Sync Aktif: Data otomatis sinkron ke seluruh perangkat secara instan. Klik untuk segarkan paksa.' 
                  : syncStatus === 'syncing' 
                  ? 'Sedang menyinkronkan data antar perangkat...' 
                  : 'Mode Offline: Klik untuk mencoba sinkronisasi ulang.'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer hover:opacity-90 active:scale-95 ${
                syncStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                  : syncStatus === 'syncing'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/60'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span className="font-mono text-[10px] hidden sm:inline">
                {syncStatus === 'connected' ? 'Live Multi-Device' : syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Offline'}
              </span>
              <span className="font-mono text-[10px] sm:hidden">
                {syncStatus === 'connected' ? 'Live' : syncStatus === 'syncing' ? 'Sync' : 'Off'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDark}
              aria-label="Toggle Theme"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Direct Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Keluar dari sesi saat ini"
                className="hidden lg:inline-flex items-center gap-1 p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-100 dark:border-slate-800 scrollbar-none">
          {role === 'owner' && (
            <>
              {onOpenUserManagement && (
                <button
                  onClick={() => onOpenUserManagement('owner')}
                  className="px-3 py-1 text-xs whitespace-nowrap rounded font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-1"
                >
                  <UserCog className="w-3 h-3" />
                  Edit Owner/Penjaga
                </button>
              )}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
                  activeTab === 'dashboard' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Monitoring
              </button>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
                  activeTab === 'rooms' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Kamar
              </button>
              <button
                onClick={() => setActiveTab('tenants')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
                  activeTab === 'tenants' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Penghuni
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
                  activeTab === 'billing' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Tagihan ({unverifiedCount})
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
                  activeTab === 'tickets' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Tiket ({openTicketsCount})
              </button>
              <button
                onClick={() => setActiveTab('control')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
                  activeTab === 'control' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Meteran & PIN
              </button>
            </>
          )}

          {role === 'staff' && (
            <>
              <button
                onClick={() => setActiveTab('caretaker_dashboard')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
                  activeTab === 'caretaker_dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Tugas Penjaga
              </button>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
                  activeTab === 'rooms' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Denah Kamar
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
                  activeTab === 'tickets' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Tiket Perbaikan ({openTicketsCount})
              </button>
              <button
                onClick={() => setActiveTab('control')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
                  activeTab === 'control' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Meteran & PIN
              </button>
            </>
          )}

          {role === 'tenant' && (
            <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 py-1">
              Portal Mandiri Penghuni Kost
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
