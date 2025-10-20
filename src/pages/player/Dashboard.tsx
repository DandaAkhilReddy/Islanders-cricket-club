import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  User,
  MessageSquare,
  Target,
  Calendar,
  Activity,
  DollarSign,
  Trophy,
  Clock,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { PlayerProfile } from '../../types/player';
import StatCard from '../../components/StatCard';
import { formatFixed } from '../../utils/number';
import {
  fetchPlayerUpdateRequests,
  fetchPendingPlayerUpdateRequests,
} from '../../services/requestService';

export default function PlayerDashboard() {
  const { currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);

        // Load player profile
        const profileRef = doc(db, 'players', currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as PlayerProfile);
        }

        // Load pending requests count
        const requests = await fetchPlayerUpdateRequests(currentUser.uid);
        const pending = requests.filter((r) => r.status === 'pending');
        setPendingRequestsCount(pending.length);
      } catch (error) {
        console.error('Failed to load player data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentUser]);

  if (!authLoading && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-soft-blue-200 border-t-soft-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      name: 'Update Profile',
      description: 'Edit your player information',
      icon: User,
      path: '/profile',
      color: 'soft-blue',
    },
    {
      name: 'Team Chat',
      description: 'Message your teammates',
      icon: MessageSquare,
      path: '/messenger',
      color: 'soft-orange',
      badge: null,
    },
    {
      name: 'View Matches',
      description: 'See upcoming matches',
      icon: Calendar,
      path: '/matches',
      color: 'soft-blue',
    },
    {
      name: 'Practice Schedule',
      description: 'Check practice sessions',
      icon: Activity,
      path: '/practice',
      color: 'soft-orange',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-soft-blue-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-soft-blue-600 to-soft-blue-700 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={profile?.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Welcome back, {profile?.name || currentUser?.displayName}!
              </h1>
              <p className="text-soft-blue-100 text-lg">
                {profile?.position || 'Player'} • {profile?.role || 'Team Member'}
              </p>
            </div>
          </div>

          {pendingRequestsCount > 0 && (
            <div className="mt-4 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 w-fit">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                You have {pendingRequestsCount} pending request{pendingRequestsCount > 1 ? 's' : ''}{' '}
                under review
              </span>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Matches Played"
              value={profile?.stats?.matchesPlayed || 0}
              subtitle="Total appearances"
              icon={Trophy}
              color="soft-blue"
            />
            <StatCard
              title="Total Runs"
              value={profile?.stats?.runs || 0}
              subtitle={`Avg: ${formatFixed(profile?.stats?.average || 0, 2)}`}
              icon={Target}
              color="soft-orange"
            />
            <StatCard
              title="Wickets"
              value={profile?.stats?.wickets || 0}
              subtitle={`Economy: ${formatFixed(profile?.stats?.economy || 0, 2)}`}
              icon={Activity}
              color="soft-blue"
            />
            <StatCard
              title="Strike Rate"
              value={formatFixed(profile?.stats?.strikeRate || 0, 1)}
              subtitle="Batting SR"
              icon={Target}
              color="soft-orange"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const colorClasses =
                action.color === 'soft-blue'
                  ? {
                      bg: 'bg-soft-blue-100',
                      text: 'text-soft-blue-600',
                      hover: 'hover:border-soft-blue-300',
                    }
                  : {
                      bg: 'bg-soft-orange-100',
                      text: 'text-soft-orange-600',
                      hover: 'hover:border-soft-orange-300',
                    };

              return (
                <Link
                  key={action.name}
                  to={action.path}
                  className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${colorClasses.hover} hover:shadow-lg transition-all group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-lg ${colorClasses.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${colorClasses.text}`} />
                    </div>
                    {action.badge && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-soft-blue-600 transition">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Team Announcements */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Team Updates</h2>
            <Link
              to="/communications"
              className="text-sm text-soft-blue-600 hover:underline font-medium"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-soft-blue-50 rounded-lg">
              <Bell className="w-5 h-5 text-soft-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Check the communications hub for latest team announcements
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Stay updated with matches, practices, and team news
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Status</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${profile?.availability ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
              <div>
                <p className="font-medium text-gray-900">
                  {profile?.availability ? 'Available' : 'Unavailable'}
                </p>
                <p className="text-sm text-gray-600">
                  {profile?.availability
                    ? 'You are available for upcoming matches'
                    : 'You are marked as unavailable'}
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="px-4 py-2 bg-soft-blue-100 text-soft-blue-600 rounded-lg hover:bg-soft-blue-200 transition text-sm font-medium"
            >
              Update Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
