import React from 'react';
import { Room, Tenant, Invoice, MaintenanceTicket, RoomStatus } from '../types';
import { formatIDR, formatDateIndo } from '../lib/storage';
import { 
  Building2, 
  Key, 
  Zap, 
  User, 
  Wrench, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  Settings
} from 'lucide-react';

interface RoomDetailModalProps {
  room: Room | null;
  tenant?: Tenant;
  invoices: Invoice[];
  tickets: MaintenanceTicket[];
  onClose: () => void;
  onUpdateStatus: (roomId: string, status: RoomStatus) => void;
  onOpenCheckIn: (room: Room) => void;
  onOpenMeter: (room: Room) => void;
  onOpenTicket: (room: Room) => void;
  onOpenBill: (room: Room) => void;
  onOpenRoomConfig?: (roomId: string) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  tenant,
  invoices,
  tickets,
  onClose,
  onUpdateStatus,
  onOpenCheckIn,
  onOpenMeter,
  onOpenTicket,
  onOpenBill,
  onOpenRoomConfig,
}) => {
  if (!room) return null;

  const roomInvoices = invoices.filter(inv => inv.roomId === room.id);
  const roomTickets = tickets.filter(t => t.roomId === room.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                Kamar {room.number}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Lantai {room.floor} · {room.type}
              </span>
              {onOpenRoomConfig && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRoomConfig(room.id);
                  }}
                  className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 flex items-center gap-1 transition-colors"
                  title="Ubah tarif sewa pokok dan konfigurasi nomor kamar"
                >
                  <Settings className="w-3 h-3" />
                  Ubah Tarif / No
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Luas {room.sizeM2} m² · Harga Sewa Pokok: <span className="font-mono font-bold text-slate-900 dark:text-white">{formatIDR(room.basePrice)}</span>/bulan
            </p>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            ✕
          </button>
        </div>

        {/* Room Image & Quick Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-5 h-36 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img 
              src={room.imageUrl || '/src/assets/images/kost_room_deluxe_1793684547405.jpg'} 
              alt={`Kamar ${room.number}`} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="sm:col-span-7 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Status Operasional:</span>
              <select
                value={room.status}
                onChange={(e) => onUpdateStatus(room.id, e.target.value as RoomStatus)}
                className="p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-medium"
              >
                <option value="occupied">Terisi (Occupied)</option>
                <option value="vacant">Kosong Siap Huni (Vacant)</option>
                <option value="pending_payment">Menunggu Pembayaran</option>
                <option value="maintenance">Dalam Perbaikan (Maintenance)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">PIN Kunci Pintu:</span>
              <span className="font-mono font-bold tracking-wider text-slate-900 dark:text-white">{room.doorPin}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">RFID Smart Card:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{room.keycardUid || '-'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Meteran Listrik KWh:</span>
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                {room.currentMeterKwh.toFixed(1)} KWh
              </span>
            </div>
          </div>
        </div>

        {/* Current Tenant Information */}
        {tenant ? (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Penyewa Saat Ini: {tenant.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Jatuh Tempo: Tgl {tenant.rentDueDay}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
              <div>WhatsApp: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{tenant.phone}</span></div>
              <div>Pekerjaan: {tenant.occupation}</div>
              <div>Periode: {formatDateIndo(tenant.startDate)} s/d {formatDateIndo(tenant.endDate)}</div>
              <div>Deposit: <span className="font-mono">{formatIDR(tenant.depositAmount)}</span></div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
            <span className="text-emerald-800 dark:text-emerald-300">
              Unit kamar ini kosong dan siap untuk dihuni penghuni baru.
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenCheckIn(room);
              }}
              className="px-3 py-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs"
            >
              Check-in Sekarang
            </button>
          </div>
        )}

        {/* Facilities */}
        <div className="text-xs space-y-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300 block">Fasilitas Unit:</span>
          <div className="flex flex-wrap gap-1.5">
            {room.facilities.map((fac, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                {fac}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Operations toolbar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                onOpenMeter(room);
              }}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded flex items-center gap-1 text-slate-700 dark:text-slate-200"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Catat Meter Listrik
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenBill(room);
              }}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded flex items-center gap-1 text-slate-700 dark:text-slate-200"
            >
              <Receipt className="w-3.5 h-3.5 text-blue-500" />
              Generate Tagihan
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenTicket(room);
              }}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded flex items-center gap-1 text-slate-700 dark:text-slate-200"
            >
              <Wrench className="w-3.5 h-3.5 text-rose-500" />
              Buat Tiket Perbaikan
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 text-white font-medium rounded text-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
