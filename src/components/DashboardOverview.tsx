import React, { useMemo } from 'react';
import { Room, Tenant, Invoice, MaintenanceTicket, FinancialRecord } from '../types';
import { formatIDR, formatDateIndo } from '../lib/storage';
import { 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Wrench, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Send, 
  DollarSign, 
  Zap, 
  Users 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardOverviewProps {
  rooms: Room[];
  tenants: Tenant[];
  invoices: Invoice[];
  tickets: MaintenanceTicket[];
  expenses: FinancialRecord[];
  onOpenWhatsAppModal: (invoice: Invoice) => void;
  onNavigateTab: (tab: string) => void;
  onSelectRoom: (roomId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  rooms,
  tenants,
  invoices,
  tickets,
  expenses,
  onOpenWhatsAppModal,
  onNavigateTab,
  onSelectRoom,
}) => {
  // Room Status Stats
  const roomStats = useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter(r => r.status === 'occupied').length;
    const vacant = rooms.filter(r => r.status === 'vacant').length;
    const maintenance = rooms.filter(r => r.status === 'maintenance').length;
    const pendingPayment = rooms.filter(r => r.status === 'pending_payment').length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, vacant, maintenance, pendingPayment, occupancyRate };
  }, [rooms]);

  // Financial Stats for Current Month (November 2026)
  const financialStats = useMemo(() => {
    // Incomes from paid invoices
    const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const totalCollected = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((acc, inv) => acc + inv.totalAmount, 0);
    const totalPending = invoices
      .filter(inv => inv.status === 'unpaid' || inv.status === 'verifying' || inv.status === 'overdue')
      .reduce((acc, inv) => acc + inv.totalAmount, 0);

    const totalExpense = expenses
      .filter(exp => exp.type === 'expense')
      .reduce((acc, exp) => acc + exp.amount, 0);

    const netOperatingIncome = totalCollected - totalExpense;

    return { totalBilled, totalCollected, totalPending, totalExpense, netOperatingIncome };
  }, [invoices, expenses]);

  // Live Alerts for Upcoming & Overdue Rent
  const rentAlerts = useMemo(() => {
    const today = new Date('2026-11-02'); // Current mock date context

    return invoices
      .filter(inv => inv.status !== 'paid')
      .map(inv => {
        const dueDate = new Date(inv.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const tenant = tenants.find(t => t.id === inv.tenantId);
        const room = rooms.find(r => r.id === inv.roomId);

        let urgency: 'overdue' | 'urgent' | 'warning' | 'normal' = 'normal';
        let label = '';

        if (diffDays < 0) {
          urgency = 'overdue';
          label = `Terlambat ${Math.abs(diffDays)} hari`;
        } else if (diffDays <= 3) {
          urgency = 'urgent';
          label = `${diffDays === 0 ? 'Hari ini' : diffDays + ' hari lagi'}`;
        } else if (diffDays <= 7) {
          urgency = 'warning';
          label = `${diffDays} hari lagi`;
        } else {
          label = `${diffDays} hari lagi`;
        }

        return {
          invoice: inv,
          tenant,
          room,
          diffDays,
          urgency,
          label,
        };
      })
      .sort((a, b) => a.diffDays - b.diffDays);
  }, [invoices, tenants, rooms]);

  // 6-Month Revenue & Expense Trend Mock Data
  const chartData = [
    { month: 'Jun', pendapatan: 26800000, pengeluaran: 5200000, bersih: 21600000 },
    { month: 'Jul', pendapatan: 28400000, pengeluaran: 6100000, bersih: 22300000 },
    { month: 'Agt', pendapatan: 31200000, pengeluaran: 5800000, bersih: 25400000 },
    { month: 'Sep', pendapatan: 32500000, pengeluaran: 5900000, bersih: 26600000 },
    { month: 'Okt', pendapatan: 33400000, pengeluaran: 6400000, bersih: 27000000 },
    { month: 'Nov (Est)', pendapatan: 34200000, pengeluaran: 5530000, bersih: 28670000 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Context */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Monitoring Operasional Real-Time</span>
              <span>·</span>
              <span>Kost Fajar Balikpapan</span>
              <span>·</span>
              <span className="font-mono">Balikpapan, Kaltim</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Pusat Kendali Operasional Kost
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Ringkasan performa okupansi unit kamar, kepatuhan pembayaran sewa bulanan, monitoring konsumsi KWh listrik, dan penanganan tiket perbaikan fasilitas.
            </p>
          </div>
          <div className="lg:col-span-4 flex justify-end">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-lg border border-slate-200 dark:border-slate-700 w-full sm:w-auto text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Tingkat Okupansi Kamar</span>
              <div className="flex items-baseline justify-end gap-2 mt-0.5">
                <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                  {roomStats.occupancyRate}%
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 inline" /> +8.3% MoM
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${roomStats.occupancyRate}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 block">
                {roomStats.occupied} dari {roomStats.total} Kamar Terisi Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Terisi */}
        <div 
          onClick={() => onNavigateTab('rooms')}
          className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Kamar Terisi</span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {roomStats.occupied}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ {roomStats.total} unit</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {roomStats.vacant} unit siap disewa
          </p>
        </div>

        {/* Card 2: Uang Masuk Terkumpul */}
        <div 
          onClick={() => onNavigateTab('billing')}
          className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pemasukan Terverifikasi</span>
            <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums block truncate">
              {formatIDR(financialStats.totalCollected)}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span>Sewa + Add-on Listrik</span>
          </p>
        </div>

        {/* Card 3: Tagihan Pending / Belum Bayar */}
        <div 
          onClick={() => onNavigateTab('billing')}
          className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Piutang Berjalan</span>
            <div className="w-7 h-7 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums block truncate">
              {formatIDR(financialStats.totalPending)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {invoices.filter(i => i.status !== 'paid').length} invoice menunggu bayar
          </p>
        </div>

        {/* Card 4: Laba Bersih Operasional (NOI) */}
        <div 
          onClick={() => onNavigateTab('billing')}
          className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Forecast Laba Bersih</span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums block truncate">
              {formatIDR(financialStats.netOperatingIncome)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Pengeluaran: {formatIDR(financialStats.totalExpense)}
          </p>
        </div>
      </div>

      {/* Main Grid: 2-Column Split (Live Alerts & Financial Analytics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Rent Due Alerts & Action Center */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Peringatan Jatuh Tempo Sewa
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tindakan cepat tagihan sewa & verifikasi bukti transfer
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
                {rentAlerts.length} Menunggu
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[380px] overflow-y-auto">
              {rentAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  Semua tagihan sewa bulan ini telah lunas terverifikasi! 🎉
                </div>
              ) : (
                rentAlerts.map(alert => (
                  <div key={alert.invoice.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          Kamar {alert.room?.number || '-'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">·</span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-medium">
                          {alert.tenant?.name || 'Penghuni'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                          {formatIDR(alert.invoice.totalAmount)}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className={`font-medium ${
                          alert.urgency === 'overdue' 
                            ? 'text-rose-600 dark:text-rose-400 font-bold' 
                            : alert.urgency === 'urgent'
                            ? 'text-amber-600 dark:text-amber-400 font-semibold'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {alert.label}
                        </span>
                        {alert.invoice.status === 'verifying' && (
                          <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
                            Bukti Terunggah
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onOpenWhatsAppModal(alert.invoice)}
                        title="Kirim Pesan WhatsApp Pengingat Tagihan"
                        className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-md border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Format pesan otomatis dengan rincian listrik KWh</span>
              <button 
                onClick={() => onNavigateTab('billing')}
                className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
              >
                Buka Semua Tagihan →
              </button>
            </div>
          </div>

          {/* Quick Caretaker / Maintenance Snapshot */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Tiket Perbaikan Berjalan
                </h3>
              </div>
              <button 
                onClick={() => onNavigateTab('tickets')}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Kelola Tiket
              </button>
            </div>
            <div className="space-y-3 mt-3">
              {tickets.slice(0, 3).map(t => {
                const room = rooms.find(r => r.id === t.roomId);
                return (
                  <div key={t.id} className="text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Kamar {room?.number} · {t.title}
                      </span>
                      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-medium ${
                        t.status === 'open' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300' :
                        t.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300' :
                        'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {t.status === 'open' ? 'Terbuka' : t.status === 'in_progress' ? 'Dikerjakan' : 'Selesai'}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 line-clamp-1">
                      {t.description}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Petugas: {t.assignedStaff || 'Belum ditugaskan'}</span>
                      <span>{t.reportedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Financial Chart & Visual Room Matrix */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Revenue & Cashflow Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Tren Finansial & Arus Kas 6 Bulan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pendapatan kotor vs pengeluaran operasional (Maintenance, Gaji, Wi-Fi, Listrik)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" /> Pemasukan
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-400 inline-block" /> Pengeluaran
                </span>
              </div>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartGrid />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)} jt`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatIDR(Number(value)), '']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderRadius: '8px', 
                      color: '#fff',
                      fontSize: '12px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pendapatan" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPendapatan)" 
                    name="Pemasukan"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pengeluaran" 
                    stroke="#f43f5e" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPengeluaran)" 
                    name="Pengeluaran"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Rata-rata Pendapatan</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
                  Rp 31,1 Jt/bln
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Beban Operasional</span>
                <span className="text-sm font-semibold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                  17.8% dari Omset
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Gross Yield Tahunan</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  11.4%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Room Status Matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Matriks Status Kamar Cepat
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Klik unit untuk melihat rincian penyewa atau mencatat meteran
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Terisi ({roomStats.occupied})
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" /> Kosong ({roomStats.vacant})
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Tagihan ({roomStats.pendingPayment})
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Perbaikan ({roomStats.maintenance})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 mt-4">
              {rooms.map(room => {
                const tenant = tenants.find(t => t.id === room.currentTenantId);
                const statusBg = 
                  room.status === 'occupied' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' :
                  room.status === 'vacant' ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300' :
                  room.status === 'pending_payment' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200' :
                  'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200';

                return (
                  <button
                    key={room.id}
                    onClick={() => onSelectRoom(room.id)}
                    className={`p-3 rounded-lg border text-left transition-all hover:scale-[1.02] shadow-2xs ${statusBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm font-mono">{room.number}</span>
                      <span className="text-[10px] font-mono">Lt {room.floor}</span>
                    </div>
                    <span className="text-[10px] block opacity-80 mt-1 truncate">
                      {room.status === 'occupied' || room.status === 'pending_payment' 
                        ? (tenant?.name ? tenant.name.split(' ')[0] : 'Terisi')
                        : room.status === 'vacant' ? 'Siap Huni' : 'Servis'}
                    </span>
                    <span className="text-[10px] font-mono block opacity-70 mt-0.5">
                      {formatIDR(room.basePrice / 1000000)}jt
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

function CartGrid() {
  return <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />;
}
