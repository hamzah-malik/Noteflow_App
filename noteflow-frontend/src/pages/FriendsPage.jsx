import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserMinus, Check, X } from 'lucide-react';
import { searchUsers } from '@/api/auth';
import { listFriends, listFriendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from '@/api/friends';

export default function FriendsPage() {
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: results } = useQuery({
    queryKey: ['user-search', query],
    queryFn: () => searchUsers(query).then((r) => r.data.results ?? r.data),
    enabled: query.length > 1,
  });

  const { data: friends } = useQuery({
    queryKey: ['friends'],
    queryFn: () => listFriends().then((r) => r.data.results ?? r.data),
  });

  const { data: received } = useQuery({
    queryKey: ['friend-requests', 'received'],
    queryFn: () => listFriendRequests('received').then((r) => r.data.results ?? r.data),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['friends'] });
    queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">Friends</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search students by name or username..."
        className="mt-6 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-accent-500"
      />

      {results?.length > 0 && (
        <div className="mt-2 space-y-1">
          {results.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-2.5">
              <span className="text-sm text-[var(--text-primary)]">{u.full_name} <span className="text-[var(--text-secondary)]">@{u.username}</span></span>
              <button
                onClick={async () => { await sendFriendRequest(u.id); setQuery(''); }}
                className="flex items-center gap-1 rounded-full bg-accent-500 px-3 py-1 text-xs font-medium text-white"
              >
                <UserPlus size={12} /> Add
              </button>
            </div>
          ))}
        </div>
      )}

      {received?.filter((r) => r.status === 'pending').length > 0 && (
        <section className="mt-8">
          <h2 className="font-medium text-[var(--text-primary)]">Friend requests</h2>
          <div className="mt-3 space-y-2">
            {received.filter((r) => r.status === 'pending').map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                <span className="text-sm text-[var(--text-primary)]">{r.from_user_detail?.full_name}</span>
                <div className="flex gap-2">
                  <button onClick={async () => { await acceptFriendRequest(r.id); invalidate(); }} className="rounded-full bg-approved-500 px-3 py-1.5 text-xs font-medium text-white"><Check size={12} /></button>
                  <button onClick={async () => { await rejectFriendRequest(r.id); invalidate(); }} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]"><X size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-medium text-[var(--text-primary)]">Your friends</h2>
        {friends?.length ? (
          <div className="mt-3 space-y-1">
            {friends.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-2.5">
                <span className="text-sm text-[var(--text-primary)]">{f.full_name} <span className="text-[var(--text-secondary)]">@{f.username}</span></span>
                <UserMinus size={14} className="text-[var(--text-secondary)] cursor-pointer hover:text-rejected-500" />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--text-secondary)]">No friends yet - search above to connect.</p>
        )}
      </section>
    </div>
  );
}
