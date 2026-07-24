import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Check, X, Lock, UserPlus, PartyPopper, CheckCircle2 } from 'lucide-react';
import AccessGrantedAnimation from './AccessGrantedAnimation';

const VERB_ICON = {
  friend_request: UserPlus,
  friend_accepted: PartyPopper,
  access_requested: Lock,
  access_approved: PartyPopper,
  access_rejected: Lock,
};

const VERB_TEXT = {
  friend_request: 'sent you a friend request',
  friend_accepted: 'accepted your friend request',
  access_requested: 'requested access to',
  access_approved: 'approved your access request for',
  access_rejected: 'declined your access request for',
};

export default function NotificationItem({ notification, onApprove, onReject }) {
  // justClicked plays the full animation once, right after this click, in
  // this session. On any other render (reload, refetch, revisit) the real
  // source of truth is notification.target_status from the backend - a
  // resolved request must never show Approve/Reject again just because
  // local state reset. See the bug this fixes: a stale "requested access"
  // notification looking actionable forever after being approved.
  const [justClicked, setJustClicked] = useState(null); // null | 'approved' | 'rejected'
  const Icon = VERB_ICON[notification.verb] || Lock;

  const isAccessRequest = notification.verb === 'access_requested';
  const resolvedStatus = justClicked || notification.target_status; // 'pending' | 'approved' | 'rejected'
  const isActionable = isAccessRequest && resolvedStatus === 'pending';
  const isApproved = isAccessRequest && resolvedStatus === 'approved';
  const isRejected = isAccessRequest && resolvedStatus === 'rejected';

  const handleApprove = async () => {
    setJustClicked('approved');
    await onApprove?.(notification);
  };
  const handleReject = async () => {
    setJustClicked('rejected');
    await onReject?.(notification);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--border)] p-3"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-surface)]">
        <Icon size={15} className="text-accent-500" />
      </div>
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {isApproved && justClicked === 'approved' ? (
            // Just now, in this session - play the full sequence.
            <motion.div key="granted-fresh" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AccessGrantedAnimation label={`Access granted to ${notification.actor_detail?.full_name || 'requester'}`} />
            </motion.div>
          ) : isApproved ? (
            // Already resolved before this page load - static, compact, no
            // replayed animation. This is the exact fix for "it should just
            // say Req granted to X" instead of showing buttons again.
            <motion.p key="granted-static" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-sm font-medium text-approved-500">
              <CheckCircle2 size={15} /> Access granted to {notification.actor_detail?.full_name || notification.actor_detail?.username}
            </motion.p>
          ) : isRejected ? (
            <motion.p key="rejected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-[var(--text-secondary)]">
              Declined {notification.actor_detail?.full_name || notification.actor_detail?.username}'s request for {notification.target_label}
            </motion.p>
          ) : (
            <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm text-[var(--text-primary)]">
                <span className="font-medium">{notification.actor_detail?.full_name || notification.actor_detail?.username}</span>{' '}
                {VERB_TEXT[notification.verb]}
                {notification.target_label && <> <span className="font-medium">{notification.target_label}</span></>}
              </p>

              {isActionable && (
                <div className="mt-2 flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApprove}
                    className="flex items-center gap-1 rounded-full bg-approved-500 px-3 py-1 text-xs font-medium text-white"
                  >
                    <Check size={12} /> Approve
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReject}
                    className="flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]"
                  >
                    <X size={12} /> Reject
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
