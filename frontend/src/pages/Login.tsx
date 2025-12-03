import { FormEvent, useState, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { Sparkles, Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function Login(): ReactElement {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const floatAnimation = useSpring({
    from: { transform: 'translateY(0px)' },
    to: async (next) => {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        await next({ transform: 'translateY(-20px)' });
        await next({ transform: 'translateY(0px)' });
      }
    },
    config: { duration: 3000 },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      toast.success('Login successful! 🎉', {
        style: {
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
        },
      });
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      toast.error(message, {
        style: {
          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 animate-gradient bg-[length:400%_400%] p-4 relative overflow-hidden">
        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              }}
              animate={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="w-full max-w-md z-10"
        >
          <animated.div style={floatAnimation}>
            <div className="glass backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              {/* Header with animated icon */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: 0.2,
                  }}
                  className="inline-block"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center backdrop-blur-xl border border-white/30">
                    <Zap className="w-10 h-10 text-yellow-300" strokeWidth={2.5} />
                  </div>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold text-white mb-2 text-gradient"
                >
                  Welcome Back
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Sign in to continue your journey
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 transition-colors group-focus-within:text-blue-600" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/90 border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 outline-none"
                      placeholder="your@email.com"
                      autoComplete="email"
                    />
                  </div>
                </motion.div>

                {/* Password Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 transition-colors group-focus-within:text-blue-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/90 border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 outline-none"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 backdrop-blur-xl"
                  >
                    <p className="text-red-200 text-sm font-medium">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </motion.button>

                {/* Register Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center pt-4"
                >
                  <p className="text-white/70">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-white font-semibold hover:text-cyan-300 transition-colors inline-flex items-center gap-1 group"
                    >
                      Register here
                      <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                    </Link>
                  </p>
                </motion.div>
              </form>
            </div>
          </animated.div>
        </motion.div>
      </div>
    </>
  );
}
