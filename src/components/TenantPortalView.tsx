import React, { useState } from 'react';
import { Tenant, Room, Invoice, MaintenanceTicket, TicketCategory } from '../types';
import { formatIDR, formatDateIndo } from '../lib/storage';
import { KOST_INFO, HOUSE_RULES } from '../data/mockData';
import { 
  User, 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Wifi, 
  Key, 
  FileText, 
  Send, 
  QrCode, 
  Clock 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TenantPortalViewProps {
  tenants: Tenant[];
  rooms: Room[];
  invoices: Invoice[];
  tickets: MaintenanceTicket[];
  activeTenantId: string;
  setActiveTenantId: (id: string) => void;
  onUploadPaymentProof: (invoiceId: string, proofUrl: string, method: any) => void;
  onSubmitMaintenance: (ticket: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'reportedAt'>) => void;
}

export const TenantPortalView: React.FC<TenantPortalViewProps> = ({
  tenants,
  rooms,
  invoices,
  tickets,
  activeTenantId,
  setActiveTenantId,
  onUploadPaymentProof,
  onSubmitMaintenance,
}) => {
  const currentTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];
  const currentRoom = rooms.find(r => r.id === currentTenant?.roomId);
  const tenantInvoices = invoices.filter(inv => inv.tenantId === currentTenant?.id);
  const tenantTickets = tickets.filter(t => t.roomId === currentRoom?.id);

  // Upload proof modal state
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Transfer BCA' | 'Transfer Mandiri' | 'QRIS'>('Transfer BCA');
  const [mockProofUploaded, setMockProofUploaded] = useState(false);

  // New Ticket State
  const [ticketCategory, setTicketCategory] = useState<TicketCategory>('AC');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Find wifi for this floor
  const floorWifi = KOST_INFO.wifiSsids.find(w => w.floor.includes(`Lantai ${currentRoom?.floor}`)) || KOST_INFO.wifiSsids[0];

  const handleExecuteUploadProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceToPay) return;

    onUploadPaymentProof(
      selectedInvoiceToPay.id,
      '/src/assets/images/proof_sample.jpg',
      paymentMethod
    );

    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch {}

    setSelectedInvoiceToPay(null);
    setMockProofUploaded(false);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoom || !ticketTitle) return;

    onSubmitMaintenance({
      roomId: currentRoom.id,
      tenantId: currentTenant.id,
      category: ticketCategory,
      priority: 'medium',
      title: ticketTitle,
      description: ticketDesc,
      status: 'open',
    });

    setTicketSuccess(true);
    setTicketTitle('');
    setTicketDesc('');
    setTimeout(() => setTicketSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Persona Header & Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-lg">
              {currentTenant?.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Portal Mandiri Penghuni Kost
                </h1>
                <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                  Penghuni: {currentTenant?.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kamar {currentRoom?.number} (Lantai {currentRoom?.floor} · {currentRoom?.type}) · Jatuh tempo tgl {currentTenant?.rentDueDay}
              </p>
            </div>
          </div>

          {/* Switch Tenant for Preview */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Simulasikan Sebagai:</span>
            <select
              value={currentTenant?.id}
              onChange={(e) => setActiveTenantId(e.target.value)}
              className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-medium"
            >
              {tenants.map(t => {
                const rm = rooms.find(r => r.id === t.roomId);
                return (
                  <option key={t.id} value={t.id}>
                    Kmr {rm?.number} - {t.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Amenities & Smartlock Access Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Door Lock PIN */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Key className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Akses Pintu Kamar Digital</span>
          </div>
          <div className="text-2xl font-mono font-bold tracking-widest text-slate-900 dark:text-white">
            {currentRoom?.doorPin}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Gunakan PIN di atas atau sentuh kartu RFID Anda di pintu kamar {currentRoom?.number}.
          </p>
        </div>

        {/* Card 2: Wi-Fi Credentials */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Wifi className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Koneksi Wi-Fi Lantai {currentRoom?.floor}</span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
            SSID: {floorWifi.ssid}
          </div>
          <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            Password: {floorWifi.pass}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Biznet Dedicated Fiber 200 Mbps
          </p>
        </div>

        {/* Card 3: Caretaker Contact */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <User className="w-4 h-4 text-purple-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Penjaga Kost Siaga (Caretaker)</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {KOST_INFO.caretakerName}
          </div>
          <a 
            href={`https://wa.me/${KOST_INFO.caretakerPhone.replace(/^0/, '62')}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline block mt-0.5"
          >
            WA: {KOST_INFO.caretakerPhone}
          </a>
          <p className="text-[11px] text-slate-500 mt-1">
            Standby di Pos Depan 24 Jam
          </p>
        </div>

      </div>

      {/* Active Invoices & Billing */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Tagihan Sewa Bulanan Anda
            </h2>
            <p className="text-xs text-slate-500">
              Lihat rincian sewa kamar, pemakaian listrik KWh, dan unggah bukti transfer pembayaran
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {tenantInvoices.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Belum ada riwayat tagihan untuk akun penyewa ini.
            </div>
          ) : (
            tenantInvoices.map(inv => {
              const isPaid = inv.status === 'paid';
              const isVerifying = inv.status === 'verifying';

              return (
                <div 
                  key={inv.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isPaid ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800' :
                    isVerifying ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60' :
                    'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Periode: {inv.periodMonth}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          isPaid ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          isVerifying ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {isPaid ? 'LUNAS' : isVerifying ? 'MENUNGGU VERIFIKASI' : 'BELUM DIBAYAR'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-0.5">
                        {inv.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span>• {it.description}:</span>
                            <span className="font-mono text-slate-800 dark:text-slate-200">{formatIDR(it.amount)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-xs text-slate-500 mt-2">
                        Jatuh Tempo: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{formatDateIndo(inv.dueDate)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end justify-between gap-2 shrink-0">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Total Pembayaran:</span>
                        <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                          {formatIDR(inv.totalAmount)}
                        </span>
                      </div>

                      {!isPaid && !isVerifying && (
                        <button
                          onClick={() => setSelectedInvoiceToPay(inv)}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1.5 shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Bayar & Unggah Bukti
                        </button>
                      )}

                      {isVerifying && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Bukti sedang diverifikasi admin
                        </span>
                      )}

                      {isPaid && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Lunas diverifikasi ({inv.paymentMethod})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Maintenance Request Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Submit Ticket Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Wrench className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Laporkan Keluhan / Kerusakan Fasilitas
            </h2>
          </div>

          {ticketSuccess && (
            <div className="p-3 my-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-md text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Keluhan berhasil dikirim ke pengelola dan teknisi kost!
            </div>
          )}

          <form onSubmit={handleCreateTicketSubmit} className="space-y-3 mt-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Kategori Masalah:</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value as any)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              >
                <option value="AC">AC & Udara (Bocor/Kurang Dingin)</option>
                <option value="Wi-Fi">Wi-Fi & Internet</option>
                <option value="Plumbing">Kamar Mandi / Kran Air / Water Heater</option>
                <option value="Listrik">Listrik / Lampu Mati</option>
                <option value="Kunci/Pintu">Kunci Kamar / Smartlock</option>
                <option value="Kebersihan">Kebersihan Koridor / Sampah</option>
                <option value="Lainnya">Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Judul Singkat Kendala:</label>
              <input
                type="text"
                required
                placeholder="Contoh: AC kamar 101 menetes air"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Deskripsi Tambahan:</label>
              <textarea
                rows={3}
                placeholder="Jelaskan kondisi kerusakan agar teknisi membawa peralatan yang sesuai..."
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Kirim Laporan Keluhan
            </button>
          </form>
        </div>

        {/* Existing Tickets for this Room */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Riwayat Tiket Keluhan Kamar {currentRoom?.number}
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-3 text-xs">
            {tenantTickets.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                Tidak ada tiket komplain aktif untuk kamar Anda. Kondisi kamar terpantau baik! 👍
              </div>
            ) : (
              tenantTickets.map(t => (
                <div key={t.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {t.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      t.status === 'open' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      t.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {t.status === 'open' ? 'Menunggu Penugasan' : t.status === 'in_progress' ? 'Sedang Dikerjakan' : 'Selesai'}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    {t.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Petugas: {t.assignedStaff || 'Belum ditugaskan'}</span>
                    <span>{t.reportedAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Payment Proof Upload Modal */}
      {selectedInvoiceToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Konfirmasi Pembayaran Sewa
              </h2>
              <button onClick={() => setSelectedInvoiceToPay(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleExecuteUploadProof} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1">
                <div className="text-slate-500">Total yang harus ditransfer:</div>
                <div className="text-xl font-mono font-bold text-slate-900 dark:text-white">
                  {formatIDR(selectedInvoiceToPay.totalAmount)}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Invoice: {selectedInvoiceToPay.invoiceNumber} ({selectedInvoiceToPay.periodMonth})
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Pilih Rekening Tujuan Transfer:</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod === 'Transfer BCA'}
                      onChange={() => setPaymentMethod('Transfer BCA')}
                      className="text-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Bank BCA: 8030 9921 44</span>
                      <span className="text-[10px] text-slate-500">a/n Kost Fajar Balikpapan</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod === 'Transfer Mandiri'}
                      onChange={() => setPaymentMethod('Transfer Mandiri')}
                      className="text-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Bank Mandiri: 164 000 892 1109</span>
                      <span className="text-[10px] text-slate-500">a/n Kost Fajar Balikpapan</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod === 'QRIS'}
                      onChange={() => setPaymentMethod('QRIS')}
                      className="text-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">QRIS (Gopay/OVO/ShopeePay/BCA)</span>
                      <span className="text-[10px] text-slate-500">NMID: ID102008392182</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Unggah Foto / Screenshot Bukti Transfer:</label>
                <div 
                  onClick={() => setMockProofUploaded(true)}
                  className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                    mockProofUploaded 
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300' 
                      : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                  }`}
                >
                  <Upload className="w-5 h-5 mx-auto mb-1 opacity-70" />
                  {mockProofUploaded ? (
                    <span className="font-medium text-xs">✓ Bukti Transfer Terpilih (M-Banking_BCA_Success.jpg)</span>
                  ) : (
                    <span className="text-slate-500 text-xs">Klik untuk memilih screenshot bukti transfer m-Banking</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceToPay(null)}
                  className="px-3.5 py-1.5 text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!mockProofUploaded}
                  className="px-4 py-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-50 shadow-xs"
                >
                  Kirim Bukti Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
