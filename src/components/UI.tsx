import React from "react";
import { cn } from "../utils/cn";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...p }) => (
  <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm", className)} {...p} />
);

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost"; size?: "sm" | "md" }
> = ({ className, variant = "primary", size = "md", ...p }) => {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm" };
  const variants = {
    primary:   "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200",
    danger:    "bg-red-600 hover:bg-red-700 text-white shadow-sm",
    ghost:     "bg-transparent hover:bg-slate-100 text-slate-700",
  };
  return <button className={cn(base, sizes[size], variants[variant], className)} {...p} />;
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...p }) => (
  <input className={cn("w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", className)} {...p} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...p }) => (
  <select className={cn("w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", className)} {...p}>{children}</select>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...p }) => (
  <textarea className={cn("w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[90px]", className)} {...p} />
);

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...p }) => (
  <label className={cn("block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide", className)} {...p} />
);

export const Badge: React.FC<{ tone?: "blue" | "green" | "red" | "yellow" | "slate" | "purple"; children: React.ReactNode }> = ({ tone = "slate", children }) => {
  const tones = {
    blue:   "bg-blue-100 text-blue-700",
    green:  "bg-green-100 text-green-700",
    red:    "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-800",
    slate:  "bg-slate-100 text-slate-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold", tones[tone])}>{children}</span>;
};

export const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }> = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

export const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex gap-2">{actions}</div>}
  </div>
);

export const StatCard: React.FC<{ label: string; value: string | number; icon: string; tone?: string }> = ({ label, value, icon, tone = "bg-blue-50 text-blue-600" }) => (
  <Card className="p-5 flex items-center gap-4">
    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-2xl", tone)}>{icon}</div>
    <div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
    </div>
  </Card>
);

export const EmptyState: React.FC<{ icon?: string; title: string; description?: string }> = ({ icon = "📭", title, description }) => (
  <div className="text-center py-12">
    <div className="text-4xl mb-2">{icon}</div>
    <div className="font-semibold text-slate-700">{title}</div>
    {description && <div className="text-sm text-slate-500 mt-1">{description}</div>}
  </div>
);
