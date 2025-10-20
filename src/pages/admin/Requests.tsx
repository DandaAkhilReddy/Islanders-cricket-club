import { useEffect, useState } from 'react';
import { Loader2, Check, XCircle, Clock } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchAllPlayerUpdateRequests,
  updatePlayerRequestStatus,
  type PlayerUpdateRequestDoc,
} from '../../services/requestService';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

function toDate(value?: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in (value as Record<string, unknown>)) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTimestamp(value?: unknown) {
  const date = toDate(value);
  return date ? date.toLocaleString() : '--';
}

const statusStyles: Record<PlayerUpdateRequestDoc['status'], string> = {
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border border-red-200',
};

export default function AdminRequests() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<PlayerUpdateRequestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await fetchAllPlayerUpdateRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load player update requests', error);
      toast.error('Unable to load player update requests');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(request: PlayerUpdateRequestDoc) {
    if (!currentUser) return;
    setProcessingId(request.id);
    try {
      if (!request.playerId) {
        throw new Error('Missing player reference');
      }

      const playerRef = doc(db, 'players', request.playerId);
      const updatePayload: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };

      Object.entries(request.changes?.profile ?? {}).forEach(([field, value]) => {
        updatePayload[field] = value ?? null;
      });

      Object.entries(request.changes?.equipment ?? {}).forEach(([field, value]) => {
        updatePayload[`equipment.${field}`] = value;
      });

      await updateDoc(playerRef, updatePayload);

      await updatePlayerRequestStatus(
        request.id,
        'approved',
        {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName,
        }
      );

      toast.success('Player profile updated and request approved');
      await loadData();
    } catch (error) {
      console.error('Failed to approve request', error);
      toast.error('Unable to approve the request');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(request: PlayerUpdateRequestDoc) {
    if (!currentUser) return;
    const reason = window.prompt('Add a note for the player (optional):', request.reviewNotes ?? '');
    if (reason === null) {
      return;
    }

    setProcessingId(request.id);
    try {
      await updatePlayerRequestStatus(
        request.id,
        'rejected',
        {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName,
        },
        reason?.trim() || undefined
      );

      toast.success('Request marked as rejected');
      await loadData();
    } catch (error) {
      console.error('Failed to reject request', error);
      toast.error('Unable to reject the request');
    } finally {
      setProcessingId(null);
    }
  }

  const pendingRequests = requests.filter((request) => request.status === 'pending');
  const processedRequests = requests.filter((request) => request.status !== 'pending');

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Player Update Requests</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and approve player-submitted profile, equipment, and scouting updates. Approved changes are synced to the player dashboard automatically.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-soft-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Pending approval ({pendingRequests.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading requests...
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-6 text-sm text-gray-500">
              No pending player submissions.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.playerName}</h3>
                      <p className="text-sm text-gray-500">
                        {request.playerEmail} - Submitted {formatTimestamp(request.createdAt)}
                      </p>
                      {request.notes && (
                        <p className="text-sm text-gray-700 mt-2">"{request.notes}"</p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReject(request)}
                        disabled={processingId === request.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(request)}
                        disabled={processingId === request.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {processingId === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Approve & apply
                      </button>
                    </div>
                  </div>

                  {request.screenshots && request.screenshots.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700">Attached screenshots</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {request.screenshots.map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt="Opponent scouting upload"
                            className="h-28 w-full object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {request.changes?.profile && Object.keys(request.changes.profile).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700">Profile fields</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        {Object.entries(request.changes.profile).map(([field, value]) => (
                          <div key={field}>
                            <span className="font-semibold text-gray-800 capitalize">{field.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                              <span>{String(value ?? '--')}</span>
                              {request.changes.previousProfile && request.changes.previousProfile[field] !== undefined && (
                              <span className="ml-2 text-gray-400">(was {String(request.changes.previousProfile[field] ?? '--')})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {request.changes?.equipment && Object.keys(request.changes.equipment).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700">Equipment status</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        {Object.entries(request.changes.equipment).map(([field, value]) => (
                          <div key={field}>
                            <span className="font-semibold text-gray-800 capitalize">{field.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                            <span>{value ? 'Has item' : 'Needs item'}</span>
                            {request.changes.previousEquipment && request.changes.previousEquipment[field] !== undefined && (
                              <span className="ml-2 text-gray-400">(was {request.changes.previousEquipment[field] ? 'Has item' : 'Needs item'})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Recently processed</h2>
          {requestsLoading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading history...
            </div>
          ) : processedRequests.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-6 text-sm text-gray-500">
              No processed requests yet.
            </div>
          ) : (
            <div className="space-y-3">
              {processedRequests.slice(0, 10).map((request) => (
                <div key={request.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{request.playerName}</p>
                    <p className="text-xs text-gray-500">
                      {request.status.toUpperCase()} - {formatTimestamp(request.reviewedAt)}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[request.status] ?? 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                    {request.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
