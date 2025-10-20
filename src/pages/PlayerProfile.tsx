
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Target,
  Loader2,
  UploadCloud,
  Image as ImageIcon,
  ClipboardList,
  Send,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import type { PlayerProfile as PlayerProfileType } from '../types/player';
import { formatFixed } from '../utils/number';
import {
  submitPlayerUpdateRequest,
  fetchPlayerUpdateRequests,
  type PlayerUpdateRequestDoc,
} from '../services/requestService';
const equipmentSchema = z.object({
  practiceTShirt: z.boolean().default(false),
  matchTShirt: z.boolean().default(false),
  cap: z.boolean().default(false),
});

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['Batsman', 'Allrounder', 'Bowler', 'WK-Batsman']),
  battingHand: z.enum(['Right', 'Left']),
  position: z.enum([
    'Player',
    'Captain',
    'Vice Captain',
    'Associate VC',
    'Quality Director',
    'Director',
    'Principal',
  ]),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  availability: z.boolean(),
  equipment: equipmentSchema,
  requestMessage: z.string().max(500, 'Request cannot exceed 500 characters').optional(),
  batPreference: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const equipmentItems: Array<{
  key: keyof ProfileFormData['equipment'];
  label: string;
  description: string;
}> = [
  {
    key: 'practiceTShirt',
    label: 'Practice Islanders T-Shirt',
    description: 'Issued for official Islanders training sessions',
  },
  {
    key: 'matchTShirt',
    label: 'Match Islanders Jersey',
    description: 'Required on game day - match jersey allocation',
  },
  {
    key: 'cap',
    label: 'Islanders Cap',
    description: 'Match-day cap or sun hat for fielding innings',
  },
];

const statusBadgeStyles: Record<'pending' | 'approved' | 'rejected', string> = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border border-red-200',
};

function toDate(value?: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const maybeToDate = (value as { toDate?: () => Date }).toDate;
    if (typeof maybeToDate === 'function') {
      try {
        return maybeToDate();
      } catch (error) {
        console.error('Failed to convert Firestore timestamp', error);
        return null;
      }
    }
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTimestamp(value?: unknown): string {
  const date = toDate(value);
  return date ? date.toLocaleString() : '--';
}

function formatFieldName(field: string): string {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}
export default function PlayerProfile() {
  const { currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<PlayerProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requests, setRequests] = useState<PlayerUpdateRequestDoc[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [uploadedScreenshots, setUploadedScreenshots] = useState<string[]>([]);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      availability: true,
      equipment: {
        practiceTShirt: false,
        matchTShirt: false,
        cap: false,
      },
      requestMessage: '',
      batPreference: '',
    },
  });

  const loadRequests = useCallback(async () => {
    if (!currentUser) {
      setRequests([]);
      setRequestsLoading(false);
      return;
    }

    setRequestsLoading(true);
    try {
      const data = await fetchPlayerUpdateRequests(currentUser.uid);
      setRequests(data);
    } catch (error) {
      console.error('Failed to load update requests', error);
      toast.error('Unable to load your update requests right now');
    } finally {
      setRequestsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      setLoading(false);
      setRequests([]);
      setRequestsLoading(false);
      return;
    }

    let active = true;

    async function loadProfile() {
      setLoading(true);

      try {
        const profileRef = doc(db, 'players', currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        let profileData: PlayerProfileType | null = null;

        if (profileSnap.exists()) {
          profileData = profileSnap.data() as PlayerProfileType;
        } else {
          const now = new Date();
          const defaultProfile: PlayerProfileType = {
            name: currentUser.displayName || '',
            phone: currentUser.phoneNumber || '',
            email: currentUser.email || '',
            role: 'Allrounder',
            battingHand: 'Right',
            position: 'Player',
            bio: '',
            availability: true,
            equipment: {
              practiceTShirt: false,
              matchTShirt: false,
              cap: false,
            },
            stats: {
              matchesPlayed: 0,
              innings: 0,
              notOuts: 0,
              runs: 0,
              highestScore: 0,
              average: 0,
              strikeRate: 0,
              centuries: 0,
              halfCenturies: 0,
              wickets: 0,
              bowlingAverage: 0,
              economy: 0,
              bestBowling: '',
              catches: 0,
            },
            joinedDate: now,
            createdAt: now,
            updatedAt: now,
            photoURL: currentUser.photoURL || null,
          } as unknown as PlayerProfileType;

          await setDoc(profileRef, defaultProfile);
          profileData = defaultProfile;
        }

        if (active && profileData) {
          setProfile(profileData);
          reset({
            name: profileData.name || currentUser.displayName || '',
            phone: profileData.phone || '',
            role: profileData.role,
            battingHand: profileData.battingHand,
            position: profileData.position,
            bio: profileData.bio || '',
            availability: profileData.availability ?? true,
            equipment: {
              practiceTShirt: Boolean(
                (profileData.equipment as Record<string, unknown> | undefined)?.practiceTShirt ?? false
              ),
              matchTShirt: Boolean(
                (profileData.equipment as Record<string, unknown> | undefined)?.matchTShirt ?? false
              ),
              cap: Boolean(
                (profileData.equipment as Record<string, unknown> | undefined)?.cap ?? false
              ),
            },
            requestMessage: '',
            batPreference: typeof (profileData as Record<string, unknown>).batPreference === 'string'
              ? ((profileData as Record<string, unknown>).batPreference as string)
              : '',
          });
        }
      } catch (error) {
        console.error('Error loading profile', error);
        toast.error('Failed to load profile');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    loadRequests();

    return () => {
      active = false;
    };
  }, [currentUser, loadRequests, reset]);
  async function handleScreenshotUpload(event: ChangeEvent<HTMLInputElement>) {
    if (!currentUser) {
      toast.error('Please sign in to upload screenshots');
      return;
    }

    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const remainingSlots = Math.max(0, 5 - uploadedScreenshots.length);
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast.error('You can attach up to 5 screenshots per request');
      event.target.value = '';
      return;
    }

    setUploadingScreenshots(true);

    try {
      const urls = await Promise.all(
        filesToUpload.map(async (file) => {
          const fileKey = `player-update-requests/${currentUser.uid}/${Date.now()}-${file.name}`;
          const fileRef = ref(storage, fileKey);
          await uploadBytes(fileRef, file);
          return getDownloadURL(fileRef);
        })
      );

      setUploadedScreenshots((prev) => [...prev, ...urls]);
      toast.success('Screenshots uploaded');
    } catch (error) {
      console.error('Failed to upload screenshots', error);
      toast.error('Unable to upload screenshots right now');
    } finally {
      setUploadingScreenshots(false);
      event.target.value = '';
    }
  }

  function handleRemoveScreenshot(url: string) {
    setUploadedScreenshots((prev) => prev.filter((item) => item !== url));
  }

  const onSubmit = handleSubmit(async (data) => {
    if (!currentUser) {
      toast.error('Please sign in to submit a request');
      return;
    }

    setSaving(true);

    try {
      const profileChanges: Record<string, unknown> = {};
      const previousProfile: Record<string, unknown> = {};
      const equipmentChanges: Record<string, boolean> = {};
      const previousEquipment: Record<string, boolean> = {};

      const profileFields: Array<keyof ProfileFormData> = [
        'name',
        'phone',
        'role',
        'battingHand',
        'position',
        'bio',
        'availability',
        'batPreference',
      ];

      const currentProfile = (profile ?? {}) as Record<string, unknown>;

      profileFields.forEach((field) => {
        const newValue = data[field];
        const oldValue =
          field === 'availability'
            ? Boolean(currentProfile[field] ?? true)
            : currentProfile[field] ?? '';

        if (field === 'availability') {
          if (Boolean(newValue) !== Boolean(oldValue)) {
            profileChanges[field] = Boolean(newValue);
            previousProfile[field] = Boolean(oldValue);
          }
        } else if ((newValue ?? '') !== (oldValue ?? '')) {
          profileChanges[field] = newValue ?? '';
          previousProfile[field] = oldValue ?? '';
        }
      });

      const existingEquipment =
        (profile?.equipment as Record<string, unknown> | undefined) ?? {};

      (Object.keys(equipmentSchema.shape) as Array<keyof ProfileFormData['equipment']>).forEach(
        (key) => {
          const newValue = Boolean(data.equipment[key]);
          const oldValue = Boolean(existingEquipment[key] ?? false);

          if (newValue !== oldValue) {
            equipmentChanges[key] = newValue;
            previousEquipment[key] = oldValue;
          }
        }
      );

      const hasChanges =
        Object.keys(profileChanges).length > 0 || Object.keys(equipmentChanges).length > 0;
      const hasUploads = uploadedScreenshots.length > 0;
      const hasNote = Boolean(data.requestMessage?.trim());

      if (!hasChanges && !hasUploads && !hasNote) {
        toast.error('No changes detected. Update a field or add a note before submitting.');
        return;
      }

      await submitPlayerUpdateRequest({
        playerId: currentUser.uid,
        playerName: (profile?.name || data.name || currentUser.displayName || '').trim(),
        playerEmail: currentUser.email,
        requestedByUid: currentUser.uid,
        requestedByName: currentUser.displayName,
        requestedByEmail: currentUser.email,
        changes: {
          profile: profileChanges,
          previousProfile,
          equipment: equipmentChanges,
          previousEquipment,
        },
        screenshots: uploadedScreenshots,
        notes: data.requestMessage?.trim() || undefined,
      });

      toast.success('Your update request has been sent to the admin team');
      setUploadedScreenshots([]);
      reset({
        ...data,
        requestMessage: '',
      });
      await loadRequests();
    } catch (error) {
      console.error('Failed to submit update request', error);
      toast.error('Unable to submit request right now. Please try again later.');
    } finally {
      setSaving(false);
    }
  });
  if (!authLoading && !currentUser) {
    return <Navigate to="/" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  const pendingRequests = requests.filter((request) => request.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <User className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.name || currentUser?.displayName || 'Player Profile'}
                  </h1>
                  <p className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    {profile?.email || currentUser?.email || 'Email not available'}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Updated {formatTimestamp(profile?.updatedAt)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                {profile?.role || 'Allrounder'}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                {profile?.battingHand || 'Right'} hand
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                {profile?.position || 'Player'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Profile updates require admin approval</p>
                <p className="mt-1 text-amber-600">
                  Submit your changes below. Admins review requests, apply approved updates, and you will
                  receive an email once processed.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <ClipboardList className="h-5 w-5 text-emerald-600" />
              Request profile update
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full name *</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Contact number"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Primary role *</label>
                <select
                  {...register('role')}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Allrounder">Allrounder</option>
                  <option value="Bowler">Bowler</option>
                  <option value="WK-Batsman">WK-Batsman</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Batting hand *</label>
                <select
                  {...register('battingHand')}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="Right">Right</option>
                  <option value="Left">Left</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Team position *</label>
                <select
                  {...register('position')}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="Player">Player</option>
                  <option value="Captain">Captain</option>
                  <option value="Vice Captain">Vice Captain</option>
                  <option value="Associate VC">Associate VC</option>
                  <option value="Quality Director">Quality Director</option>
                  <option value="Director">Director</option>
                  <option value="Principal">Principal</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Bat preference</label>
                <input
                  type="text"
                  {...register('batPreference')}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Optional preference notes"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-1 block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                rows={4}
                {...register('bio')}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Tell the team about yourself, experience, or key highlights."
              />
              {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>}
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                type="checkbox"
                {...register('availability')}
                className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Available for upcoming matches and team activities
              </label>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Target className="h-4 w-4 text-emerald-600" />
                Equipment status
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Check the items you currently have. Submit a request if you need replacements or new gear.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {equipmentItems.map(({ key, label, description }) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-start gap-3 rounded-lg bg-white p-3 shadow-sm transition hover:border-emerald-200 hover:shadow"
                  >
                    <input
                      type="checkbox"
                      {...register(`equipment.${key}` as const)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  Message to admins
                </label>
                <textarea
                  rows={3}
                  {...register('requestMessage')}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Describe the changes you are requesting or provide additional context."
                />
                {errors.requestMessage && (
                  <p className="mt-1 text-sm text-red-500">{errors.requestMessage.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Attach screenshots (optional)
                </label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:border-emerald-400 hover:text-emerald-600">
                    <UploadCloud className="h-4 w-4" />
                    <span>{uploadingScreenshots ? 'Uploading...' : 'Upload files'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleScreenshotUpload}
                      className="hidden"
                      disabled={uploadingScreenshots}
                    />
                  </label>
                  {uploadedScreenshots.map((url) => (
                    <div
                      key={url}
                      className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200"
                    >
                      <img
                        src={url}
                        alt="Attachment"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveScreenshot(url)}
                        className="absolute right-1 top-1 rounded-full bg-white/90 px-2 text-xs font-semibold text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {uploadedScreenshots.length === 0 && (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Add up to 5 screenshots. Accepted formats: JPG, PNG. Max 10 MB per file.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {saving ? 'Submitting request...' : 'Submit update request'}
            </button>
          </form>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <ClipboardList className="h-5 w-5 text-emerald-600" />
              Request history
            </h2>

            {requestsLoading ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your requests...
              </div>
            ) : requests.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No update requests submitted yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Submitted {formatTimestamp(request.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {request.status === 'pending'
                            ? 'Waiting for admin review'
                            : `Reviewed ${formatTimestamp(request.reviewedAt)}`}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyles[request.status] ?? 'bg-gray-200 text-gray-700'}`}
                      >
                        {request.status.toUpperCase()}
                      </span>
                    </div>

                    {request.notes && (
                      <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm text-gray-700">
                        <strong className="font-semibold text-gray-900">Your note:</strong>{' '}
                        {request.notes}
                      </p>
                    )}

                    {request.reviewNotes && (
                      <p className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-emerald-700">
                        <strong className="font-semibold text-emerald-800">Admin note:</strong>{' '}
                        {request.reviewNotes}
                      </p>
                    )}

                    {request.changes?.profile && Object.keys(request.changes.profile).length > 0 && (
                      <div className="mt-3 space-y-1 text-xs text-gray-600">
                        <p className="text-xs font-semibold text-gray-800">Profile changes</p>
                        {Object.entries(request.changes.profile).map(([field, value]) => (
                          <div key={field} className="flex flex-wrap gap-1">
                            <span className="font-semibold text-gray-800">
                              {formatFieldName(field)}:
                            </span>
                            <span>{String(value ?? '--')}</span>
                            {request.changes.previousProfile &&
                              request.changes.previousProfile[field] !== undefined && (
                                <span className="text-gray-400">
                                  (was {String(request.changes.previousProfile[field] ?? '--')})
                                </span>
                              )}
                          </div>
                        ))}
                      </div>
                    )}

                    {request.changes?.equipment &&
                      Object.keys(request.changes.equipment).length > 0 && (
                        <div className="mt-3 space-y-1 text-xs text-gray-600">
                          <p className="text-xs font-semibold text-gray-800">Equipment updates</p>
                          {Object.entries(request.changes.equipment).map(([field, value]) => (
                            <div key={field} className="flex flex-wrap gap-1">
                              <span className="font-semibold text-gray-800">
                                {formatFieldName(field)}:
                              </span>
                              <span>{value ? 'Has item' : 'Needs item'}</span>
                              {request.changes.previousEquipment &&
                                request.changes.previousEquipment[field] !== undefined && (
                                  <span className="text-gray-400">
                                    (was{' '}
                                    {request.changes.previousEquipment[field] ? 'Has item' : 'Needs item'})
                                  </span>
                                )}
                            </div>
                          ))}
                        </div>
                      )}

                    {request.screenshots && request.screenshots.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-800">Screenshots</p>
                        <div className="flex flex-wrap gap-2">
                          {request.screenshots.map((url) => (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="block h-16 w-16 overflow-hidden rounded-lg border border-gray-200"
                            >
                              <img
                                src={url}
                                alt="Request attachment"
                                className="h-full w-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <aside className="w-full space-y-6 lg:w-72">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Trophy className="h-5 w-5 text-emerald-600" />
              Performance snapshot
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Matches</span>
                <span className="font-semibold">{profile?.stats?.matchesPlayed ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Runs</span>
                <span className="font-semibold">{profile?.stats?.runs ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average</span>
                <span className="font-semibold">
                  {formatFixed(profile?.stats?.average ?? 0, 2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Strike rate</span>
                <span className="font-semibold">
                  {formatFixed(profile?.stats?.strikeRate ?? 0, 2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Wickets</span>
                <span className="font-semibold">{profile?.stats?.wickets ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Pending requests</h2>
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No pending requests at the moment.</p>
            ) : (
              <ul className="space-y-3 text-sm text-gray-700">
                {pendingRequests.map((request) => (
                  <li key={request.id} className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                    <p className="font-semibold text-amber-800">
                      Submitted {formatTimestamp(request.createdAt)}
                    </p>
                    <p className="text-xs text-amber-700">
                      Admins will review soon. You will be notified via email.
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
