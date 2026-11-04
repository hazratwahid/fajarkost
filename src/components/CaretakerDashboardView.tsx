import React, { useState } from 'react';
import { Room, Tenant, MaintenanceTicket, MeterLog, TicketStatus, StaffMember } from '../types';
import { formatIDR, formatDateIndo } from '../lib/storage';
import { 
  Wrench, 
  Zap, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Eye, 
  Copy, 
  Check, 
  ShieldAlert, 
  User, 
  Sparkles,
  Phone,
  FileText,
  Filter
} from 'lucide-react';

interface CaretakerDashboardViewProps {
  rooms: Room[];
  tenants: Tenant[];
  tickets: MaintenanceTicket[];
  meterLogs: MeterLog[];
  currentStaffName: string;
  kostName?: string;
  onUpdateMeter: (roomId: string, newKwh: number, recordedBy: string) => void;
  onGenerateNewPin: (roomId: string) => void;
  onUpdateTicketStatus: (
    ticketId: string, 
    status: TicketStatus, 
    assignedStaff?: string, 
    expenseAmount?: number, 
    notes?: string
  ) => void;
  onSelectRoomDetail: (roomId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const CaretakerDashboardView: React.FC<CaretakerDashboardViewProps> = ({
  rooms,
  tenants,
  tickets,
  meterLogs,
  currentStaffName,
  kostName = 'Kost Fajar Balikpapan',
  onUpdateMeter,
  onGenerateNewPin,
  onUpdateTicketStatus,
  onSelectRoomDetail,
  onNavigateTab,
}) => {
  // Operational metrics for Caretaker
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance');
  const occupiedRooms = rooms.filter(r => r.status === 'occupied');
  const vacantRooms = rooms.filter(r => r.status === 'vacant');

  // Meter modal / quick input state
  const [selectedMeterRoom, setSelectedMeterRoom] = useState<Room | null>(null);
  const [inputKwhValue, setInputKwhValue] = useState<number>(0);
  const [meterSavedMessage, setMeterSavedMessage] = useState<string | null>(null);

  // Door PIN search helper (when tenant is locked out)
  const [pinSearchQuery, setPinSearchQuery] = useState('');
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);
  const [showPinsMap, setShowPinsMap] = useState<Record<string, boolean>>({});

  // Ticket resolution modal
  const [resolvingTicket, setResolvingTicket] = useState<MaintenanceTicket | null>(null);
  const [ticketExpenseInput, setTicketExpenseInput] = useState<number>(0);
  const [ticketResolutionNote, setTicketResolutionNote] = useState<string>('');

  // Quick Meter Input Modal submit
  const handleSaveMeterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeterRoom) return;
    onUpdateMeter(selectedMeterRoom.id, Number(inputKwhValue), currentStaffName);
    setMeterSavedMessage(`Meteran Kamar ${selectedMeterRoom.number} berhasil dicatat: ${inputKwhValue} KWh.`);
    setSelectedMeterRoom(null);
    setTimeout(() => setMeterSavedMessage(null), 3000);
  };

  const handleCopyPin = (roomId: string, pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPinId(roomId);
    setTimeout(() => setCopiedPinId(null), 2000);
  };

  const handleResolveTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;

    onUpdateTicketStatus(
      resolvingTicket.id,
      'resolved',
      currentStaffName,
      ticketExpenseInput > 0 ? Number(ticketExpenseInput) : undefined,
      ticketResolutionNote || 'Selesai diperbaiki oleh penjaga on-site.'
    );

    setResolvingTicket(null);
    setTicketExpenseInput(0);
    setTicketResolutionNote('');
  };

  // Filtered rooms for PIN finder
  const pinSearchResult = rooms.filter(r => {
    if (!pinSearchQuery) return true;
    const tenant = tenants.find(t => t.id === r.currentTenantId);
    return (
      r.number.includes(pinSearchQuery) ||
      (tenant && tenant.name.toLowerCase().includes(pinSearchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Caretaker Identity & Operational Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Akses Penjaga Kost (Caretaker)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {kostName}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Pusat Tugas Lapangan & Fasilitas
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Petugas Aktif: <strong className="text-slate-800 dark:text-slate-200">{currentStaffName}</strong> · Fokus tugas: Meteran Listrik KWh, Kunci Smart Lock, & Penanganan Perbaikan
            </p>
          </div>

          {/* Quick Notice about protected owner data */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl max-w-sm text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Proteksi Data Finansial Owner</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Laporan laba bersih, kas omzet, dan konfigurasi tarif sewa pokok hanya dapat diubah oleh akun Owner.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {meterSavedMessage && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{meterSavedMessage}</span>
          </div>
        )}

        {/* 4 Quick Stat Cards for Caretaker */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Tiket Keluhan Terbuka</span>
              <Wrench className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {openTickets.length}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Perlu inspeksi & perbaikan fisik</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Kamar Maintenance</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {maintenanceRooms.length}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Perlu pembersihan & cek aset</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Kamar Kosong Siap Huni</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {vacantRooms.length}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Siap terima calon penghuni</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Kamar Terisi Aktif</span>
              <User className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {occupiedRooms.length}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Penghuni aktif saat ini</p>
          </div>

        </div>
      </div>

      {/* Main Grid: 2 Operational Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Repair Tickets (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  Antrean Tiket Perbaikan Lapangan ({openTickets.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Prioritas penanganan keluhan penghuni (AC, Wi-Fi, Pipa, Kunci, dll.)
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('tickets')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Lihat Semua
              </button>
            </div>

            {openTickets.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                Tidak ada tiket keluhan aktif. Semua fasilitas berfungsi normal!
              </div>
            ) : (
              <div className="space-y-3">
                {openTickets.map((t) => {
                  const room = rooms.find(r => r.id === t.roomId);
                  const tenant = tenants.find(tn => tn.id === t.tenantId);

                  return (
                    <div 
                      key={t.id} 
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 transition-all hover:border-blue-400"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              Kamar {room?.number || '-'}
                            </span>
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {t.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {t.description}
                          </p>
                        </div>

                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          t.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : t.priority === 'high'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {t.priority}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <div className="text-slate-500 flex items-center gap-2">
                          <span>Kategori: <strong>{t.category}</strong></span>
                          <span>·</span>
                          <span>Pelapor: {tenant?.name || 'Penghuni'}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {t.status === 'open' ? (
                            <button
                              type="button"
                              onClick={() => onUpdateTicketStatus(t.id, 'in_progress', currentStaffName)}
                              className="px-2.5 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-md flex items-center gap-1"
                            >
                              <Clock className="w-3 h-3" />
                              Mulai Tangani
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setResolvingTicket(t);
                                setTicketExpenseInput(t.expenseAmount || 0);
                                setTicketResolutionNote(t.resolutionNotes || '');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Selesai & Catat Biaya
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Meter KWh Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Catat Cepat Meteran Listrik KWh Kamar
                </h2>
                <p className="text-xs text-slate-500">
                  Input angka stand meteran terbaru untuk perhitungan tagihan listrik bulanan
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('control')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Log Lengkap
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Kamar</th>
                    <th className="py-2.5 px-3">Penghuni</th>
                    <th className="py-2.5 px-3">Meter Terakhir</th>
                    <th className="py-2.5 px-3">Aksi Catat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {rooms.map(r => {
                    const tenant = tenants.find(t => t.id === r.currentTenantId);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          {r.number}
                          <span className="ml-1 text-[10px] font-normal text-slate-400 font-sans">
                            (Lt {r.floor})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                          {tenant ? tenant.name : <span className="text-slate-400 italic">Kosong</span>}
                        </td>
                        <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400 font-semibold">
                          {r.currentMeterKwh.toFixed(1)} KWh
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMeterRoom(r);
                              setInputKwhValue(r.currentMeterKwh);
                            }}
                            className="px-2.5 py-1 text-xs font-sans font-semibold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded transition-colors"
                          >
                            Input KWh
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Emergency Lock Helper & Room Inspection (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Smart Lock Emergency Helper */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" />
                Bantuan Kunci Pintu & Smart Lock
              </h2>
              <p className="text-xs text-slate-500">
                Cek PIN pintu kamar jika ada anak kost yang lupa kode atau kartu RFID hilang
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nomor kamar atau nama..."
                value={pinSearchQuery}
                onChange={(e) => setPinSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {pinSearchResult.map((r) => {
                const tenant = tenants.find(t => t.id === r.currentTenantId);
                const isPinVisible = showPinsMap[r.id];

                return (
                  <div 
                    key={r.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <span>Kamar {r.number}</span>
                        <span className="text-[10px] font-normal text-slate-500 font-mono">
                          · {tenant ? tenant.name : 'Kosong'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        RFID: {r.keycardUid || '-'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="font-mono font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                        {isPinVisible ? r.doorPin : '••••••'}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPinsMap(prev => ({ ...prev, [r.id]: !prev[r.id] }))}
                        title={isPinVisible ? 'Sembunyikan PIN' : 'Lihat PIN'}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyPin(r.id, r.doorPin)}
                        title="Salin PIN"
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                      >
                        {copiedPinId === r.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Room Cleaning & Turnover inspection */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Inspeksi Kamar & Pembersihan
            </h2>
            <p className="text-xs text-slate-500">
              Kamar dalam perbaikan / selesai checkout yang perlu dibersihkan sebelum dihuni
            </p>

            {maintenanceRooms.length === 0 ? (
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                Semua unit kamar bersih dan siap digunakan.
              </div>
            ) : (
              <div className="space-y-2">
                {maintenanceRooms.map(r => (
                  <div 
                    key={r.id} 
                    className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-amber-900 dark:text-amber-200">
                        Kamar {r.number} (Lantai {r.floor} · {r.type})
                      </span>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300">
                        Status: Pembersihan / Maintenance Fasilitas
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectRoomDetail(r.id)}
                      className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50"
                    >
                      Buka Rincian
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Meter Recording Modal */}
      {selectedMeterRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Catat Meter Listrik Kamar {selectedMeterRoom.number}
              </h3>
              <button 
                onClick={() => setSelectedMeterRoom(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMeterSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Angka Meter Sebelumnya:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedMeterRoom.lastMeterKwh.toFixed(1)} KWh
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Angka Meter Terakhir:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {selectedMeterRoom.currentMeterKwh.toFixed(1)} KWh
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Stand Angka Meteran Baru (KWh):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={selectedMeterRoom.currentMeterKwh}
                  value={inputKwhValue}
                  onChange={(e) => setInputKwhValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm font-bold text-slate-900 dark:text-white"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Selisih Pemakaian: <strong className="font-mono text-slate-800 dark:text-slate-200">{Math.max(0, inputKwhValue - selectedMeterRoom.currentMeterKwh).toFixed(1)} KWh</strong>
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedMeterRoom(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                >
                  Simpan Catatan KWh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Resolution Modal */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Selesaikan Tiket Perbaikan
              </h3>
              <button 
                onClick={() => setResolvingTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveTicketSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">{resolvingTicket.title}</div>
                <p className="text-slate-500">{resolvingTicket.description}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Catatan Solusi / Pekerjaan:
                </label>
                <textarea
                  value={ticketResolutionNote}
                  onChange={(e) => setTicketResolutionNote(e.target.value)}
                  placeholder="Contoh: Pipa diganti pipa baru 1/2 inch, AC sudah dibersihkan..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Biaya Pengeluaran Sparepart / Nota (Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={ticketExpenseInput}
                  onChange={(e) => setTicketExpenseInput(parseFloat(e.target.value) || 0)}
                  placeholder="0 jika tidak ada biaya belanja"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs font-bold text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Biaya akan otomatis dicatat ke buku pengeluaran kas operasional kost.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Konfirmasi Selesai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
