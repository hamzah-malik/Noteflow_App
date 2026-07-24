import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Lock } from 'lucide-react';

export default function RequestAccessDialog({ note, open, onClose, onSubmit }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    setSending(true);
    try {
      await onSubmit(message);
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg)] p-6"
            initial={{ scale: 0.92, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-50 text-accent-500">
                <Lock size={18} />
              </div>
              <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={18} />
              </button>
            </div>

            <h2 className="mt-4 font-medium text-lg text-[var(--text-primary)]">Request access</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{note?.title}</p>

            <label className="mt-4 block text-sm font-medium text-[var(--text-primary)]">
              Why do you need access?
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="I'm preparing for tomorrow's exam."
              rows={3}
              className="mt-1.5 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-accent-500"
            />

            <button
              onClick={handleSubmit}
              disabled={sending}
              className="mt-4 w-full rounded-full bg-accent-500 py-2.5 text-sm font-medium text-white hover:bg-accent-600 transition-colors disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send request'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
