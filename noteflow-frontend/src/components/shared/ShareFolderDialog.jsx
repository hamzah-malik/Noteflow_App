import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Globe, Users, Lock } from 'lucide-react';
import { shareFolder } from '@/api/folders';
import { useToast } from './ToastProvider';

const OPTIONS = [
  { value: 'public', label: 'Public', body: 'Anyone can see and download every note in this folder.', icon: Globe },
  { value: 'friends', label: 'Friends Only', body: 'Only your accepted friends can discover these notes - they\'ll still need to request access to download.', icon: Users },
  { value: 'private', label: 'Private', body: 'Nobody but you can see these notes exist.', icon: Lock },
];

// Bulk-sets visibility for every note in the folder at once - the
// "share the whole folder" feature, instead of editing each note one by one.
export default function ShareFolderDialog({ folder, open, onClose }) {
  const [selected, setSelected] = useState('friends');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const handleShare = async () => {
    setSaving(true);
    try {
      const { data } = await shareFolder(folder.id, selected);
      showToast(data.detail, { title: 'Folder updated' });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    } finally {
      setSaving(false);
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
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-lg text-[var(--text-primary)]">Share "{folder.name}"</h2>
              <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={18} /></button>
            </div>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              This sets visibility for every note in this folder ({folder.notes_count} notes) at once.
            </p>

            <div className="mt-4 space-y-2">
              {OPTIONS.map(({ value, label, body, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSelected(value)}
                  className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    selected === value ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10' : 'border-[var(--border)]'
                  }`}
                >
                  <Icon size={16} className={selected === value ? 'text-accent-500 mt-0.5' : 'text-[var(--text-secondary)] mt-0.5'} />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{body}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleShare}
              disabled={saving}
              className="btn-primary mt-5 w-full rounded-full py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Apply to folder'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
