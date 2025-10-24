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
    const response = await fetch('/api/global-leaderboard');

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
    const response = await fetch('/api/is-moderator');

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
    const response = await fetch('/api/reset-leaderboard', {
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

// Track any post usage in session to prevent duplicates
export async function trackPostUsage(postId: string, sessionId: string, postType: 'truth' | 'troll'): Promise<{ success: boolean; totalUsedPosts?: number; error?: string }> {
  try {
    const response = await fetch('/api/track-post-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, sessionId, postType }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error tracking post usage:', error);
    return {
      success: false,
      error: 'Failed to track post usage'
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

// Track truth post usage to prevent repetition across sessions
export async function trackTruthPost(postId: string, subreddit?: string): Promise<{ success: boolean; totalUsedPosts?: number; error?: string }> {
  try {
    const response = await fetch('/api/track-truth-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, subreddit }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error tracking truth post:', error);
    return {
      success: false,
      error: 'Failed to track truth post'
    };
  }
}

// Get recently used truth posts for filtering (session-specific)
export async function getRecentTruthPosts(sessionId: string): Promise<{
  success: boolean;
  recentPosts?: string[];
  totalTracked?: number;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/recent-truth-posts?sessionId=${encodeURIComponent(sessionId)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting recent truth posts:', error);
    return {
      success: false,
      recentPosts: [],
      error: 'Failed to get recent truth posts'
    };
  }
}

// Fetch fresh truth posts directly from Reddit API via backend
export async function fetchFreshTruthPost(subreddit: string, sessionId: string): Promise<{
  success: boolean;
  post?: {
    id: string;
    title: string;
    body: string;
    subreddit: string;
    author: string;
    upvotes: number;
  };
  strategy?: number;
  totalAvailable?: number;
  sessionUsedCount?: number;
  error?: string;
}> {
  try {
    console.log('🌐 [CLIENT] Requesting fresh truth post from backend for r/', subreddit, 'session:', sessionId);
    
    const response = await fetch(`/api/fetch-fresh-truth-posts?subreddit=${encodeURIComponent(subreddit)}&sessionId=${encodeURIComponent(sessionId)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ [CLIENT] Received fresh truth post from backend:', {
        id: result.post.id,
        title: result.post.title.substring(0, 60) + '...',
        strategy: result.strategy,
        totalAvailable: result.totalAvailable
      });
    }

    return result;
  } catch (error) {
    console.error('❌ [CLIENT] Error fetching fresh truth post:', error);
    return {
      success: false,
      error: 'Failed to fetch fresh truth post from backend'
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
