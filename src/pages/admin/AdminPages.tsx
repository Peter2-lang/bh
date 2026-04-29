import React, { useMemo, useState } from "react";
import { useApp } from "../../store/AppContext";
import { Badge, Button, Card, EmptyState, Input, Label, Modal, PageHeader, Select, StatCard, Textarea } from "../../components/UI";
import type { MaintenanceRequest, Room, User } from "../../store/db";

/* ───────────────────────── Dashboard ───────────────────────── */
export const AdminDashboard: React.FC = () => {
  const { db } = useApp();
  const tenants = db.users.filter(u => u.role === "tenant");
  const occupied = db.rooms.filter(r => r.status === "occupied").length;
  const unpaid = db.bills.filter(b => b.status !== "paid");
  const totalUnpaid = unpaid.reduce((s, b) => s + b.amount, 0);
  const pendingMaint = db.maintenance.filter(m => m.status !== "resolved").length;
  const totalRevenue = db.payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Welcome back — overview of ${db.settings.houseName}`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tenants" value={tenants.length} icon="👥" tone="bg-blue-50 text-blue-600" />
        <StatCard label="Occupied Rooms" value={`${occupied}/${db.rooms.length}`} icon="🏠" tone="bg-green-50 text-green-600" />
        <StatCard label="Unpaid Bills" value={`${db.settings.currency}${totalUnpaid.toLocaleString()}`} icon="💸" tone="bg-red-50 text-red-600" />
        <StatCard label="Pending Maint." value={pendingMaint} icon="🔧" tone="bg-yellow-50 text-yellow-600" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Payments</h3>
          {db.payments.length === 0 ? (
            <EmptyState icon="💳" title="No payments yet" />
          ) : (
            <div className="space-y-2">
              {db.payments.slice(-5).reverse().map(p => {
                const t = db.users.find(u => u.id === p.tenantId);
                return (
                  <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                    <div>
                      <div className="text-sm font-semibold">{t?.name}</div>
                      <div className="text-xs text-slate-500">{new Date(p.paidAt).toLocaleDateString()} · {p.method.toUpperCase()}</div>
                    </div>
                    <div className="font-bold text-green-600">{db.settings.currency}{p.amount.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Quick Stats</h3>
          <div className="space-y-3 text-sm">
            <Row label="Total Revenue" value={`${db.settings.currency}${totalRevenue.toLocaleString()}`} />
            <Row label="Total Rooms" value={String(db.rooms.length)} />
            <Row label="Available Rooms" value={String(db.rooms.filter(r => r.status === "available").length)} />
            <Row label="Maintenance Requests" value={String(db.maintenance.length)} />
            <Row label="Active Notifications" value={String(db.notifications.length)} />
          </div>
        </Card>
      </div>
    </div>
  );
};
const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-600">{label}</span><span className="font-semibold">{value}</span></div>
);

/* ───────────────────────── Manage Users ───────────────────────── */
export const ManageUsers: React.FC = () => {
  const { db, addUser, updateUser, deleteUser } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "tenant", phone: "" });

  const openNew = () => { setEditing(null); setForm({ name: "", email: "", password: "", role: "tenant", phone: "" }); setOpen(true); };
  const openEdit = (u: User) => { setEditing(u); setForm({ name: u.name, email: u.email, password: u.password, role: u.role, phone: u.phone ?? "" }); setOpen(true); };
  const save = () => {
    if (!form.name || !form.email || !form.password) return;
    if (editing) updateUser(editing.id, { ...form, role: form.role as any });
    else addUser({ ...form, role: form.role as any });
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Manage Users" subtitle="Add, edit, or remove system users"
        actions={<Button onClick={openNew}>+ Add User</Button>} />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {db.users.map(u => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-800">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3"><Badge tone={u.role === "admin" ? "purple" : "blue"}>{u.role}</Badge></td>
                <td className="px-4 py-3 text-slate-600">{u.phone || "—"}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(u)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => { if (confirm(`Delete ${u.name}?`)) deleteUser(u.id); }}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit User" : "Add User"}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="space-y-3">
          <div><Label>Full Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Password</Label><Input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          <div><Label>Role</Label>
            <Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="tenant">Tenant</option>
              <option value="admin">Administrator</option>
            </Select>
          </div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
};

/* ───────────────────────── Manage Rooms ───────────────────────── */
export const ManageRooms: React.FC = () => {
  const { db, addRoom, updateRoom, deleteRoom, assignRoom } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState({ number: "", type: "Single", monthlyRate: 3500, status: "available" as Room["status"], tenantId: "" });
  const tenants = db.users.filter(u => u.role === "tenant");

  const openNew = () => { setEditing(null); setForm({ number: "", type: "Single", monthlyRate: 3500, status: "available", tenantId: "" }); setOpen(true); };
  const openEdit = (r: Room) => { setEditing(r); setForm({ number: r.number, type: r.type, monthlyRate: r.monthlyRate, status: r.status, tenantId: r.tenantId ?? "" }); setOpen(true); };

  const save = () => {
    const data = { number: form.number, type: form.type, monthlyRate: Number(form.monthlyRate), status: form.tenantId ? "occupied" as const : form.status, tenantId: form.tenantId || undefined };
    if (editing) updateRoom(editing.id, data);
    else addRoom(data);
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Manage Rooms & Assignments" subtitle="Configure rooms and assign tenants"
        actions={<Button onClick={openNew}>+ Add Room</Button>} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {db.rooms.map(r => {
          const tenant = r.tenantId ? db.users.find(u => u.id === r.tenantId) : null;
          const tone = r.status === "occupied" ? "green" : r.status === "available" ? "blue" : "yellow";
          return (
            <Card key={r.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">Room {r.number}</div>
                  <div className="text-sm text-slate-500">{r.type}</div>
                </div>
                <Badge tone={tone as any}>{r.status}</Badge>
              </div>
              <div className="mt-3 text-lg font-bold text-blue-700">{db.settings.currency}{r.monthlyRate.toLocaleString()}<span className="text-xs text-slate-500 font-normal">/month</span></div>
              <div className="mt-3 text-sm text-slate-600">
                {tenant ? <>👤 <span className="font-semibold">{tenant.name}</span></> : <span className="italic text-slate-400">No tenant assigned</span>}
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>Edit</Button>
                {r.tenantId ? (
                  <Button size="sm" variant="ghost" onClick={() => assignRoom(r.id, undefined)}>Unassign</Button>
                ) : (
                  <Select className="!w-auto !py-1 text-xs" onChange={e => e.target.value && assignRoom(r.id, e.target.value)} defaultValue="">
                    <option value="">Assign tenant…</option>
                    {tenants.filter(t => !db.rooms.some(rr => rr.tenantId === t.id)).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </Select>
                )}
                <Button size="sm" variant="danger" onClick={() => { if (confirm(`Delete Room ${r.number}?`)) deleteRoom(r.id); }}>Delete</Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Room" : "Add Room"}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="space-y-3">
          <div><Label>Room Number</Label><Input value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} /></div>
          <div><Label>Type</Label>
            <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option>Single</option><option>Double</option><option>Suite</option>
            </Select>
          </div>
          <div><Label>Monthly Rate</Label><Input type="number" value={form.monthlyRate} onChange={e => setForm({ ...form, monthlyRate: Number(e.target.value) })} /></div>
          <div><Label>Status</Label>
            <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
              <option value="available">Available</option><option value="occupied">Occupied</option><option value="maintenance">Maintenance</option>
            </Select>
          </div>
          <div><Label>Assign Tenant (optional)</Label>
            <Select value={form.tenantId} onChange={e => setForm({ ...form, tenantId: e.target.value })}>
              <option value="">— None —</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/* ───────────────────────── Tenant Records ───────────────────────── */
export const TenantRecords: React.FC = () => {
  const { db, addUser, assignRoom } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "tenant123", phone: "", roomId: "" });

  const register = () => {
    if (!form.name || !form.email) return;
    const u = addUser({ name: form.name, email: form.email, password: form.password, role: "tenant", phone: form.phone });
    if (form.roomId) assignRoom(form.roomId, u.id);
    setOpen(false);
    setForm({ name: "", email: "", password: "tenant123", phone: "", roomId: "" });
  };

  const tenants = db.users.filter(u => u.role === "tenant");
  const availableRooms = db.rooms.filter(r => r.status === "available");

  return (
    <div>
      <PageHeader title="Tenant Records" subtitle="View all tenant information and history"
        actions={<Button onClick={() => setOpen(true)}>+ Register Tenant</Button>} />
      <div className="grid md:grid-cols-2 gap-4">
        {tenants.map(t => {
          const room = db.rooms.find(r => r.tenantId === t.id);
          const myBills = db.bills.filter(b => b.tenantId === t.id);
          const paid = myBills.filter(b => b.status === "paid").length;
          const unpaid = myBills.filter(b => b.status !== "paid").length;
          return (
            <Card key={t.id} className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center">{t.name.charAt(0)}</div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.email}</div>
                  <div className="text-xs text-slate-500">{t.phone}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="text-xs text-slate-500">Room</div>
                  <div className="font-bold text-blue-700">{room?.number ?? "—"}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-2">
                  <div className="text-xs text-slate-500">Paid</div>
                  <div className="font-bold text-green-700">{paid}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <div className="text-xs text-slate-500">Unpaid</div>
                  <div className="font-bold text-red-700">{unpaid}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">Joined {new Date(t.createdAt).toLocaleDateString()}</div>
            </Card>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Register New Tenant"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={register}>Register</Button></>}>
        <div className="space-y-3">
          <div><Label>Full Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Initial Password</Label><Input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Assign Room (optional)</Label>
            <Select value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })}>
              <option value="">— None —</option>
              {availableRooms.map(r => <option key={r.id} value={r.id}>Room {r.number} · {r.type} · {db.settings.currency}{r.monthlyRate}</option>)}
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/* ───────────────────────── Payments ───────────────────────── */
export const ProcessPayments: React.FC = () => {
  const { db, addBill, payBill } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tenantId: "", roomId: "", month: new Date().toISOString().slice(0, 7), amount: 0, dueDate: "" });

  const tenants = db.users.filter(u => u.role === "tenant");

  const issue = () => {
    if (!form.tenantId || !form.roomId || !form.dueDate) return;
    addBill({ tenantId: form.tenantId, roomId: form.roomId, month: form.month, amount: Number(form.amount), dueDate: form.dueDate, status: "unpaid" });
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Process Payments & History" subtitle="Issue bills, record payments, and view history"
        actions={<Button onClick={() => setOpen(true)}>+ Issue Bill</Button>} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold mb-3 text-slate-800">Outstanding Bills</h3>
          {db.bills.filter(b => b.status !== "paid").length === 0 && <EmptyState icon="✅" title="No outstanding bills" />}
          <div className="space-y-2">
            {db.bills.filter(b => b.status !== "paid").map(b => {
              const t = db.users.find(u => u.id === b.tenantId);
              const r = db.rooms.find(rr => rr.id === b.roomId);
              return (
                <div key={b.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-sm">{t?.name} · Room {r?.number}</div>
                      <div className="text-xs text-slate-500">For {b.month} · Due {b.dueDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">{db.settings.currency}{b.amount.toLocaleString()}</div>
                      <Button size="sm" className="mt-1" onClick={() => {
                        const m = prompt("Payment method (cash, gcash, bank):", "cash") as any;
                        if (!m) return;
                        const ref = prompt("Reference # (optional):") || undefined;
                        payBill(b.id, m, ref);
                      }}>Mark Paid</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3 text-slate-800">Payment History</h3>
          {db.payments.length === 0 && <EmptyState icon="💳" title="No payments yet" />}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {db.payments.slice().reverse().map(p => {
              const t = db.users.find(u => u.id === p.tenantId);
              return (
                <div key={p.id} className="p-3 rounded-lg bg-green-50 border border-green-100 flex justify-between">
                  <div>
                    <div className="font-semibold text-sm">{t?.name}</div>
                    <div className="text-xs text-slate-500">{new Date(p.paidAt).toLocaleString()} · {p.method.toUpperCase()} {p.reference && `· #${p.reference}`}</div>
                  </div>
                  <div className="font-bold text-green-700">{db.settings.currency}{p.amount.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Issue New Bill"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={issue}>Issue Bill</Button></>}>
        <div className="space-y-3">
          <div><Label>Tenant</Label>
            <Select value={form.tenantId} onChange={e => {
              const t = e.target.value;
              const room = db.rooms.find(r => r.tenantId === t);
              setForm({ ...form, tenantId: t, roomId: room?.id ?? "", amount: room?.monthlyRate ?? 0 });
            }}>
              <option value="">— Select tenant —</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </div>
          <div><Label>Room</Label>
            <Select value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })}>
              <option value="">— Select room —</option>
              {db.rooms.map(r => <option key={r.id} value={r.id}>Room {r.number}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Month</Label><Input type="month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} /></div>
            <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
          </div>
          <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
        </div>
      </Modal>
    </div>
  );
};

/* ───────────────────────── Maintenance ───────────────────────── */
export const MaintenanceAdmin: React.FC = () => {
  const { db, updateMaintenanceStatus } = useApp();
  const list = db.maintenance.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div>
      <PageHeader title="Update Maintenance Status" subtitle="Track and resolve tenant requests" />
      {list.length === 0 && <EmptyState icon="🔧" title="No maintenance requests" />}
      <div className="space-y-3">
        {list.map(m => {
          const t = db.users.find(u => u.id === m.tenantId);
          const r = db.rooms.find(rr => rr.id === m.roomId);
          const tones: Record<MaintenanceRequest["status"], any> = { pending: "yellow", in_progress: "blue", resolved: "green" };
          return (
            <Card key={m.id} className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-[260px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{m.title}</span>
                    <Badge tone={tones[m.status]}>{m.status.replace("_", " ")}</Badge>
                    <Badge tone={m.priority === "high" ? "red" : m.priority === "medium" ? "yellow" : "slate"}>{m.priority}</Badge>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">{m.description}</div>
                  <div className="text-xs text-slate-400 mt-2">{t?.name} · Room {r?.number} · {new Date(m.createdAt).toLocaleString()}</div>
                </div>
                <Select className="!w-auto" value={m.status} onChange={e => updateMaintenanceStatus(m.id, e.target.value as any)}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </Select>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

/* ───────────────────────── Notifications (Send) ───────────────────────── */
export const SendNotifications: React.FC = () => {
  const { db, sendNotification } = useApp();
  const [target, setTarget] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const send = () => {
    if (!title || !message) return;
    const recipients = target === "all" ? db.users.filter(u => u.role === "tenant") : db.users.filter(u => u.id === target);
    recipients.forEach(r => sendNotification({ userId: r.id, title, message }));
    setTitle(""); setMessage("");
    alert(`Notification sent to ${recipients.length} recipient(s).`);
  };

  return (
    <div>
      <PageHeader title="Send Notifications" subtitle="Broadcast announcements to tenants" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold mb-3 text-slate-800">Compose</h3>
          <div className="space-y-3">
            <div><Label>Recipient</Label>
              <Select value={target} onChange={e => setTarget(e.target.value)}>
                <option value="all">All Tenants</option>
                {db.users.filter(u => u.role === "tenant").map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </div>
            <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Reminder, Announcement…" /></div>
            <div><Label>Message</Label><Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message…" /></div>
            <Button onClick={send}>Send Notification</Button>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-3 text-slate-800">Recently Sent</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {db.notifications.slice().reverse().slice(0, 20).map(n => {
              const u = db.users.find(x => x.id === n.userId);
              return (
                <div key={n.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex justify-between">
                    <div className="font-semibold text-sm">{n.title}</div>
                    <div className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{n.message}</div>
                  <div className="text-[10px] text-slate-400 mt-1">→ {u?.name}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ───────────────────────── Reports ───────────────────────── */
export const Reports: React.FC = () => {
  const { db } = useApp();
  const totalRev = db.payments.reduce((s, p) => s + p.amount, 0);
  const unpaidTotal = db.bills.filter(b => b.status !== "paid").reduce((s, b) => s + b.amount, 0);

  // monthly revenue
  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    db.payments.forEach(p => {
      const key = p.paidAt.slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + p.amount);
    });
    return Array.from(map.entries()).sort();
  }, [db.payments]);

  const max = Math.max(1, ...byMonth.map(([, v]) => v));

  const exportCSV = () => {
    const rows = [["Type", "Tenant", "Amount", "Date", "Reference/Status"]];
    db.payments.forEach(p => {
      const t = db.users.find(u => u.id === p.tenantId);
      rows.push(["Payment", t?.name ?? "", String(p.amount), p.paidAt, p.reference ?? p.method]);
    });
    db.bills.forEach(b => {
      const t = db.users.find(u => u.id === b.tenantId);
      rows.push(["Bill", t?.name ?? "", String(b.amount), b.dueDate, b.status]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bhms-report-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="Generate Reports" subtitle="Financial and operational reports"
        actions={<Button onClick={exportCSV}>⬇ Export CSV</Button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={`${db.settings.currency}${totalRev.toLocaleString()}`} icon="💰" tone="bg-green-50 text-green-600" />
        <StatCard label="Outstanding" value={`${db.settings.currency}${unpaidTotal.toLocaleString()}`} icon="⏳" tone="bg-red-50 text-red-600" />
        <StatCard label="Total Payments" value={db.payments.length} icon="🧾" tone="bg-blue-50 text-blue-600" />
        <StatCard label="Total Bills" value={db.bills.length} icon="📑" tone="bg-purple-50 text-purple-600" />
      </div>
      <Card className="p-5">
        <h3 className="font-semibold mb-4 text-slate-800">Monthly Revenue</h3>
        {byMonth.length === 0 ? (
          <EmptyState icon="📊" title="No revenue data yet" />
        ) : (
          <div className="space-y-2">
            {byMonth.map(([month, val]) => (
              <div key={month}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-700">{month}</span>
                  <span className="text-slate-600">{db.settings.currency}{val.toLocaleString()}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${(val / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

/* ───────────────────────── Settings ───────────────────────── */
export const SystemSettings: React.FC = () => {
  const { db, updateSettings } = useApp();
  const [form, setForm] = useState(db.settings);

  return (
    <div>
      <PageHeader title="Configure System Settings" subtitle="Manage your boarding house information" />
      <Card className="p-6 max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Label>House Name</Label><Input value={form.houseName} onChange={e => setForm({ ...form, houseName: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          <div><Label>Contact Email</Label><Input value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} /></div>
          <div><Label>Contact Phone</Label><Input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} /></div>
          <div><Label>Currency Symbol</Label><Input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} /></div>
          <div><Label>Late Fee (%)</Label><Input type="number" value={form.lateFeePercent} onChange={e => setForm({ ...form, lateFeePercent: Number(e.target.value) })} /></div>
        </div>
        <div className="mt-6 flex gap-2">
          <Button onClick={() => { updateSettings(form); alert("Settings saved!"); }}>Save Changes</Button>
          <Button variant="secondary" onClick={() => setForm(db.settings)}>Reset</Button>
        </div>
      </Card>
    </div>
  );
};
