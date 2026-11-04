/**
 * Real-time Multi-Device Synchronization & Authentication Service
 * Communicates with the Express backend via Server-Sent Events (SSE) and REST APIs.
 */

import { 
  Room, 
  Tenant, 
  Invoice, 
  MaintenanceTicket, 
  FinancialRecord, 
  MeterLog, 
  StaffMember, 
  OwnerProfile, 
  KostProfile, 
  CurrentUserSession, 
  UserRole 
} from '../types';

export interface KostDataState {
  rooms: Room[];
  tenants: Tenant[];
  invoices: Invoice[];
  tickets: MaintenanceTicket[];
  expenses: FinancialRecord[];
  meterLogs: MeterLog[];
  staffList: StaffMember[];
  ownerProfile: OwnerProfile;
  kostProfile: KostProfile;
  lastUpdated?: number;
}

export type SyncStatus = 'connected' | 'syncing' | 'offline';

let eventSource: EventSource | null = null;
let lastSyncTimestamp = 0;

/**
 * Fetch full data snapshot from the backend
 */
export async function fetchKostData(): Promise<KostDataState | null> {
  try {
    const res = await fetch('/api/data', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      lastSyncTimestamp = json.data.lastUpdated || Date.now();
      return json.data;
    }
  } catch (err) {
    console.warn('Failed to fetch remote data:', err);
  }
  return null;
}

/**
 * Push local changes to the central database, triggering instant real-time broadcast to all devices
 */
export async function pushSyncUpdate(payload: Partial<KostDataState>): Promise<boolean> {
  try {
    const res = await fetch('/api/sync/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success) {
      lastSyncTimestamp = json.lastUpdated || Date.now();
      return true;
    }
  } catch (err) {
    console.warn('Failed to push sync update to server:', err);
  }
  return false;
}

/**
 * Authenticate with Role, Username/Identifier, and Password against central database
 */
export async function authenticateUser(
  role: UserRole, 
  username: string, 
  password: string
): Promise<{ success: boolean; session?: CurrentUserSession; message?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, username, password }),
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, session: json.session };
    }
    return { success: false, message: json.message || 'Login gagal. Periksa username dan password.' };
  } catch (err: any) {
    return { success: false, message: 'Tidak dapat terhubung ke server autentikasi.' };
  }
}

/**
 * Change password on the central database
 */
export async function changeUserPassword(
  role: UserRole,
  identifier: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, identifier, newPassword }),
    });
    const json = await res.json();
    return { success: json.success, message: json.message };
  } catch (err: any) {
    return { success: false, message: 'Gagal memperbarui password pada server.' };
  }
}

/**
 * Initialize real-time SSE listener and background polling for multi-device synchronization
 */
export function subscribeToRealtimeSync(
  onData: (data: KostDataState) => void,
  onStatusChange: (status: SyncStatus) => void
): () => void {
  let isSubscribed = true;

  function connectSSE() {
    if (!isSubscribed) return;

    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    onStatusChange('syncing');

    try {
      eventSource = new EventSource('/api/realtime/stream');

      eventSource.onopen = () => {
        if (!isSubscribed) return;
        onStatusChange('connected');
      };

      eventSource.onmessage = (event) => {
        if (!isSubscribed) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'DATA_UPDATED' && payload.data) {
            onStatusChange('connected');
            onData(payload.data);
          } else if (payload.type === 'CONNECTED') {
            onStatusChange('connected');
          }
        } catch (e) {
          console.error('Failed to parse realtime SSE message:', e);
        }
      };

      eventSource.onerror = () => {
        if (!isSubscribed) return;
        onStatusChange('offline');
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Retry connection in 5 seconds
        setTimeout(() => {
          if (isSubscribed) connectSSE();
        }, 5000);
      };
    } catch {
      onStatusChange('offline');
    }
  }

  // Initial connect
  connectSSE();

  // Polling fallback every 8 seconds to guarantee consistency across mobile devices
  const pollInterval = setInterval(async () => {
    if (!isSubscribed) return;
    try {
      const freshData = await fetchKostData();
      if (freshData && freshData.lastUpdated && freshData.lastUpdated > lastSyncTimestamp) {
        onData(freshData);
      }
    } catch {
      // Ignore background poll errors
    }
  }, 8000);

  // Sync immediately when tab regains focus or visibility
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && isSubscribed) {
      const freshData = await fetchKostData();
      if (freshData) onData(freshData);
    }
  };
  window.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleVisibilityChange);

  // Cleanup function
  return () => {
    isSubscribed = false;
    clearInterval(pollInterval);
    window.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleVisibilityChange);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
