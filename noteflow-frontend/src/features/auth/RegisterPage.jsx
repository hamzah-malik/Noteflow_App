import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '@/api/auth';

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      await registerApi({
        email: data.email,
        username: data.username,
        full_name: data.fullName,
        password: data.password,
        confirm_password: data.confirmPassword,
      });
      navigate('/login');
    } catch (err) {
      const detail = err.response?.data;
      setServerError(typeof detail === 'object' ? Object.values(detail).flat().join(' ') : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--text-primary)]">Create your account</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Join NoteFlow in under a minute.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Field label="Full name" error={errors.fullName}>
          <input {...register('fullName', { required: 'Required' })} className={inputCls} />
        </Field>
        <Field label="Username" error={errors.username}>
          <input {...register('username', { required: 'Required' })} className={inputCls} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" {...register('email', { required: 'Required' })} className={inputCls} />
        </Field>
        <Field label="Password" error={errors.password}>
          <input type="password" {...register('password', { required: 'Required', minLength: { value: 8, message: 'At least 8 characters' } })} className={inputCls} />
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword}>
          <input type="password" {...register('confirmPassword', { required: 'Required', validate: (v) => v === password || 'Passwords do not match' })} className={inputCls} />
        </Field>

        {serverError && <p className="text-sm text-rejected-500">{serverError}</p>}

        <button type="submit" disabled={loading} className="w-full rounded-full bg-accent-500 py-2.5 text-sm font-medium text-white hover:bg-accent-600 transition-colors disabled:opacity-50">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Already have an account? <Link to="/login" className="text-accent-500 hover:underline">Log in</Link>
      </p>
    </div>
  );
}

const inputCls = 'mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-accent-500';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-[var(--text-primary)]">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rejected-500">{error.message}</p>}
    </div>
  );
}
