import React, { useState } from 'react';
import { StaffMember, CurrentUserSession } from '../types';
import { 
  Shield, 
  Wrench, 
  User, 
  Plus, 
  Phone, 
  CheckCircle2, 
  Lock, 
  Key, 
  Zap, 
  FileText,
  UserCheck,
  Trash2,
  ArrowRight
} from 'lucide-react';

interface StaffAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onAddStaff: (newStaff: Omit<StaffMember, 'id'>) => void;
  onDeleteStaff?: (id: string) => void;
  onSwitchStaffSession: (staff: StaffMember) => void;
}

export const StaffAccessModal: React.FC<StaffAccessModalProps> = ({
  isOpen,
  onClose,
  staffList,
  onAddStaff,
  onDeleteStaff,
  onSwitchStaffSession,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'hierarchy'>('list');

  // New staff form state
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Penjaga Kost' | 'Teknisi' | 'Cleaning' | 'Pengelola'>('Penjaga Kost');
  const [phone, setPhone] = useState('');
  const [shift, setShift] = useState('Shift Pagi - Sore (07:00 - 16:00)');
  const [canRecordMeter, setCanRecordMeter] = useState(true);
  const [canHandleTickets, setCanHandleTickets] = useState(true);
  const [canViewDoorPin, setCanViewDoorPin] = useState(true);
  const [canVerifyPayment, setCanVerifyPayment] = useState(false);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    onAddStaff({
      name,
      role,
      phone,
      shift,
      active: true,
      permissions: {
        canRecordMeter,
        canHandleTickets,
        canViewDoorPin,
        canVerifyPayment,
      },
    });

    setName('');
    setPhone('');
    setActiveTab('list');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Kelola Akses & Petugas Lapangan
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manajemen akun penjaga kost, teknisi, dan petugas on-site Adyatma Residence BSD
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Daftar Petugas ({staffList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'add'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            + Tambah Petugas Baru
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hierarchy')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'hierarchy'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Matriks Hak Akses Peran
          </button>
        </div>

        {/* Tab 1: List Staff */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2.5">
              {staffList.map((stf) => (
                <div
                  key={stf.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {stf.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {stf.role}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {stf.phone}
                      </span>
                      <span>·</span>
                      <span>{stf.shift || 'Shift On-Site'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchStaffSession(stf);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Masuk sebagai akun petugas ini"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Login Akun Ini
                    </button>

                    {onDeleteStaff && staffList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteStaff(stf.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                        title="Hapus petugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Add New Staff */}
        {activeTab === 'add' && (
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Lengkap Petugas:
                </label>
                <input
                  type="text"
                  placeholder="Misal: Pak Agus Supriadi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Jabatan / Peran:
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Penjaga Kost">Penjaga Kost (Caretaker)</option>
                  <option value="Teknisi">Teknisi (AC, Listrik & Pipa)</option>
                  <option value="Cleaning">Cleaning Service / Housekeeping</option>
                  <option value="Pengelola">Pengelola Operasional</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nomor WhatsApp:
                </label>
                <input
                  type="text"
                  placeholder="0812xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Shift Jadwal Tugas:
                </label>
                <input
                  type="text"
                  placeholder="Misal: Shift Pagi - Sore (07:00 - 16:00)"
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Checkboxes for permissions */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Hak Izin Petugas Ini:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canRecordMeter}
                    onChange={(e) => setCanRecordMeter(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Pencatatan Meteran Listrik KWh</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canHandleTickets}
                    onChange={(e) => setCanHandleTickets(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Tangani Tiket Perbaikan & Biaya Nota</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canViewDoorPin}
                    onChange={(e) => setCanViewDoorPin(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Bantuan Kunci Pintu / PIN Smart Lock</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canVerifyPayment}
                    onChange={(e) => setCanVerifyPayment(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Verifikasi Bukti Transfer di Lokasi</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Simpan Petugas Baru
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Hierarchy Matrix */}
        {activeTab === 'hierarchy' && (
          <div className="space-y-4 text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                    <th className="py-2 px-3">Modul / Fitur</th>
                    <th className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-bold">1. Owner</th>
                    <th className="py-2 px-3 text-blue-600 dark:text-blue-400 font-bold">2. Penjaga</th>
                    <th className="py-2 px-3 text-purple-600 dark:text-purple-400 font-bold">3. Penghuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="py-2 px-3 font-semibold">Laporan Omset & Laba Bersih</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Penuh</td>
                    <td className="py-2 px-3 text-slate-400">✗ Terkunci</td>
                    <td className="py-2 px-3 text-slate-400">✗ Terkunci</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Ubah Nomor & Tarif Kamar</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Penuh</td>
                    <td className="py-2 px-3 text-slate-400">✗ Terkunci</td>
                    <td className="py-2 px-3 text-slate-400">✗ Terkunci</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Check-in & Kontrak Penghuni</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Penuh</td>
                    <td className="py-2 px-3 text-blue-600 font-bold">✓ Cek Kamar</td>
                    <td className="py-2 px-3 text-slate-400">✗ Terkunci</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Catat Meter Listrik KWh</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Monitor</td>
                    <td className="py-2 px-3 text-blue-600 font-bold">✓ Input Harian</td>
                    <td className="py-2 px-3 text-purple-600 font-bold">✓ Lihat Tagihan</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Penanganan Tiket Keluhan</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Monitor</td>
                    <td className="py-2 px-3 text-blue-600 font-bold">✓ Eksekusi</td>
                    <td className="py-2 px-3 text-purple-600 font-bold">✓ Buat Laporan</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Kunci Pintu & Smart Lock</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Generate PIN</td>
                    <td className="py-2 px-3 text-blue-600 font-bold">✓ Bantuan Darurat</td>
                    <td className="py-2 px-3 text-purple-600 font-bold">✓ PIN Kamar Sendiri</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Upload & Bayar Tagihan</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Verifikasi Kas</td>
                    <td className="py-2 px-3 text-blue-600 font-bold">✓ Catat Tunai</td>
                    <td className="py-2 px-3 text-purple-600 font-bold">✓ Bayar & Bukti</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white font-medium rounded-lg text-xs"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
