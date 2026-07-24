import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';
import { FOLDER_ICONS, FOLDER_COLORS } from '@/lib/folderStyles';

const ICON_OPTIONS = Object.keys(FOLDER_ICONS);
const COLOR_OPTIONS = Object.keys(FOLDER_COLORS);

export default function CreateFolderDialog({ open, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('folder');
  const [color, setColor] = useState('blue');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), icon, color });
      setName('');
      setIcon('folder');
      setColor('blue');
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
              <h2 className="font-medium text-lg text-[var(--text-primary)]">New folder</h2>
              <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={18} /></button>
            </div>

            <label className="mt-4 block text-sm font-medium text-[var(--text-primary)]">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Data Structures"
              className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-accent-500"
            />

            <label className="mt-4 block text-sm font-medium text-[var(--text-primary)]">Icon</label>
            <div className="mt-1.5 flex gap-2">
              {ICON_OPTIONS.map((key) => {
                const Icon = FOLDER_ICONS[key];
                return (
                  <button
                    key={key}
                    onClick={() => setIcon(key)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                      icon === key ? 'border-accent-500 bg-accent-50 text-accent-500' : 'border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>

            <label className="mt-4 block text-sm font-medium text-[var(--text-primary)]">Color</label>
            <div className="mt-1.5 flex gap-2">
              {COLOR_OPTIONS.map((key) => (
                <button
                  key={key}
                  onClick={() => setColor(key)}
                  className={`h-8 w-8 rounded-full ${FOLDER_COLORS[key].bg} ${FOLDER_COLORS[key].text} flex items-center justify-center border-2 ${
                    color === key ? 'border-current' : 'border-transparent'
                  }`}
                >
                  <span className="h-3 w-3 rounded-full bg-current" />
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving || !name.trim()}
              className="btn-primary mt-6 w-full rounded-full py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create folder'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
