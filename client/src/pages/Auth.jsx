import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success('Account created successfully!');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent/20 blur-[160px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[140px] rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10"
      >
        {/* Left Side: Branding/Value Prop */}
        <div className="hidden lg:block space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-accent text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Next-gen Task Management</span>
          </div>
          <h1 className="text-6xl font-bold font-heading leading-tight gradient-text">
            Streamline your <br />
            team's workflow <br />
            with precision.
          </h1>
          <p className="text-xl text-muted leading-relaxed max-w-md">
            Collaborate in real-time, track progress with beautiful Kanban boards, and hit every deadline with TaskSync.
          </p>
          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-surface flex items-center justify-center">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} className="rounded-full" alt="" />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted font-medium">Joined by 2,000+ teams worldwide</p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-card relative">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/20 blur-3xl rounded-full" />
            
            <div className="mb-8">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-accent/20 mb-6">T</div>
              <h2 className="text-3xl font-bold font-heading mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-muted">
                {isLogin ? 'Sign in to your dashboard' : 'Join the elite teams managing tasks today'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="label">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/60" />
                      <input
                        type="text"
                        name="name"
                        required={!isLogin}
                        className="glass-input pl-11"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/60" />
                  <input
                    type="email"
                    name="email"
                    required
                    className="glass-input pl-11"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="label">Password</label>
                  {isLogin && <button type="button" className="text-[10px] text-accent hover:underline uppercase tracking-wider font-bold">Forgot?</button>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/60" />
                  <input
                    type="password"
                    name="password"
                    required
                    className="glass-input pl-11"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary w-full h-12 flex items-center justify-center gap-2 mt-4 text-base font-bold tracking-wide"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Get Started'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted hover:text-white transition-colors group"
              >
                {isLogin ? (
                  <>Don't have an account? <span className="text-accent font-bold group-hover:underline underline-offset-4">Sign Up Free</span></>
                ) : (
                  <>Already a member? <span className="text-accent font-bold group-hover:underline underline-offset-4">Login Now</span></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
