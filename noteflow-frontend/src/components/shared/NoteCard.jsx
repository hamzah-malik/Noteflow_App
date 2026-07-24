import { motion, AnimatePresence } from 'framer-motion';
import { Download, Eye, Lock, Clock, FileText } from 'lucide-react';
import AccessGrantedAnimation from './AccessGrantedAnimation';

const FILE_TYPE_LABEL = { pdf: 'PDF', docx: 'DOCX', doc: 'DOC' };

export default function NoteCard({ note, accessState = 'unlocked', justUnlocked = false, onRequestAccess, onDownload, onOpen }) {
  // accessState: 'unlocked' | 'locked' | 'pending'
  // justUnlocked: true for one render cycle right after a pending request
  // was approved - see NotesPage's transition detection - plays the big
  // sequence here instead of just swapping the badge silently.
  return (
    <div
      onClick={() => onOpen?.(note)}
      className="card-surface group relative cursor-pointer rounded-[var(--radius-card)] p-4 transition-shadow hover:shadow-[0_4px_24px_rgba(76,107,58,0.12)]"
    >
      {justUnlocked ? (
        <AccessGrantedAnimation label="You now have access" />
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-secondary)]">
              <FileText size={13} />
              {FILE_TYPE_LABEL[note.file_type] || note.file_type?.toUpperCase()}
            </div>
            <StateBadge state={accessState} />
          </div>

          <h3 className="mt-2 font-medium leading-snug text-[var(--text-primary)] line-clamp-2">
            {note.title}
          </h3>

          {note.description && (
            <p className="mt-1.5 text-sm text-[var(--text-secondary)] line-clamp-2">{note.description}</p>
          )}

          {note.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {note.tags.slice(0, 3).map((tag) => (
                <span key={tag.id} className="rounded-[var(--radius-badge)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
            <div className="flex items-center gap-3 font-mono text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1"><Eye size={13} /> {note.views_count}</span>
              <span className="flex items-center gap-1"><Download size={13} /> {note.downloads_count}</span>
            </div>

            {accessState === 'locked' && (
              <button
                onClick={(e) => { e.stopPropagation(); onRequestAccess?.(note); }}
                className="btn-primary rounded-[var(--radius-badge)] px-3 py-1.5 text-xs font-medium"
              >
                Request Access
              </button>
            )}
            {accessState === 'pending' && (
              <span className="rounded-[var(--radius-badge)] bg-pending-500/10 px-3 py-1.5 text-xs font-medium text-pending-500">
                Pending
              </span>
            )}
            {accessState === 'unlocked' && (
              <button
                onClick={(e) => { e.stopPropagation(); onDownload?.(note); }}
                className="flex items-center gap-1.5 rounded-[var(--radius-badge)] border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                <Download size={13} /> Download
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StateBadge({ state }) {
  return (
    <AnimatePresence mode="wait">
      {state === 'locked' && (
        <motion.div key="locked" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
          <Lock size={14} className="text-[var(--text-secondary)]" />
        </motion.div>
      )}
      {state === 'pending' && (
        <motion.div key="pending" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
          <Clock size={14} className="text-pending-500" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
