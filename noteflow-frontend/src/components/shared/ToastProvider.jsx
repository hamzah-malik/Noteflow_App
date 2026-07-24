import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const DURATION_MS = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, { type = 'success', title } = {}) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type, title }]);
    setTimeout(() => dismiss(id), DURATION_MS);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }) {
  const Icon = toast.type === 'error' ? XCircle : CheckCircle2;
  const iconColor = toast.type === 'error' ? 'text-rejected-500' : 'text-approved-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40 }}
      className="relative w-80 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg)] p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <Icon size={20} className={iconColor} />
        <div className="flex-1 min-w-0">
          {toast.title && <p className="text-sm font-medium text-[var(--text-primary)]">{toast.title}</p>}
          <p className="text-sm text-[var(--text-secondary)]">{toast.message}</p>
        </div>
        <button onClick={onDismiss} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <X size={15} />
        </button>
      </div>
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: DURATION_MS / 1000, ease: 'linear' }}
        style={{ transformOrigin: 'left' }}
        className={`absolute bottom-0 left-0 h-0.5 w-full ${toast.type === 'error' ? 'bg-rejected-500' : 'bg-approved-500'}`}
      />
    </motion.div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
