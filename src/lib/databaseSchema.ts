export const PRISMA_SCHEMA = `// Prisma Schema for Kost Bulanan Management Platform (SiKost Pro)
// Datasource & Generator Configuration

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum RoomStatus {
  OCCUPIED
  VACANT
  MAINTENANCE
  PENDING_PAYMENT
}

enum RoomType {
  STANDARD
  DELUXE
  VIP_SUITE
}

enum InvoiceStatus {
  UNPAID
  VERIFYING
  PAID
  OVERDUE
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
}

enum TicketCategory {
  AC
  WIFI
  PLUMBING
  ELECTRICAL
  LOCK_DOOR
  CLEANING
  OTHER
}

model Room {
  id              String         @id @default(uuid())
  number          String         @unique // e.g., "101", "204"
  floor           Int            // 1, 2, 3
  type            RoomType       @default(STANDARD)
  basePrice       Decimal        @db.Decimal(12, 2) // Monthly rent IDR
  status          RoomStatus     @default(VACANT)
  sizeM2          Float
  doorPin         String         // 6-digit electronic lock PIN
  keycardUid      String?        // RFID serial identifier
  lastMeterKwh    Float          @default(0.0)
  currentMeterKwh Float          @default(0.0)
  kwhRate         Decimal        @default(2500.00) @db.Decimal(8, 2)
  facilities      String[]       // Array of amenities
  imageUrl        String?

  // Relations
  tenants         Tenant[]
  invoices        Invoice[]
  tickets         MaintenanceTicket[]
  meterLogs       MeterReadingLog[]
  expenses        FinancialRecord[]

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([status])
  @@index([floor])
}

model Tenant {
  id              String         @id @default(uuid())
  name            String
  nik             String         @unique // Indonesian KTP 16-digit ID
  phone           String         // WhatsApp contact number
  email           String         @unique
  occupation      String
  institution     String         // Company or Campus name
  
  // Emergency Contact Info
  emergencyName   String
  emergencyRel    String         // Parent, sibling, etc.
  emergencyPhone  String

  idCardPhotoUrl  String?
  roomId          String
  room            Room           @relation(fields: [roomId], references: [id], onDelete: Restrict)

  startDate       DateTime
  endDate         DateTime
  rentDueDay      Int            // Day of month (e.g. 1st or 5th)
  depositAmount   Decimal        @db.Decimal(12, 2)
  isAutoRenew     Boolean        @default(true)
  notes           String?
  status          String         @default("ACTIVE") // ACTIVE, GRADUATED, EVICTED

  // Relations
  invoices        Invoice[]
  tickets         MaintenanceTicket[]

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([roomId])
}

model Invoice {
  id              String         @id @default(uuid())
  invoiceNumber   String         @unique // e.g., INV/2026/11/001
  tenantId        String
  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  roomId          String
  room            Room           @relation(fields: [roomId], references: [id], onDelete: Restrict)

  periodMonth     String         // "November 2026"
  dueDate         DateTime
  baseRent        Decimal        @db.Decimal(12, 2)
  totalAmount     Decimal        @db.Decimal(12, 2)
  status          InvoiceStatus  @default(UNPAID)

  paymentDate     DateTime?
  paymentMethod   String?        // "Transfer BCA", "QRIS", etc.
  proofReceiptUrl String?        // Uploaded transfer receipt
  verifiedBy      String?        // Admin/Staff name
  notes           String?

  items           InvoiceItem[]
  financialRecord FinancialRecord?

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([tenantId])
  @@index([status])
  @@index([dueDate])
}

model InvoiceItem {
  id          String   @id @default(uuid())
  invoiceId   String
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  description String   // "Kelebihan KWh Listrik", "Laundry", etc.
  amount      Decimal  @db.Decimal(12, 2)
  isUsageBased Boolean @default(false)
}

model MaintenanceTicket {
  id              String         @id @default(uuid())
  ticketNumber    String         @unique // TCK-202611-01
  roomId          String
  room            Room           @relation(fields: [roomId], references: [id], onDelete: Cascade)
  tenantId        String?
  tenant          Tenant?        @relation(fields: [tenantId], references: [id], onDelete: SetNull)

  category        TicketCategory
  priority        TicketPriority @default(MEDIUM)
  title           String
  description     String         @db.Text
  reportedAt      DateTime       @default(now())
  assignedStaff   String?
  status          TicketStatus   @default(OPEN)
  resolvedAt      DateTime?
  resolutionNotes String?        @db.Text
  
  expenseAmount   Decimal?       @db.Decimal(12, 2) // Repair cost
  expenseLogged   Boolean        @default(false)

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([status])
  @@index([roomId])
}

model MeterReadingLog {
  id           String   @id @default(uuid())
  roomId       String
  room         Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  readingDate  DateTime @default(now())
  previousKwh  Float
  currentKwh   Float
  consumedKwh  Float
  recordedBy   String   // Caretaker name
  billed       Boolean  @default(false)

  @@index([roomId, readingDate])
}

model FinancialRecord {
  id          String   @id @default(uuid())
  date        DateTime @default(now())
  type        String   // "INCOME" or "EXPENSE"
  category    String   // "Sewa Kamar", "Maintenance", "Gaji Staff", etc.
  description String
  amount      Decimal  @db.Decimal(12, 2)
  
  roomId      String?
  room        Room?    @relation(fields: [roomId], references: [id], onDelete: SetNull)
  invoiceId   String?  @unique
  invoice     Invoice? @relation(fields: [invoiceId], references: [id], onDelete: SetNull)

  createdAt   DateTime @default(now())

  @@index([type, date])
}
`;

export const POSTGRES_DDL = `-- PostgreSQL DDL Schema for Kost Bulanan Management System
-- Database: kost_bulanan_db

CREATE TYPE room_status AS ENUM ('OCCUPIED', 'VACANT', 'MAINTENANCE', 'PENDING_PAYMENT');
CREATE TYPE room_type AS ENUM ('STANDARD', 'DELUXE', 'VIP_SUITE');
CREATE TYPE invoice_status AS ENUM ('UNPAID', 'VERIFYING', 'PAID', 'OVERDUE');
CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');
CREATE TYPE ticket_category AS ENUM ('AC', 'WIFI', 'PLUMBING', 'ELECTRICAL', 'LOCK_DOOR', 'CLEANING', 'OTHER');

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(10) UNIQUE NOT NULL,
    floor INTEGER NOT NULL,
    type room_type NOT NULL DEFAULT 'STANDARD',
    base_price NUMERIC(12,2) NOT NULL,
    status room_status NOT NULL DEFAULT 'VACANT',
    size_m2 NUMERIC(5,2) NOT NULL,
    door_pin VARCHAR(6) NOT NULL,
    keycard_uid VARCHAR(50),
    last_meter_kwh NUMERIC(8,2) DEFAULT 0.0,
    current_meter_kwh NUMERIC(8,2) DEFAULT 0.0,
    kwh_rate NUMERIC(8,2) DEFAULT 2500.00,
    facilities TEXT[],
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    nik VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(25) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    occupation VARCHAR(100),
    institution VARCHAR(100),
    emergency_name VARCHAR(100) NOT NULL,
    emergency_rel VARCHAR(50) NOT NULL,
    emergency_phone VARCHAR(25) NOT NULL,
    id_card_photo_url TEXT,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rent_due_day INTEGER NOT NULL,
    deposit_amount NUMERIC(12,2) NOT NULL,
    is_auto_renew BOOLEAN DEFAULT TRUE,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    period_month VARCHAR(30) NOT NULL,
    due_date DATE NOT NULL,
    base_rent NUMERIC(12,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    status invoice_status DEFAULT 'UNPAID',
    payment_date DATE,
    payment_method VARCHAR(50),
    proof_receipt_url TEXT,
    verified_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(200) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    is_usage_based BOOLEAN DEFAULT FALSE
);

CREATE TABLE maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    category ticket_category NOT NULL,
    priority ticket_priority DEFAULT 'MEDIUM',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_staff VARCHAR(100),
    status ticket_status DEFAULT 'OPEN',
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    expense_amount NUMERIC(12,2),
    expense_logged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meter_reading_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    reading_date TIMESTAMPTZ DEFAULT NOW(),
    previous_kwh NUMERIC(8,2) NOT NULL,
    current_kwh NUMERIC(8,2) NOT NULL,
    consumed_kwh NUMERIC(8,2) NOT NULL,
    recorded_by VARCHAR(100) NOT NULL,
    billed BOOLEAN DEFAULT FALSE
);

CREATE TABLE financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE DEFAULT CURRENT_DATE,
    type VARCHAR(10) NOT NULL, -- 'INCOME' or 'EXPENSE'
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for High Query Performance
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_tenants_room ON tenants(room_id);
CREATE INDEX idx_invoices_due ON invoices(due_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_tickets_status ON maintenance_tickets(status);
CREATE INDEX idx_finance_type_date ON financial_records(type, date);
`;
