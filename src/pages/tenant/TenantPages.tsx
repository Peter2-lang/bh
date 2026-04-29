import React, { useState } from "react";
import { useApp } from "../../store/AppContext";
import { Badge, Button, Card, EmptyState, Input, Label, Modal, PageHeader, Select, StatCard, Textarea } from "../../components/UI";

export const TenantDashboard: React.FC = () => {
  const { db, currentUser } = useApp();
  const room = db.rooms.find(r => r.tenantId === currentUser?.id);
  const myBills = db.bills.filter(b => b.tenantId === currentUser?.id);
  const unpaid = myBills.filter(b => b.status !== "paid");
  const myMaint = db.maintenance.filter(m => m.tenantId === currentUser?.id);
  const open = myMaint.filter(m => m.status !== "resolved").length;

  return (
    <div>
      <PageHeader title={`Welcome, ${currentUser?.name}!`} subtitle="Your tenant dashboard" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="My Room" value={room ? `Room ${room.number}` : "—"} icon="🏠" tone="bg-blue-50 text-blue-600" />
        <StatCard label="Unpaid Bills" value={unpaid.length} icon="💸" tone="bg-red-50 text-red-600" />
        <StatCard label="Open Requests" value={open} icon="🔧" tone="bg-yellow-50 text-yellow-600" />
        <StatCard label="Total Bills" value={myBills.length} icon="📑" tone="bg-purple-50 text-purple-600" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Room Details</h3>
          {room ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Room Number</span><span className="font-semibold">{room.number}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-semibold">{room.type}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Monthly Rate</span><span className="font-semibold">{db.settings.currency}{room.monthlyRate.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status</span><Badge tone="green">{room.status}</Badge></div>
            </div>
          ) : (
            <EmptyState icon="🏠" title="No room assigned yet" description="Contact administrator." />
          )}
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Recent Activity</h3>
          {myBills.slice(-3).reverse().map(b => (
            <div key={b.id} className="flex justify-between items-center p-2 border-b border-slate-100 text-sm">
              <span>Bill for {b.month}</span>
              <Badge tone={b.status === "paid" ? "green" : "red"}>{b.status}</Badge>
            </div>
          ))}
          {myBills.length === 0 && <EmptyState icon="📭" title="No activity yet" />}
        </Card>
      </div>
    </div>
  );
};

export const TenantProfile: React.FC = () => {
  const { db, currentUser, updateUser } = useApp();
  const [form, setForm] = useState({ name: currentUser?.name ?? "", email: currentUser?.email ?? "", phone: currentUser?.phone ?? "", password: currentUser?.password ?? "" });
  const room = db.rooms.find(r => r.tenantId === currentUser?.id);

  return (
    <div>
      <PageHeader title="My Profile" subtitle="View and update your information" />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-bold flex items-center justify-center">
            {currentUser?.name.charAt(0)}
          </div>
          <div className="mt-4 font-bold text-slate-900 text-lg">{currentUser?.name}</div>
          <div className="text-sm text-slate-500">{currentUser?.email}</div>
          <Badge tone="blue">Tenant</Badge>
          <div className="mt-4 text-sm text-slate-600">
            {room && <div>📍 Room {room.number} ({room.type})</div>}
            <div className="mt-1">📅 Member since {new Date(currentUser!.createdAt).toLocaleDateString()}</div>
          </div>
        </Card>
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">Edit Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Full Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Password</Label><Input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          </div>
          <div className="mt-4">
            <Button onClick={() => { updateUser(currentUser!.id, form); alert("Profile updated!"); }}>Save Changes</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const TenantBills: React.FC = () => {
  const { db, currentUser, payBill } = useApp();
  const [paying, setPaying] = useState<string | null>(null);
  const [method, setMethod] = useState<"cash" | "gcash" | "bank">("gcash");
  const [reference, setReference] = useState("");

  const myBills = db.bills.filter(b => b.tenantId === currentUser?.id).sort((a, b) => b.month.localeCompare(a.month));

  const submitPayment = () => {
    if (!paying) return;
    payBill(paying, method, reference || undefined);
    setPaying(null); setReference("");
  };

  return (
    <div>
      <PageHeader title="My Bills" subtitle="View and pay your monthly bills" />
      {myBills.length === 0 && <EmptyState icon="📑" title="No bills yet" />}
      <div className="space-y-3">
        {myBills.map(b => {
          const r = db.rooms.find(rr => rr.id === b.roomId);
          return (
            <Card key={b.id} className="p-5 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Bill for {b.month}</div>
                <div className="text-xs text-slate-500">Room {r?.number} · Due {b.dueDate}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{db.settings.currency}{b.amount.toLocaleString()}</div>
                <Badge tone={b.status === "paid" ? "green" : b.status === "overdue" ? "red" : "yellow"}>{b.status}</Badge>
              </div>
              {b.status !== "paid" && <Button onClick={() => setPaying(b.id)}>Pay Now</Button>}
            </Card>
          );
        })}
      </div>

      <Modal open={!!paying} onClose={() => setPaying(null)} title="Pay Bill"
        footer={<><Button variant="secondary" onClick={() => setPaying(null)}>Cancel</Button><Button onClick={submitPayment}>Submit Payment</Button></>}>
        <div className="space-y-3">
          <div><Label>Payment Method</Label>
            <Select value={method} onChange={e => setMethod(e.target.value as any)}>
              <option value="gcash">GCash</option>
              <option value="bank">Bank Transfer</option>
              <option value="cash">Cash</option>
            </Select>
          </div>
          <div><Label>Reference # (optional)</Label><Input value={reference} onChange={e => setReference(e.target.value)} /></div>
          <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg">
            Note: This is a demo. In production, this would integrate with a real payment gateway.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const TenantPayments: React.FC = () => {
  const { db, currentUser } = useApp();
  const myPayments = db.payments.filter(p => p.tenantId === currentUser?.id).sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  const total = myPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <PageHeader title="Payment History" subtitle="All your past payments" />
      <Card className="p-5 mb-6">
        <div className="text-sm text-slate-500">Total Paid (Lifetime)</div>
        <div className="text-3xl font-bold text-green-600">{db.settings.currency}{total.toLocaleString()}</div>
      </Card>
      {myPayments.length === 0 ? (
        <EmptyState icon="💳" title="No payments yet" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {myPayments.map(p => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{new Date(p.paidAt).toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{db.settings.currency}{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge tone="blue">{p.method.toUpperCase()}</Badge></td>
                  <td className="px-4 py-3 text-slate-600">{p.reference ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export const TenantMaintenance: React.FC = () => {
  const { db, currentUser, addMaintenance } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" as const });
  const room = db.rooms.find(r => r.tenantId === currentUser?.id);
  const myReqs = db.maintenance.filter(m => m.tenantId === currentUser?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const submit = () => {
    if (!form.title || !room) { alert("Please fill out the form. You must have an assigned room."); return; }
    addMaintenance({ tenantId: currentUser!.id, roomId: room.id, title: form.title, description: form.description, priority: form.priority });
    setOpen(false);
    setForm({ title: "", description: "", priority: "medium" });
  };

  return (
    <div>
      <PageHeader title="Submit Maintenance Request" subtitle="Request repairs and report issues"
        actions={<Button onClick={() => setOpen(true)}>+ New Request</Button>} />
      {myReqs.length === 0 && <EmptyState icon="🔧" title="No requests yet" description="Click 'New Request' to submit one." />}
      <div className="space-y-3">
        {myReqs.map(m => {
          const tones: Record<string, any> = { pending: "yellow", in_progress: "blue", resolved: "green" };
          return (
            <Card key={m.id} className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{m.title}</span>
                    <Badge tone={tones[m.status]}>{m.status.replace("_", " ")}</Badge>
                    <Badge tone={m.priority === "high" ? "red" : m.priority === "medium" ? "yellow" : "slate"}>{m.priority}</Badge>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">{m.description}</div>
                </div>
                <div className="text-xs text-slate-400">Submitted {new Date(m.createdAt).toLocaleDateString()}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Maintenance Request"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Submit Request</Button></>}>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Broken faucet" /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail…" /></div>
          <div><Label>Priority</Label>
            <Select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as any })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const TenantNotifications: React.FC = () => {
  const { db, currentUser, markNotificationRead } = useApp();
  const list = db.notifications.filter(n => n.userId === currentUser?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div>
      <PageHeader title="Notifications" subtitle="Messages and updates from administrator" />
      {list.length === 0 && <EmptyState icon="🔔" title="No notifications" />}
      <div className="space-y-2">
        {list.map(n => (
          <Card key={n.id} className={`p-4 ${!n.read ? "border-l-4 border-l-blue-500" : ""}`}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{n.title}</span>
                  {!n.read && <Badge tone="blue">New</Badge>}
                </div>
                <div className="text-sm text-slate-600 mt-1">{n.message}</div>
                <div className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.read && <Button size="sm" variant="secondary" onClick={() => markNotificationRead(n.id)}>Mark Read</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
