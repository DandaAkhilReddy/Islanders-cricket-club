import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface PlayerStats {
  playerName: string;
  matchesPlayed: number;
  runs: number;
  wickets: number;
  catches: number;
  highestScore?: number;
  battingAverage?: number;
  strikeRate?: number;
  economy?: number;
  confidence: number; // 0-100% confidence in extraction
}

export interface AnalysisResult {
  success: boolean;
  playersFound: PlayerStats[];
  matchInfo?: {
    teams: string[];
    date?: string;
    venue?: string;
    matchType?: string;
  };
  rawAnalysis: string;
  error?: string;
}

/**
 * Analyze a single scorecard image using Gemini AI
 */
export async function analyzeScorecardImage(
  imageDataUrl: string
): Promise<AnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Convert data URL to base64
    const base64Data = imageDataUrl.split(',')[1];

    const prompt = `You are a cricket statistics analyzer. Analyze this cricket scorecard image and extract ALL player statistics.

IMPORTANT INSTRUCTIONS:
1. Find and extract stats for EVERY player visible in the scorecard
2. Look for batting scorecards (runs, balls, 4s, 6s, strike rate)
3. Look for bowling scorecards (overs, maidens, runs, wickets, economy)
4. Look for fielding stats (catches, stumpings, run-outs)
5. Extract team names, match date, venue if visible

Return the data in EXACTLY this JSON format (no markdown, no code blocks, just pure JSON):
{
  "success": true,
  "matchInfo": {
    "teams": ["Team A", "Team B"],
    "date": "YYYY-MM-DD or null",
    "venue": "Venue name or null",
    "matchType": "T20/ODI/Test or null"
  },
  "playersFound": [
    {
      "playerName": "Full Name",
      "matchesPlayed": 1,
      "runs": 0,
      "wickets": 0,
      "catches": 0,
      "highestScore": 0,
      "battingAverage": 0.0,
      "strikeRate": 0.0,
      "economy": 0.0,
      "confidence": 95
    }
  ],
  "rawAnalysis": "Brief description of what was found"
}

IMPORTANT:
- Extract stats for EVERY player you see
- If a player only batted, set wickets to 0
- If a player only bowled, set runs to 0
- Confidence should be 0-100 based on image clarity
- Return valid JSON only, no other text`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up the response (remove markdown code blocks if present)
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '');
    }

    // Parse JSON response
    const analysis: AnalysisResult = JSON.parse(cleanText);

    return analysis;
  } catch (error) {
    console.error('Error analyzing scorecard:', error);
    return {
      success: false,
      playersFound: [],
      rawAnalysis: '',
      error: error instanceof Error ? error.message : 'Failed to analyze image',
    };
  }
}

/**
 * Analyze multiple scorecard images and aggregate stats
 */
export async function analyzeMultipleScorecards(
  imageDataUrls: string[],
  onProgress?: (current: number, total: number) => void
): Promise<{
  aggregatedStats: Map<string, PlayerStats>;
  allResults: AnalysisResult[];
  totalImages: number;
  successfulAnalysis: number;
}> {
  const allResults: AnalysisResult[] = [];
  const playerStatsMap = new Map<string, PlayerStats>();

  for (let i = 0; i < imageDataUrls.length; i++) {
    if (onProgress) {
      onProgress(i + 1, imageDataUrls.length);
    }

    const result = await analyzeScorecardImage(imageDataUrls[i]);
    allResults.push(result);

    if (result.success && result.playersFound) {
      // Aggregate stats for each player
      result.playersFound.forEach((player) => {
        const normalizedName = player.playerName.toLowerCase().trim();

        if (playerStatsMap.has(normalizedName)) {
          const existing = playerStatsMap.get(normalizedName)!;
          playerStatsMap.set(normalizedName, {
            playerName: player.playerName, // Keep original casing
            matchesPlayed: existing.matchesPlayed + player.matchesPlayed,
            runs: existing.runs + player.runs,
            wickets: existing.wickets + player.wickets,
            catches: existing.catches + player.catches,
            highestScore: Math.max(
              existing.highestScore || 0,
              player.highestScore || 0
            ),
            battingAverage:
              existing.runs + player.runs > 0
                ? (existing.runs + player.runs) /
                  (existing.matchesPlayed + player.matchesPlayed)
                : 0,
            strikeRate: player.strikeRate || existing.strikeRate,
            economy: player.economy || existing.economy,
            confidence: Math.min(existing.confidence, player.confidence),
          });
        } else {
          playerStatsMap.set(normalizedName, { ...player });
        }
      });
    }
  }

  const successfulAnalysis = allResults.filter((r) => r.success).length;

  return {
    aggregatedStats: playerStatsMap,
    allResults,
    totalImages: imageDataUrls.length,
    successfulAnalysis,
  };
}

/**
 * Convert image file to base64 data URL
 */
export function imageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
