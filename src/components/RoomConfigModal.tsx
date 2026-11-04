import React, { useState } from 'react';
import { Room, RoomType, RoomStatus } from '../types';
import { formatIDR } from '../lib/storage';
import { 
  Building2, 
  DollarSign, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  AlertCircle, 
  TrendingUp,
  Layers,
  Sparkles,
  Sliders
} from 'lucide-react';

interface RoomConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  onUpdateRoom: (roomId: string, updatedData: Partial<Room>) => void;
  onAddRoom: (newRoom: Omit<Room, 'id'>) => void;
  onBatchUpdatePrice: (filterType: RoomType | 'all', adjustmentType: 'fixed' | 'delta' | 'percentage', value: number) => void;
  initialSelectedRoomId?: string | null;
}

const COMMON_FACILITIES = [
  'AC Daikin 1/2 PK',
  'AC Inverter 1 PK',
  'Kamar Mandi Dalam',
  'Water Heater',
  'Kasur Springbed 120x200',
  'Kasur Queen 160x200',
  'Kasur King 180x200',
  'Smart TV 32"',
  'Smart TV 43"',
  'Kulkas Mini',
  'Kulkas 2 Pintu',
  'Balkon Pribadi',
  'Meja Kerja & Kursi',
  'Lemari 2 Pintu',
  'Pantry & Sink',
  'Jendela Hadap Taman'
];

export const RoomConfigModal: React.FC<RoomConfigModalProps> = ({
  isOpen,
  onClose,
  rooms,
  onUpdateRoom,
  onAddRoom,
  onBatchUpdatePrice,
  initialSelectedRoomId,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'batch' | 'add'>('list');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(initialSelectedRoomId || null);

  // Edit Single Room Form State
  const [editForm, setEditForm] = useState<{
    number: string;
    floor: number;
    type: RoomType;
    basePrice: number;
    sizeM2: number;
    kwhRate: number;
    facilities: string[];
    doorPin: string;
  }>({
    number: '',
    floor: 1,
    type: 'Standard',
    basePrice: 2000000,
    sizeM2: 16,
    kwhRate: 2500,
    facilities: [],
    doorPin: '123456',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Batch Update State
  const [batchTargetType, setBatchTargetType] = useState<RoomType | 'all'>('all');
  const [batchMode, setBatchMode] = useState<'fixed' | 'delta' | 'percentage'>('delta');
  const [batchValue, setBatchValue] = useState<number>(100000);

  // Add Room Form State
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState<number>(1);
  const [newRoomType, setNewRoomType] = useState<RoomType>('Standard');
  const [newRoomPrice, setNewRoomPrice] = useState<number>(2200000);
  const [newRoomSize, setNewRoomSize] = useState<number>(16);
  const [newRoomKwhRate, setNewRoomKwhRate] = useState<number>(2500);
  const [newRoomFacilities, setNewRoomFacilities] = useState<string[]>([
    'AC Daikin 1/2 PK',
    'Kamar Mandi Dalam',
    'Kasur Springbed 120x200',
    'Lemari 2 Pintu',
    'Meja Kerja & Kursi'
  ]);

  if (!isOpen) return null;

  const handleStartEdit = (room: Room) => {
    setEditingRoomId(room.id);
    setEditForm({
      number: room.number,
      floor: room.floor,
      type: room.type,
      basePrice: room.basePrice,
      sizeM2: room.sizeM2,
      kwhRate: room.kwhRate,
      facilities: [...room.facilities],
      doorPin: room.doorPin,
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoomId) return;

    // Check duplicate room number
    const isDuplicate = rooms.some(
      r => r.id !== editingRoomId && r.number.trim().toLowerCase() === editForm.number.trim().toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage(`Nomor kamar "${editForm.number}" sudah digunakan oleh unit lain.`);
      return;
    }

    if (!editForm.number.trim()) {
      setErrorMessage('Nomor kamar tidak boleh kosong.');
      return;
    }

    if (editForm.basePrice <= 0) {
      setErrorMessage('Harga sewa harus lebih dari Rp 0.');
      return;
    }

    onUpdateRoom(editingRoomId, {
      number: editForm.number.trim(),
      floor: Number(editForm.floor),
      type: editForm.type,
      basePrice: Number(editForm.basePrice),
      sizeM2: Number(editForm.sizeM2),
      kwhRate: Number(editForm.kwhRate),
      facilities: editForm.facilities,
      doorPin: editForm.doorPin,
    });

    setSuccessMessage(`Berhasil memperbarui data Kamar ${editForm.number}!`);
    setTimeout(() => {
      setSuccessMessage('');
      setEditingRoomId(null);
    }, 1500);
  };

  const handleExecuteBatchPrice = (e: React.FormEvent) => {
    e.preventDefault();
    onBatchUpdatePrice(batchTargetType, batchMode, Number(batchValue));
    setSuccessMessage('Penyesuaian tarif harga sewa massal berhasil diterapkan!');
    setTimeout(() => setSuccessMessage(''), 2500);
  };

  const handleCreateNewRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = newRoomNumber.trim();
    if (!cleanNum) {
      setErrorMessage('Nomor kamar wajib diisi.');
      return;
    }

    const isDuplicate = rooms.some(
      r => r.number.toLowerCase() === cleanNum.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage(`Nomor kamar "${cleanNum}" sudah terdaftar.`);
      return;
    }

    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();

    onAddRoom({
      number: cleanNum,
      floor: Number(newRoomFloor),
      type: newRoomType,
      basePrice: Number(newRoomPrice),
      status: 'vacant',
      sizeM2: Number(newRoomSize),
      facilities: newRoomFacilities,
      doorPin: randomPin,
      lastMeterKwh: 0,
      currentMeterKwh: 0,
      kwhRate: Number(newRoomKwhRate),
      imageUrl: '/src/assets/images/kost_room_deluxe_1793684547405.jpg',
    });

    setSuccessMessage(`Kamar ${cleanNum} berhasil ditambahkan ke sistem!`);
    setNewRoomNumber('');
    setTimeout(() => {
      setSuccessMessage('');
      setActiveTab('list');
    }, 1500);
  };

  const toggleFacility = (facility: string, isNewRoom = false) => {
    if (isNewRoom) {
      setNewRoomFacilities(prev => 
        prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
      );
    } else {
      setEditForm(prev => ({
        ...prev,
        facilities: prev.facilities.includes(facility) 
          ? prev.facilities.filter(f => f !== facility) 
          : [...prev.facilities, facility]
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-4xl w-full p-6 space-y-4 max-h-[92vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Konfigurasi Kamar & Manajemen Tarif Sewa
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ubah nomor kamar, harga sewa bulanan, tipe unit, fasilitas, dan penyesuaian harga serentak
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => {
                setActiveTab('list');
                setEditingRoomId(null);
                setErrorMessage('');
              }}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Daftar & Edit Unit ({rooms.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('batch');
                setEditingRoomId(null);
                setErrorMessage('');
              }}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'batch'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Penyesuaian Tarif Massal
            </button>
            <button
              onClick={() => {
                setActiveTab('add');
                setEditingRoomId(null);
                setErrorMessage('');
              }}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'add'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Unit Kamar Baru
            </button>
          </div>

          {successMessage && (
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {successMessage}
            </span>
          )}

          {errorMessage && (
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMessage}
            </span>
          )}
        </div>

        {/* Tab 1: LIST & INLINE EDITING */}
        {activeTab === 'list' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            
            {/* If a room is actively being edited, show full editor form */}
            {editingRoomId ? (
              <form onSubmit={handleSaveEdit} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-emerald-600" />
                    Edit Nomor & Tarif Kamar: {rooms.find(r => r.id === editingRoomId)?.number}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingRoomId(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕ Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Nomor Kamar:</label>
                    <input
                      type="text"
                      required
                      value={editForm.number}
                      onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                      placeholder="Contoh: 101, 102-A"
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono font-bold text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Lantai:</label>
                    <select
                      value={editForm.floor}
                      onChange={(e) => setEditForm({ ...editForm, floor: Number(e.target.value) })}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                    >
                      <option value={1}>Lantai 1</option>
                      <option value={2}>Lantai 2</option>
                      <option value={3}>Lantai 3 (Rooftop)</option>
                      <option value={4}>Lantai 4</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Tipe Kamar:</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value as RoomType })}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="VIP Suite">VIP Suite</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Harga Sewa Bulanan (Rp):</label>
                    <input
                      type="number"
                      required
                      step="50000"
                      value={editForm.basePrice}
                      onChange={(e) => setEditForm({ ...editForm, basePrice: Number(e.target.value) })}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                      {formatIDR(editForm.basePrice)} / bulan
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Luas Kamar (m²):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editForm.sizeM2}
                      onChange={(e) => setEditForm({ ...editForm, sizeM2: Number(e.target.value) })}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Tarif KWh Listrik (Rp):</label>
                    <input
                      type="number"
                      value={editForm.kwhRate}
                      onChange={(e) => setEditForm({ ...editForm, kwhRate: Number(e.target.value) })}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Facilities Checklist */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                    Fasilitas Unit Kamar:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COMMON_FACILITIES.map(fac => {
                      const isChecked = editForm.facilities.includes(fac);
                      return (
                        <button
                          key={fac}
                          type="button"
                          onClick={() => toggleFacility(fac)}
                          className={`p-1.5 rounded text-left border flex items-center justify-between transition-colors ${
                            isChecked
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-medium'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="truncate pr-1">{fac}</span>
                          {isChecked && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setEditingRoomId(null)}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-400"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs"
                  >
                    Simpan Perubahan Kamar
                  </button>
                </div>
              </form>
            ) : null}

            {/* Table of all rooms */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold">
                    <th className="py-2.5 px-3">No. Kamar</th>
                    <th className="py-2.5 px-3">Lantai</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3">Harga Sewa Pokok</th>
                    <th className="py-2.5 px-3">Luas</th>
                    <th className="py-2.5 px-3">Tarif Listrik</th>
                    <th className="py-2.5 px-3">Status Saat Ini</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rooms.map(room => (
                    <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        Kamar {room.number}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        Lt {room.floor}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {room.type}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {formatIDR(room.basePrice)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {room.sizeM2} m²
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        Rp {room.kwhRate}/KWh
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          room.status === 'occupied' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          room.status === 'vacant' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                          room.status === 'pending_payment' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {room.status === 'occupied' ? 'Terisi' :
                           room.status === 'vacant' ? 'Kosong' :
                           room.status === 'pending_payment' ? 'Tagihan' : 'Servis'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleStartEdit(room)}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-md transition-colors"
                        >
                          Ubah Harga / No
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 2: BATCH PRICING ADJUSTMENT */}
        {activeTab === 'batch' && (
          <div className="flex-1 overflow-y-auto space-y-5 p-1 text-xs">
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
              <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Penyesuaian Harga Sewa Massal (Batch Pricing)
              </span>
              <p className="text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed">
                Fitur ini memungkinkan pengelola mengubah harga sewa secara serentak untuk seluruh kamar atau tipe kamar tertentu (misal: kenaikan tahunan sebesar Rp 100.000 atau 5%).
              </p>
            </div>

            <form onSubmit={handleExecuteBatchPrice} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Target Tipe Kamar:</label>
                  <select
                    value={batchTargetType}
                    onChange={(e) => setBatchTargetType(e.target.value as any)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  >
                    <option value="all">Semua Tipe Kamar ({rooms.length} unit)</option>
                    <option value="Standard">Standard Saja ({rooms.filter(r => r.type === 'Standard').length} unit)</option>
                    <option value="Deluxe">Deluxe Saja ({rooms.filter(r => r.type === 'Deluxe').length} unit)</option>
                    <option value="VIP Suite">VIP Suite Saja ({rooms.filter(r => r.type === 'VIP Suite').length} unit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Metode Penyesuaian:</label>
                  <select
                    value={batchMode}
                    onChange={(e) => setBatchMode(e.target.value as any)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  >
                    <option value="delta">Tambah / Kurang Nominal Tetap (± Rp)</option>
                    <option value="percentage">Tambah / Kurang Persentase (± %)</option>
                    <option value="fixed">Set Harga Baru Sama Rata (Rp)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    {batchMode === 'percentage' ? 'Nilai Persentase (%):' : 'Nominal Nilai (Rp):'}
                  </label>
                  <input
                    type="number"
                    required
                    value={batchValue}
                    onChange={(e) => setBatchValue(Number(e.target.value))}
                    placeholder={batchMode === 'percentage' ? 'Contoh: 5 untuk +5%' : 'Contoh: 100000'}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Simulation Preview */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Simulasi Estimasi Perubahan Harga:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {rooms
                    .filter(r => batchTargetType === 'all' || r.type === batchTargetType)
                    .slice(0, 3)
                    .map(r => {
                      let projected = r.basePrice;
                      if (batchMode === 'fixed') projected = batchValue;
                      else if (batchMode === 'delta') projected = r.basePrice + batchValue;
                      else if (batchMode === 'percentage') projected = Math.round((r.basePrice * (1 + batchValue / 100)) / 10000) * 10000;

                      return (
                        <div key={r.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 text-[11px]">
                          <span className="font-bold block">Kamar {r.number} ({r.type})</span>
                          <span className="text-slate-400 line-through font-mono">{formatIDR(r.basePrice)}</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                            → {formatIDR(projected)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Terapkan Perubahan Harga ke Semua Unit Terpilih
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: ADD NEW ROOM */}
        {activeTab === 'add' && (
          <form onSubmit={handleCreateNewRoom} className="flex-1 overflow-y-auto space-y-4 p-1 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                Pendaftaran Unit Kamar Baru
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Tambahkan kamar baru pada denah kost (misal pembangunan lantai baru atau penambahan paviliun).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Nomor Kamar Baru:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 305, 401"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Lantai:</label>
                <select
                  value={newRoomFloor}
                  onChange={(e) => setNewRoomFloor(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                >
                  <option value={1}>Lantai 1</option>
                  <option value={2}>Lantai 2</option>
                  <option value={3}>Lantai 3 (Rooftop)</option>
                  <option value={4}>Lantai 4</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Tipe Kamar:</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="VIP Suite">VIP Suite</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Harga Sewa Bulanan (Rp):</label>
                <input
                  type="number"
                  required
                  step="50000"
                  value={newRoomPrice}
                  onChange={(e) => setNewRoomPrice(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Luas Kamar (m²):</label>
                <input
                  type="number"
                  step="0.5"
                  value={newRoomSize}
                  onChange={(e) => setNewRoomSize(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Tarif KWh Listrik (Rp):</label>
                <input
                  type="number"
                  value={newRoomKwhRate}
                  onChange={(e) => setNewRoomKwhRate(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">Pilih Fasilitas Standar Unit:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMMON_FACILITIES.map(fac => {
                  const isChecked = newRoomFacilities.includes(fac);
                  return (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => toggleFacility(fac, true)}
                      className={`p-1.5 rounded text-left border flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-medium'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="truncate pr-1">{fac}</span>
                      {isChecked && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-3.5 py-1.5 text-slate-600 dark:text-slate-400"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Daftarkan Kamar Baru
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>Semua perubahan harga dan nomor kamar otomatis tersimpan dan terhubung ke sistem penagihan.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 text-white font-medium rounded-md hover:bg-slate-800"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
