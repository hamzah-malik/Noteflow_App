import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { confirmPasswordReset } from '@/api/auth';

export default function ResetPasswordPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const password = watch('newPassword');

  const onSubmit = async ({ newPassword }) => {
    setServerError('');
    setLoading(true);
    try {
      await confirmPasswordReset(uid, token, newPassword);
      navigate('/login', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--text-primary)]">Set a new password</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Choose a strong password to secure your account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)]">New password</label>
          <input type="password" {...register('newPassword', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })} className={inputCls} />
          {errors.newPassword && <p className="mt-1 text-xs text-rejected-500">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--text-primary)]">Confirm password</label>
          <input type="password" {...register('confirmPassword', { required: 'Confirm your password', validate: (value) => value === password || 'Passwords do not match' })} className={inputCls} />
          {errors.confirmPassword && <p className="mt-1 text-xs text-rejected-500">{errors.confirmPassword.message}</p>}
        </div>

        {serverError && <p className="text-sm text-rejected-500">{serverError}</p>}

        <button type="submit" disabled={loading} className="w-full rounded-full bg-accent-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-600 disabled:opacity-50">
          {loading ? 'Saving...' : 'Update password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        <Link to="/login" className="text-accent-500 hover:underline">Back to login</Link>
      </p>
    </div>
  );
}

const inputCls = 'mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-accent-500';