
import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { Button, Card, Input, Label } from "../components/UI";

export const Login: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const u = login(email, password);

    if (!u) {
      setError("Invalid email or password.");
    }
  };

  const fill = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left brand panel */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-700 to-indigo-800 text-white">
          <div>
            <div className="text-3xl font-extrabold tracking-tight">
              🏠 Madaje&apos;s Boarding House
            </div>

            <p className="mt-3 text-blue-100 text-sm">
              Poblacion, Hinunangan, Southern Leyte
            </p>
          </div>

          <div className="space-y-4 text-sm text-blue-50 leading-relaxed">
            <p>
              Madaje&apos;s Boarding House Management System is a web-based
              platform designed to help manage the daily operations of
              Madaje&apos;s Boarding House.
            </p>

            <p>
              It allows administrators to organize room assignments, monitor
              tenants, track bills and payments, manage maintenance requests,
              and send real-time notifications for smoother and more efficient
              boarding house management.
            </p>
          </div>

          <div className="text-xs text-blue-200">
            © 2026 Madaje&apos;s Boarding House
          </div>
        </div>

        {/* Right login form */}
        <div className="p-8 md:p-10">
          <div className="md:hidden text-center mb-6">
            <div className="text-2xl font-extrabold text-blue-700">
              🏠 Madaje&apos;s BHMS
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Sign in to your account
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <Card className="mt-6 p-4 bg-slate-50">
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Demo accounts click to autofill:
            </div>

            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => fill("admin@madaje.com", "admin123")}
                className="block w-full text-left px-2 py-1 rounded hover:bg-white"
              >
                <span className="font-semibold text-blue-700">Admin:</span>{" "}
                admin@madaje.com / admin123
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
