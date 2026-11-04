import React, { useState } from 'react';
import { MaintenanceTicket, Room, Tenant, StaffMember, TicketCategory, TicketPriority, TicketStatus } from '../types';
import { formatIDR, formatDateIndo } from '../lib/storage';
import { STAFF_MEMBERS } from '../data/mockData';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus, 
  Search, 
  User, 
  DollarSign, 
  CheckCircle2, 
  Filter
} from 'lucide-react';

interface MaintenanceSystemProps {
  tickets: MaintenanceTicket[];
  rooms: Room[];
  tenants: Tenant[];
  onCreateTicket: (ticket: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'reportedAt'>) => void;
  onUpdateTicketStatus: (
    ticketId: string, 
    status: TicketStatus, 
    assignedStaff?: string, 
    expenseAmount?: number, 
    notes?: string
  ) => void;
}

export const MaintenanceSystem: React.FC<MaintenanceSystemProps> = ({
  tickets,
  rooms,
  tenants,
  onCreateTicket,
  onUpdateTicketStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    roomId: '',
    category: 'AC' as TicketCategory,
    priority: 'medium' as TicketPriority,
    title: '',
    description: '',
    assignedStaff: 'Pak Budi (Caretaker)',
  });

  // Resolve / Edit Modal State
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [editStatus, setEditStatus] = useState<TicketStatus>('open');
  const [editStaff, setEditStaff] = useState('');
  const [editExpense, setEditExpense] = useState<number>(0);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const room = rooms.find(r => r.id === t.roomId);
      return (
        t.title.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q) ||
        room?.number.includes(q) ||
        t.assignedStaff?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenEdit = (t: MaintenanceTicket) => {
    setSelectedTicket(t);
    setEditStatus(t.status);
    setEditStaff(t.assignedStaff || 'Pak Budi (Caretaker)');
    setEditExpense(t.expenseAmount || 0);
    setResolutionNotes(t.resolutionNotes || '');
  };

  const handleSaveTicketUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    onUpdateTicketStatus(
      selectedTicket.id,
      editStatus,
      editStaff,
      editExpense > 0 ? editExpense : undefined,
      resolutionNotes
    );

    setSelectedTicket(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.roomId || !newTicketForm.title) {
      alert('Pilih nomor kamar dan isi judul kendala.');
      return;
    }

    const room = rooms.find(r => r.id === newTicketForm.roomId);

    onCreateTicket({
      roomId: newTicketForm.roomId,
      tenantId: room?.currentTenantId,
      category: newTicketForm.category,
      priority: newTicketForm.priority,
      title: newTicketForm.title,
      description: newTicketForm.description,
      assignedStaff: newTicketForm.assignedStaff,
      status: 'open',
    });

    setIsCreateOpen(false);
    setNewTicketForm({
      roomId: '',
      category: 'AC',
      priority: 'medium',
      title: '',
      description: '',
      assignedStaff: 'Pak Budi (Caretaker)',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Sistem Tiket Keluhan & Perbaikan Fasilitas
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau laporan perbaikan AC, Wi-Fi, pipa air, penugasan staff teknisi, dan integrasi biaya ke laporan kas
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="py-1.5 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Buat Tiket Perbaikan
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-xs">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md ${statusFilter === 'all' ? 'bg-white dark:bg-slate-700 font-semibold shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Semua Status
            </button>
            <button
              onClick={() => setStatusFilter('open')}
              className={`px-2.5 py-1 rounded-md ${statusFilter === 'open' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 font-semibold shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Terbuka (Open)
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-2.5 py-1 rounded-md ${statusFilter === 'in_progress' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Dikerjakan
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-2.5 py-1 rounded-md ${statusFilter === 'resolved' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Selesai
            </button>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tiket, kamar, staf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.map(t => {
          const room = rooms.find(r => r.id === t.roomId);
          const tenant = tenants.find(tn => tn.id === t.tenantId);

          const statusColor = 
            t.status === 'open' ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200' :
            t.status === 'in_progress' ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200' :
            'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200';

          const priorityColor = 
            t.priority === 'urgent' ? 'text-rose-600 dark:text-rose-400 font-bold' :
            t.priority === 'high' ? 'text-amber-600 dark:text-amber-400 font-semibold' :
            'text-slate-500 dark:text-slate-400';

          return (
            <div 
              key={t.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500 font-medium">
                    {t.ticketNumber}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] rounded font-semibold border ${statusColor}`}>
                    {t.status === 'open' ? 'TERBUKA' : t.status === 'in_progress' ? 'DIKERJAKAN' : 'SELESAI'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-bold text-slate-900 dark:text-white">Kamar {room?.number}</span>
                    <span>·</span>
                    <span>Kategori: {t.category}</span>
                    <span>·</span>
                    <span className={priorityColor}>Prioritas: {t.priority.toUpperCase()}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                {t.resolutionNotes && (
                  <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <span className="font-semibold block">Catatan Penyelesaian:</span>
                    {t.resolutionNotes}
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500">
                    Petugas: <span className="font-medium text-slate-800 dark:text-slate-200">{t.assignedStaff || '-'}</span>
                  </div>
                  {t.expenseAmount && (
                    <div className="text-[11px] font-mono font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                      Biaya: {formatIDR(t.expenseAmount)}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleOpenEdit(t)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Ticket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Buat Tiket Perbaikan Fasilitas Baru
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Pilih Unit Kamar:</label>
                <select
                  required
                  value={newTicketForm.roomId}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, roomId: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">-- Pilih Kamar --</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Kamar {r.number} (Lt {r.floor} · {r.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Kategori Kendala:</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="AC">AC & Pendingin</option>
                    <option value="Wi-Fi">Wi-Fi & Jaringan</option>
                    <option value="Plumbing">Pipa & Kran Air</option>
                    <option value="Listrik">Kelistrikan & Saklar</option>
                    <option value="Kunci/Pintu">Kunci / Smart Lock</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Tingkat Prioritas:</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="low">Rendah (Low)</option>
                    <option value="medium">Sedang (Medium)</option>
                    <option value="high">Tinggi (High)</option>
                    <option value="urgent">Darurat (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Judul Keluhan / Gejala:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: AC menetes ke lantai atau tidak dingin"
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Detail Deskripsi Kendala:</label>
                <textarea
                  rows={3}
                  placeholder="Rincian kendala, perkiraan waktu kejadian..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Tugaskan ke Petugas:</label>
                <select
                  value={newTicketForm.assignedStaff}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, assignedStaff: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {STAFF_MEMBERS.map(stf => (
                    <option key={stf.id} value={`${stf.name} (${stf.role})`}>
                      {stf.name} - {stf.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                >
                  Kirim Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Ticket Status Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Update Progres: {selectedTicket.ticketNumber}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedTicket.title} (Kamar {rooms.find(r => r.id === selectedTicket.roomId)?.number})
            </p>

            <form onSubmit={handleSaveTicketUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Status Pengerjaan:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="open">Terbuka (Belum dikerjakan)</option>
                  <option value="in_progress">Sedang Dikerjakan Teknisi</option>
                  <option value="resolved">Selesai (Resolved)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Petugas Penanggung Jawab:</label>
                <input
                  type="text"
                  value={editStaff}
                  onChange={(e) => setEditStaff(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Biaya Perbaikan / Sparepart (Rp) - Otomatis Tercatat ke Kas:
                </label>
                <input
                  type="number"
                  value={editExpense}
                  onChange={(e) => setEditExpense(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Catatan Tindakan / Solusi:</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Sudah dibersihkan, ganti kapasitor baru..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
