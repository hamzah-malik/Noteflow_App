import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { login as loginApi, fetchMe } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import TransferAnimation from '@/components/shared/TransferAnimation';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  // Plays once per visit to /login, not on every re-render - see the brief's
  // "before login page appears" framing (an intro, not a loop).
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('noteflow_intro_seen'));
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);

  const dismissIntro = () => {
    sessionStorage.setItem('noteflow_intro_seen', '1');
    setShowIntro(false);
  };

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const { data: tokenData } = await loginApi(data.email, data.password, data.rememberMe);
      setAccessToken(tokenData.access);
      const { data: me } = await fetchMe();
      setUser(me);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Could not log in. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showIntro && <TransferAnimation onComplete={dismissIntro} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-sm flex-col justify-center px-6"
      >
        <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--text-primary)]">Welcome back</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Log in to your NoteFlow account.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">Email</label>
            <input type="email" {...register('email', { required: 'Email is required' })} className={inputCls} />
            {errors.email && <p className="mt-1 text-xs text-rejected-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">Password</label>
            <input type="password" {...register('password', { required: 'Password is required' })} className={inputCls} />
            {errors.password && <p className="mt-1 text-xs text-rejected-500">{errors.password.message}</p>}
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[var(--text-secondary)]">
              <input type="checkbox" {...register('rememberMe')} className="rounded" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-accent-500 hover:underline">Forgot password?</Link>
          </div>
          {serverError && <p className="text-sm text-rejected-500">{serverError}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-accent-500 py-2.5 text-sm font-medium text-white hover:bg-accent-600 transition-colors disabled:opacity-50">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Don't have an account? <Link to="/register" className="text-accent-500 hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </>
  );
}

const inputCls = 'mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-accent-500';
