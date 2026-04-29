// Simulated "database" using localStorage — mirrors what a Laravel
// backend (Eloquent models + migrations) would expose via API endpoints.

export type Role = "admin" | "tenant";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Room {
  id: string;
  number: string;
  type: string; // Single, Double, Suite
  monthlyRate: number;
  status: "available" | "occupied" | "maintenance";
  tenantId?: string;
}

export interface Bill {
  id: string;
  tenantId: string;
  roomId: string;
  month: string; // YYYY-MM
  amount: number;
  status: "unpaid" | "paid" | "overdue";
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  billId: string;
  tenantId: string;
  amount: number;
  method: "cash" | "gcash" | "bank";
  paidAt: string;
  reference?: string;
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  roomId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string; // recipient
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Settings {
  houseName: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  lateFeePercent: number;
}

const KEY = "madajes_bhms_v1";

interface DB {
  users: User[];
  rooms: Room[];
  bills: Bill[];
  payments: Payment[];
  maintenance: MaintenanceRequest[];
  notifications: Notification[];
  settings: Settings;
  session: { userId: string | null };
}

const uid = () => Math.random().toString(36).slice(2, 10);

function seed(): DB {
  const adminId = "u_admin";
  const tenant1 = "u_tenant1";
  const tenant2 = "u_tenant2";
  const room1 = "r_101";
  const room2 = "r_102";
  const room3 = "r_103";
  const now = new Date().toISOString();

  return {
    users: [
      {
        id: adminId,
        name: "Madaje Admin",
        email: "admin@madaje.com",
        password: "admin123",
        role: "admin",
        phone: "0917-000-0001",
        createdAt: now,
      },
      {
        id: tenant1,
        name: "Juan Dela Cruz",
        email: "juan@tenant.com",
        password: "tenant123",
        role: "tenant",
        phone: "0917-111-1111",
        createdAt: now,
      },
      {
        id: tenant2,
        name: "Maria Santos",
        email: "maria@tenant.com",
        password: "tenant123",
        role: "tenant",
        phone: "0917-222-2222",
        createdAt: now,
      },
    ],
    rooms: [
      { id: room1, number: "101", type: "Single", monthlyRate: 3500, status: "occupied", tenantId: tenant1 },
      { id: room2, number: "102", type: "Double", monthlyRate: 5000, status: "occupied", tenantId: tenant2 },
      { id: room3, number: "103", type: "Single", monthlyRate: 3500, status: "available" },
      { id: "r_104", number: "104", type: "Suite",  monthlyRate: 7500, status: "available" },
      { id: "r_105", number: "105", type: "Single", monthlyRate: 3500, status: "maintenance" },
    ],
    bills: [
      {
        id: "b_1", tenantId: tenant1, roomId: room1, month: "2026-01",
        amount: 3500, status: "paid", dueDate: "2026-01-05", createdAt: now,
      },
      {
        id: "b_2", tenantId: tenant1, roomId: room1, month: "2026-02",
        amount: 3500, status: "unpaid", dueDate: "2026-02-05", createdAt: now,
      },
      {
        id: "b_3", tenantId: tenant2, roomId: room2, month: "2026-02",
        amount: 5000, status: "unpaid", dueDate: "2026-02-05", createdAt: now,
      },
    ],
    payments: [
      {
        id: "p_1", billId: "b_1", tenantId: tenant1, amount: 3500,
        method: "gcash", paidAt: "2026-01-03T09:00:00.000Z", reference: "GC-1234",
      },
    ],
    maintenance: [
      {
        id: "m_1", tenantId: tenant1, roomId: room1,
        title: "Leaking faucet",
        description: "Bathroom faucet drips continuously.",
        priority: "medium", status: "in_progress",
        createdAt: now, updatedAt: now,
      },
    ],
    notifications: [
      {
        id: "n_1", userId: tenant1,
        title: "Welcome!",
        message: "Your account has been created. Please review your bills.",
        read: false, createdAt: now,
      },
    ],
    settings: {
      houseName: "Madaje's Boarding House",
      address: "123 Rizal St., Davao City",
      contactEmail: "info@madaje.com",
      contactPhone: "0917-000-0001",
      currency: "₱",
      lateFeePercent: 5,
    },
    session: { userId: null },
  };
}

export function loadDB(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as DB;
  } catch {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
}

export function saveDB(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function resetDB() {
  localStorage.removeItem(KEY);
}

export { uid };
export type { DB };
