/**
 * Firestore Real-time Synchronization Service
 * Listens to Firestore collections with onSnapshot for instant cloud multi-device sync.
 */

import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  Room, 
  Tenant, 
  Invoice, 
  MaintenanceTicket, 
  FinancialRecord, 
  MeterLog, 
  StaffMember, 
  OwnerProfile, 
  KostProfile 
} from '../types';
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
} from '../data/mockData';

export interface FirestoreKostState {
  rooms?: Room[];
  tenants?: Tenant[];
  invoices?: Invoice[];
  tickets?: MaintenanceTicket[];
  expenses?: FinancialRecord[];
  meterLogs?: MeterLog[];
  staffList?: StaffMember[];
  ownerProfile?: OwnerProfile;
  kostProfile?: KostProfile;
}

/**
 * Seed initial data to Firestore if collections are empty
 */
export async function seedInitialFirestoreData(): Promise<void> {
  try {
    const roomsSnap = await getDocs(collection(db, 'rooms')).catch(() => null);
    if (roomsSnap && !roomsSnap.empty) {
      return; // Already seeded
    }

    const batch = writeBatch(db);

    // Rooms
    for (const room of INITIAL_ROOMS) {
      batch.set(doc(db, 'rooms', room.id), room);
    }

    // Tenants
    for (const tenant of INITIAL_TENANTS) {
      batch.set(doc(db, 'tenants', tenant.id), tenant);
    }

    // Invoices
    for (const invoice of INITIAL_INVOICES) {
      batch.set(doc(db, 'invoices', invoice.id), invoice);
    }

    // Tickets
    for (const ticket of INITIAL_TICKETS) {
      batch.set(doc(db, 'tickets', ticket.id), ticket);
    }

    // Expenses
    for (const expense of INITIAL_EXPENSES) {
      batch.set(doc(db, 'expenses', expense.id), expense);
    }

    // Meter Logs
    for (const log of INITIAL_METER_LOGS) {
      batch.set(doc(db, 'meterLogs', log.id), log);
    }

    // Staff
    for (const staff of STAFF_MEMBERS) {
      batch.set(doc(db, 'staff', staff.id), staff);
    }

    // Configs
    batch.set(doc(db, 'config', 'ownerProfile'), DEFAULT_OWNER_PROFILE);
    batch.set(doc(db, 'config', 'kostProfile'), KOST_INFO);

    await batch.commit();
    console.log('Initial Kost data successfully seeded to Firestore.');
  } catch (err) {
    console.warn('Notice: Firestore seeding skipped or partially completed:', err);
  }
}

/**
 * Attach real-time onSnapshot listeners to Firestore collections
 */
export function subscribeToFirestore(
  onUpdate: (state: FirestoreKostState) => void,
  onStatusChange?: (status: 'connected' | 'syncing' | 'offline') => void
): () => void {
  const unsubs: (() => void)[] = [];

  try {
    if (onStatusChange) onStatusChange('syncing');

    // 1. Rooms
    const unRooms = onSnapshot(
      collection(db, 'rooms'),
      (snapshot) => {
        if (!snapshot.empty) {
          const rooms = snapshot.docs.map(d => d.data() as Room);
          onUpdate({ rooms });
        }
        if (onStatusChange) onStatusChange('connected');
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'rooms');
        if (onStatusChange) onStatusChange('offline');
      }
    );
    unsubs.push(unRooms);

    // 2. Tenants
    const unTenants = onSnapshot(
      collection(db, 'tenants'),
      (snapshot) => {
        if (!snapshot.empty) {
          const tenants = snapshot.docs.map(d => d.data() as Tenant);
          onUpdate({ tenants });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tenants');
      }
    );
    unsubs.push(unTenants);

    // 3. Invoices
    const unInvoices = onSnapshot(
      collection(db, 'invoices'),
      (snapshot) => {
        if (!snapshot.empty) {
          const invoices = snapshot.docs.map(d => d.data() as Invoice);
          onUpdate({ invoices });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'invoices');
      }
    );
    unsubs.push(unInvoices);

    // 4. Tickets
    const unTickets = onSnapshot(
      collection(db, 'tickets'),
      (snapshot) => {
        if (!snapshot.empty) {
          const tickets = snapshot.docs.map(d => d.data() as MaintenanceTicket);
          onUpdate({ tickets });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tickets');
      }
    );
    unsubs.push(unTickets);

    // 5. Expenses
    const unExpenses = onSnapshot(
      collection(db, 'expenses'),
      (snapshot) => {
        if (!snapshot.empty) {
          const expenses = snapshot.docs.map(d => d.data() as FinancialRecord);
          onUpdate({ expenses });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'expenses');
      }
    );
    unsubs.push(unExpenses);

    // 6. Meter Logs
    const unMeters = onSnapshot(
      collection(db, 'meterLogs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const meterLogs = snapshot.docs.map(d => d.data() as MeterLog);
          onUpdate({ meterLogs });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'meterLogs');
      }
    );
    unsubs.push(unMeters);

    // 7. Staff
    const unStaff = onSnapshot(
      collection(db, 'staff'),
      (snapshot) => {
        if (!snapshot.empty) {
          const staffList = snapshot.docs.map(d => d.data() as StaffMember);
          onUpdate({ staffList });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'staff');
      }
    );
    unsubs.push(unStaff);

    // 8. Config (Owner & Kost Profile)
    const unOwner = onSnapshot(
      doc(db, 'config', 'ownerProfile'),
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate({ ownerProfile: snapshot.data() as OwnerProfile });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'config/ownerProfile');
      }
    );
    unsubs.push(unOwner);

    const unKost = onSnapshot(
      doc(db, 'config', 'kostProfile'),
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate({ kostProfile: snapshot.data() as KostProfile });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'config/kostProfile');
      }
    );
    unsubs.push(unKost);

  } catch (err) {
    console.error('Failed to initialize Firestore real-time listeners:', err);
  }

  return () => {
    unsubs.forEach(u => u());
  };
}

/**
 * Save / sync individual entity to Firestore
 */
export async function syncEntityToFirestore<T extends { id: string }>(
  collectionName: string, 
  item: T
): Promise<void> {
  try {
    await setDoc(doc(db, collectionName, item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}
