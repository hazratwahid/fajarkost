import React, { useState } from 'react';
import { Room, Tenant, RoomStatus, RoomType } from '../types';
import { formatIDR } from '../lib/storage';
import { 
  Building2, 
  Key, 
  Zap, 
  UserPlus, 
  Wrench, 
  Receipt, 
  Search, 
  SlidersHorizontal,
  CheckCircle,
  Clock,
  Sparkles,
  Maximize2,
  Settings
} from 'lucide-react';

interface RoomGridProps {
  rooms: Room[];
  tenants: Tenant[];
  onSelectRoom: (roomId: string) => void;
  onOpenCheckInModal: (room: Room) => void;
  onOpenMeterModal: (room: Room) => void;
  onOpenTicketModal: (room: Room) => void;
  onOpenBillModal: (room: Room) => void;
  onUpdateRoomStatus: (roomId: string, status: RoomStatus) => void;
  onOpenRoomConfig?: (roomId?: string) => void;
}

export const RoomGrid: React.FC<RoomGridProps> = ({
  rooms,
  tenants,
  onSelectRoom,
  onOpenCheckInModal,
  onOpenMeterModal,
  onOpenTicketModal,
  onOpenBillModal,
  onUpdateRoomStatus,
  onOpenRoomConfig,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms.filter(room => {
    if (selectedFloor !== 'all' && room.floor !== selectedFloor) return false;
    if (selectedStatus !== 'all' && room.status !== selectedStatus) return false;
    if (selectedType !== 'all' && room.type !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const tenant = tenants.find(t => t.id === room.currentTenantId);
      const matchesNumber = room.number.toLowerCase().includes(q);
      const matchesTenant = tenant?.name.toLowerCase().includes(q);
      const matchesType = room.type.toLowerCase().includes(q);
      if (!matchesNumber && !matchesTenant && !matchesType) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Denah & Manajemen Kamar
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau status 12 unit kamar, ketersediaan hunian, dan kontrol akses kamar per lantai
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Search */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari no. kamar, tipe, penyewa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {onOpenRoomConfig && (
              <button
                onClick={() => onOpenRoomConfig()}
                className="py-1.5 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1.5 transition-colors shadow-xs whitespace-nowrap"
              >
                <Settings className="w-3.5 h-3.5" />
                Kelola Tarif & No. Kamar
              </button>
            )}
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-4 text-xs">
          
          {/* Floor selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedFloor('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedFloor === 'all' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua Lantai
            </button>
            <button
              onClick={() => setSelectedFloor(1)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedFloor === 1 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Lantai 1
            </button>
            <button
              onClick={() => setSelectedFloor(2)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedFloor === 2 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Lantai 2
            </button>
            <button
              onClick={() => setSelectedFloor(3)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedFloor === 3 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Lantai 3 (Rooftop)
            </button>
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === 'all' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Semua Status
            </button>
            <button
              onClick={() => setSelectedStatus('occupied')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === 'occupied' 
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-2xs font-medium' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Terisi
            </button>
            <button
              onClick={() => setSelectedStatus('vacant')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === 'vacant' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Kosong (Siap)
            </button>
            <button
              onClick={() => setSelectedStatus('pending_payment')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === 'pending_payment' 
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-2xs font-medium' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Tagihan
            </button>
            <button
              onClick={() => setSelectedStatus('maintenance')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedStatus === 'maintenance' 
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-2xs font-medium' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Perbaikan
            </button>
          </div>

          {/* Type selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedType === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Tipe: Semua
            </button>
            <button
              onClick={() => setSelectedType('Standard')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedType === 'Standard' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setSelectedType('Deluxe')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedType === 'Deluxe' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Deluxe
            </button>
            <button
              onClick={() => setSelectedType('VIP Suite')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedType === 'VIP Suite' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              VIP Suite
            </button>
          </div>

          <div className="ml-auto text-xs text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-semibold text-slate-900 dark:text-white">{filteredRooms.length}</span> dari {rooms.length} unit
          </div>
        </div>
      </div>

      {/* Room Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredRooms.map(room => {
          const tenant = tenants.find(t => t.id === room.currentTenantId);

          const statusBadge = 
            room.status === 'occupied' ? { label: 'Terisi Aktif', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' } :
            room.status === 'vacant' ? { label: 'Kosong (Tersedia)', color: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' } :
            room.status === 'pending_payment' ? { label: 'Menunggu Bayar', color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' } :
            { label: 'Dalam Perbaikan', color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' };

          return (
            <div 
              key={room.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col shadow-xs"
            >
              {/* Room Header Image */}
              <div className="relative h-40 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={room.imageUrl || '/src/assets/images/kost_room_deluxe_1793684547405.jpg'}
                  alt={`Kamar ${room.number} Kost Fajar Balikpapan`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                
                {/* Floating Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 text-xs font-bold font-mono bg-slate-900/90 text-white rounded-md backdrop-blur-xs">
                    Kamar {room.number}
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 rounded-md backdrop-blur-xs">
                    Lt {room.floor} · {room.type}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 text-[11px] font-medium rounded-md border backdrop-blur-xs ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white drop-shadow-sm font-medium">
                  <span className="bg-slate-900/70 px-2 py-0.5 rounded backdrop-blur-xs">
                    {room.sizeM2} m²
                  </span>
                  <span className="bg-slate-900/70 px-2 py-0.5 rounded backdrop-blur-xs font-mono font-semibold">
                    {formatIDR(room.basePrice)}/bln
                  </span>
                </div>
              </div>

              {/* Room Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                
                {/* Tenant Info or Vacancy Notice */}
                {tenant && (room.status === 'occupied' || room.status === 'pending_payment') ? (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Penyewa Aktif:</span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                        {tenant.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>Jatuh Tempo: Tgl {tenant.rentDueDay}</span>
                      <span>WA: {tenant.phone}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
                    {room.status === 'vacant' ? (
                      <div className="flex items-center justify-between">
                        <span>Unit bersih siap huni hari ini</span>
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <span className="text-rose-700 dark:text-rose-400">
                        Dalam perbaikan / maintenance teknisi
                      </span>
                    )}
                  </div>
                )}

                {/* Facilities Highlights */}
                <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Fasilitas: </span>
                  {room.facilities.slice(0, 3).join(', ')}
                  {room.facilities.length > 3 && ` +${room.facilities.length - 3} lainnya`}
                </div>

                {/* Meter & Access Info */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-mono tabular-nums text-[11px]">{room.currentMeterKwh.toFixed(1)} KWh</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-slate-600 dark:text-slate-400">
                    <Key className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-mono text-[11px]">PIN: {room.doorPin}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                  {room.status === 'vacant' ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <button
                        onClick={() => onOpenCheckInModal(room)}
                        className="flex-1 py-1.5 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Check-in Penghuni
                      </button>
                      {onOpenRoomConfig && (
                        <button
                          onClick={() => onOpenRoomConfig(room.id)}
                          title="Ubah Nomor & Harga Kamar"
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onSelectRoom(room.id)}
                        className="flex-1 py-1.5 px-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors text-center"
                      >
                        Detail
                      </button>
                      {onOpenRoomConfig && (
                        <button
                          onClick={() => onOpenRoomConfig(room.id)}
                          title="Ubah Nomor & Tarif Kamar"
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onOpenMeterModal(room)}
                        title="Catat Meteran Listrik"
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenBillModal(room)}
                        title="Generate Tagihan Bulanan"
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenTicketModal(room)}
                        title="Buat Tiket Perbaikan"
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
