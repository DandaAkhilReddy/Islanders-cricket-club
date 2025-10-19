import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Trophy, 
  Target, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import type { PlayerProfile as PlayerProfileType } from '../types/player';

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

export default function PlayerProfile() {
  const { currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<PlayerProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      availability: true,
    },
  });

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;

      try {
        const profileRef = doc(db, 'players', currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data() as PlayerProfileType;
          setProfile(data);
          reset({
            name: data.name,
            phone: data.phone || '',
            role: data.role,
            battingHand: data.battingHand,
            position: data.position,
            bio: data.bio || '',
            availability: data.availability ?? true,
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      loadProfile();
    }
  }, [currentUser, reset]);

  async function onSubmit(data: ProfileFormData) {
    if (!currentUser) return;

    setSaving(true);
    try {
      const profileRef = doc(db, 'players', currentUser.uid);
      
      const profileData = {
        name: data.name,
        phone: data.phone || null,
        email: currentUser.email,
        role: data.role,
        battingHand: data.battingHand,
        position: data.position,
        bio: data.bio || '',
        availability: data.availability,
        photoURL: currentUser.photoURL || null,
        updatedAt: new Date(),
      };

      if (!profile) {
        // Create new profile
        const stats = {
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
        };

        const equipment = {
          bat: false,
          pads: false,
          gloves: false,
          helmet: false,
          shoes: false,
          abdominalGuard: false,
        };

        await setDoc(profileRef, {
          ...profileData,
          stats,
          equipment,
          joinedDate: new Date(),
          createdAt: new Date(),
        });
      } else {
        // Update existing profile
        await updateDoc(profileRef, profileData);
      }

      toast.success('Profile updated successfully!');
      
      // Reload profile
      const updatedSnap = await getDoc(profileRef);
      if (updatedSnap.exists()) {
        setProfile(updatedSnap.data() as PlayerProfileType);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  async function toggleEquipment(item: keyof PlayerProfileType['equipment']) {
    if (!currentUser || !profile) return;

    try {
      const profileRef = doc(db, 'players', currentUser.uid);
      const newValue = !profile.equipment[item];
      
      await updateDoc(profileRef, {
        [`equipment.${item}`]: newValue,
      });

      setProfile({
        ...profile,
        equipment: {
          ...profile.equipment,
          [item]: newValue,
        },
      });

      toast.success('Equipment status updated');
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error('Failed to update equipment');
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const equipmentItems: Array<{ key: keyof PlayerProfileType['equipment']; label: string }> = [
    { key: 'bat', label: 'Cricket Bat' },
    { key: 'pads', label: 'Batting Pads' },
    { key: 'gloves', label: 'Batting Gloves' },
    { key: 'helmet', label: 'Helmet' },
    { key: 'shoes', label: 'Cricket Shoes' },
    { key: 'abdominalGuard', label: 'Abdominal Guard' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Profile'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-12 h-12" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {profile?.name || currentUser.displayName || 'Your Profile'}
            </h1>
            <p className="text-emerald-100 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {currentUser.email}
            </p>
            {profile?.joinedDate && (
              <p className="text-emerald-100 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile.joinedDate.seconds * 1000).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Personal Information
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="(123) 456-7890"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Playing Role *
                </label>
                <select
                  {...register('role')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Allrounder">Allrounder</option>
                  <option value="Bowler">Bowler</option>
                  <option value="WK-Batsman">WK-Batsman</option>
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                )}
              </div>

              {/* Batting Hand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batting Hand *
                </label>
                <select
                  {...register('battingHand')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="Right">Right-Handed</option>
                  <option value="Left">Left-Handed</option>
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Position *
                </label>
                <select
                  {...register('position')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register('availability')}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Available for upcoming matches
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          {profile?.stats && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-600" />
                Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Matches</span>
                  <span className="font-semibold">{profile.stats.matchesPlayed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Runs</span>
                  <span className="font-semibold">{profile.stats.runs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average</span>
                  <span className="font-semibold">{profile.stats.average.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strike Rate</span>
                  <span className="font-semibold">{profile.stats.strikeRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Wickets</span>
                  <span className="font-semibold">{profile.stats.wickets}</span>
                </div>
              </div>
            </div>
          )}

          {/* Equipment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Equipment Checklist
            </h3>
            <div className="space-y-2">
              {equipmentItems.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleEquipment(key)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-sm font-medium">{label}</span>
                  {profile?.equipment[key] ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
