import { Room, Tenant, Invoice, MaintenanceTicket, FinancialRecord, MeterLog, RoomStatus, KostProfile } from '../types';
import { INITIAL_ROOMS, INITIAL_TENANTS, INITIAL_INVOICES, INITIAL_TICKETS, INITIAL_EXPENSES, INITIAL_METER_LOGS, KOST_INFO } from '../data/mockData';

const STORAGE_KEYS = {
  ROOMS: 'sikost_rooms_v1',
  TENANTS: 'sikost_tenants_v1',
  INVOICES: 'sikost_invoices_v1',
  TICKETS: 'sikost_tickets_v1',
  EXPENSES: 'sikost_expenses_v1',
  METER_LOGS: 'sikost_meter_logs_v1',
  STAFF: 'sikost_staff_v1',
  OWNER: 'sikost_owner_profile_v1',
  KOST_INFO: 'sikost_kost_profile_v1',
  SESSION: 'sikost_session_v1',
};

export function loadStoredData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function getInitialAppState() {
  return {
    rooms: loadStoredData<Room[]>(STORAGE_KEYS.ROOMS, INITIAL_ROOMS),
    tenants: loadStoredData<Tenant[]>(STORAGE_KEYS.TENANTS, INITIAL_TENANTS),
    invoices: loadStoredData<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES),
    tickets: loadStoredData<MaintenanceTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS),
    expenses: loadStoredData<FinancialRecord[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES),
    meterLogs: loadStoredData<MeterLog[]>(STORAGE_KEYS.METER_LOGS, INITIAL_METER_LOGS),
  };
}

export function resetAllData() {
  localStorage.removeItem(STORAGE_KEYS.ROOMS);
  localStorage.removeItem(STORAGE_KEYS.TENANTS);
  localStorage.removeItem(STORAGE_KEYS.INVOICES);
  localStorage.removeItem(STORAGE_KEYS.TICKETS);
  localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  localStorage.removeItem(STORAGE_KEYS.METER_LOGS);
  localStorage.removeItem(STORAGE_KEYS.STAFF);
  localStorage.removeItem(STORAGE_KEYS.OWNER);
  localStorage.removeItem(STORAGE_KEYS.KOST_INFO);
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

// Indonesian Currency Formatter helper
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Generates Indonesian WhatsApp reminder message for tenant payment
export function generateWhatsAppMessage(tenant: Tenant, room: Room, invoice: Invoice, kost?: KostProfile): string {
  const currentKost = kost || KOST_INFO;
  const dueFormatted = formatDateIndo(invoice.dueDate);
  const itemsText = invoice.items
    .map(it => `• ${it.description}: ${formatIDR(it.amount)}`)
    .join('\n');

  const bankLines = currentKost.bankAccounts && currentKost.bankAccounts.length > 0
    ? currentKost.bankAccounts.map(b => `💳 *${b.bank}*: ${b.number} a/n ${b.holder}`).join('\n')
    : `💳 *BCA*: 8030 9921 44 a/n Kost Fajar Balikpapan
💳 *Mandiri*: 164 000 892 1109 a/n Kost Fajar Balikpapan
📱 *QRIS*: Tersedia di Portal Penghuni`;

  return `Halo Kak *${tenant.name}* (Kamar ${room.number}),

Salam hangat dari Pengelola *${currentKost.name}*.
Berikut kami informasikan rincian tagihan sewa bulanan untuk periode *${invoice.periodMonth}*:

${itemsText}
───────────────────
*Total Tagihan: ${formatIDR(invoice.totalAmount)}*
*Jatuh Tempo: ${dueFormatted}*

Pembayaran dapat ditransfer melalui:
${bankLines}

Mohon konfirmasi atau unggah bukti transfer setelah melakukan pembayaran ya Kak. Terima kasih banyak atas kerjasamanya! 🙏`;
}

