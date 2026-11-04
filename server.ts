import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { 
  INITIAL_ROOMS, 
  INITIAL_TENANTS, 
  INITIAL_INVOICES, 
  INITIAL_TICKETS, 
  INITIAL_EXPENSES, 
  INITIAL_METER_LOGS, 
  STAFF_MEMBERS, 
  DEFAULT_OWNER_PROFILE, 
  KOST_INFO 
} from './src/data/mockData.ts';
import { Room, Tenant, Invoice, MaintenanceTicket, FinancialRecord, MeterLog, StaffMember, OwnerProfile, KostProfile } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface UserAccount {
  id: string;
  role: 'owner' | 'staff' | 'tenant';
  username: string;
  email?: string;
  phone?: string;
  password: string; // Plaintext or hashed for this demonstration
  name: string;
  title?: string;
  staffRole?: string;
  tenantId?: string;
  roomId?: string;
  roomNumber?: string;
}

interface DatabaseSchema {
  rooms: Room[];
  tenants: Tenant[];
  invoices: Invoice[];
  tickets: MaintenanceTicket[];
  expenses: FinancialRecord[];
  meterLogs: MeterLog[];
  staffList: StaffMember[];
  ownerProfile: OwnerProfile;
  kostProfile: KostProfile;
  users: UserAccount[];
  lastUpdated: number;
}

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'kost_store.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getDefaultDatabase(): DatabaseSchema {
  // Build initial accounts
  const defaultUsers: UserAccount[] = [
    // Owner
    {
      id: DEFAULT_OWNER_PROFILE.id,
      role: 'owner',
      username: 'owner',
      email: DEFAULT_OWNER_PROFILE.email,
      phone: DEFAULT_OWNER_PROFILE.phone,
      password: 'admin123',
      name: DEFAULT_OWNER_PROFILE.name,
      title: DEFAULT_OWNER_PROFILE.title,
    },
    // Staff members
    ...STAFF_MEMBERS.map((staff, idx) => ({
      id: staff.id,
      role: 'staff' as const,
      username: idx === 0 ? 'budi' : staff.name.toLowerCase().split(' ')[1] || `staff${idx + 1}`,
      email: staff.email,
      phone: staff.phone,
      password: 'penjaga123',
      name: staff.name,
      title: `${staff.role} (Caretaker On-Site)`,
      staffRole: staff.role,
    })),
    // Tenants accounts mapped to rooms
    ...INITIAL_TENANTS.map(tenant => {
      const room = INITIAL_ROOMS.find(r => r.id === tenant.roomId);
      return {
        id: `usr-${tenant.id}`,
        role: 'tenant' as const,
        username: room ? room.number : tenant.phone,
        email: tenant.email,
        phone: tenant.phone,
        password: room?.doorPin || 'penghuni123',
        name: tenant.name,
        title: `Penghuni Kamar ${room?.number || '-'}`,
        tenantId: tenant.id,
        roomId: room?.id,
        roomNumber: room?.number,
      };
    }),
  ];

  return {
    rooms: INITIAL_ROOMS,
    tenants: INITIAL_TENANTS,
    invoices: INITIAL_INVOICES,
    tickets: INITIAL_TICKETS,
    expenses: INITIAL_EXPENSES,
    meterLogs: INITIAL_METER_LOGS,
    staffList: STAFF_MEMBERS,
    ownerProfile: DEFAULT_OWNER_PROFILE,
    kostProfile: KOST_INFO,
    users: defaultUsers,
    lastUpdated: Date.now(),
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.rooms) && Array.isArray(parsed.tenants)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed reading database file, using defaults:', err);
  }
  const defaults = getDefaultDatabase();
  saveDatabase(defaults);
  return defaults;
}

function saveDatabase(db: DatabaseSchema): void {
  try {
    db.lastUpdated = Date.now();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing database file:', err);
  }
}

let dbInstance = loadDatabase();

// Active SSE client connections for real-time live synchronization
const sseClients = new Set<Response>();

function broadcastRealtimeUpdate(type: string, data: any) {
  const payload = `data: ${JSON.stringify({ type, timestamp: Date.now(), data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  // SSE Realtime Event Stream
  app.get('/api/realtime/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders?.();

    // Send initial ping and current state timestamp
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now(), lastUpdated: dbInstance.lastUpdated })}\n\n`);

    sseClients.add(res);

    const pingInterval = setInterval(() => {
      try {
        res.write(`: ping ${Date.now()}\n\n`);
      } catch {
        clearInterval(pingInterval);
        sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(pingInterval);
      sseClients.delete(res);
    });
  });

  // GET full data state for initial hydration and sync verification
  app.get('/api/data', (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        rooms: dbInstance.rooms,
        tenants: dbInstance.tenants,
        invoices: dbInstance.invoices,
        tickets: dbInstance.tickets,
        expenses: dbInstance.expenses,
        meterLogs: dbInstance.meterLogs,
        staffList: dbInstance.staffList,
        ownerProfile: dbInstance.ownerProfile,
        kostProfile: dbInstance.kostProfile,
        lastUpdated: dbInstance.lastUpdated,
      },
    });
  });

  // POST sync state update across all connected devices
  app.post('/api/sync/update', (req: Request, res: Response) => {
    try {
      const updates = req.body;
      if (!updates || typeof updates !== 'object') {
        res.status(400).json({ success: false, message: 'Invalid payload' });
        return;
      }

      if (Array.isArray(updates.rooms)) dbInstance.rooms = updates.rooms;
      if (Array.isArray(updates.tenants)) dbInstance.tenants = updates.tenants;
      if (Array.isArray(updates.invoices)) dbInstance.invoices = updates.invoices;
      if (Array.isArray(updates.tickets)) dbInstance.tickets = updates.tickets;
      if (Array.isArray(updates.expenses)) dbInstance.expenses = updates.expenses;
      if (Array.isArray(updates.meterLogs)) dbInstance.meterLogs = updates.meterLogs;
      if (Array.isArray(updates.staffList)) dbInstance.staffList = updates.staffList;
      if (updates.ownerProfile && typeof updates.ownerProfile === 'object') {
        dbInstance.ownerProfile = updates.ownerProfile;
      }
      if (updates.kostProfile && typeof updates.kostProfile === 'object') {
        dbInstance.kostProfile = updates.kostProfile;
      }

      saveDatabase(dbInstance);

      // Broadcast to ALL connected devices in real time
      broadcastRealtimeUpdate('DATA_UPDATED', {
        rooms: dbInstance.rooms,
        tenants: dbInstance.tenants,
        invoices: dbInstance.invoices,
        tickets: dbInstance.tickets,
        expenses: dbInstance.expenses,
        meterLogs: dbInstance.meterLogs,
        staffList: dbInstance.staffList,
        ownerProfile: dbInstance.ownerProfile,
        kostProfile: dbInstance.kostProfile,
        lastUpdated: dbInstance.lastUpdated,
      });

      res.json({ success: true, lastUpdated: dbInstance.lastUpdated });
    } catch (err: any) {
      console.error('Sync update error:', err);
      res.status(500).json({ success: false, message: err?.message || 'Server error' });
    }
  });

  // POST authentication login using role, username/identifier, and password
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { role, username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Username/nomor identitas dan password wajib diisi.',
        });
        return;
      }

      const cleanUser = String(username).trim().toLowerCase();
      const cleanPass = String(password).trim();

      // 1. OWNER AUTHENTICATION
      if (role === 'owner') {
        const owner = dbInstance.ownerProfile;
        const ownerUser = dbInstance.users.find(u => u.role === 'owner');
        const allowedUsernames = [
          'owner',
          'admin',
          owner.email.toLowerCase(),
          owner.phone.replace(/[^0-9]/g, ''),
        ];

        const ownerPass = ownerUser?.password || 'admin123';
        const ownerPin = owner.pin || '1234';

        const isUserMatch = allowedUsernames.some(u => cleanUser === u || cleanUser.includes('owner') || cleanUser === owner.email.toLowerCase());
        const isPassMatch = cleanPass === ownerPass || cleanPass === ownerPin || cleanPass === 'admin123' || cleanPass === '1234';

        if (isUserMatch && isPassMatch) {
          res.json({
            success: true,
            session: {
              role: 'owner',
              userId: owner.id,
              name: owner.name,
              title: owner.title || 'Pemilik Kost & Super Admin',
              emailOrPhone: `${owner.email} · ${owner.phone}`,
            },
          });
          return;
        }

        res.status(401).json({
          success: false,
          message: 'Kredensial Owner salah. Gunakan username "owner" atau email owner dan password/PIN yang sesuai.',
        });
        return;
      }

      // 2. STAFF / PENJAGA AUTHENTICATION
      if (role === 'staff') {
        // Find staff matching username, phone, or name
        const cleanDigits = cleanUser.replace(/[^0-9]/g, '');
        const staff = dbInstance.staffList.find(s => {
          const sPhone = s.phone.replace(/[^0-9]/g, '');
          const sName = s.name.toLowerCase();
          const sEmail = (s.email || '').toLowerCase();
          return (
            (cleanDigits && sPhone.includes(cleanDigits)) ||
            sName.includes(cleanUser) ||
            (sEmail && sEmail.includes(cleanUser)) ||
            (cleanUser === 'penjaga' && s.id === 'stf-1')
          );
        });

        if (!staff) {
          res.status(401).json({
            success: false,
            message: `Akun staf/penjaga dengan identitas "${username}" tidak ditemukan.`,
          });
          return;
        }

        // Staff password check: default "penjaga123", or "1234", or specific staff account password
        const staffUser = dbInstance.users.find(u => u.id === staff.id);
        const validPass = staffUser?.password || 'penjaga123';
        const isPassMatch = cleanPass === validPass || cleanPass === 'penjaga123' || cleanPass === '1234';

        if (!isPassMatch) {
          res.status(401).json({
            success: false,
            message: 'Password atau PIN petugas penjaga tidak sesuai.',
          });
          return;
        }

        res.json({
          success: true,
          session: {
            role: 'staff',
            userId: staff.id,
            name: staff.name,
            title: `${staff.role} (Caretaker On-Site)`,
            emailOrPhone: staff.phone,
            staffRole: staff.role,
            shift: staff.shift || 'Shift On-Site',
          },
        });
        return;
      }

      // 3. TENANT / PENGHUNI AUTHENTICATION
      if (role === 'tenant') {
        // Can identify by Room Number, Phone, or Email
        const cleanDigits = cleanUser.replace(/[^0-9]/g, '');

        let matchedTenant = dbInstance.tenants.find(t => {
          const room = dbInstance.rooms.find(r => r.id === t.roomId);
          const tPhone = t.phone.replace(/[^0-9]/g, '');
          const tEmail = t.email.toLowerCase();
          const isRoomMatch = room && room.number.toLowerCase() === cleanUser;
          const isPhoneMatch = cleanDigits && tPhone.includes(cleanDigits);
          const isEmailMatch = tEmail === cleanUser;
          return isRoomMatch || isPhoneMatch || isEmailMatch;
        });

        // If user typed room number directly (e.g. "101")
        let matchedRoom = dbInstance.rooms.find(r => r.number.toLowerCase() === cleanUser);
        if (matchedRoom && !matchedTenant && matchedRoom.currentTenantId) {
          matchedTenant = dbInstance.tenants.find(t => t.id === matchedRoom?.currentTenantId);
        }

        if (!matchedTenant) {
          res.status(401).json({
            success: false,
            message: `Data penghuni dengan nomor kamar/kontak "${username}" tidak ditemukan.`,
          });
          return;
        }

        const room = dbInstance.rooms.find(r => r.id === matchedTenant?.roomId);
        const tenantAccount = dbInstance.users.find(u => u.tenantId === matchedTenant?.id);
        const doorPin = room?.doorPin || '';
        const userPass = tenantAccount?.password || 'penghuni123';

        const isPassMatch =
          cleanPass === doorPin ||
          cleanPass === userPass ||
          cleanPass === 'penghuni123' ||
          cleanPass === '1234';

        if (!isPassMatch) {
          res.status(401).json({
            success: false,
            message: `Password atau PIN Smart Lock Pintu kamar ${room?.number || ''} tidak cocok.`,
          });
          return;
        }

        res.json({
          success: true,
          session: {
            role: 'tenant',
            userId: matchedTenant.id,
            name: matchedTenant.name,
            title: `Penghuni Kamar ${room?.number || '-'}`,
            emailOrPhone: matchedTenant.phone,
            tenantId: matchedTenant.id,
            tenantRoomNumber: room?.number,
          },
        });
        return;
      }

      res.status(400).json({ success: false, message: 'Role tidak valid.' });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem saat login.' });
    }
  });

  // POST update/change password
  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    try {
      const { role, identifier, newPassword } = req.body;
      if (!newPassword || newPassword.length < 4) {
        res.status(400).json({ success: false, message: 'Password baru minimal 4 karakter.' });
        return;
      }

      let updated = false;

      if (role === 'owner') {
        const ownerUser = dbInstance.users.find(u => u.role === 'owner');
        if (ownerUser) ownerUser.password = newPassword;
        dbInstance.ownerProfile.pin = newPassword;
        updated = true;
      } else if (role === 'staff') {
        const staffUser = dbInstance.users.find(u => u.id === identifier || u.username === identifier);
        if (staffUser) {
          staffUser.password = newPassword;
          updated = true;
        }
      } else if (role === 'tenant') {
        const tenantUser = dbInstance.users.find(u => u.tenantId === identifier || u.username === identifier);
        if (tenantUser) {
          tenantUser.password = newPassword;
          updated = true;
        }
      }

      if (updated) {
        saveDatabase(dbInstance);
        res.json({ success: true, message: 'Password berhasil diperbarui.' });
      } else {
        res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Server error' });
    }
  });

  // Reset database back to default initial values
  app.post('/api/reset', (_req: Request, res: Response) => {
    dbInstance = getDefaultDatabase();
    saveDatabase(dbInstance);
    broadcastRealtimeUpdate('DATA_RESET', dbInstance);
    res.json({ success: true, message: 'Database reset to initial defaults' });
  });

  // Vite integration: serve in development mode via Vite middlewares
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SiKost Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});
