import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Unlock, Users, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-[var(--bg)]">
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-28 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="font-[var(--font-display)] text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)]"
        >
          Share notes.<br />Securely. Beautifully.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-lg text-[var(--text-secondary)]"
        >
          No more messy WhatsApp groups. Upload your notes, control exactly who sees them, and approve access with one tap.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex justify-center gap-3"
        >
          <Link to="/register" className="rounded-full bg-accent-500 px-6 py-3 text-sm font-medium text-white hover:bg-accent-600 transition-colors">
            Get started free
          </Link>
          <a href="#how-it-works" className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">
            See how it works
          </a>
        </motion.div>

        {/* Lock -> unlock hero, echoing the product's core interaction */}
        <div className="mx-auto mt-20 flex max-w-md items-center justify-center gap-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.4 }}
            className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)]"
          >
            <motion.div
              animate={{ rotate: [0, 0, -18, 0] }}
              transition={{ duration: 2, delay: 1.6, times: [0, 0.6, 0.8, 1] }}
            >
              <Lock size={28} className="text-[var(--text-secondary)]" />
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.8 }} className="text-[var(--text-secondary)]">
            →
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 0.4 }}
            className="flex h-24 w-24 items-center justify-center rounded-3xl bg-accent-500"
          >
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2.2, type: 'spring', damping: 10 }}>
              <Unlock size={28} className="text-white" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Lock, title: 'You control access', body: 'Public or Private, per note. Private notes require your approval before anyone can open them.' },
              { icon: Zap, title: 'Approve with one tap', body: 'A request comes in with a short message. Approve or reject - instantly, with a satisfying confirmation.' },
              { icon: Users, title: 'Built for your circle', body: 'See what your friends are sharing, right on your dashboard.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <Icon size={20} className="text-accent-500" />
                <h3 className="mt-3 font-medium text-[var(--text-primary)]">{title}</h3>
                <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-[var(--font-display)] text-3xl font-bold text-[var(--text-primary)]">How it works</h2>
        <div className="mt-12 grid gap-8 text-left md:grid-cols-3">
          {[
            { step: 'Upload a note', body: 'PDF or Word. Add a title, description, and tags in seconds.' },
            { step: 'Set who can see it', body: 'Public for everyone, or Private - nobody gets in without your say-so.' },
            { step: 'Approve requests', body: 'Someone wants in, they tell you why, you decide. That simple.' },
          ].map(({ step, body }, i) => (
            <div key={step}>
              <span className="font-mono text-xs text-accent-500">0{i + 1}</span>
              <h3 className="mt-2 font-medium text-[var(--text-primary)]">{step}</h3>
              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)] py-20 text-center">
        <h2 className="font-[var(--font-display)] text-3xl font-bold text-[var(--text-primary)]">
          Your notes, on your terms.
        </h2>
        <Link to="/register" className="mt-6 inline-block rounded-full bg-accent-500 px-6 py-3 text-sm font-medium text-white hover:bg-accent-600 transition-colors">
          Create your account
        </Link>
      </section>

      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text-secondary)]">
        NoteFlow
      </footer>
    </div>
  );
}
