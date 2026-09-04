import React, { useState } from 'react';
import {
  Shield,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const AuthView: React.FC = () => {
  const { loginWithEmail, signupWithEmail, loginAsDemo, loading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setActionLoading(true);

    try {
      if (isSignup) {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          throw new Error('Please fill in all required fields.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await signupWithEmail({ fullName, email, phone });
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter both email and password.');
        }
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setErrorMsg('');
    setActionLoading(true);
    try {
      await loginAsDemo();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to login with demo profile.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-xs mb-3">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          LifeTrack
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Life Insurance Expense Tracker & Premium Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200/90 sm:px-10">
          {/* Top Mode Selector */}
          <div className="flex bg-slate-100/90 p-1 rounded-xl mb-6 text-xs font-semibold border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setIsSignup(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                !isSignup ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignup(true);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                isSignup ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium animate-in fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Demo Profile Access */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={actionLoading || loading}
            className="w-full mb-5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/70 text-indigo-900 transition-colors shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Quick Sign In with Demo Account (Kasthuri)</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-white px-3 text-slate-400 font-medium">
                {isSignup ? 'Enter account details' : 'Or sign in with email'}
              </span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {isSignup && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Kasthuri Raman"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>
            )}

            {!isSignup && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link will be sent to your email.')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={actionLoading || loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{actionLoading ? 'Authenticating...' : isSignup ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
