import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listNotes, getDownloadUrl } from '@/api/notes';
import { useAuthStore } from '@/store/authStore';
import NoteCard from '@/components/shared/NoteCard';

// Notes I don't own but can access - approved private requests plus public
// notes from friends. Filtering is done server-side isn't available as a
// single param yet, so this fetches broadly and filters client-side by
// can_access + not-mine; fine at this scale, revisit if note volume grows.
export default function SharedWithMePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({
    queryKey: ['notes', 'shared-with-me'],
    queryFn: () => listNotes().then((r) => r.data.results ?? r.data),
  });

  const handleDownload = async (note) => {
    const { data } = await getDownloadUrl(note.id);
    window.open(data.url, '_blank');
  };

  const shared = data?.filter((n) => n.can_access && n.uploader !== user?.id) || [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">Shared with Me</h1>

      {shared.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--text-secondary)]">Nothing here yet - notes friends share, or notes you've been granted access to, show up here.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shared.map((note) => (
            <NoteCard key={note.id} note={note} accessState="unlocked" onOpen={(n) => navigate(`/notes/${n.id}`)} onDownload={handleDownload} />
          ))}
        </div>
      )}
    </div>
  );
}
