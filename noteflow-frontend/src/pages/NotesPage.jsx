import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { listNotes, getDownloadUrl } from '@/api/notes';
import { createAccessRequest } from '@/api/accessRequests';
import { useAuthStore } from '@/store/authStore';
import NoteCard from '@/components/shared/NoteCard';
import RequestAccessDialog from '@/components/shared/RequestAccessDialog';
import { useToast } from '@/components/shared/ToastProvider';

export default function NotesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const folderId = searchParams.get('folder') || '';
  const uploaderId = searchParams.get('uploader') || '';
  const visibilityFilter = searchParams.get('visibility') || '';
  const [search, setSearch] = useState(searchParams.get('search') || '');

  // The top AppShell search bar navigates to /notes?search=X even when
  // already on this page - React Router updates the URL without
  // remounting, so the useState initializer above never re-runs. Without
  // this, typing in the top bar and hitting Enter while on /notes silently
  // did nothing.
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== search) setSearch(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const [dialogNote, setDialogNote] = useState(null);
  const [justUnlockedIds, setJustUnlockedIds] = useState(new Set());
  const prevAccessRef = useRef(new Map());
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);

  const { data, refetch, isError, error, isLoading } = useQuery({
    queryKey: ['notes', search, folderId, uploaderId, visibilityFilter],
    queryFn: () => listNotes({ search, folder: folderId || undefined, uploader: uploaderId || undefined, visibility: visibilityFilter || undefined }).then((r) => r.data.results ?? r.data),
    // Polling is what makes the requester-side "just unlocked" animation
    // possible without websockets - a modest interval is enough for the
    // brief's "instantly" framing without real infra.
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!data) return;
    const newlyUnlocked = new Set();
    data.forEach((note) => {
      const prev = prevAccessRef.current.get(note.id);
      if (prev === false && note.can_access === true) newlyUnlocked.add(note.id);
      prevAccessRef.current.set(note.id, note.can_access);
    });
    if (newlyUnlocked.size > 0) {
      setJustUnlockedIds(newlyUnlocked);
      setTimeout(() => setJustUnlockedIds(new Set()), 2200);
    }
  }, [data]);

  const accessStateFor = (note) => {
    if (note.can_access) return 'unlocked';
    if (note.has_pending_request) return 'pending';
    return 'locked';
  };

  const handleRequestAccess = async (message) => {
    await createAccessRequest(dialogNote.id, message);
    showToast(`Request sent to ${dialogNote.uploader_name}.`, { title: 'Access requested' });
    setDialogNote(null);
    refetch();
  };

  const handleDownload = async (note) => {
    const { data } = await getDownloadUrl(note.id);
    window.open(data.url, '_blank');
  };

  const errorMessage = error?.response?.data?.detail || error?.message || 'Could not load notes.';

  if (isError) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="card-surface rounded-[var(--radius-card)] p-6">
          <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">Notes unavailable</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{errorMessage}</p>
          <button onClick={() => refetch()} className="btn-primary mt-4 rounded-full px-4 py-2 text-sm font-medium">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">
          {uploaderId ? (data?.[0]?.uploader_name ? `${data[0].uploader_name}'s Folder` : "Friend's Folder") : folderId ? 'Folder' : 'My Notes'}
        </h1>
        <div className="flex items-center gap-3">
          {folderId && !uploaderId && (
            <button onClick={() => navigate(`/upload?folder=${folderId}`)} className="btn-primary rounded-full px-4 py-2 text-sm font-medium">
              Upload to this folder
            </button>
          )}
          {(folderId || uploaderId) && (
            <button onClick={() => setSearchParams({})} className="text-sm text-accent-500 hover:underline">
              Clear filter
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 max-w-md">
        <Search size={16} className="text-[var(--text-secondary)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-secondary)]"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-sm text-[var(--text-secondary)]">Loading notes...</p>
        ) : (
          data?.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              accessState={accessStateFor(note)}
              justUnlocked={justUnlockedIds.has(note.id)}
              onOpen={(n) => navigate(`/notes/${n.id}`)}
              onRequestAccess={setDialogNote}
              onDownload={handleDownload}
            />
          ))
        )}
      </div>

      {data?.length === 0 && (
        <p className="mt-8 text-sm text-[var(--text-secondary)]">No notes found.</p>
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
