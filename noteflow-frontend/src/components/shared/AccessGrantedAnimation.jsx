import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  angle: (i / 10) * 360,
  distance: 38 + (i % 3) * 10,
  delay: i * 0.02,
}));

// The standalone lock -> burst -> checkmark sequence from the mockup -
// bigger and more deliberate than an inline badge swap. Used identically on
// the owner's side (right after Approve) and the requester's side (when
// their pending note flips to accessible) so the metaphor stays consistent
// on both ends of the interaction, per the design plan.
export default function AccessGrantedAnimation({ label = 'Access Granted!' }) {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="relative flex h-16 w-16 items-center justify-center">
        {/* Lock, rotates open and fades */}
        <motion.div
          initial={{ opacity: 1, rotate: 0, scale: 1 }}
          animate={{ opacity: 0, rotate: -25, scale: 0.7 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="absolute flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-surface)]"
        >
          <Lock size={26} className="text-[var(--text-secondary)]" />
        </motion.div>

        {/* Particle burst */}
        {PARTICLES.map((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          return (
            <motion.div
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-approved-500"
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: Math.cos(rad) * p.distance,
                y: Math.sin(rad) * p.distance,
              }}
              transition={{ duration: 0.6, delay: 0.35 + p.delay, ease: 'easeOut' }}
            />
          );
        })}

        {/* Checkmark circle, springs in */}
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', damping: 11, stiffness: 260 }}
          className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-approved-500"
        >
          <Check size={28} className="text-white" strokeWidth={3} />
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="text-sm font-medium text-approved-500"
      >
        {label}
      </motion.p>
    </div>
  );
}
