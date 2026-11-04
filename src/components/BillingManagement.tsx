import React, { useState } from 'react';
import { Invoice, Room, Tenant, FinancialRecord, InvoiceItem } from '../types';
import { formatIDR, formatDateIndo, generateWhatsAppMessage } from '../lib/storage';
import { 
  Receipt, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  Printer, 
  Search, 
  Filter, 
  DollarSign, 
  FileCheck,
  Zap,
  Copy,
  ExternalLink,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BillingManagementProps {
  invoices: Invoice[];
  rooms: Room[];
  tenants: Tenant[];
  expenses: FinancialRecord[];
  onVerifyPayment: (invoiceId: string, verified: boolean, notes?: string) => void;
  onCreateInvoice: (newInvoice: Omit<Invoice, 'id'>) => void;
  onOpenReceipt: (invoice: Invoice) => void;
  onAddExpense: (expense: Omit<FinancialRecord, 'id'>) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
}

export const BillingManagement: React.FC<BillingManagementProps> = ({
  invoices,
  rooms,
  tenants,
  expenses,
  onVerifyPayment,
  onCreateInvoice,
  onOpenReceipt,
  onAddExpense,
  onDeleteInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'verification' | 'expenses'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  
  // WhatsApp Preview Modal State
  const [waModalData, setWaModalData] = useState<{
    invoice: Invoice;
    tenant: Tenant;
    room: Room;
    message: string;
  } | null>(null);
  const [copiedWA, setCopiedWA] = useState(false);

  // New Invoice Generator Modal
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [periodMonth, setPeriodMonth] = useState('November 2026');
  const [dueDate, setDueDate] = useState('2026-11-05');
  const [kwhUsed, setKwhUsed] = useState(65);
  const [kwhRate, setKwhRate] = useState(2500);
  const [parkingFee, setParkingFee] = useState(0);
  const [laundryFee, setLaundryFee] = useState(0);
  const [trashFee, setTrashFee] = useState(50000);

  // New Expense Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    date: '2026-11-02',
    category: 'Maintenance' as FinancialRecord['category'],
    description: '',
    amount: 150000,
    roomId: '',
  });

  const verifyingInvoices = invoices.filter(inv => inv.status === 'verifying');

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const tenant = tenants.find(t => t.id === inv.tenantId);
      const room = rooms.find(r => r.id === inv.roomId);
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        tenant?.name.toLowerCase().includes(q) ||
        room?.number.includes(q)
      );
    }
    return true;
  });

  const handleOpenWAModal = (inv: Invoice) => {
    const tenant = tenants.find(t => t.id === inv.tenantId);
    const room = rooms.find(r => r.id === inv.roomId);
    if (!tenant || !room) return;

    const message = generateWhatsAppMessage(tenant, room, inv);
    setWaModalData({ invoice: inv, tenant, room, message });
    setCopiedWA(false);
  };

  const handleCopyWAMessage = () => {
    if (!waModalData) return;
    navigator.clipboard.writeText(waModalData.message);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2500);
  };

  const handleOpenWhatsAppWeb = () => {
    if (!waModalData) return;
    const cleanPhone = waModalData.tenant.phone.replace(/^0/, '62');
    const encoded = encodeURIComponent(waModalData.message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  const handleExecuteVerify = (invId: string, approved: boolean) => {
    if (approved) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
    }
    onVerifyPayment(invId, approved, approved ? 'Terverifikasi via mutasi bank' : 'Bukti transfer tidak sesuai nominal');
  };

  const handleGenerateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const room = rooms.find(r => r.id === selectedRoomId);
    if (!room || !room.currentTenantId) {
      alert('Pilih kamar yang memiliki penyewa aktif.');
      return;
    }

    const items: InvoiceItem[] = [
      { description: `Sewa Pokok Kamar ${room.number} (${periodMonth})`, amount: room.basePrice },
    ];

    if (kwhUsed > 0) {
      const electricityCost = kwhUsed * kwhRate;
      items.push({
        description: `Pemakaian Listrik (${kwhUsed} KWh x ${formatIDR(kwhRate)})`,
        amount: electricityCost,
        isUsageBased: true,
      });
    }

    if (parkingFee > 0) {
      items.push({ description: 'Iuran Parkir Kendaraan Tambahan', amount: Number(parkingFee) });
    }

    if (laundryFee > 0) {
      items.push({ description: 'Langganan Laundry Kiloan', amount: Number(laundryFee) });
    }

    if (trashFee > 0) {
      items.push({ description: 'Iuran Kebersihan & Sampah', amount: Number(trashFee) });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const invoiceNum = `INV/2026/${(invoices.length + 1).toString().padStart(3, '0')}`;

    onCreateInvoice({
      invoiceNumber: invoiceNum,
      tenantId: room.currentTenantId,
      roomId: room.id,
      periodMonth,
      dueDate,
      baseRent: room.basePrice,
      items,
      totalAmount,
      status: 'unpaid',
      createdAt: new Date().toISOString().split('T')[0],
    });

    setIsCreateInvoiceOpen(false);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount) return;

    onAddExpense({
      date: expenseForm.date,
      type: 'expense',
      category: expenseForm.category,
      description: expenseForm.description,
      amount: Number(expenseForm.amount),
      roomId: expenseForm.roomId || undefined,
    });

    setIsAddExpenseOpen(false);
    setExpenseForm({
      date: '2026-11-02',
      category: 'Maintenance',
      description: '',
      amount: 150000,
      roomId: '',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Billing Otomatis, Tagihan & Pembukuan Kas
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generate tagihan dinamis bulanan, kalkulasi KWh listrik, kirim format WhatsApp 1-klik, dan verifikasi mutasi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="py-1.5 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-rose-500" />
              Catat Pengeluaran
            </button>
            <button
              onClick={() => setIsCreateInvoiceOpen(true)}
              className="py-1.5 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate Tagihan Baru
            </button>
          </div>
        </div>

        {/* Tab Sub-navigation */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-xs">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'invoices'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Daftar Tagihan ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors relative ${
              activeTab === 'verification'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Antrean Verifikasi Bukti
            {verifyingInvoices.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full">
                {verifyingInvoices.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'expenses'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Buku Kas Pengeluaran ({expenses.filter(e => e.type === 'expense').length})
          </button>
        </div>
      </div>

      {/* View: INVOICES LIST */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Filter Status:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded text-xs ${statusFilter === 'all' ? 'bg-slate-200 dark:bg-slate-700 font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-2.5 py-1 rounded text-xs ${statusFilter === 'paid' ? 'bg-emerald-100 dark:bg-emerald-950 font-semibold text-emerald-800 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Lunas
              </button>
              <button
                onClick={() => setStatusFilter('unpaid')}
                className={`px-2.5 py-1 rounded text-xs ${statusFilter === 'unpaid' ? 'bg-amber-100 dark:bg-amber-950 font-semibold text-amber-800 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Belum Bayar
              </button>
              <button
                onClick={() => setStatusFilter('overdue')}
                className={`px-2.5 py-1 rounded text-xs ${statusFilter === 'overdue' ? 'bg-rose-100 dark:bg-rose-950 font-semibold text-rose-800 dark:text-rose-300' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Menunggak
              </button>
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari no invoice, penghuni..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold">
                    <th className="py-3 px-4">No. Invoice</th>
                    <th className="py-3 px-4">Kamar & Penghuni</th>
                    <th className="py-3 px-4">Periode</th>
                    <th className="py-3 px-4">Rincian Komponen</th>
                    <th className="py-3 px-4">Jatuh Tempo</th>
                    <th className="py-3 px-4">Total Tagihan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.map(inv => {
                    const room = rooms.find(r => r.id === inv.roomId);
                    const tenant = tenants.find(t => t.id === inv.tenantId);

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            Kamar {room?.number} · {tenant?.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            WA: {tenant?.phone}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {inv.periodMonth}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                            {inv.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between gap-2">
                                <span>{it.description}</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{formatIDR(it.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {formatDateIndo(inv.dueDate)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {formatIDR(inv.totalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                            inv.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                            inv.status === 'verifying' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' :
                            inv.status === 'overdue' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' :
                            'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}>
                            {inv.status === 'paid' ? 'LUNAS' :
                             inv.status === 'verifying' ? 'VERIFIKASI' :
                             inv.status === 'overdue' ? 'TERLAMBAT' : 'BELUM BAYAR'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status !== 'paid' && (
                              <button
                                onClick={() => handleOpenWAModal(inv)}
                                title="Kirim Pengingat WhatsApp"
                                className="p-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-md transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onOpenReceipt(inv)}
                              title="Lihat Kuitansi Resmi Kost"
                              className="p-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setInvoiceToDelete(inv)}
                              title="Hapus Tagihan (Koreksi Data)"
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* View: VERIFICATION QUEUE */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Antrean Verifikasi Bukti Pembayaran
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cek kesesuaian transfer bank atau QRIS dari penghuni sebelum mengesahkan kuitansi lunas
            </p>

            <div className="mt-4 space-y-4">
              {verifyingInvoices.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Tidak ada bukti transfer yang menunggu verifikasi saat ini.
                </div>
              ) : (
                verifyingInvoices.map(inv => {
                  const room = rooms.find(r => r.id === inv.roomId);
                  const tenant = tenants.find(t => t.id === inv.tenantId);

                  return (
                    <div 
                      key={inv.id} 
                      className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            Kamar {room?.number} · {tenant?.name}
                          </span>
                          <span className="font-mono text-xs text-slate-500">({inv.invoiceNumber})</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {inv.notes || 'Penghuni telah mengunggah bukti bayar transfer.'}
                        </p>
                        <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          Nominal: {formatIDR(inv.totalAmount)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleExecuteVerify(inv.id, false)}
                          className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-md border border-rose-200 dark:border-rose-800 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Tolak
                        </button>
                        <button
                          onClick={() => handleExecuteVerify(inv.id, true)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verifikasi & Sahkan Lunas
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* View: EXPENSES LEDGER */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Buku Kas Beban Operasional Kost
                </h2>
                <p className="text-xs text-slate-500">
                  Mencatat pengeluaran rutin, gaji staf, maintenance AC, tagihan internet, dan listrik area bersama
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                Total Beban: {formatIDR(expenses.filter(e => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0))}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold">
                    <th className="py-2.5 px-4">Tanggal</th>
                    <th className="py-2.5 px-4">Kategori Beban</th>
                    <th className="py-2.5 px-4">Deskripsi / Peruntukan</th>
                    <th className="py-2.5 px-4">Unit Terkait</th>
                    <th className="py-2.5 px-4 text-right">Nominal Beban</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenses.filter(e => e.type === 'expense').map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-mono">{formatDateIndo(exp.date)}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {exp.category}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">{exp.description}</td>
                      <td className="py-2.5 px-4 font-mono">
                        {exp.roomId ? rooms.find(r => r.id === exp.roomId)?.number || '-' : 'Fasilitas Bersama'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                        {formatIDR(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Message Preview Modal */}
      {waModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Template Pengingat Tagihan WhatsApp
                </h3>
              </div>
              <button 
                onClick={() => setWaModalData(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Format pesan otomatis lengkap dengan rincian pemakaian listrik, rekening bank, dan tanggal jatuh tempo untuk Kak <span className="font-semibold text-slate-800 dark:text-slate-200">{waModalData.tenant.name}</span>:
            </p>

            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 rounded-lg">
              <pre className="text-xs font-mono whitespace-pre-wrap text-slate-800 dark:text-slate-200 max-h-60 overflow-y-auto leading-relaxed">
                {waModalData.message}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleCopyWAMessage}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedWA ? 'Tersalin ke Clipboard!' : 'Salin Pesan'}
              </button>

              <button
                onClick={handleOpenWhatsAppWeb}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1.5 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka WhatsApp ({waModalData.tenant.phone})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {isCreateInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Generate Tagihan Sewa & Utilitas
              </h2>
              <button 
                onClick={() => setIsCreateInvoiceOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateInvoiceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Unit Kamar:
                </label>
                <select
                  required
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">-- Pilih Kamar Terisi --</option>
                  {rooms.filter(r => r.currentTenantId).map(r => {
                    const t = tenants.find(tn => tn.id === r.currentTenantId);
                    return (
                      <option key={r.id} value={r.id}>
                        Kamar {r.number} ({t?.name} · Sewa Pokok {formatIDR(r.basePrice)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Periode Tagihan:</label>
                  <input
                    type="text"
                    value={periodMonth}
                    onChange={(e) => setPeriodMonth(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Jatuh Tempo:</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Utility Add-ons */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Add-on Utilitas & Layanan Tambahan:
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-0.5">Pemakaian Listrik (KWh):</label>
                    <input
                      type="number"
                      value={kwhUsed}
                      onChange={(e) => setKwhUsed(Number(e.target.value))}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-0.5">Tarif per KWh (Rp):</label>
                    <input
                      type="number"
                      value={kwhRate}
                      onChange={(e) => setKwhRate(Number(e.target.value))}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-0.5">Parkir Mobil (Rp):</label>
                    <input
                      type="number"
                      value={parkingFee}
                      onChange={(e) => setParkingFee(Number(e.target.value))}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-0.5">Laundry Kiloan (Rp):</label>
                    <input
                      type="number"
                      value={laundryFee}
                      onChange={(e) => setLaundryFee(Number(e.target.value))}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-0.5">Iuran Sampah & Kebersihan (Rp):</label>
                  <input
                    type="number"
                    value={trashFee}
                    onChange={(e) => setTrashFee(Number(e.target.value))}
                    className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateInvoiceOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedRoomId}
                  className="px-4 py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-50"
                >
                  Buat Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Catat Pengeluaran Beban Operasional
            </h3>
            <form onSubmit={handleAddExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Tanggal Pengeluaran:</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Kategori Beban:</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Maintenance">Maintenance & Perbaikan</option>
                  <option value="Gaji Staff">Gaji Staff / Penjaga</option>
                  <option value="Internet/Wi-Fi">Internet & Wi-Fi Kost</option>
                  <option value="Listrik/KWh">Listrik Area Bersama</option>
                  <option value="Kebersihan/Sampah">Kebersihan & Sampah RT</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Deskripsi / Peruntukan:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli token listrik pompa air"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Nominal Biaya (Rp):</label>
                <input
                  type="number"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs"
                >
                  Simpan Beban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Invoice Confirmation Modal */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Hapus Tagihan?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Invoice {invoiceToDelete.invoiceNumber} ({invoiceToDelete.periodMonth})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus tagihan ini sebesar <strong className="font-mono text-slate-900 dark:text-white">{formatIDR(invoiceToDelete.totalAmount)}</strong>? Tindakan ini akan menghapus data tagihan ini agar data tagihan lebih valid.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setInvoiceToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteInvoice?.(invoiceToDelete.id);
                  setInvoiceToDelete(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Tagihan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
