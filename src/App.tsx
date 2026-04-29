import React, { useState } from "react";
import { AppProvider, useApp } from "./store/AppContext";
import { Login } from "./pages/Login";
import { Layout, type NavItem } from "./components/Layout";
import {
  AdminDashboard, ManageUsers, ManageRooms, TenantRecords,
  ProcessPayments, MaintenanceAdmin, SendNotifications, Reports, SystemSettings,
} from "./pages/admin/AdminPages";
import {
  TenantDashboard, TenantProfile, TenantBills, TenantPayments,
  TenantMaintenance, TenantNotifications,
} from "./pages/tenant/TenantPages";

const adminNav: NavItem[] = [
  { key: "dashboard",     label: "Dashboard",            icon: "📊" },
  { key: "users",         label: "Manage Users",         icon: "👥" },
  { key: "rooms",         label: "Manage Rooms",         icon: "🏠" },
  { key: "tenants",       label: "Tenant Records",       icon: "📋" },
  { key: "payments",      label: "Payments & Billing",   icon: "💰" },
  { key: "maintenance",   label: "Maintenance",          icon: "🔧" },
  { key: "notifications", label: "Send Notifications",   icon: "📢" },
  { key: "reports",       label: "Reports",              icon: "📈" },
  { key: "settings",      label: "System Settings",      icon: "⚙️" },
];

const tenantNav: NavItem[] = [
  { key: "dashboard",     label: "Dashboard",            icon: "📊" },
  { key: "profile",       label: "View Profile",         icon: "👤" },
  { key: "bills",         label: "View Bills",           icon: "📑" },
  { key: "payments",      label: "Payment History",      icon: "💳" },
  { key: "maintenance",   label: "Maintenance Requests", icon: "🔧" },
  { key: "notifications", label: "Notifications",        icon: "🔔" },
];

const Shell: React.FC = () => {
  const { currentUser } = useApp();
  const [page, setPage] = useState("dashboard");

  if (!currentUser) return <Login />;

  const isAdmin = currentUser.role === "admin";
  const nav = isAdmin ? adminNav : tenantNav;

  const renderAdmin = () => {
    switch (page) {
      case "users":         return <ManageUsers />;
      case "rooms":         return <ManageRooms />;
      case "tenants":       return <TenantRecords />;
      case "payments":      return <ProcessPayments />;
      case "maintenance":   return <MaintenanceAdmin />;
      case "notifications": return <SendNotifications />;
      case "reports":       return <Reports />;
      case "settings":      return <SystemSettings />;
      default:              return <AdminDashboard />;
    }
  };

  const renderTenant = () => {
    switch (page) {
      case "profile":       return <TenantProfile />;
      case "bills":         return <TenantBills />;
      case "payments":      return <TenantPayments />;
      case "maintenance":   return <TenantMaintenance />;
      case "notifications": return <TenantNotifications />;
      default:              return <TenantDashboard />;
    }
  };

  return (
    <Layout nav={nav} active={page} onNavigate={setPage}>
      {isAdmin ? renderAdmin() : renderTenant()}
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
