import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg)] p-6"
            initial={{ scale: 0.92, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${danger ? 'bg-rejected-500/10 text-rejected-500' : 'bg-accent-50 text-accent-500'}`}>
              <AlertTriangle size={18} />
            </div>
            <h2 className="mt-4 font-medium text-lg text-[var(--text-primary)]">{title}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{message}</p>

            <div className="mt-6 flex gap-2">
              <button onClick={onCancel} className="btn-secondary flex-1 rounded-full py-2.5 text-sm font-medium">Cancel</button>
              <button
                onClick={onConfirm}
                className={`flex-1 rounded-full py-2.5 text-sm font-medium text-white transition-colors ${danger ? 'bg-rejected-500 hover:opacity-90' : 'btn-primary'}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
