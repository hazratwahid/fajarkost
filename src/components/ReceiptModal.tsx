import React from 'react';
import { Invoice, Room, Tenant } from '../types';
import { formatIDR, formatDateIndo } from '../lib/storage';
import { KOST_INFO } from '../data/mockData';
import { Printer, Download, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  invoice: Invoice | null;
  room?: Room;
  tenant?: Tenant;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  invoice,
  room,
  tenant,
  onClose,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white text-slate-900 rounded-xl max-w-xl w-full p-8 space-y-6 shadow-2xl border border-slate-200">
        
        {/* Receipt Header */}
        <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-emerald-700 font-bold">
              Kuitansi Resmi Pembayaran Kost
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              {KOST_INFO.name}
            </h1>
            <p className="text-[11px] text-slate-500 max-w-sm mt-0.5 leading-tight">
              {KOST_INFO.address} · Telp/WA: {KOST_INFO.caretakerPhone}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-500 block">NO. KUITANSI</span>
            <span className="text-sm font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Tanggal: {formatDateIndo(invoice.paymentDate || invoice.createdAt)}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-3 text-xs leading-relaxed">
          <div className="flex border-b border-slate-100 pb-2">
            <span className="w-36 text-slate-500">Telah Diterima Dari:</span>
            <span className="font-bold text-slate-900">{tenant?.name || 'Penghuni'}</span>
          </div>

          <div className="flex border-b border-slate-100 pb-2">
            <span className="w-36 text-slate-500">Unit Kamar:</span>
            <span className="font-semibold text-slate-900">
              Kamar {room?.number} (Lantai {room?.floor} · Tipe {room?.type})
            </span>
          </div>

          <div className="flex border-b border-slate-100 pb-2">
            <span className="w-36 text-slate-500">Untuk Pembayaran:</span>
            <span className="text-slate-800">
              Sewa Kamar Bulanan & Utilitas Periode <strong className="text-slate-900">{invoice.periodMonth}</strong>
            </span>
          </div>

          {/* Breakdown Table */}
          <div className="pt-2">
            <span className="font-semibold text-slate-700 block mb-1.5">Rincian Komponen Tagihan:</span>
            <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 border border-slate-200">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">• {item.description}</span>
                  <span className="font-mono font-medium text-slate-900">{formatIDR(item.amount)}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-bold text-sm">
                <span>TOTAL DIBAYAR</span>
                <span className="font-mono text-emerald-700">{formatIDR(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="flex border-b border-slate-100 pb-2">
            <span className="w-36 text-slate-500">Metode Pembayaran:</span>
            <span className="font-medium text-slate-900">{invoice.paymentMethod || 'Transfer Rekening Bank'}</span>
          </div>

          <div className="flex pb-2">
            <span className="w-36 text-slate-500">Status Pembayaran:</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              LUNAS / DITERIMA PENUH
            </span>
          </div>
        </div>

        {/* Signature & Stamp */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 italic max-w-xs">
            Bukti pembayaran ini sah dan diterbitkan secara digital oleh sistem manajemen SiKost Pro.
          </div>

          <div className="text-center w-40">
            <span className="text-[10px] text-slate-400 block mb-8">PENGELOLA KOST,</span>
            <span className="font-bold text-xs text-slate-900 block underline">
              {KOST_INFO.caretakerName}
            </span>
            <span className="text-[10px] text-slate-500">{KOST_INFO.name}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-500 hover:text-slate-800"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md flex items-center gap-1.5 hover:bg-slate-800 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Kuitansi (PDF/Print)
          </button>
        </div>

      </div>
    </div>
  );
};
