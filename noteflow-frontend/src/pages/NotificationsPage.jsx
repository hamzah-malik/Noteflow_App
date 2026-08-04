import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listNotifications, markAllNotificationsRead } from '@/api/notifications';
import { approveAccessRequest, rejectAccessRequest } from '@/api/accessRequests';
import { useToast } from '@/components/shared/ToastProvider';
import NotificationItem from '@/components/shared/NotificationItem';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => listNotifications().then((r) => r.data.results ?? r.data),
  });

  // Visiting this page is the "read" action - mark everything read and
  // refresh the sidebar's badge count (which reads from the dashboard
  // query). Previously nothing ever called this, so the unread count
  // stayed stuck at whatever it was when you first logged in.
  useEffect(() => {
    markAllNotificationsRead().then(() => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });
  }, [queryClient]);

  const handleApprove = async (notification) => {
    // target_id on an access_requested notification is the AccessRequest id.
    await approveAccessRequest(notification.target_id);
    showToast(`${notification.actor_detail?.full_name || 'They'} can now access your note.`, { title: 'Access approved!' });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const handleReject = async (notification) => {
    await rejectAccessRequest(notification.target_id);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const errorMessage = error?.response?.data?.detail || error?.message || 'Could not load notifications.';

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="card-surface rounded-[var(--radius-card)] p-6">
          <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">Notifications unavailable</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{errorMessage}</p>
          <button onClick={() => refetch()} className="btn-primary mt-4 rounded-full px-4 py-2 text-sm font-medium">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
        ) : data?.length ? (
          data.map((n) => (
            <NotificationItem key={n.id} notification={n} onApprove={handleApprove} onReject={handleReject} />
          ))
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">You're all caught up.</p>
        )}
      </div>
    </div>
  );
}
