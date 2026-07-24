import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Smartphone, FileText, Send, CheckCircle2 } from 'lucide-react';

// 5-step labeled AirDrop-style sequence: Devices connect -> Note prepares to
// send -> Sending securely -> Arriving safely -> Connection successful.
// Restyled with our own tokens (signal-blue + approved-green, soft surfaces,
// card-surface depth) rather than a flat single-blue illustration, so it
// reads as part of this product rather than a generic stock animation.
const STEPS = [
  { label: 'Devices connect' },
  { label: 'Note prepares to send' },
  { label: 'Sending securely' },
  { label: 'Arriving safely' },
  { label: 'Connection successful' },
];

const STEP_DURATION = 620;

export default function TransferAnimation({ onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length - 1) {
      const doneTimer = setTimeout(() => onComplete?.(), 700);
      return () => clearTimeout(doneTimer);
    }
    const timer = setTimeout(() => setStep((s) => s + 1), STEP_DURATION);
    return () => clearTimeout(timer);
  }, [step, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative flex w-72 items-center justify-between">
        <DeviceIcon pulse={step >= 0} />

        <div className="relative flex-1 h-16 flex items-center justify-center overflow-visible">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <ConnectRipples key="connect" />
            )}
            {(step === 1 || step === 2 || step === 3) && (
              <TravelingNote key="travel" mode={step === 1 ? 'prepare' : 'send'} />
            )}
            {step === 4 && (
              <motion.div
                key="check"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 11, stiffness: 260 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-approved-500"
              >
                <CheckCircle2 size={18} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DeviceIcon pulse={step >= 3} filled={step === 4} />
      </div>

      <div className="mt-10 h-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-sm font-medium text-[var(--text-secondary)]"
          >
            {STEPS[step].label}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex gap-1.5">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === step ? 'w-5 bg-accent-500' : i < step ? 'w-1.5 bg-accent-500/40' : 'w-1.5 bg-[var(--border)]'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

function DeviceIcon({ pulse, filled }) {
  return (
    <motion.div
      animate={pulse ? { boxShadow: ['0 0 0 rgba(76,107,58,0)', '0 0 24px rgba(76,107,58,0.28)', '0 0 0 rgba(76,107,58,0)'] } : {}}
      transition={{ duration: 1.1, repeat: pulse ? Infinity : 0, ease: 'easeInOut' }}
      className="card-surface flex h-16 w-16 items-center justify-center rounded-2xl"
    >
      <Smartphone size={22} className={filled ? 'text-approved-500' : 'text-accent-500'} />
    </motion.div>
  );
}

function ConnectRipples() {
  return (
    <div className="relative flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={{ scale: 0.3, opacity: 0.5 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.35, ease: 'easeOut' }}
          className="absolute h-3 w-3 rounded-full border border-accent-500"
        />
      ))}
      <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
    </div>
  );
}

function TravelingNote({ mode }) {
  return (
    <>
      <motion.div
        initial={{ x: -60, opacity: 0, scale: 0.7 }}
        animate={{ x: [-60, -10, 90], opacity: [0, 1, 1], scale: [0.7, 1, 1] }}
        transition={{ duration: 1.7, ease: 'easeInOut' }}
        className="absolute flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500 text-white shadow-[0_4px_14px_rgba(76,107,58,0.35)]"
      >
        {mode === 'prepare' ? <FileText size={16} /> : <Send size={14} />}
      </motion.div>

      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ x: [-40, 20 + i * 25, 110], y: [0, -8 - i * 3, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: 1.5, delay: 0.1 + i * 0.08, ease: 'easeInOut' }}
          className="absolute h-1 w-1 rounded-full bg-accent-500"
        />
      ))}
    </>
  );
}
