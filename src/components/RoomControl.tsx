import React, { useState } from 'react';
import { Room, MeterLog, HouseRule } from '../types';
import { formatIDR, formatDateIndo } from '../lib/storage';
import { HOUSE_RULES, KOST_INFO } from '../data/mockData';
import { 
  Zap, 
  Key, 
  Wifi, 
  ShieldAlert, 
  RefreshCw, 
  Check, 
  Copy, 
  Plus, 
  Search, 
  BookOpen, 
  Cpu, 
  TrendingUp, 
  Smartphone 
} from 'lucide-react';

interface RoomControlProps {
  rooms: Room[];
  meterLogs: MeterLog[];
  onUpdateMeter: (roomId: string, newKwh: number, recordedBy: string) => void;
  onGenerateNewPin: (roomId: string) => void;
}

export const RoomControl: React.FC<RoomControlProps> = ({
  rooms,
  meterLogs,
  onUpdateMeter,
  onGenerateNewPin,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'meter' | 'access' | 'wifi_rules'>('meter');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Meter Modal
  const [selectedRoomForMeter, setSelectedRoomForMeter] = useState<Room | null>(null);
  const [inputKwh, setInputKwh] = useState<number>(0);
  const [recorderName, setRecorderName] = useState('Pak Budi (Caretaker)');

  // Copied states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenMeterModal = (r: Room) => {
    setSelectedRoomForMeter(r);
    setInputKwh(r.currentMeterKwh);
  };

  const handleSaveMeter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForMeter) return;
    onUpdateMeter(selectedRoomForMeter.id, Number(inputKwh), recorderName);
    setSelectedRoomForMeter(null);
  };

  const filteredRooms = rooms.filter(r => {
    if (!searchQuery) return true;
    return r.number.includes(searchQuery) || r.type.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Kontrol Akses, Meteran Listrik & Tata Tertib
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pencatatan meteran KWh per kamar, manajemen PIN kunci pintu digital, kredensial Wi-Fi, dan aturan hunian
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setActiveSubTab('meter')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'meter'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Meteran Listrik (KWh)
            </button>
            <button
              onClick={() => setActiveSubTab('access')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'access'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-blue-500" />
              PIN Smartlock & RFID
            </button>
            <button
              onClick={() => setActiveSubTab('wifi_rules')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'wifi_rules'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              Wi-Fi & Tata Tertib
            </button>
          </div>
        </div>
      </div>

      {/* View: METER LOGS & RECORDING */}
      {activeSubTab === 'meter' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pencatatan Meteran Listrik Digital (KWh) per Kamar
                </h2>
                <p className="text-xs text-slate-500">
                  Tarif acuan: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">Rp 2.500 / KWh</span>. Pemakaian dihitung dari selisih meteran awal dan akhir bulan.
                </p>
              </div>

              <div className="relative min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kamar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold">
                    <th className="py-2.5 px-4">Kamar</th>
                    <th className="py-2.5 px-4">Tipe Kamar</th>
                    <th className="py-2.5 px-4">Meter Lalu (KWh)</th>
                    <th className="py-2.5 px-4">Meter Terkini (KWh)</th>
                    <th className="py-2.5 px-4">Konsumsi (KWh)</th>
                    <th className="py-2.5 px-4">Estimasi Tagihan</th>
                    <th className="py-2.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRooms.map(room => {
                    const consumed = Math.max(0, room.currentMeterKwh - room.lastMeterKwh);
                    const estimatedCost = consumed * room.kwhRate;

                    return (
                      <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          Kamar {room.number}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          Lt {room.floor} · {room.type}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {room.lastMeterKwh.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                          {room.currentMeterKwh.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                          {consumed.toFixed(1)} KWh
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200">
                          {formatIDR(estimatedCost)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenMeterModal(room)}
                            className="px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-md transition-colors"
                          >
                            Catat Meter Baru
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
      )}

      {/* View: ACCESS & SMARTLOCK PINS */}
      {activeSubTab === 'access' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Log Kunci Pintu Digital & Kartu Akses RFID
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola kredensial smartlock untuk setiap kamar. Generate PIN baru otomatis saat ada pergantian penghuni demi keamanan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {rooms.map(room => (
                <div 
                  key={room.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      Kamar {room.number}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Lt {room.floor} · {room.type}
                    </span>
                  </div>

                  {/* PIN Display */}
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">PIN Kunci Digital:</span>
                      <span className="text-base font-mono font-bold tracking-widest text-slate-900 dark:text-white">
                        {room.doorPin}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(`pin-${room.id}`, room.doorPin)}
                        title="Salin PIN"
                        className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded"
                      >
                        {copiedId === `pin-${room.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onGenerateNewPin(room.id)}
                        title="Acak / Generate PIN Baru"
                        className="p-1.5 text-blue-600 hover:text-blue-700 rounded"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* RFID UID */}
                  <div className="text-[11px] flex items-center justify-between text-slate-500">
                    <span>RFID Card UID:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{room.keycardUid || 'Belum dipasangkan'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View: WIFI CREDENTIALS & HOUSE RULES */}
      {activeSubTab === 'wifi_rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Wi-Fi Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Wifi className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kredensial Wi-Fi Kost Tiap Lantai
                </h3>
              </div>

              <div className="space-y-3 mt-4 text-xs">
                {KOST_INFO.wifiSsids.map((w, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">{w.floor}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">SSID:</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-white">{w.ssid}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Password:</span>
                      <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{w.pass}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Accounts */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Rekening Resmi Pembayaran Kost
              </h3>
              <div className="space-y-3 mt-4 text-xs">
                {KOST_INFO.bankAccounts.map((b, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{b.bank}</span>
                      <span className="text-[11px] text-slate-500">{b.holder}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white block">{b.number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* House Rules */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <BookOpen className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tata Tertib & Norma Hunian (House Rules)
                </h3>
                <p className="text-xs text-slate-500">
                  Dapat diakses oleh seluruh penghuni melalui portal penyewa untuk menjaga keharmonisan bersama
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-3 text-xs">
              {HOUSE_RULES.map((rule, idx) => (
                <div key={rule.id} className="py-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">0{idx + 1}.</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{rule.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({rule.category})</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Record Meter Modal */}
      {selectedRoomForMeter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Catat Angka Meter Kamar {selectedRoomForMeter.number}
            </h3>
            <p className="text-xs text-slate-500">
              Angka meteran sebelumnya: <span className="font-mono font-semibold">{selectedRoomForMeter.currentMeterKwh.toFixed(1)} KWh</span>
            </p>

            <form onSubmit={handleSaveMeter} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Angka Meteran Terkini (KWh):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={inputKwh}
                  onChange={(e) => setInputKwh(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-base"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Dicatat Oleh:</label>
                <input
                  type="text"
                  value={recorderName}
                  onChange={(e) => setRecorderName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoomForMeter(null)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs"
                >
                  Simpan Meteran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
