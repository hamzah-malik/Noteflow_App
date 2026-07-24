import { Link } from 'react-router-dom';
import { Eye, Users, Lock, Globe } from 'lucide-react';

// Per the redesign doc: the promotional card is gone, replaced with
// functional widgets - visibility breakdown, pending requests, and recent
// activity. "Friends Online" (presence) is intentionally not included -
// it needs real-time infrastructure we don't have yet, not a UI decision.
export default function InsightsPanel({ stats, pendingRequests, notifications, onApprove, onReject }) {
  return (
    <aside className="w-full shrink-0 space-y-6 lg:w-80">
      <div className="card-surface rounded-[var(--radius-card)] p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
            <Eye size={14} /> Who Can See My Notes
          </h3>
          <Link to="/notes" className="text-xs text-accent-500 hover:underline">Manage</Link>
        </div>
        <div className="mt-3 space-y-1.5 text-sm text-[var(--text-secondary)]">
          <p className="flex items-center justify-between"><span className="flex items-center gap-1.5"><Globe size={13} /> Public</span> <span className="font-mono">{stats?.public_count ?? 0}</span></p>
          <p className="flex items-center justify-between"><span className="flex items-center gap-1.5"><Users size={13} /> Friends Only</span> <span className="font-mono">{stats?.friends_only_count ?? 0}</span></p>
          <p className="flex items-center justify-between"><span className="flex items-center gap-1.5"><Lock size={13} /> Private</span> <span className="font-mono">{stats?.private_notes_count ?? 0}</span></p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">Pending Requests</h3>
          <Link to="/access-requests" className="text-xs text-accent-500 hover:underline">View all</Link>
        </div>
        <div className="mt-3 space-y-2">
          {pendingRequests?.length > 0 ? pendingRequests.slice(0, 3).map((ar) => (
            <div key={ar.id} className="card-surface rounded-[var(--radius-card)] p-3">
              <p className="text-sm text-[var(--text-primary)]">
                <span className="font-medium">{ar.requester_detail?.full_name}</span> requested{' '}
                <span className="font-medium">{ar.note_title}</span>
              </p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => onReject(ar)} className="btn-secondary flex-1 rounded-full py-1.5 text-xs font-medium">Reject</button>
                <button onClick={() => onApprove(ar)} className="btn-primary flex-1 rounded-full py-1.5 text-xs font-medium">Approve</button>
              </div>
            </div>
          )) : (
            <p className="text-sm text-[var(--text-secondary)]">Nothing pending.</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">Recent Activity</h3>
          <Link to="/notifications" className="text-xs text-accent-500 hover:underline">View all</Link>
        </div>
        <div className="mt-3 space-y-2">
          {notifications?.length > 0 ? notifications.slice(0, 5).map((n) => (
            <div key={n.id} className="flex items-start gap-2.5 text-sm">
              <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-xs">
                {n.verb.includes('approved') || n.verb.includes('accepted') ? '🎉' : n.verb.includes('requested') ? '🔒' : '👋'}
              </div>
              <p className="text-[var(--text-secondary)]">
                <span className="font-medium text-[var(--text-primary)]">{n.actor_detail?.full_name}</span>{' '}
                {n.verb === 'friend_request' && 'sent you a friend request'}
                {n.verb === 'friend_accepted' && 'accepted your friend request'}
                {n.verb === 'access_requested' && <>requested access to {n.target_label}</>}
                {n.verb === 'access_approved' && <>approved your request for {n.target_label}</>}
                {n.verb === 'access_rejected' && <>declined your request for {n.target_label}</>}
              </p>
            </div>
          )) : (
            <p className="text-sm text-[var(--text-secondary)]">No activity yet.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
