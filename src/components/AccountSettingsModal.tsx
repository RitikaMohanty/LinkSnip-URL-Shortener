import React, { useState, useEffect } from "react";
import { X, User, Key, LogIn, UserPlus, LogOut, CheckCircle2, ShieldCheck, Mail, Sparkles } from "lucide-react";
import { UserProfile } from "../types";

interface AccountSettingsModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  initialTab?: 'login' | 'signup' | 'settings';
  onClose: () => void;
  onUserUpdated: (user: UserProfile | null) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  user,
  isOpen,
  initialTab = 'login',
  onClose,
  onUserUpdated,
}) => {
  const [tab, setTab] = useState<'login' | 'signup' | 'settings'>(
    user ? 'settings' : initialTab
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [verifySent, setVerifySent] = useState(false);
  const [isVerified, setIsVerified] = useState(user?.isEmailVerified ?? false);

  useEffect(() => {
    if (user) {
      setTab('settings');
      setName(user.name);
      setEmail(user.email);
      setIsVerified(user.isEmailVerified);
    } else {
      setTab(initialTab);
      setName("");
      setEmail("");
    }
    setErrorMsg(null);
  }, [user, isOpen, initialTab]);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customName?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const loginEmail = customEmail || email.trim();
    const loginName = customName || name.trim() || undefined;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, name: loginName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onUserUpdated(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      onUserUpdated(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        onUserUpdated(data.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onUserUpdated(null);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async () => {
    try {
      await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || user?.email }),
      });
      setResetSent(true);
      setTimeout(() => setResetSent(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await fetch("/api/auth/verify-email", { method: "POST" });
      setIsVerified(true);
      setVerifySent(true);
      setTimeout(() => setVerifySent(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-[16px] max-w-md w-full shadow-2xl border border-[#e4e4e7] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e4e4e7]">
          <div>
            <h2 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-base font-bold text-[#09090b]"
            >
              {tab === 'login' ? 'Log In to LinkSnip' : tab === 'signup' ? 'Create Free Account' : 'Account & Security Settings'}
            </h2>
            <p className="text-xs text-[#71717a]">
              {tab === 'login'
                ? 'Sign in to access custom aliases, password gates & UTM parameters'
                : tab === 'signup'
                ? 'Sign up to unlock all advanced link customizations & telemetry'
                : 'Manage profile credentials, email verification, and API tokens'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-[#09090b] hover:bg-[#f1f5f9] rounded-[8px] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#e4e4e7] bg-[#f8fafc] p-1.5 gap-1 text-xs">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setTab('settings')}
                className={`flex-1 py-1.5 rounded-[8px] font-semibold text-center transition-all cursor-pointer ${
                  tab === 'settings'
                    ? 'bg-white text-[#09090b] shadow-xs border border-[#e4e4e7]'
                    : 'text-[#71717a] hover:text-[#09090b]'
                }`}
              >
                Profile & Settings
              </button>
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`flex-1 py-1.5 rounded-[8px] font-semibold text-center transition-all cursor-pointer ${
                  tab === 'login'
                    ? 'bg-white text-[#09090b] shadow-xs border border-[#e4e4e7]'
                    : 'text-[#71717a] hover:text-[#09090b]'
                }`}
              >
                Switch Account
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(null); }}
                className={`flex-1 py-2 rounded-[8px] font-bold text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tab === 'login'
                    ? 'bg-white text-[#09090b] shadow-xs border border-[#e4e4e7]'
                    : 'text-[#71717a] hover:text-[#09090b]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setErrorMsg(null); }}
                className={`flex-1 py-2 rounded-[8px] font-bold text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tab === 'signup'
                    ? 'bg-white text-[#09090b] shadow-xs border border-[#e4e4e7]'
                    : 'text-[#71717a] hover:text-[#09090b]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-xs rounded-[10px] flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="p-5 space-y-4 text-xs">
            {/* Quick Demo Login Option */}
            <div className="p-3.5 bg-[#f8fafc] border border-[#e4e4e7] rounded-[12px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#09090b] text-white flex items-center justify-center font-bold text-xs">
                  R
                </div>
                <div>
                  <p className="font-bold text-[#09090b] leading-tight">Ritika Mohanty</p>
                  <p className="text-[11px] text-[#71717a]">ritikamohanty804@gmail.com</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLogin(undefined, "ritikamohanty804@gmail.com", "Ritika Mohanty")}
                className="px-3 py-1.5 bg-[#09090b] hover:bg-[#27272a] text-white font-semibold rounded-[8px] shadow-2xs text-xs transition-all cursor-pointer"
              >
                Instant Log In
              </button>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-[#e4e4e7] w-full"></div>
              <span className="bg-white px-2 text-[11px] text-[#71717a] uppercase font-semibold">or log in with credentials</span>
            </div>

            <div>
              <label className="block font-semibold text-[#09090b] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-[#09090b] text-xs focus:border-[#09090b] focus:ring-3 focus:ring-black/5 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#09090b] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-[#09090b] text-xs focus:border-[#09090b] focus:ring-3 focus:ring-black/5 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#09090b] hover:bg-[#27272a] text-white rounded-[10px] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? "Signing In..." : "Sign In & Unlock Advanced Options"}
            </button>

            <p className="text-center text-[11px] text-[#71717a] pt-1">
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => setTab('signup')}
                className="text-[#09090b] font-bold hover:underline cursor-pointer"
              >
                Create one now
              </button>
            </p>
          </form>
        )}

        {/* TAB 2: SIGN UP */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="p-5 space-y-4 text-xs">
            <div className="p-3.5 bg-[#f8fafc] rounded-[12px] border border-[#e4e4e7] space-y-1.5">
              <span className="font-bold text-[#09090b] flex items-center gap-1 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#09090b]" />
                Included with Free Account:
              </span>
              <ul className="text-[11px] text-[#71717a] space-y-1 list-disc list-inside">
                <li>Custom back-half URLs (e.g., <code className="font-mono text-[#09090b]">/r/custom-slug</code>)</li>
                <li>Password protection & scheduled expiration limits</li>
                <li>UTM campaign builder & folder groupings</li>
                <li>Real-time telemetry and API key generation</li>
              </ul>
            </div>

            <div>
              <label className="block font-semibold text-[#09090b] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-[#09090b] text-xs focus:border-[#09090b] focus:ring-3 focus:ring-black/5 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#09090b] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-[#09090b] text-xs focus:border-[#09090b] focus:ring-3 focus:ring-black/5 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#09090b] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-[#09090b] text-xs focus:border-[#09090b] focus:ring-3 focus:ring-black/5 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#09090b] hover:bg-[#27272a] text-white rounded-[10px] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? "Creating Account..." : "Create Account & Unlock Advanced Options"}
            </button>

            <p className="text-center text-[11px] text-[#71717a] pt-1">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-[#09090b] font-bold hover:underline cursor-pointer"
              >
                Log In
              </button>
            </p>
          </form>
        )}

        {/* TAB 3: SETTINGS */}
        {tab === 'settings' && user && (
          <form onSubmit={handleSaveProfile} className="p-5 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#09090b] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-[#09090b] text-xs focus:border-[#09090b] focus:ring-3 focus:ring-black/5 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#09090b]">Email Address</label>
                {isVerified ? (
                  <span className="text-[10px] text-[#059669] font-bold bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#a7f3d0] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                    Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    className="text-[10px] text-[#09090b] font-bold hover:underline cursor-pointer"
                  >
                    Send Verification Link
                  </button>
                )}
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-[#09090b] text-xs focus:border-[#09090b] focus:ring-3 focus:ring-black/5 outline-none"
              />
            </div>

            {verifySent && (
              <div className="p-2.5 bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] rounded-[8px] text-[11px] flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>Email verification confirmed!</span>
              </div>
            )}

            {/* Password Reset Trigger */}
            <div className="p-3.5 bg-[#f8fafc] rounded-[12px] border border-[#e4e4e7] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#09090b] block">Password & Credentials</span>
                  <p className="text-[11px] text-[#71717a]">Trigger a secure reset link to your email</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="px-3 py-1.5 bg-white border border-[#e4e4e7] hover:bg-[#f4f4f5] text-[#09090b] font-semibold rounded-[8px] shadow-2xs text-xs transition-colors cursor-pointer"
                >
                  Reset Password
                </button>
              </div>
              {resetSent && (
                <p className="text-[11px] text-[#059669] font-semibold pt-1">
                  ✓ Password reset instructions sent to {email}!
                </p>
              )}
            </div>

            {/* Plan badge */}
            <div className="flex items-center justify-between p-3.5 bg-[#f8fafc] rounded-[12px] border border-[#e4e4e7]">
              <div>
                <span className="font-bold text-[#09090b] block">Current Plan: {user.plan}</span>
                <span className="text-[11px] text-[#71717a]">Unlimited Shortening, Fast Redirection & API Access</span>
              </div>
              <span className="px-2.5 py-1 bg-[#09090b] text-white font-bold rounded-[6px] text-[10px]">
                Active
              </span>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#e4e4e7]">
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 text-[#dc2626] hover:bg-[#fef2f2] rounded-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white border border-[#e4e4e7] hover:bg-[#f4f4f5] text-[#09090b] rounded-[10px] font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-[#09090b] hover:bg-[#27272a] text-white rounded-[10px] font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
