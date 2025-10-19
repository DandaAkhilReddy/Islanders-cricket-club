import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Save, Camera, CheckCircle2, Circle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import type { PlayerRole, BattingHand, PlayerPosition } from '../types';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['Batsman', 'Allrounder', 'Bowler', 'WK-Batsman']),
  battingHand: z.enum(['Right', 'Left']),
  position: z.enum(['Player', 'Captain', 'Vice Captain', 'Associate VC', 'Quality Director', 'Director', 'Principal']),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  availability: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface PlayerProfile {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: PlayerRole;
  battingHand: BattingHand;
  position: PlayerPosition;
  bio?: string;
  photoURL?: string;
  availability: boolean;
  stats: {
    matchesPlayed: number;
    runs: number;
    wickets: number;
    catches: number;
    battingAverage: number;
    strikeRate: number;
  };
  equipment: {
    practiceTShirt: { received: boolean; size?: string; date?: Date };
    matchTShirt: { received: boolean; size?: string; date?: Date };
    bat: boolean;
    pads: boolean;
    gloves: boolean;
    helmet: boolean;
    shoes: boolean;
    kitBag: boolean;
    other: string[];
  };
  joinedDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function PlayerProfile() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const equipment = watch('role');

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  async function loadProfile() {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const profileRef = doc(db, 'players', currentUser.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const data = profileSnap.data() as PlayerProfile;
        setProfile(data);

        // Populate form
        setValue('name', data.name || currentUser.displayName || '');
        setValue('phone', data.phone || '');
        setValue('role', data.role || 'Player');
        setValue('battingHand', data.battingHand || 'Right');
        setValue('position', data.position || 'Player');
        setValue('bio', data.bio || '');
        setValue('availability', data.availability ?? true);
      } else {
        // Initialize with default values from auth
        setValue('name', currentUser.displayName || '');
        setValue('role', 'Allrounder');
        setValue('battingHand', 'Right');
        setValue('position', 'Player');
        setValue('availability', true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: ProfileFormData) {
    if (!currentUser) return;

    try {
      setSaving(true);

      const profileRef = doc(db, 'players', currentUser.uid);
      const now = new Date();

      const profileData: Partial<PlayerProfile> = {
        userId: currentUser.uid,
        name: data.name,
        email: currentUser.email || '',
        phone: data.phone,
        role: data.role,
        battingHand: data.battingHand,
        position: data.position,
        bio: data.bio,
        photoURL: currentUser.photoURL || undefined,
        availability: data.availability,
        updatedAt: now,
        isActive: true,
      };

      if (!profile) {
        // Creating new profile
        await setDoc(profileRef, {
          ...profileData,
          stats: {
            matchesPlayed: 0,
            runs: 0,
            wickets: 0,
            catches: 0,
            battingAverage: 0,
            strikeRate: 0,
          },
          equipment: {
            practiceTShirt: { received: false },
            matchTShirt: { received: false },
            bat: false,
            pads: false,
            gloves: false,
            helmet: false,
            shoes: false,
            kitBag: false,
            other: [],
          },
          joinedDate: now,
          createdAt: now,
        });
        toast.success('Profile created successfully!');
      } else {
        // Updating existing profile
        await updateDoc(profileRef, profileData);
        toast.success('Profile updated successfully!');
      }

      await loadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  async function toggleEquipment(item: keyof PlayerProfile['equipment']) {
    if (!currentUser || !profile) return;

    try {
      const profileRef = doc(db, 'players', currentUser.uid);
      const currentValue = profile.equipment[item];

      if (typeof currentValue === 'boolean') {
        await updateDoc(profileRef, {
          [`equipment.${item}`]: !currentValue,
        });
      } else {
        // For complex equipment items (t-shirts)
        await updateDoc(profileRef, {
          [`equipment.${item}.received`]: !currentValue.received,
        });
      }

      await loadProfile();
      toast.success('Equipment status updated');
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error('Failed to update equipment');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Player Profile</h1>
          <p className="text-gray-600">Manage your personal information and equipment</p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo */}
              {currentUser?.photoURL && (
                <div className="col-span-full flex items-center gap-4">
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Profile'}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{currentUser.displayName}</p>
                    <p className="text-sm text-gray-600">{currentUser.email}</p>
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="(123) 456-7890"
                />
              </div>

              {/* Cricket Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cricket Role *
                </label>
                <select
                  {...register('role')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="Allrounder">Allrounder</option>
                  <option value="WK-Batsman">Wicket-Keeper Batsman</option>
                </select>
              </div>

              {/* Batting Hand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batting Hand *
                </label>
                <select
                  {...register('battingHand')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Right">Right-handed</option>
                  <option value="Left">Left-handed</option>
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position/Title *
                </label>
                <select
                  {...register('position')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Player">Player</option>
                  <option value="Captain">Captain</option>
                  <option value="Vice Captain">Vice Captain</option>
                  <option value="Associate VC">Associate Vice Captain</option>
                  <option value="Quality Director">Quality Director</option>
                  <option value="Director">Director</option>
                  <option value="Principal">Principal</option>
                </select>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-3">
                <input
                  {...register('availability')}
                  type="checkbox"
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Available for selection
                </label>
              </div>

              {/* Bio */}
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio / About Me
                </label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Tell us about yourself, your cricket journey, achievements, etc."
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Equipment Status Card */}
          {profile && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Equipment Status</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(profile.equipment).map(([key, value]) => {
                  if (key === 'other') return null;

                  const isReceived = typeof value === 'boolean' ? value : value.received;
                  const label = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase());

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleEquipment(key as keyof PlayerProfile['equipment'])}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                        isReceived
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {isReceived ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className={isReceived ? 'text-green-900 font-medium' : 'text-gray-700'}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Click on items to mark as received. Contact admin for equipment requests.
                </p>
              </div>
            </Card>
          )}

          {/* Statistics Card (Read-only for players) */}
          {profile && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{profile.stats.matchesPlayed}</p>
                  <p className="text-sm text-gray-600">Matches</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{profile.stats.runs}</p>
                  <p className="text-sm text-gray-600">Runs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{profile.stats.wickets}</p>
                  <p className="text-sm text-gray-600">Wickets</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{profile.stats.catches}</p>
                  <p className="text-sm text-gray-600">Catches</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {profile.stats.battingAverage.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Average</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {profile.stats.strikeRate.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Strike Rate</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Statistics are updated by scorers after each match.
                </p>
              </div>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
