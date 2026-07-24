import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listAccessRequests, approveAccessRequest, rejectAccessRequest } from '@/api/accessRequests';
import { useToast } from '@/components/shared/ToastProvider';
import AccessGrantedAnimation from '@/components/shared/AccessGrantedAnimation';
import { useState } from 'react';

// Dedicated page for requests on notes I own - the mockup's own nav item,
// distinct from the general Notifications feed. Shows every request
// (pending/approved/rejected), not just pending, so it doubles as a log.
export default function AccessRequestsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [justResolved, setJustResolved] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['access-requests', 'received'],
    queryFn: () => listAccessRequests('received').then((r) => r.data.results ?? r.data),
  });

  const handleApprove = async (ar) => {
    await approveAccessRequest(ar.id);
    setJustResolved((s) => ({ ...s, [ar.id]: true }));
    showToast(`${ar.requester_detail?.full_name || 'They'} can now access your note.`, { title: 'Access approved!' });
    queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const handleReject = async (ar) => {
    await rejectAccessRequest(ar.id);
    queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const pending = data?.filter((ar) => ar.status === 'pending') || [];
  const resolved = data?.filter((ar) => ar.status !== 'pending') || [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">Access Requests</h1>

      {isLoading ? (
        <p className="mt-6 text-sm text-[var(--text-secondary)]">Loading...</p>
      ) : (
        <>
          <section className="mt-6">
            <h2 className="text-sm font-medium text-[var(--text-secondary)]">Pending ({pending.length})</h2>
            <div className="mt-3 space-y-2">
              {pending.length === 0 && <p className="text-sm text-[var(--text-secondary)]">Nothing pending.</p>}
              {pending.map((ar) => (
                <div key={ar.id} className="card-surface rounded-[var(--radius-card)] p-4">
                  {justResolved[ar.id] ? (
                    <AccessGrantedAnimation label={`Access granted to ${ar.requester_detail?.full_name || 'requester'}`} />
                  ) : (
                    <>
                      <p className="text-sm text-[var(--text-primary)]">
                        <span className="font-medium">{ar.requester_detail?.full_name}</span> requested access to{' '}
                        <span className="font-medium">{ar.note_title}</span>
                      </p>
                      {ar.message && <p className="mt-1 text-xs italic text-[var(--text-secondary)]">"{ar.message}"</p>}
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => handleApprove(ar)} className="btn-primary rounded-full px-4 py-1.5 text-xs font-medium">Approve</button>
                        <button onClick={() => handleReject(ar)} className="btn-secondary rounded-full px-4 py-1.5 text-xs font-medium">Reject</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          {resolved.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-medium text-[var(--text-secondary)]">History</h2>
              <div className="mt-3 space-y-2">
                {resolved.map((ar) => (
                  <div key={ar.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm">
                    <span className="text-[var(--text-secondary)]">
                      <span className="font-medium text-[var(--text-primary)]">{ar.requester_detail?.full_name}</span> — {ar.note_title}
                    </span>
                    <span className={ar.status === 'approved' ? 'text-approved-500' : 'text-rejected-500'}>{ar.status}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
