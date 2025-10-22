import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calendar, Save, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Match, MatchType, MatchStatus } from '../../types';
import toast from 'react-hot-toast';

interface MatchFormData {
  date: string;
  time: string;
  opponent: string;
  location: string;
  type: MatchType;
  status: MatchStatus;
}

export default function MatchForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MatchFormData>({
    defaultValues: {
      status: 'scheduled',
      type: 'Friendly',
      time: '10:00',
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchMatch(id);
    }
  }, [id, isEditMode]);

  async function fetchMatch(matchId: string) {
    try {
      setLoading(true);
      const matchDoc = await getDoc(doc(db, 'matches', matchId));

      if (matchDoc.exists()) {
        const matchData = matchDoc.data() as Match;

        // Convert date to string format for input
        const dateObj = matchData.date instanceof Date ? matchData.date : (matchData.date as any).toDate();
        const dateString = dateObj.toISOString().split('T')[0];

        reset({
          date: dateString,
          time: matchData.time,
          opponent: matchData.opponent,
          location: matchData.location,
          type: matchData.type,
          status: matchData.status,
        });
      } else {
        toast.error('Match not found');
        navigate('/admin/matches');
      }
    } catch (error) {
      console.error('Error fetching match:', error);
      toast.error('Failed to load match data');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: MatchFormData) {
    try {
      setLoading(true);

      const matchData: Omit<Match, 'id'> = {
        date: new Date(data.date),
        time: data.time,
        opponent: data.opponent,
        location: data.location,
        type: data.type,
        status: data.status,
        scorecard: [],
        budgetSpent: 0,
        expenses: [],
      };

      if (isEditMode && id) {
        await setDoc(doc(db, 'matches', id), matchData);
        toast.success(`Match against ${data.opponent} updated successfully!`);
      } else {
        await addDoc(collection(db, 'matches'), matchData);
        toast.success(`Match against ${data.opponent} scheduled successfully!`);
      }

      navigate('/admin/matches');
    } catch (error) {
      console.error('Error saving match:', error);
      toast.error('Failed to save match');
    } finally {
      setLoading(false);
    }
  }

  if (loading && isEditMode) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-soft-blue-200 border-t-soft-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading match...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Match' : 'Add New Match'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode ? 'Update match details' : 'Schedule a new match'}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/matches')}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-6">
            <div className="space-y-6">
              {/* Match Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Match Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('date', { required: 'Date is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-transparent"
                    />
                    {errors.date && (
                      <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register('time', { required: 'Time is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-transparent"
                    />
                    {errors.time && (
                      <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opponent <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('opponent', { required: 'Opponent is required' })}
                      placeholder="e.g., Warriors CC"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-transparent"
                    />
                    {errors.opponent && (
                      <p className="text-red-500 text-xs mt-1">{errors.opponent.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('location', { required: 'Location is required' })}
                      placeholder="e.g., Memorial Park"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-transparent"
                    />
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Match Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('type', { required: 'Match type is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-transparent"
                    >
                      <option value="Friendly">Friendly</option>
                      <option value="League">League</option>
                      <option value="Tournament">Tournament</option>
                      <option value="Practice Match">Practice Match</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('status', { required: 'Status is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-transparent"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/matches')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update Match' : 'Create Match'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
