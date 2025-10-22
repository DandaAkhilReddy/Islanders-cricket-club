import { useState } from 'react';
import { Upload, Loader2, CheckCircle, XCircle, Camera, Trash2, BarChart3 } from 'lucide-react';
import {
  analyzeMultipleScorecards,
  imageToDataUrl,
  type PlayerStats,
  type AnalysisResult,
} from '../services/aiAnalysisService';
import { submitPlayerUpdateRequest } from '../services/requestService';
import { getPlayerByAuthId } from '../services/playerClaimService';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import Card from './Card';
import toast from 'react-hot-toast';

const MAX_IMAGES = 20;

export default function AIStatsAnalyzer() {
  const { currentUser } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{
    aggregatedStats: Map<string, PlayerStats>;
    allResults: AnalysisResult[];
    totalImages: number;
    successfulAnalysis: number;
  } | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    if (selectedFiles.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    // Validate file types
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      return true;
    });

    setSelectedFiles([...selectedFiles, ...validFiles]);
    toast.success(`${validFiles.length} image(s) added`);
  }

  function removeFile(index: number) {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    toast.success('Image removed');
  }

  function clearAll() {
    setSelectedFiles([]);
    setResults(null);
    toast.success('All images cleared');
  }

  async function analyzeImages() {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setAnalyzing(true);
    setProgress({ current: 0, total: selectedFiles.length });

    try {
      // Convert all files to data URLs
      const imageDataUrls = await Promise.all(
        selectedFiles.map((file) => imageToDataUrl(file))
      );

      // Analyze images
      const analysisResults = await analyzeMultipleScorecards(
        imageDataUrls,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      setResults(analysisResults);

      if (analysisResults.successfulAnalysis > 0) {
        toast.success(
          `Successfully analyzed ${analysisResults.successfulAnalysis}/${analysisResults.totalImages} images!`
        );
      } else {
        toast.error('Failed to analyze images. Please try again.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze images');
    } finally {
      setAnalyzing(false);
    }
  }

  async function submitStatsRequest() {
    if (!currentUser) {
      toast.error('You must be logged in to submit requests');
      return;
    }

    if (!results || results.aggregatedStats.size === 0) {
      toast.error('No stats to submit');
      return;
    }

    setSubmitting(true);

    try {
      // Get player profile
      const playerProfile = await getPlayerByAuthId(currentUser.uid);

      if (!playerProfile) {
        toast.error('Player profile not found. Please claim your profile first.');
        return;
      }

      // Aggregate all stats
      const allPlayers = Array.from(results.aggregatedStats.values());
      const totalRuns = allPlayers.reduce((sum, p) => sum + p.runs, 0);
      const totalWickets = allPlayers.reduce((sum, p) => sum + p.wickets, 0);
      const totalCatches = allPlayers.reduce((sum, p) => sum + p.catches, 0);
      const totalMatches = allPlayers.reduce((sum, p) => sum + p.matchesPlayed, 0);

      // Calculate averages
      const avgBattingAvg = allPlayers.reduce((sum, p) => sum + (p.battingAverage || 0), 0) / allPlayers.length;
      const avgStrikeRate = allPlayers.reduce((sum, p) => sum + (p.strikeRate || 0), 0) / allPlayers.length;
      const avgEconomy = allPlayers.reduce((sum, p) => sum + (p.economy || 0), 0) / allPlayers.length;

      // Create update request
      await submitPlayerUpdateRequest({
        playerId: playerProfile.id,
        playerName: playerProfile.name || currentUser.displayName || 'Unknown Player',
        playerEmail: currentUser.email,
        requestedByUid: currentUser.uid,
        requestedByName: currentUser.displayName,
        requestedByEmail: currentUser.email,
        changes: {
          profile: {
            'stats.matchesPlayed': (playerProfile.stats?.matchesPlayed || 0) + totalMatches,
            'stats.runs': (playerProfile.stats?.runs || 0) + totalRuns,
            'stats.wickets': (playerProfile.stats?.wickets || 0) + totalWickets,
            'stats.catches': (playerProfile.stats?.catches || 0) + totalCatches,
            'stats.battingAverage': avgBattingAvg || playerProfile.stats?.battingAverage || 0,
            'stats.strikeRate': avgStrikeRate || playerProfile.stats?.strikeRate || 0,
            'stats.economy': avgEconomy || playerProfile.stats?.economy || 0,
          },
          previousProfile: {
            'stats.matchesPlayed': playerProfile.stats?.matchesPlayed || 0,
            'stats.runs': playerProfile.stats?.runs || 0,
            'stats.wickets': playerProfile.stats?.wickets || 0,
            'stats.catches': playerProfile.stats?.catches || 0,
            'stats.battingAverage': playerProfile.stats?.battingAverage || 0,
            'stats.strikeRate': playerProfile.stats?.strikeRate || 0,
            'stats.economy': playerProfile.stats?.economy || 0,
          },
          equipment: {},
          previousEquipment: {},
        },
        screenshots: [],
        notes: `AI-analyzed stats from ${results.totalImages} scorecard images. Found ${results.aggregatedStats.size} player(s). Total: ${totalRuns} runs, ${totalWickets} wickets, ${totalCatches} catches across ${totalMatches} match(es).`,
      });

      toast.success('Stats update request submitted successfully! Admin will review it.');

      // Clear results after successful submission
      setResults(null);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast.error('Failed to submit stats request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-soft-blue-100">
            <Camera className="w-5 h-5 text-soft-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              AI Scorecard Analyzer
            </h3>
            <p className="text-sm text-gray-600">
              Upload match scorecards (up to {MAX_IMAGES} images) and get automatic stats extraction
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-soft-blue-500 transition">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={analyzing || selectedFiles.length >= MAX_IMAGES}
              className="hidden"
              id="scorecard-upload"
            />
            <label
              htmlFor="scorecard-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-12 h-12 text-gray-400" />
              <p className="text-sm font-medium text-gray-900">
                Click to upload scorecard images
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG up to 10MB each ({selectedFiles.length}/{MAX_IMAGES} selected)
              </p>
            </label>
          </div>

          {/* Selected Images Preview */}
          {selectedFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-900">
                  Selected Images ({selectedFiles.length})
                </p>
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Scorecard ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-center text-gray-600 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <div className="flex gap-3">
            <Button
              onClick={analyzeImages}
              disabled={analyzing || selectedFiles.length === 0}
              className="flex-1"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing... ({progress.current}/{progress.total})
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyze Scorecards
                </>
              )}
            </Button>
          </div>

          {/* API Key Notice */}
          {!import.meta.env.VITE_GEMINI_API_KEY?.includes('YOUR_') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                ⚠️ <strong>API Key Required:</strong> Add your free Gemini API key to .env file
                <br />
                Get it from:{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  https://makersuite.google.com/app/apikey
                </a>
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Results Section */}
      {results && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
              <p className="text-sm text-gray-600">
                Successfully analyzed {results.successfulAnalysis} out of{' '}
                {results.totalImages} images
              </p>
            </div>
          </div>

          {/* Aggregated Player Stats */}
          {results.aggregatedStats.size > 0 ? (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">
                Player Statistics ({results.aggregatedStats.size} players found)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from(results.aggregatedStats.values()).map((player, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-soft-blue-50 to-soft-orange-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-lg font-bold text-gray-900">
                        {player.playerName}
                      </h5>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {player.confidence}% confident
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Matches</p>
                        <p className="text-xl font-bold text-gray-900">
                          {player.matchesPlayed}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Runs</p>
                        <p className="text-xl font-bold text-green-600">
                          {player.runs}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Wickets</p>
                        <p className="text-xl font-bold text-red-600">
                          {player.wickets}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Catches</p>
                        <p className="text-xl font-bold text-blue-600">
                          {player.catches}
                        </p>
                      </div>

                      {player.highestScore && player.highestScore > 0 && (
                        <div>
                          <p className="text-gray-600">Highest Score</p>
                          <p className="text-lg font-bold text-purple-600">
                            {player.highestScore}
                          </p>
                        </div>
                      )}

                      {player.battingAverage && player.battingAverage > 0 && (
                        <div>
                          <p className="text-gray-600">Batting Avg</p>
                          <p className="text-lg font-bold text-orange-600">
                            {player.battingAverage.toFixed(2)}
                          </p>
                        </div>
                      )}

                      {player.strikeRate && player.strikeRate > 0 && (
                        <div>
                          <p className="text-gray-600">Strike Rate</p>
                          <p className="text-lg font-bold text-indigo-600">
                            {player.strikeRate.toFixed(2)}
                          </p>
                        </div>
                      )}

                      {player.economy && player.economy > 0 && (
                        <div>
                          <p className="text-gray-600">Economy</p>
                          <p className="text-lg font-bold text-pink-600">
                            {player.economy.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Export/Save Options */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  💡 <strong>Tip:</strong> These stats are automatically extracted from your
                  scorecards. Review them and submit a request to update your profile!
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setResults(null)}>
                    Analyze More Images
                  </Button>
                  <Button onClick={submitStatsRequest} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Stats Update Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                No player statistics found in the images. Please ensure scorecards are
                clear and readable.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
