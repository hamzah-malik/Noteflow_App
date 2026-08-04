import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Lock, Clock, Share2 } from 'lucide-react';
import { fetchDashboard } from '@/api/notes';
import { approveAccessRequest, rejectAccessRequest } from '@/api/accessRequests';
import { createFolder } from '@/api/folders';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/shared/ToastProvider';
import FolderCard from '@/components/shared/FolderCard';
import CreateFolderDialog from '@/components/shared/CreateFolderDialog';
import NoteRow from '@/components/shared/NoteRow';
import InsightsPanel from '@/components/shared/InsightsPanel';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchDashboard().then((r) => r.data),
  });

  // Normalizes the two shapes InsightsPanel can hand back: a raw
  // AccessRequest (from the quick-approve list, has .id) or a Notification
  // wrapping one (from the activity feed, has .target_id).
  const resolveRequestId = (arOrNotification) => arOrNotification.target_id || arOrNotification.id;

  const handleApprove = async (arOrNotification) => {
    const id = resolveRequestId(arOrNotification);
    await approveAccessRequest(id);
    const name = arOrNotification.requester_detail?.full_name || arOrNotification.actor_detail?.full_name || 'They';
    showToast(`${name} can now access your note.`, { title: 'Access approved!' });
    refetch();
  };

  const handleReject = async (arOrNotification) => {
    await rejectAccessRequest(resolveRequestId(arOrNotification));
    refetch();
  };

  const handleCreateFolder = async (payload) => {
    await createFolder(payload);
    showToast(`"${payload.name}" is ready.`, { title: 'Folder created' });
    setFolderDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const stats = data?.stats;
  const errorMessage = error?.response?.data?.detail || error?.message || 'Could not load dashboard data.';

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="card-surface rounded-[var(--radius-card)] p-6">
          <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">Dashboard unavailable</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{errorMessage}</p>
          <button onClick={() => refetch()} className="btn-primary mt-4 rounded-full px-4 py-2 text-sm font-medium">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
      <div className="min-w-0 flex-1">
        <input
          placeholder="Search notes by title, subject or owner..."
          className="mb-6 w-full rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm outline-none focus:border-accent-500 lg:hidden"
        />

        {/* Categories - computed filters, not stored objects */}
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">Categories</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <CategoryCard icon={FileText} label="All Notes" value={stats?.all_notes_count} color="purple" onClick={() => navigate('/notes')} />
          <CategoryCard icon={Lock} label="Private Notes" value={stats?.private_notes_count} color="blue" onClick={() => navigate('/notes?visibility=private')} />
          <CategoryCard icon={Clock} label="Pending Access" value={stats?.pending_access_count} suffix="requests" color="amber" onClick={() => navigate('/access-requests')} />
          <CategoryCard icon={Share2} label="Shared Notes" value={stats?.shared_notes_count} color="green" onClick={() => navigate('/shared')} />
        </div>

        {/* My Notes - real folders */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--text-secondary)]">My Notes</h2>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data?.folders?.map((folder) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
          <button
            onClick={() => setFolderDialogOpen(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-[var(--border)] p-4 text-[var(--text-secondary)] hover:border-accent-500 hover:text-accent-500 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">New Folder</span>
          </button>
        </div>

        {/* Recent Notes - list style */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--text-secondary)]">Recent Notes</h2>
        </div>
        <div className="card-surface mt-3 divide-y divide-[var(--border)] rounded-[var(--radius-card)] p-2">
          {isLoading ? (
            <p className="p-4 text-sm text-[var(--text-secondary)]">Loading...</p>
          ) : data?.my_recent_uploads?.length || data?.shared_with_me?.length ? (
            [...(data?.my_recent_uploads || []), ...(data?.shared_with_me || [])]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 8)
              .map((note) => (
                <NoteRow key={note.id} note={note} isOwner={note.uploader === user?.id} />
              ))
          ) : (
            <p className="p-4 text-sm text-[var(--text-secondary)]">No notes yet - upload your first one.</p>
          )}
        </div>
      </div>

      <InsightsPanel
        stats={data?.stats}
        pendingRequests={data?.pending_requests}
        notifications={data?.notifications}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <CreateFolderDialog
        open={folderDialogOpen}
        onClose={() => setFolderDialogOpen(false)}
        onSubmit={handleCreateFolder}
      />
    </div>
  );
}

const CATEGORY_COLORS = {
  purple: 'bg-purple-50 text-purple-500 dark:bg-purple-500/15',
  blue: 'bg-accent-50 text-accent-500 dark:bg-accent-500/15',
  amber: 'bg-pending-500/10 text-pending-500',
  green: 'bg-approved-500/10 text-approved-500',
};

function CategoryCard({ icon: Icon, label, value, suffix, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card-surface rounded-[var(--radius-card)] p-4 text-left transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${CATEGORY_COLORS[color]}`}>
        <Icon size={16} />
      </div>
      <p className="mt-3 font-mono text-xl font-bold text-[var(--text-primary)]">{value ?? '—'}</p>
      <p className="text-xs text-[var(--text-secondary)]">{label}{suffix ? ` ${suffix}` : ''}</p>
    </button>
  );
}
