import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Share2, MoreHorizontal, FileText, Trash2 } from 'lucide-react';
import { deleteNote } from '@/api/notes';
import { useToast } from './ToastProvider';
import ConfirmDialog from './ConfirmDialog';

const FILE_TYPE_STYLE = {
  pdf: { bg: 'bg-rejected-500', label: 'PDF' },
  docx: { bg: 'bg-accent-500', label: 'DOCX' },
  doc: { bg: 'bg-accent-500', label: 'DOC' },
};

const STATUS_STYLE = {
  private: { label: 'Private', className: 'text-purple-500 bg-purple-50 dark:bg-purple-500/15' },
  shared: { label: 'Shared', className: 'text-approved-500 bg-approved-500/10' },
  pending: { label: 'Pending Access', className: 'text-pending-500 bg-pending-500/10' },
};

// Compact list row for "Recent Notes" - denser than NoteCard's grid tile,
// matching the reference design's list-style dashboard section.
export default function NoteRow({ note, isOwner }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileStyle = FILE_TYPE_STYLE[note.file_type] || FILE_TYPE_STYLE.pdf;

  let statusKey = 'shared';
  if (isOwner && note.visibility === 'private') statusKey = 'private';
  else if (!note.can_access && note.has_pending_request) statusKey = 'pending';
  const status = STATUS_STYLE[statusKey];

  const handleDelete = async () => {
    await deleteNote(note.id);
    showToast('The note has been removed.', { title: 'Deleted' });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    setConfirmOpen(false);
  };

  return (
    <div
      onClick={() => navigate(`/notes/${note.id}`)}
      className="relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--bg-surface)]"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${fileStyle.bg}`}>
        <FileText size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--text-primary)]">{note.title}</p>
      </div>
      <span className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline-block ${status.className}`}>
        {status.label}
      </span>
      <span className="hidden w-24 truncate text-xs text-[var(--text-secondary)] md:inline-block">
        {isOwner ? 'You' : note.uploader_name}
      </span>
      <button onClick={(e) => e.stopPropagation()} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <Share2 size={15} />
      </button>

      {isOwner && (
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((m) => !m); }}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <div className="card-surface absolute right-0 top-6 z-20 w-32 rounded-lg p-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setConfirmOpen(true); }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-rejected-500 hover:bg-rejected-500/10"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this note?"
        message={`"${note.title}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
