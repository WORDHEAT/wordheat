import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import { Icon } from './Icon';
import { ArrowRight, Sparkles, UserCircle, Mail, Lock, Chrome, Apple, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AVATARS = [
  'User', 'Zap', 'Flame', 'Brain', 'Globe', 'PawPrint', 'Trophy', 'Gamepad2', 'Bot', 'Swords', 'Eye', 'Rocket'
];

interface AuthModalProps {
  isOpen: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen }) => {
  const { updateProfile, profile, closeAuthModal, showToast } = useUser();
  const [mode, setMode] = useState<'welcome' | 'login' | 'signup'>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('User');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);

  if (!isOpen) return null;

  const handleGuest = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    updateProfile(`Guest #${randomId}`, 'User', true);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.register(email.trim(), password, name.trim(), selectedAvatar);

      showToast('Account created!', 'success', 'Mail');
      setSuccessMsg("Account created! Please check your email to confirm.");
      setMode('login');

    } catch (error: any) {
      console.error("Signup error:", error);
      setErrorMsg(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowResend(false);

    try {
      await api.login(email.trim(), password);
      showToast('Welcome back!', 'success');
      closeAuthModal();
    } catch (error: any) {
      console.error("Login error:", error);
      const msg = error.message || "Login failed";

      if (msg.includes('Email not confirmed')) {
        setErrorMsg("Email not confirmed. Please use the button below to get a new verification link.");
        setShowResend(true);
      } else if (msg.includes('Invalid login credentials')) {
        setErrorMsg("Incorrect email or password.");
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await api.resendConfirmation(email);
      showToast('Verification email resent!', 'success');
      setSuccessMsg('A new verification link has been sent to your email.');
      setShowResend(false);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      // Redirect happens automatically
    } catch (error: any) {
      console.error("Social login error:", error);
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-pop">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col relative">

        {/* Close Button */}
        {profile.username && (
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        {mode === 'welcome' && (
          <div className="p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/20 mx-auto mb-6 transform rotate-3">
              <Icon name="Flame" size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">WordHeat</h2>
            <p className="text-slate-400 mb-8">The semantic puzzle game.</p>

            <div className="space-y-3">
              <button
                onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={18} /> Create Free Account
              </button>

              <button
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                Log In
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-slate-900 text-xs text-slate-500 uppercase font-bold tracking-wider">Or</span>
                </div>
              </div>

              <button
                onClick={handleGuest}
                className="w-full py-3 text-slate-400 hover:text-white font-bold text-sm transition-colors"
              >
                Play as Guest
              </button>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div className="p-8">
            <h3 className="text-2xl font-bold text-white mb-2 text-center">Welcome Back</h3>
            <p className="text-slate-400 text-center mb-6 text-sm">Log in to sync your progress across devices.</p>

            {successMsg && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex flex-col items-start gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-green-400 shrink-0" />
                  <div className="text-sm text-green-200 font-bold">Success</div>
                </div>
                <div className="text-sm text-green-200">{successMsg}</div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col items-start gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-400 shrink-0" />
                  <div className="text-sm text-red-200 font-bold">Error</div>
                </div>
                <div className="text-sm text-red-200">{errorMsg}</div>

                {showResend && (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="mt-2 text-xs bg-white text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm w-full justify-center"
                  >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Resend Verification Email
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Chrome size={18} /> Continue with Google
              </button>
            </div>

            <div className="relative py-2 mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-slate-900 text-xs text-slate-500 uppercase font-bold tracking-wider">Or with Email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Log In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-400">Don't have an account? </span>
              <button onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); setShowResend(false); }} className="text-blue-400 hover:text-blue-300 font-bold">Sign Up</button>
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => { setMode('welcome'); setErrorMsg(null); setSuccessMsg(null); }} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <ArrowRight size={20} className="rotate-180" />
              </button>
              <h3 className="text-xl font-bold text-white text-center flex-1 pr-6">Create Account</h3>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-red-200">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSignup}>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Choose Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`aspect-square rounded-lg flex items-center justify-center border transition-all ${selectedAvatar === av ? 'bg-blue-500/20 border-blue-500 text-blue-400 scale-110 shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-transparent text-slate-500 hover:bg-slate-700'}`}
                    >
                      <Icon name={av} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Username</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Display Name"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 font-bold"
                    maxLength={12}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim() || !email.trim() || !password.trim()}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'} {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-slate-400">Already play WordHeat? </span>
              <button onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); setShowResend(false); }} className="text-blue-400 hover:text-blue-300 font-bold">Log In</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};