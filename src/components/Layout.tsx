import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { cn } from "../utils/cn";
import { Badge } from "./UI";

export type NavItem = { key: string; label: string; icon: string };

interface Props {
  nav: NavItem[];
  active: string;
  onNavigate: (k: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ nav, active, onNavigate, children }) => {
  const { currentUser, logout, db, markNotificationRead } = useApp();
  const [openSidebar, setOpenSidebar] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const myNotifs = db.notifications.filter(n => n.userId === currentUser?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unread = myNotifs.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-800 to-indigo-900 text-white flex flex-col transition-transform",
        openSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="text-lg font-extrabold">🏠 Madaje's BHMS</div>
          <div className="text-xs text-blue-200 mt-1">{currentUser?.role === "admin" ? "Administrator Panel" : "Tenant Portal"}</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(item => (
            <button
              key={item.key}
              onClick={() => { onNavigate(item.key); setOpenSidebar(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                active === item.key
                  ? "bg-white/15 text-white font-semibold"
                  : "text-blue-100 hover:bg-white/10"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10 text-xs text-blue-200">
          v1.0 · Built for Madaje's
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 h-16 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-700 text-2xl" onClick={() => setOpenSidebar(true)}>☰</button>
            <div className="font-semibold text-slate-800 capitalize">
              {nav.find(n => n.key === active)?.label}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-lg"
              >
                🔔
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 max-h-96 overflow-y-auto z-50">
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Notifications</span>
                    <Badge tone="blue">{myNotifs.length}</Badge>
                  </div>
                  {myNotifs.length === 0 && (
                    <div className="p-6 text-center text-sm text-slate-500">No notifications</div>
                  )}
                  {myNotifs.map(n => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 block",
                        !n.read && "bg-blue-50/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-sm text-slate-800">{n.title}</div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-slate-800">{currentUser?.name}</div>
              <div className="text-xs text-slate-500 capitalize">{currentUser?.role}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center">
              {currentUser?.name?.charAt(0)}
            </div>
            <button onClick={logout} className="text-sm text-slate-600 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100">
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-auto">
          {children}
        </main>
      </div>

      {/* Sidebar overlay */}
      {openSidebar && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpenSidebar(false)} />
      )}
    </div>
  );
};
