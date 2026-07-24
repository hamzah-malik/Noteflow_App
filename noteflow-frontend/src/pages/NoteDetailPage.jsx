import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ZoomIn, ZoomOut, Maximize, Download, ArrowLeft, Lock, Clock, Trash2 } from 'lucide-react';
import { getNote, getPreviewUrl, getDownloadUrl, deleteNote } from '@/api/notes';
import { createAccessRequest } from '@/api/accessRequests';
import { useAuthStore } from '@/store/authStore';
import RequestAccessDialog from '@/components/shared/RequestAccessDialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/ToastProvider';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const [scale, setScale] = useState(1.1);
  const [numPages, setNumPages] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const containerRef = useRef(null);

  const { data: note, isLoading, refetch } = useQuery({
    queryKey: ['note', id],
    queryFn: () => getNote(id).then((r) => r.data),
  });

  useEffect(() => {
    if (note?.can_access && note.file_type === 'pdf' && !previewUrl && !loadingPreview) {
      loadPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.can_access, note?.file_type]);

  const loadPreview = async () => {
    setLoadingPreview(true);
    try {
      const { data } = await getPreviewUrl(id);
      setPreviewUrl(data.url);
    } catch {
      // 403 here means access was revoked/never granted - the locked state
      // below is the source of truth, so we just leave previewUrl null.
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownload = async () => {
    const { data } = await getDownloadUrl(id);
    window.open(data.url, '_blank');
  };

  const handleRequestAccess = async (message) => {
    await createAccessRequest(id, message);
    showToast('The owner will be notified.', { title: 'Access requested' });
    setDialogOpen(false);
    refetch();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteNote(id);
      showToast('The note has been removed.', { title: 'Deleted' });
      navigate('/notes');
    } catch {
      showToast('Could not delete this note.', { type: 'error', title: 'Error' });
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-6 py-10 text-sm text-[var(--text-secondary)]">Loading...</div>;
  }

  const locked = !note.can_access;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-xl font-bold text-[var(--text-primary)]">{note.title}</h1>
          <p className="text-sm text-[var(--text-secondary)]">by {note.uploader_name}</p>
        </div>

        <div className="flex items-center gap-2">
          {!locked && (
            <>
              <button onClick={() => setScale((s) => Math.max(0.6, s - 0.15))} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><ZoomOut size={15} /></button>
              <button onClick={() => setScale((s) => Math.min(2.5, s + 0.15))} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><ZoomIn size={15} /></button>
              <button onClick={toggleFullscreen} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><Maximize size={15} /></button>
              <button onClick={handleDownload} className="btn-primary flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium">
                <Download size={14} /> Download
              </button>
            </>
          )}
          {note.uploader === user?.id && (
            <button
              onClick={() => setDeleteDialogOpen(true)}
              aria-label="Delete note"
              className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:border-rejected-500 hover:text-rejected-500 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      <div ref={containerRef} className="mt-6 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
        {locked ? (
          <LockedState
            pending={note.has_pending_request}
            fileType={note.file_type}
            onRequestAccess={() => setDialogOpen(true)}
          />
        ) : previewUrl ? (
          <div className="flex justify-center overflow-auto">
            <Document file={previewUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
              {Array.from({ length: numPages || 0 }, (_, i) => (
                <Page key={i} pageNumber={i + 1} scale={scale} className="mb-4 shadow-sm" />
              ))}
            </Document>
          </div>
        ) : note.file_type === 'pdf' ? (
          <div className="flex flex-col items-center justify-center py-16">
            {loadingPreview ? (
              <p className="text-sm text-[var(--text-secondary)]">Loading preview...</p>
            ) : (
              <>
                <p className="text-sm text-[var(--text-secondary)]">Couldn't load the preview.</p>
                <button
                  onClick={loadPreview}
                  className="mt-3 rounded-full bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 transition-colors"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Word documents don't preview in-browser yet - download to view.
            </p>
          </div>
        )}
      </div>

      <RequestAccessDialog
        note={note}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleRequestAccess}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete this note?"
        message={`"${note.title}" will be permanently removed. This can't be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}

function LockedState({ pending, onRequestAccess }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg)]">
        {pending ? <Clock size={26} className="text-pending-500" /> : <Lock size={26} className="text-[var(--text-secondary)]" />}
      </div>
      <p className="mt-4 font-medium text-[var(--text-primary)]">
        {pending ? 'Access request pending' : 'This note is private'}
      </p>
      <p className="mt-1 max-w-xs text-sm text-[var(--text-secondary)]">
        {pending
          ? "The owner hasn't responded to your request yet."
          : 'Request access from the owner to view or download this note.'}
      </p>
      {!pending && (
        <button
          onClick={onRequestAccess}
          className="mt-5 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600 transition-colors"
        >
          Request Access
        </button>
      )}
    </div>
  );
}
