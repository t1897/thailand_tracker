import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOAuth = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setErrorMsg(error.message);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setErrorMsg('Check your email for a confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLogin();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-surface-dark border border-surface-highlight rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6"
          >
            <button
              className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 text-white transition-colors"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-400 text-sm">Sign in to sync your journey across devices</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {errorMsg}
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuth('google')}
                className="w-full py-3 px-4 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>

              <button
                onClick={() => handleOAuth('github')}
                className="w-full py-3 px-4 bg-[#24292F] text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#24292F]/90 transition-colors border border-white/10"
              >
                <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5 invert" alt="GitHub" />
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">or</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            {/* Email/Password */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center bg-black/20 rounded-xl px-3 border border-white/5 focus-within:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-slate-500">mail</span>
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 py-3 ml-2 text-sm focus:outline-none"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="flex items-center bg-black/20 rounded-xl px-3 border border-white/5 focus-within:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-slate-500">lock</span>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 py-3 ml-2 text-sm focus:outline-none"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                />
              </div>
            </div>

            <button
              onClick={handleEmailAuth}
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-primary-content rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-content border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isSignUp ? 'Sign Up' : 'Sign In'
              )}
            </button>

            <p className="mt-4 text-center text-sm text-slate-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
                className="text-primary font-bold hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>

            <p className="mt-4 text-center text-xs text-slate-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
