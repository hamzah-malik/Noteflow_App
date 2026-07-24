import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, UserPlus, FileText, Folder } from 'lucide-react';
import { getFriendProfile } from '@/api/friends';
import { listFolders } from '@/api/folders';
import { listNotes, getDownloadUrl } from '@/api/notes';
import { sendFriendRequest } from '@/api/friends';
import { createAccessRequest } from '@/api/accessRequests';
import { useState } from 'react';
import { useToast } from '@/components/shared/ToastProvider';
import { FOLDER_ICONS, FOLDER_COLORS } from '@/lib/folderStyles';
import NoteCard from '@/components/shared/NoteCard';
import RequestAccessDialog from '@/components/shared/RequestAccessDialog';

// The gated entry point for the whole discovery flow. A non-friend gets
// deliberately minimal information - see backend FriendProfileView - no
// note/folder data leaks before an Add Friend click.
export default function FriendProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [requestSent, setRequestSent] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['friend-profile', id],
    queryFn: () => getFriendProfile(id).then((r) => r.data),
  });

  const { data: folders } = useQuery({
    queryKey: ['friend-folders', id],
    queryFn: () => listFolders({ user: id }).then((r) => r.data.results ?? r.data),
    enabled: !!profile?.is_friend,
  });

  const { data: allNotes } = useQuery({
    queryKey: ['friend-notes', id],
    queryFn: () => listNotes({ uploader: id }).then((r) => r.data.results ?? r.data),
    enabled: !!profile?.is_friend,
  });

  const [dialogNote, setDialogNote] = useState(null);

  const handleDownload = async (note) => {
    const { data } = await getDownloadUrl(note.id);
    window.open(data.url, '_blank');
  };

  const handleRequestAccess = async (message) => {
    await createAccessRequest(dialogNote.id, message);
    showToast(`Request sent to ${dialogNote.uploader_name}.`, { title: 'Access requested' });
    setDialogNote(null);
  };

  const folderlessNotes = allNotes?.filter((n) => !n.folder) || [];

  const handleAddFriend = async () => {
    await sendFriendRequest(id);
    setRequestSent(true);
    showToast('They\'ll need to accept before you can see their notes.', { title: 'Friend request sent' });
  };

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-[var(--text-secondary)]">Loading...</div>;
  }

  const user = profile.user;

  if (!profile.is_friend) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-600 text-xl font-medium text-white">
          {(user.full_name || user.username)[0].toUpperCase()}
        </div>
        <h1 className="mt-4 font-[var(--font-display)] text-xl font-bold text-[var(--text-primary)]">{user.full_name || user.username}</h1>

        <div className="card-surface mt-6 flex flex-col items-center rounded-[var(--radius-card)] p-6">
          <Lock size={22} className="text-[var(--text-secondary)]" />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">This user shares notes with friends only.</p>
          <button
            onClick={handleAddFriend}
            disabled={requestSent}
            className="btn-primary mt-4 flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            <UserPlus size={14} /> {requestSent ? 'Request sent' : 'Add Friend'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-600 text-xl font-medium text-white">
          {(user.full_name || user.username)[0].toUpperCase()}
        </div>
        <div>
          <h1 className="font-[var(--font-display)] text-xl font-bold text-[var(--text-primary)]">{user.full_name || user.username}</h1>
          {user.bio && <p className="text-sm text-[var(--text-secondary)]">{user.bio}</p>}
          <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1"><Folder size={12} /> {profile.folder_count} folders</span>
            <span className="flex items-center gap-1"><FileText size={12} /> {profile.note_count} notes</span>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-medium text-[var(--text-secondary)]">Folders</h2>
      {folders?.length ? (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => {
            const Icon = FOLDER_ICONS[folder.icon] || FOLDER_ICONS.folder;
            const color = FOLDER_COLORS[folder.color] || FOLDER_COLORS.blue;
            return (
              <button
                key={folder.id}
                onClick={() => navigate(`/notes?folder=${folder.id}&uploader=${id}`)}
                className="card-surface flex flex-col items-start gap-3 rounded-[var(--radius-card)] p-4 text-left transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.bg} ${color.text}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{folder.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{folder.notes_count} notes</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">No folders yet.</p>
      )}

      {profile.note_count > 0 && (
        <>
          <h2 className="mt-8 text-sm font-medium text-[var(--text-secondary)]">Notes not in a folder</h2>
          {folderlessNotes.length > 0 ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {folderlessNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  accessState={note.can_access ? 'unlocked' : note.has_pending_request ? 'pending' : 'locked'}
                  onOpen={(n) => navigate(`/notes/${n.id}`)}
                  onRequestAccess={setDialogNote}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--text-secondary)]">All of their notes are organized into folders.</p>
          )}
        </>
      )}

      <RequestAccessDialog
        note={dialogNote}
        open={!!dialogNote}
        onClose={() => setDialogNote(null)}
        onSubmit={handleRequestAccess}
      />
    </div>
  );
}
