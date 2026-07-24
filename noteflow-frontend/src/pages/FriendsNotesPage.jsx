import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FileText, Folder } from 'lucide-react';
import { listFriendsNotesSummary } from '@/api/friends';

// The primary discovery surface, per the redesign: Friend -> Profile ->
// Folder -> Note -> Request Access. Only accepted friends ever appear here
// - there is no way to browse or search all users' notes.
export default function FriendsNotesPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['friends-notes-summary'],
    queryFn: () => listFriendsNotesSummary().then((r) => r.data),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">Friends' Notes</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Browse what your friends are sharing.</p>

      {isLoading ? (
        <p className="mt-6 text-sm text-[var(--text-secondary)]">Loading...</p>
      ) : data?.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((friend) => (
            <div key={friend.id} className="card-surface rounded-[var(--radius-card)] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-600 text-sm font-medium text-white">
                  {(friend.full_name || friend.username)[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--text-primary)]">{friend.full_name || friend.username}</p>
                  {friend.bio && <p className="truncate text-xs text-[var(--text-secondary)]">{friend.bio}</p>}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5"><Folder size={14} /> {friend.folder_count} folders</span>
                <span className="flex items-center gap-1.5"><FileText size={14} /> {friend.note_count} notes</span>
              </div>

              <button
                onClick={() => navigate(`/friends/${friend.id}`)}
                className="btn-secondary mt-4 w-full rounded-full py-2 text-sm font-medium"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-[var(--text-secondary)]">
          Add friends to see their notes here - visit the Friends page to search and connect.
        </p>
      )}
    </div>
  );
}
