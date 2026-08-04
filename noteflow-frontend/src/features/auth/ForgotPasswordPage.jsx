import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '@/api/auth';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverMessage, setServerMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ email }) => {
    setServerError('');
    setServerMessage('');
    setLoading(true);
    try {
      const { data } = await requestPasswordReset(email);
      setServerMessage(data.detail || 'If that email exists, a reset link has been sent.');
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Could not start password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--text-primary)]">Reset your password</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Enter your email and we’ll send a reset link.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)]">Email</label>
          <input type="email" {...register('email', { required: 'Email is required' })} className={inputCls} />
          {errors.email && <p className="mt-1 text-xs text-rejected-500">{errors.email.message}</p>}
        </div>

        {serverError && <p className="text-sm text-rejected-500">{serverError}</p>}
        {serverMessage && <p className="text-sm text-emerald-600">{serverMessage}</p>}

        <button type="submit" disabled={loading} className="w-full rounded-full bg-accent-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-600 disabled:opacity-50">
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Remembered it? <Link to="/login" className="text-accent-500 hover:underline">Back to login</Link>
      </p>
    </div>
  );
}

const inputCls = 'mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-accent-500';