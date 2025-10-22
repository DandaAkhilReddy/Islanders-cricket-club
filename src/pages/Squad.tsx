import { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Player } from '../types';

export default function Squad() {
  const [players, setPlayers] = useState<(Player & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    try {
      setLoading(true);
      const playersSnapshot = await getDocs(collection(db, 'players'));
      const playersData = playersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Player,
      }));

      // Only show active players
      const activePlayers = playersData.filter(player => player.isActive);
      setPlayers(activePlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-700" />
              <p className="text-gray-600">Loading team roster...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-10 h-10 text-green-700" />
            <h1 className="text-4xl font-bold text-gray-800">Team Roster</h1>
          </div>
          <p className="text-gray-600 text-lg">Islanders Cricket Club - Corpus Christi, Texas</p>
        </div>

        {/* Players List */}
        {players.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Players Yet</h2>
            <p className="text-gray-600">
              The team roster is currently empty. Players will appear here once they are added by the admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
              <div key={player.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="bg-green-700 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">{player.name}</h3>
                  <p className="text-green-100 text-sm">{player.position || 'Player'}</p>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">Role:</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {player.role}
                      </span>
                    </div>
                    {player.battingHand && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Batting:</span>
                        <span className="text-gray-900">{player.battingHand} Hand</span>
                      </div>
                    )}
                    {player.bio && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-gray-700 text-sm">{player.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
