export type RoomStatus = 'occupied' | 'vacant' | 'maintenance' | 'pending_payment';

export type RoomType = 'Standard' | 'Deluxe' | 'VIP Suite';

export interface Room {
  id: string;
  number: string; // e.g. "101", "204"
  floor: number;
  type: RoomType;
  basePrice: number; // in IDR
  status: RoomStatus;
  sizeM2: number;
  facilities: string[];
  currentTenantId?: string;
  doorPin: string;
  keycardUid?: string;
  lastMeterKwh: number;
  currentMeterKwh: number;
  kwhRate: number; // e.g. 2500 per KWh
  imageUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  nik: string; // KTP
  phone: string; // WhatsApp e.g. "081234567890"
  email: string;
  occupation: string;
  institution: string; // e.g. PT Tokopedia or Univ Indonesia
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  idCardPhotoUrl?: string;
  roomId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  rentDueDay: number; // day of month (e.g. 5)
  depositAmount: number;
  isAutoRenew: boolean;
  notes?: string;
  status: 'active' | 'graduated' | 'evicted';
}

export interface InvoiceItem {
  description: string;
  amount: number;
  isUsageBased?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  roomId: string;
  periodMonth: string; // "November 2026"
  dueDate: string; // YYYY-MM-DD
  baseRent: number;
  items: InvoiceItem[];
  totalAmount: number;
  status: 'unpaid' | 'verifying' | 'paid' | 'overdue';
  paymentDate?: string;
  paymentMethod?: 'Transfer BCA' | 'Transfer Mandiri' | 'QRIS' | 'Tunai';
  proofReceiptUrl?: string;
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
}

export type TicketCategory = 'AC' | 'Wi-Fi' | 'Plumbing' | 'Listrik' | 'Kunci/Pintu' | 'Kebersihan' | 'Lainnya';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  roomId: string;
  tenantId?: string;
  category: TicketCategory;
  priority: TicketPriority;
  title: string;
  description: string;
  reportedAt: string;
  assignedStaff?: string;
  status: TicketStatus;
  resolvedAt?: string;
  resolutionNotes?: string;
  expenseAmount?: number; // Biaya perbaikan
  expenseLoggedToFinance?: boolean;
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: 'Sewa Kamar' | 'Listrik/KWh' | 'Deposit' | 'Maintenance' | 'Gaji Staff' | 'Internet/Wi-Fi' | 'Kebersihan/Sampah' | 'Lainnya';
  description: string;
  amount: number;
  roomId?: string;
  invoiceId?: string;
}

export interface MeterLog {
  id: string;
  roomId: string;
  date: string;
  previousKwh: number;
  currentKwh: number;
  consumedKwh: number;
  recordedBy: string;
  billed: boolean;
}

export interface HouseRule {
  id: string;
  title: string;
  description: string;
  category: 'Ketertiban' | 'Tamu' | 'Fasilitas' | 'Kebersihan';
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Pengelola' | 'Penjaga Kost' | 'Teknisi' | 'Cleaning';
  phone: string;
  email?: string;
  shift?: string;
  active?: boolean;
  permissions?: {
    canRecordMeter: boolean;
    canHandleTickets: boolean;
    canViewDoorPin: boolean;
    canVerifyPayment: boolean;
  };
}

export type UserRole = 'owner' | 'staff' | 'tenant';

export interface OwnerProfile {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  address?: string;
  pin?: string;
  notes?: string;
}

export interface BankAccount {
  bank: string;
  number: string;
  holder: string;
}

export interface WifiInfo {
  floor: string;
  ssid: string;
  pass: string;
}

export interface KostProfile {
  name: string;
  tagline: string;
  address: string;
  city: string;
  caretakerName: string;
  caretakerPhone: string;
  bankAccounts: BankAccount[];
  wifiSsids: WifiInfo[];
}

export interface CurrentUserSession {
  role: UserRole;
  userId: string;
  name: string;
  title: string;
  emailOrPhone?: string;
  avatarUrl?: string;
  tenantId?: string;
  tenantRoomNumber?: string;
  staffRole?: string;
  shift?: string;
}
