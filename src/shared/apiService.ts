// API service for communicating with Devvit server endpoints

export interface LeaderboardEntry {
  username: string;
  score: number;
  plays: number;
}

export interface SubmitAnswerResponse {
  success: boolean;
  leaderboard: {
    score: number;
    plays: number;
  };
}

export interface GlobalLeaderboardEntry {
  username: string;
  score: number;
  accuracy: number;
  gamesPlayed: number;
  lastPlayed: number;
}

export interface LeaderboardResponse {
  success: boolean;
  leaderboard: GlobalLeaderboardEntry[];
  stats: {
    totalPlayers: number;
    totalGames: number;
    averageScore: number;
    topScore: number;
  };
  error?: string;
}

export interface GameScoreResponse {
  success: boolean;
  playerRank: number;
  playerEntry: GlobalLeaderboardEntry | null;
  totalPlayers: number;
  error?: string;
}

export async function submitAnswer(username: string, correct: boolean): Promise<SubmitAnswerResponse> {
  try {
    const response = await fetch('/submit-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, correct }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
}

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  try {
    const response = await fetch('/leaderboard');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return {
      success: false,
      leaderboard: [],
      stats: {
        totalPlayers: 0,
        totalGames: 0,
        averageScore: 0,
        topScore: 0
      },
      error: 'Failed to fetch leaderboard'
    };
  }
}

export async function submitGameScore(
  username: string, 
  gameScore: number, 
  correctAnswers: number, 
  totalQuestions: number
): Promise<GameScoreResponse> {
  try {
    const response = await fetch('/api/submit-game-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        gameScore,
        correctAnswers,
        totalQuestions
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting game score:', error);
    return {
      success: false,
      playerRank: -1,
      playerEntry: null,
      totalPlayers: 0,
      error: 'Failed to submit game score'
    };
  }
}

export interface ModeratorCheckResponse {
  success: boolean;
  isModerator: boolean;
  username?: string;
  error?: string;
}

export interface ResetLeaderboardResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function checkModeratorStatus(): Promise<ModeratorCheckResponse> {
  try {
    const response = await fetch('/is-moderator');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking moderator status:', error);
    return {
      success: false,
      isModerator: false,
      error: 'Failed to check moderator status',
    };
  }
}

export async function resetLeaderboard(): Promise<ResetLeaderboardResponse> {
  try {
    const response = await fetch('/reset-leaderboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP error! status: ${response.status}`,
      };
    }

    return result;
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    return {
      success: false,
      error: 'Failed to reset leaderboard',
    };
  }
}

export interface BalancedQuestionsResponse {
  success: boolean;
  subreddit: string;
  questionType: 'truth' | 'troll';
  usedCount: number;
  totalAvailable: number;
  balance: { truth: number; troll: number };
  poolRefreshed: boolean;
  error?: string;
}

export async function getBalancedQuestion(sessionId: string): Promise<BalancedQuestionsResponse> {
  try {
    const response = await fetch(`/api/balanced-questions?sessionId=${encodeURIComponent(sessionId)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting balanced question:', error);
    return {
      success: false,
      subreddit: 'AskReddit', // Fallback
      questionType: 'truth',
      usedCount: 0,
      totalAvailable: 16,
      balance: { truth: 0, troll: 0 },
      poolRefreshed: false,
      error: 'Failed to get balanced question',
    };
  }
}

// Track fake post usage to prevent duplicates
export async function trackFakePost(postId: string): Promise<{ success: boolean; totalUsedPosts?: number; error?: string }> {
  try {
    const response = await fetch('/api/track-fake-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error tracking fake post:', error);
    return {
      success: false,
      error: 'Failed to track fake post'
    };
  }
}

// Get fake post usage statistics
export async function getFakePostStats(): Promise<{
  success: boolean;
  usedPosts?: number;
  totalPosts?: number;
  availablePosts?: number;
  usagePercentage?: number;
  error?: string;
}> {
  try {
    const response = await fetch('/api/fake-post-stats');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting fake post stats:', error);
    return {
      success: false,
      error: 'Failed to get fake post statistics'
    };
  }
}
