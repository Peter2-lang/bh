import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loadDB, saveDB, uid, type DB, type User, type Room, type Bill, type Payment, type MaintenanceRequest, type Notification, type Settings } from "./db";

interface AppContextValue {
  db: DB;
  currentUser: User | null;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  // users
  addUser: (u: Omit<User, "id" | "createdAt">) => User;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  // rooms
  addRoom: (r: Omit<Room, "id">) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  assignRoom: (roomId: string, tenantId: string | undefined) => void;
  // bills & payments
  addBill: (b: Omit<Bill, "id" | "createdAt">) => void;
  payBill: (billId: string, method: Payment["method"], reference?: string) => void;
  // maintenance
  addMaintenance: (m: Omit<MaintenanceRequest, "id" | "createdAt" | "updatedAt" | "status">) => void;
  updateMaintenanceStatus: (id: string, status: MaintenanceRequest["status"]) => void;
  // notifications
  sendNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (id: string) => void;
  // settings
  updateSettings: (patch: Partial<Settings>) => void;
}

const Ctx = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<DB>(() => loadDB());

  useEffect(() => { saveDB(db); }, [db]);

  const currentUser = db.session.userId
    ? db.users.find(u => u.id === db.session.userId) ?? null
    : null;

  const login = useCallback((email: string, password: string) => {
    const u = db.users.find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (u) {
      setDb(prev => ({ ...prev, session: { userId: u.id } }));
      return u;
    }
    return null;
  }, [db]);

  const logout = () => setDb(prev => ({ ...prev, session: { userId: null } }));

  const addUser: AppContextValue["addUser"] = (u) => {
    const newUser: User = { ...u, id: "u_" + uid(), createdAt: new Date().toISOString() };
    setDb(prev => ({ ...prev, users: [...prev.users, newUser] }));
    return newUser;
  };
  const updateUser: AppContextValue["updateUser"] = (id, patch) => {
    setDb(prev => ({ ...prev, users: prev.users.map(u => u.id === id ? { ...u, ...patch } : u) }));
  };
  const deleteUser: AppContextValue["deleteUser"] = (id) => {
    setDb(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id),
      rooms: prev.rooms.map(r => r.tenantId === id ? { ...r, tenantId: undefined, status: "available" } : r),
    }));
  };

  const addRoom: AppContextValue["addRoom"] = (r) => {
    setDb(prev => ({ ...prev, rooms: [...prev.rooms, { ...r, id: "r_" + uid() }] }));
  };
  const updateRoom: AppContextValue["updateRoom"] = (id, patch) => {
    setDb(prev => ({ ...prev, rooms: prev.rooms.map(r => r.id === id ? { ...r, ...patch } : r) }));
  };
  const deleteRoom: AppContextValue["deleteRoom"] = (id) => {
    setDb(prev => ({ ...prev, rooms: prev.rooms.filter(r => r.id !== id) }));
  };
  const assignRoom: AppContextValue["assignRoom"] = (roomId, tenantId) => {
    setDb(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, tenantId, status: tenantId ? "occupied" : "available" } : r),
    }));
  };

  const addBill: AppContextValue["addBill"] = (b) => {
    const bill: Bill = { ...b, id: "b_" + uid(), createdAt: new Date().toISOString() };
    setDb(prev => ({
      ...prev,
      bills: [...prev.bills, bill],
      notifications: [
        ...prev.notifications,
        {
          id: "n_" + uid(), userId: bill.tenantId, read: false,
          createdAt: new Date().toISOString(),
          title: "New Bill Issued",
          message: `A new bill of ${prev.settings.currency}${bill.amount} for ${bill.month} is due ${bill.dueDate}.`,
        },
      ],
    }));
  };

  const payBill: AppContextValue["payBill"] = (billId, method, reference) => {
    setDb(prev => {
      const bill = prev.bills.find(b => b.id === billId);
      if (!bill) return prev;
      const payment: Payment = {
        id: "p_" + uid(), billId, tenantId: bill.tenantId,
        amount: bill.amount, method, paidAt: new Date().toISOString(), reference,
      };
      return {
        ...prev,
        bills: prev.bills.map(b => b.id === billId ? { ...b, status: "paid" } : b),
        payments: [...prev.payments, payment],
        notifications: [
          ...prev.notifications,
          {
            id: "n_" + uid(), userId: bill.tenantId, read: false,
            createdAt: new Date().toISOString(),
            title: "Payment Received",
            message: `Your payment of ${prev.settings.currency}${bill.amount} for ${bill.month} has been recorded.`,
          },
        ],
      };
    });
  };

  const addMaintenance: AppContextValue["addMaintenance"] = (m) => {
    const now = new Date().toISOString();
    const req: MaintenanceRequest = { ...m, id: "m_" + uid(), status: "pending", createdAt: now, updatedAt: now };
    setDb(prev => ({
      ...prev,
      maintenance: [req, ...prev.maintenance],
      // notify all admins
      notifications: [
        ...prev.notifications,
        ...prev.users.filter(u => u.role === "admin").map(a => ({
          id: "n_" + uid(), userId: a.id, read: false,
          createdAt: now,
          title: "New Maintenance Request",
          message: `${prev.users.find(u => u.id === m.tenantId)?.name ?? "Tenant"} submitted: ${m.title}`,
        })),
      ],
    }));
  };

  const updateMaintenanceStatus: AppContextValue["updateMaintenanceStatus"] = (id, status) => {
    const now = new Date().toISOString();
    setDb(prev => {
      const req = prev.maintenance.find(m => m.id === id);
      if (!req) return prev;
      return {
        ...prev,
        maintenance: prev.maintenance.map(m => m.id === id ? { ...m, status, updatedAt: now } : m),
        notifications: [
          ...prev.notifications,
          {
            id: "n_" + uid(), userId: req.tenantId, read: false,
            createdAt: now,
            title: "Maintenance Update",
            message: `Your request "${req.title}" is now ${status.replace("_", " ")}.`,
          },
        ],
      };
    });
  };

  const sendNotification: AppContextValue["sendNotification"] = (n) => {
    setDb(prev => ({
      ...prev,
      notifications: [
        ...prev.notifications,
        { ...n, id: "n_" + uid(), read: false, createdAt: new Date().toISOString() },
      ],
    }));
  };

  const markNotificationRead: AppContextValue["markNotificationRead"] = (id) => {
    setDb(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  };

  const updateSettings: AppContextValue["updateSettings"] = (patch) => {
    setDb(prev => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  };

  const value: AppContextValue = {
    db, currentUser,
    login, logout,
    addUser, updateUser, deleteUser,
    addRoom, updateRoom, deleteRoom, assignRoom,
    addBill, payBill,
    addMaintenance, updateMaintenanceStatus,
    sendNotification, markNotificationRead,
    updateSettings,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
