import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, KeyRound } from 'lucide-react';
import { fetchMe, changePassword, logout as logoutApi } from '@/api/auth';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/shared/ToastProvider';

export default function SettingsPage() {
  const { register, handleSubmit, reset } = useForm();
  const passwordForm = useForm();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { showToast } = useToast();
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetchMe().then((r) => r.data),
  });

  useEffect(() => {
    if (me) reset({ full_name: me.full_name, bio: me.bio });
  }, [me, reset]);

  const onSaveProfile = async (data) => {
    setSaving(true);
    try {
      const { data: updated } = await apiClient.patch('/users/me/', data);
      setUser(updated);
      showToast('Your profile has been updated.', { title: 'Saved' });
    } catch {
      showToast('Could not save your changes.', { type: 'error', title: 'Error' });
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data) => {
    setPasswordError('');
    if (data.newPassword !== data.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(data.oldPassword, data.newPassword);
      showToast('Your password has been changed.', { title: 'Password updated' });
      passwordForm.reset();
    } catch (err) {
      setPasswordError(err.response?.data?.old_password || err.response?.data?.new_password?.[0] || 'Could not change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      // Every cached query (note detail, dashboard, notifications...) is
      // scoped to whoever was authenticated when it was fetched. Without
      // clearing the cache, logging in as a different account in the same
      // tab can show stale data from the previous account - e.g. a note
      // cached as "locked, pending" from a friend's session still looking
      // locked after logging back in as its actual owner.
      queryClient.clear();
      clearAuth();
      navigate('/');
    }
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">Settings</h1>

      {/* Profile */}
      <form onSubmit={handleSubmit(onSaveProfile)} className="card-surface mt-6 space-y-4 rounded-[var(--radius-card)] p-5">
        <SectionHeader icon={User} title="Profile" />

        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-600 text-lg font-medium text-white shadow-[0_0_0_3px_var(--bg-surface),0_0_0_5px_rgba(76,107,58,0.35)]">
            {(me?.full_name || me?.username || 'U')[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{me?.username}</p>
            <p className="text-xs text-[var(--text-secondary)]">{me?.email}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--text-primary)]">Full name</label>
          <input defaultValue={me?.full_name} {...register('full_name')} className={inputCls} />
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--text-primary)]">Bio</label>
          <textarea defaultValue={me?.bio} {...register('bio')} rows={3} maxLength={280} className={inputCls} />
        </div>

        <button type="submit" disabled={saving} className="btn-primary rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="card-surface mt-6 space-y-4 rounded-[var(--radius-card)] p-5">
        <SectionHeader icon={KeyRound} title="Change password" />

        <div>
          <label className="text-sm font-medium text-[var(--text-primary)]">Current password</label>
          <input type="password" {...passwordForm.register('oldPassword', { required: true })} className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)]">New password</label>
          <input type="password" {...passwordForm.register('newPassword', { required: true, minLength: 8 })} className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)]">Confirm new password</label>
          <input type="password" {...passwordForm.register('confirmPassword', { required: true })} className={inputCls} />
        </div>

        {passwordError && <p className="text-sm text-rejected-500">{passwordError}</p>}

        <button type="submit" disabled={changingPassword} className="btn-secondary rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          {changingPassword ? 'Updating...' : 'Update password'}
        </button>
      </form>

      {/* Logout */}
      <div className="card-surface mt-6 rounded-[var(--radius-card)] p-5">
        <button onClick={handleLogout} className="btn-destructive flex items-center gap-2 text-sm font-medium">
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-50 text-accent-500 dark:bg-accent-500/10 dark:text-accent-dark">
        <Icon size={13} />
      </div>
      <h2 className="font-medium text-[var(--text-primary)]">{title}</h2>
    </div>
  );
}

const inputCls = 'mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-accent-500';
