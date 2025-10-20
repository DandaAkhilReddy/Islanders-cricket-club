import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { User, Trophy, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getAllPlayers,
  claimPlayerProfile,
  findPlayerByEmail,
  type ClaimablePlayer,
} from '../services/playerClaimService';
import toast from 'react-hot-toast';

export default function ClaimProfile() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<ClaimablePlayer[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [suggestedPlayer, setSuggestedPlayer] = useState<ClaimablePlayer | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    async function loadPlayers() {
      try {
        setLoading(true);

        // Get all players
        const allPlayers = await getAllPlayers();
        setPlayers(allPlayers);

        // Try to find player by email (auto-suggest)
        if (currentUser.email) {
          const matchedPlayer = await findPlayerByEmail(currentUser.email);
          if (matchedPlayer) {
            setSuggestedPlayer(matchedPlayer);
            setSelectedPlayerId(matchedPlayer.id);
          }
        }
      } catch (error) {
        console.error('Error loading players:', error);
        toast.error('Failed to load player roster');
      } finally {
        setLoading(false);
      }
    }

    loadPlayers();
  }, [currentUser]);

  async function handleClaimProfile() {
    if (!selectedPlayerId || !currentUser) {
      toast.error('Please select a player profile');
      return;
    }

    setClaiming(true);
    try {
      await claimPlayerProfile(
        selectedPlayerId,
        currentUser.uid,
        currentUser.email || '',
        currentUser.displayName || 'Unknown'
      );

      toast.success('Profile claimed successfully!');

      // Redirect to player dashboard
      setTimeout(() => {
        navigate('/player/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('Error claiming profile:', error);
      toast.error(error.message || 'Failed to claim profile');
    } finally {
      setClaiming(false);
    }
  }

  if (!authLoading && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Admins don't need to claim profiles
  if (!authLoading && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-soft-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-soft-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading player roster...</p>
        </div>
      </div>
    );
  }

  const unclaimedPlayers = players.filter((p) => !p.isClaimed);
  const claimedPlayers = players.filter((p) => p.isClaimed);

  return (
    <div className="min-h-screen bg-gradient-to-b from-soft-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-soft-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Claim Your Player Profile
          </h1>
          <p className="text-lg text-gray-600">
            Welcome, {currentUser?.displayName || 'Player'}!
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {currentUser?.email}
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-soft-blue-100 border-2 border-soft-blue-300 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-soft-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-soft-blue-900 mb-1">
                Link Your Account to Team Roster
              </h3>
              <p className="text-sm text-soft-blue-800">
                Select your name from the Islanders roster below to link your Google account to your player profile.
                This is a one-time setup - you'll be automatically logged in to your dashboard after claiming.
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Match */}
        {suggestedPlayer && !suggestedPlayer.isClaimed && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">
                  We found a match!
                </h3>
                <p className="text-sm text-green-800 mb-3">
                  Your email matches <strong>{suggestedPlayer.name}</strong> in our roster.
                  Is this you?
                </p>
                <button
                  onClick={handleClaimProfile}
                  disabled={claiming}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                >
                  {claiming ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Claiming...
                    </span>
                  ) : (
                    `Yes, I'm ${suggestedPlayer.name}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player Selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Select Your Profile
          </h2>

          {/* Unclaimed Players */}
          {unclaimedPlayers.length > 0 ? (
            <div className="space-y-3 mb-8">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Available Profiles ({unclaimedPlayers.length})
              </h3>
              {unclaimedPlayers.map((player) => (
                <label
                  key={player.id}
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                    selectedPlayerId === player.id
                      ? 'border-soft-blue-500 bg-soft-blue-50'
                      : 'border-gray-200 hover:border-soft-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="player"
                    value={player.id}
                    checked={selectedPlayerId === player.id}
                    onChange={() => setSelectedPlayerId(player.id)}
                    className="w-5 h-5 text-soft-blue-600 focus:ring-soft-blue-500"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{player.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                      <span className="bg-soft-blue-100 text-soft-blue-700 px-2 py-0.5 rounded">
                        {player.role}
                      </span>
                      <span className="bg-soft-orange-100 text-soft-orange-700 px-2 py-0.5 rounded">
                        {player.position}
                      </span>
                    </div>
                  </div>
                  {player.id === suggestedPlayer?.id && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                      Suggested
                    </span>
                  )}
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-8">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">All profiles have been claimed</p>
              <p className="text-sm text-gray-500 mt-1">
                Contact the admin if you need assistance
              </p>
            </div>
          )}

          {/* Already Claimed (grayed out) */}
          {claimedPlayers.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Already Claimed ({claimedPlayers.length})
              </h3>
              <div className="space-y-2 opacity-50">
                {claimedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-700">{player.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Claimed by {player.claimedByEmail}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claim Button */}
          {unclaimedPlayers.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleClaimProfile}
                disabled={!selectedPlayerId || claiming}
                className="w-full py-4 bg-soft-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-soft-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {claiming ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Claiming Profile...
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5" />
                    Claim My Profile
                  </>
                )}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Can't find your name?{' '}
                <a href="mailto:canderson@hssmedicine.com" className="text-soft-blue-600 hover:underline">
                  Contact Admin
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
