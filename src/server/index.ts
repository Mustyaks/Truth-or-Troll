import express from 'express';
import { InitResponse, IncrementResponse, DecrementResponse } from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

// Shared leaderboard key for all players
const LEADERBOARD_KEY = 'leaderboard';

// Leaderboard entry interface
interface LeaderboardEntry {
  username: string;
  score: number;
  accuracy: number;
  gamesPlayed: number;
  lastPlayed: number;
}

// Get global leaderboard from Redis (robust to legacy shapes)
async function getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const leaderboardData = await redis.get(LEADERBOARD_KEY);
    const parsed = leaderboardData ? JSON.parse(leaderboardData) : [];

    // Normalize to array shape if legacy object shape is encountered
    let leaderboard: LeaderboardEntry[] = Array.isArray(parsed)
      ? parsed
      : Object.entries(parsed || {}).map(([username, value]: [string, any]) => {
          const plays = typeof value?.plays === 'number' ? value.plays : 0;
          const score = typeof value?.score === 'number' ? value.score : 0;
          const accuracy = plays > 0 ? Math.round((score / plays) * 100) : 0;
          return {
            username,
            score,
            accuracy,
            gamesPlayed: plays,
            lastPlayed: Date.now()
          } as LeaderboardEntry;
        });

    return leaderboard.sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.accuracy - a.accuracy;
    });
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    return [];
  }
}

// Update player score in global leaderboard
async function updatePlayerScore(username: string, gameScore: number, correctAnswers: number, totalQuestions: number): Promise<void> {
  try {
    // Fetch current leaderboard
    const leaderboard = await getGlobalLeaderboard();
    
    // Calculate accuracy
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Check if player already exists
    const existingPlayer = leaderboard.find(p => p.username === username);
    
    if (existingPlayer) {
      // Update existing player - only keep best score
      if (gameScore > existingPlayer.score) {
        existingPlayer.score = gameScore;
        existingPlayer.accuracy = accuracy;
      }
      existingPlayer.gamesPlayed += 1;
      existingPlayer.lastPlayed = Date.now();
    } else {
      // Add new player
      leaderboard.push({
        username,
        score: gameScore,
        accuracy,
        gamesPlayed: 1,
        lastPlayed: Date.now()
      });
    }
    
    // Sort leaderboard by score, then accuracy
    const sortedLeaderboard = leaderboard
      .sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.accuracy - a.accuracy;
      });

    // Save back to Redis (persist all players who have played)
    await redis.set(LEADERBOARD_KEY, JSON.stringify(sortedLeaderboard));
  } catch (error) {
    console.error('Error updating player score:', error);
    throw error;
  }
}

// Get player rank and stats
async function getPlayerRank(username: string): Promise<{ rank: number; entry: LeaderboardEntry | null; totalPlayers: number }> {
  try {
    const leaderboard = await getGlobalLeaderboard();
    const playerIndex = leaderboard.findIndex(p => p.username === username);
    
    return {
      rank: playerIndex >= 0 ? playerIndex + 1 : -1,
      entry: playerIndex >= 0 ? (leaderboard[playerIndex] || null) : null,
      totalPlayers: leaderboard.length
    };
  } catch (error) {
    console.error('Error getting player rank:', error);
    return { rank: -1, entry: null, totalPlayers: 0 };
  }
}

// Clear global leaderboard (moderators only)
async function clearGlobalLeaderboard(): Promise<void> {
  try {
    await redis.set(LEADERBOARD_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing global leaderboard:', error);
    throw error;
  }
}

// Get leaderboard statistics
async function getLeaderboardStats(): Promise<{ totalPlayers: number; totalGames: number; averageScore: number; topScore: number }> {
  try {
    const leaderboard = await getGlobalLeaderboard();
    
    if (leaderboard.length === 0) {
      return { totalPlayers: 0, totalGames: 0, averageScore: 0, topScore: 0 };
    }
    
    const totalGames = leaderboard.reduce((sum, player) => sum + player.gamesPlayed, 0);
    const totalScore = leaderboard.reduce((sum, player) => sum + player.score, 0);
    const averageScore = Math.round(totalScore / leaderboard.length);
    const topScore = Math.max(...leaderboard.map(p => p.score));
    
    return {
      totalPlayers: leaderboard.length,
      totalGames,
      averageScore,
      topScore
    };
  } catch (error) {
    console.error('Error getting leaderboard stats:', error);
    return { totalPlayers: 0, totalGames: 0, averageScore: 0, topScore: 0 };
  }
}

// Check if user is moderator
async function checkIsModerator(): Promise<boolean> {
  try {
    const { subredditName } = context;
    
    if (!subredditName) {
      return false;
    }

    // Get current user
    const currentUser = await reddit.getCurrentUsername();
    
    if (!currentUser) {
      return false;
    }

    // Get subreddit and check moderators
    const subreddit = await reddit.getSubredditById(context.subredditId);
    if (!subreddit) {
      return false;
    }
    
    const moderators = reddit.getModerators({ subredditName: subreddit.name });
    
    // Check if current user is a moderator
    const moderatorList = await moderators.all();
    return moderatorList.some((mod: any) => mod.username === currentUser);
  } catch (error) {
    console.error('Error checking moderator status:', error);
    return false;
  }
}

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
      ]);

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

// Leaderboard endpoints (matching your specification)
router.post('/submit-answer', async (req, res): Promise<void> => {
  try {
    const { username, correct } = req.body;
    
    if (!username) {
      res.status(400).json({
        status: 'error',
        message: 'Username is required',
      });
      return;
    }

    // Get current leaderboard from Redis
    const leaderboardData = await redis.get('global_leaderboard');
    const leaderboard = leaderboardData ? JSON.parse(leaderboardData) : {};
    
    // Initialize user if they don't exist
    if (!leaderboard[username]) {
      leaderboard[username] = { score: 0, plays: 0 };
    }
    
    // Update user stats
    leaderboard[username].plays += 1;
    if (correct) {
      leaderboard[username].score += 1;
    }
    
    // Save updated leaderboard to Redis
    await redis.set('global_leaderboard', JSON.stringify(leaderboard));
    
    res.json({
      success: true,
      leaderboard: leaderboard[username],
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit answer',
    });
  }
});

// Submit game score to global leaderboard
router.post('/api/submit-game-score', async (req, res): Promise<void> => {
  try {
    const { username, gameScore, correctAnswers, totalQuestions } = req.body;
    
    if (!username || gameScore === undefined || correctAnswers === undefined || totalQuestions === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: username, gameScore, correctAnswers, totalQuestions',
      });
      return;
    }

    // Update the global leaderboard
    await updatePlayerScore(username, gameScore, correctAnswers, totalQuestions);
    
    // Get the player's new rank
    const playerRank = await getPlayerRank(username);
    
    res.json({
      success: true,
      playerRank: playerRank.rank,
      playerEntry: playerRank.entry,
      totalPlayers: playerRank.totalPlayers,
    });
  } catch (error) {
    console.error('Error submitting game score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit game score',
    });
  }
});

// Get global leaderboard
router.get('/leaderboard', async (_req, res): Promise<void> => {
  try {
    // Get global leaderboard (all players)
    const leaderboard = await getGlobalLeaderboard();
    
    // Get leaderboard stats
    const stats = await getLeaderboardStats();
    
    res.json({
      success: true,
      leaderboard,
      stats,
    });
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard',
      leaderboard: [],
      stats: {
        totalPlayers: 0,
        totalGames: 0,
        averageScore: 0,
        topScore: 0
      }
    });
  }
});

// API-prefixed global leaderboard for client access
router.get('/api/global-leaderboard', async (_req, res): Promise<void> => {
  try {
    const leaderboard = await getGlobalLeaderboard();
    const stats = await getLeaderboardStats();
    res.json({ success: true, leaderboard, stats });
  } catch (error) {
    console.error('Error fetching global leaderboard (api):', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard',
      leaderboard: [],
      stats: { totalPlayers: 0, totalGames: 0, averageScore: 0, topScore: 0 }
    });
  }
});

// Check if current user is a moderator
router.get('/is-moderator', async (_req, res): Promise<void> => {
  try {
    // Get current user
    const currentUser = await reddit.getCurrentUsername();
    
    if (!currentUser) {
      res.json({
        success: false,
        isModerator: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Check if user is moderator
    const isModerator = await checkIsModerator();
    
    res.json({
      success: true,
      isModerator,
      username: currentUser,
    });
  } catch (error) {
    console.error('Error checking moderator status:', error);
    res.status(500).json({
      success: false,
      isModerator: false,
      error: 'Failed to check moderator status',
    });
  }
});

// API-prefixed moderator check
router.get('/api/is-moderator', async (_req, res): Promise<void> => {
  try {
    const currentUser = await reddit.getCurrentUsername();
    if (!currentUser) {
      res.json({ success: false, isModerator: false, error: 'User not authenticated' });
      return;
    }
    const isModerator = await checkIsModerator();
    res.json({ success: true, isModerator, username: currentUser });
  } catch (error) {
    console.error('Error checking moderator status (api):', error);
    res.status(500).json({ success: false, isModerator: false, error: 'Failed to check moderator status' });
  }
});

// Get balanced questions with duplicate prevention
router.get('/api/balanced-questions', async (req, res): Promise<void> => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
      return;
    }

    // Get used questions for this session
    const usedQuestionsKey = `used_questions:${sessionId}`;
    const usedQuestionsData = await redis.get(usedQuestionsKey);
    const usedQuestions = new Set(usedQuestionsData ? JSON.parse(usedQuestionsData) : []);

    // Also track globally used fake posts to prevent repetition across all players
    const globalUsedFakePostsKey = 'global_used_fake_posts';
    const globalUsedFakePostsData = await redis.get(globalUsedFakePostsKey);
    const globalUsedFakePosts = new Set(globalUsedFakePostsData ? JSON.parse(globalUsedFakePostsData) : []);

    // Define available subreddits with balanced truth/troll distribution
    // Expanded list for more variety and freshness
    const subreddits = [
      // Truth sources (real Reddit posts) - expanded for variety
      { name: 'AskReddit', type: 'truth' },
      { name: 'todayilearned', type: 'truth' },
      { name: 'mildlyinteresting', type: 'truth' },
      { name: 'showerthoughts', type: 'truth' },
      { name: 'explainlikeimfive', type: 'truth' },
      { name: 'science', type: 'truth' },
      { name: 'history', type: 'truth' },
      { name: 'technology', type: 'truth' },
      { name: 'unpopularopinion', type: 'truth' },
      { name: 'AmItheAsshole', type: 'truth' },
      { name: 'relationship_advice', type: 'truth' },
      { name: 'LifeProTips', type: 'truth' },
      { name: 'YouShouldKnow', type: 'truth' },
      { name: 'NoStupidQuestions', type: 'truth' },
      { name: 'OutOfTheLoop', type: 'truth' },
      { name: 'changemyview', type: 'truth' },
      // Troll sources (AI-generated fake posts)
      { name: 'AskReddit_fake', type: 'troll' },
      { name: 'todayilearned_fake', type: 'troll' },
      { name: 'mildlyinteresting_fake', type: 'troll' },
      { name: 'showerthoughts_fake', type: 'troll' },
      { name: 'explainlikeimfive_fake', type: 'troll' },
      { name: 'science_fake', type: 'troll' },
      { name: 'history_fake', type: 'troll' },
      { name: 'technology_fake', type: 'troll' },
      { name: 'unpopularopinion_fake', type: 'troll' },
      { name: 'AmItheAsshole_fake', type: 'troll' },
      { name: 'relationship_advice_fake', type: 'troll' },
      { name: 'LifeProTips_fake', type: 'troll' },
      { name: 'YouShouldKnow_fake', type: 'troll' },
      { name: 'NoStupidQuestions_fake', type: 'troll' },
      { name: 'OutOfTheLoop_fake', type: 'troll' },
      { name: 'changemyview_fake', type: 'troll' }
    ];

    // Separate truth and troll questions
    const truthSources = subreddits.filter(sub => sub.type === 'truth');
    const trollSources = subreddits.filter(sub => sub.type === 'troll');
    
    // Filter unused questions by type
    const availableTruth = truthSources.filter(sub => !usedQuestions.has(sub.name));
    const availableTroll = trollSources.filter(sub => !usedQuestions.has(sub.name));
    
    // Check if we need to reset the pool (when either type is exhausted)
    if (availableTruth.length === 0 || availableTroll.length === 0) {
      console.log(`🔄 Question pool refreshed for session ${sessionId} - maintaining truth/troll balance`);
      await redis.del(usedQuestionsKey);
      usedQuestions.clear();
      availableTruth.push(...truthSources);
      availableTroll.push(...trollSources);
    }

    // Get session balance info
    const balanceKey = `balance:${sessionId}`;
    const balanceData = await redis.get(balanceKey);
    const balance = balanceData ? JSON.parse(balanceData) : { truth: 0, troll: 0 };
    
    // Determine which type to select (maintain 50/50 balance)
    let selectedType: 'truth' | 'troll';
    if (balance.truth === balance.troll) {
      // Equal counts, choose randomly
      selectedType = Math.random() < 0.5 ? 'truth' : 'troll';
    } else if (balance.truth < balance.troll) {
      // Need more truth questions
      selectedType = 'truth';
    } else {
      // Need more troll questions
      selectedType = 'troll';
    }
    
    // Select from appropriate pool
    const selectedPool = selectedType === 'truth' ? availableTruth : availableTroll;
    const selectedSubreddit = selectedPool[Math.floor(Math.random() * selectedPool.length)];
    
    if (!selectedSubreddit) {
      // Fallback if no subreddit available
      res.json({
        success: true,
        subreddit: 'AskReddit',
        usedCount: 0,
        totalAvailable: subreddits.length,
        poolRefreshed: false
      });
      return;
    }
    
    // Mark this subreddit as used and update balance
    usedQuestions.add(selectedSubreddit.name);
    balance[selectedType]++;
    
    // Save updated tracking data
    await Promise.all([
      redis.set(usedQuestionsKey, JSON.stringify([...usedQuestions])),
      redis.set(balanceKey, JSON.stringify(balance))
    ]);
    
    // Set expiration for session data (24 hours)
    await Promise.all([
      redis.expire(usedQuestionsKey, 86400),
      redis.expire(balanceKey, 86400)
    ]);

    // Return the base subreddit name (without _fake suffix for troll questions)
    const baseSubreddit = selectedSubreddit.name.replace('_fake', '');

    res.json({
      success: true,
      subreddit: baseSubreddit,
      questionType: selectedType,
      usedCount: usedQuestions.size,
      totalAvailable: subreddits.length,
      balance: balance,
      poolRefreshed: (availableTruth.length === truthSources.length && availableTroll.length === trollSources.length),
      globalUsedFakePosts: globalUsedFakePosts.size
    });

  } catch (error) {
    console.error('Error getting balanced questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get balanced questions',
      subreddit: 'AskReddit' // Fallback
    });
  }
});

// Track fake post usage globally
router.post('/api/track-fake-post', async (req, res): Promise<void> => {
  try {
    const { postId } = req.body;
    
    if (!postId) {
      res.status(400).json({
        success: false,
        error: 'Post ID is required',
      });
      return;
    }

    const globalUsedFakePostsKey = 'global_used_fake_posts';
    const globalUsedFakePostsData = await redis.get(globalUsedFakePostsKey);
    const globalUsedFakePosts = new Set(globalUsedFakePostsData ? JSON.parse(globalUsedFakePostsData) : []);
    
    // Add the post ID to used posts
    globalUsedFakePosts.add(postId);
    
    // Save back to Redis with expiration (reset weekly to allow variety)
    await redis.set(globalUsedFakePostsKey, JSON.stringify([...globalUsedFakePosts]));
    await redis.expire(globalUsedFakePostsKey, 604800); // 7 days
    
    res.json({
      success: true,
      totalUsedPosts: globalUsedFakePosts.size
    });

  } catch (error) {
    console.error('Error tracking fake post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track fake post'
    });
  }
});

// Track truth post usage globally to prevent repetition across sessions
router.post('/api/track-truth-post', async (req, res): Promise<void> => {
  try {
    const { postId, subreddit } = req.body;
    
    if (!postId) {
      res.status(400).json({
        success: false,
        error: 'Post ID is required',
      });
      return;
    }

    // Track truth posts with timestamps for session-based memory
    const globalUsedTruthPostsKey = 'global_used_truth_posts';
    const globalUsedTruthPostsData = await redis.get(globalUsedTruthPostsKey);
    const globalUsedTruthPosts = globalUsedTruthPostsData ? JSON.parse(globalUsedTruthPostsData) : {};
    
    // Add the post ID with timestamp and subreddit
    globalUsedTruthPosts[postId] = {
      timestamp: Date.now(),
      subreddit: subreddit || 'unknown'
    };
    
    // Clean up old entries (older than 5 sessions worth of time - approximately 1 hour)
    const fiveHoursAgo = Date.now() - (5 * 60 * 60 * 1000);
    Object.keys(globalUsedTruthPosts).forEach(key => {
      if (globalUsedTruthPosts[key].timestamp < fiveHoursAgo) {
        delete globalUsedTruthPosts[key];
      }
    });
    
    // Save back to Redis with expiration (reset daily to allow variety)
    await redis.set(globalUsedTruthPostsKey, JSON.stringify(globalUsedTruthPosts));
    await redis.expire(globalUsedTruthPostsKey, 86400); // 24 hours
    
    res.json({
      success: true,
      totalUsedPosts: Object.keys(globalUsedTruthPosts).length
    });

  } catch (error) {
    console.error('Error tracking truth post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track truth post'
    });
  }
});

// Get recently used truth posts for filtering (session-based only)
router.get('/api/recent-truth-posts', async (req, res): Promise<void> => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      res.status(400).json({
        success: false,
        error: 'Session ID is required',
        recentPosts: []
      });
      return;
    }

    // Get session-specific used truth posts (not global)
    const sessionUsedTruthPostsKey = `session_used_truth_posts:${sessionId}`;
    const sessionUsedTruthPostsData = await redis.get(sessionUsedTruthPostsKey);
    const sessionUsedTruthPosts = sessionUsedTruthPostsData ? JSON.parse(sessionUsedTruthPostsData) : {};
    
    // Return only post IDs used in this specific session
    const recentPosts = Object.keys(sessionUsedTruthPosts);
    
    console.log(`📋 Session ${sessionId} has used ${recentPosts.length} truth posts`);
    
    res.json({
      success: true,
      recentPosts,
      totalTracked: recentPosts.length
    });

  } catch (error) {
    console.error('Error getting recent truth posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent truth posts',
      recentPosts: []
    });
  }
});

// Fetch fresh truth posts directly from Reddit API (backend-side)
router.get('/api/fetch-fresh-truth-posts', async (req, res): Promise<void> => {
  try {
    const { subreddit, sessionId } = req.query;
    
    if (!subreddit || !sessionId) {
      res.status(400).json({
        success: false,
        error: 'Subreddit and sessionId are required',
      });
      return;
    }

    console.log(`🌐 [SERVER] Fetching fresh truth posts from Reddit API for r/${subreddit} (session: ${sessionId})`);

    // Get session-specific used posts to avoid duplicates within this session
    const sessionUsedTruthPostsKey = `session_used_truth_posts:${sessionId}`;
    const sessionUsedTruthPostsData = await redis.get(sessionUsedTruthPostsKey);
    const sessionUsedTruthPosts = sessionUsedTruthPostsData ? JSON.parse(sessionUsedTruthPostsData) : {};

    // Try multiple Reddit API strategies for maximum freshness
    const strategies = [
      `https://www.reddit.com/r/${subreddit}/new.json?limit=50`,
      `https://www.reddit.com/r/${subreddit}/top.json?limit=50&t=day`,
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=50`,
      `https://www.reddit.com/r/all/new.json?limit=100` // Fallback to r/all
    ];

    let response: Response;
    let usedStrategy = 0;
    let posts: any[] = [];

    for (let i = 0; i < strategies.length; i++) {
      const strategyUrl = strategies[i];
      if (!strategyUrl) continue;
      
      console.log(`🔗 [SERVER] Making fresh Reddit API call to: ${strategyUrl}`);
      response = await fetch(strategyUrl);
      
      if (response.ok) {
        const data: any = await response.json();
        posts = data.data?.children || [];
        if (posts.length > 0) {
          usedStrategy = i;
          console.log(`✅ [SERVER] Successfully fetched ${posts.length} posts from strategy ${i}`);
          break;
        }
      } else {
        console.warn(`❌ [SERVER] Strategy ${i} failed with status:`, response.status);
      }
    }

    if (posts.length === 0) {
      throw new Error('No posts found from any Reddit API strategy');
    }

    // Filter out posts without selftext and session-used posts
    const availablePosts = posts.filter(post => {
      const postData = post.data;
      return postData.selftext && 
             postData.selftext.trim().length > 50 && 
             !postData.selftext.includes('[removed]') &&
             !postData.selftext.includes('[deleted]') &&
             !sessionUsedTruthPosts[postData.id]; // Exclude session-used posts
    });

    // If all posts are used in this session, fall back to all available posts
    const finalPosts = availablePosts.length > 0 ? availablePosts : posts.filter(post => {
      const postData = post.data;
      return postData.selftext && 
             postData.selftext.trim().length > 50 && 
             !postData.selftext.includes('[removed]') &&
             !postData.selftext.includes('[deleted]');
    });

    if (finalPosts.length === 0) {
      throw new Error('No suitable text posts found');
    }

    // Randomly select a fresh post
    const randomPost = finalPosts[Math.floor(Math.random() * finalPosts.length)];
    const postData = randomPost.data;

    console.log(`🎯 [SERVER] Selected fresh truth post:`, {
      id: postData.id,
      title: postData.title.substring(0, 60) + '...',
      subreddit: postData.subreddit,
      author: postData.author,
      upvotes: postData.ups,
      strategy: usedStrategy
    });

    // Track this post as used in this session
    sessionUsedTruthPosts[postData.id] = {
      timestamp: Date.now(),
      subreddit: postData.subreddit
    };

    // Save session-specific tracking
    await redis.set(sessionUsedTruthPostsKey, JSON.stringify(sessionUsedTruthPosts));
    await redis.expire(sessionUsedTruthPostsKey, 3600); // 1 hour expiration

    res.json({
      success: true,
      post: {
        id: postData.id,
        title: postData.title,
        body: postData.selftext.length > 300 
          ? postData.selftext.substring(0, 300) + '...' 
          : postData.selftext,
        subreddit: postData.subreddit,
        author: postData.author,
        upvotes: postData.ups
      },
      strategy: usedStrategy,
      totalAvailable: finalPosts.length,
      sessionUsedCount: Object.keys(sessionUsedTruthPosts).length
    });

  } catch (error) {
    console.error('❌ [SERVER] Error fetching fresh truth posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fresh truth posts from Reddit',
    });
  }
});

// Get fake post usage statistics
router.get('/api/fake-post-stats', async (_req, res): Promise<void> => {
  try {
    const globalUsedFakePostsKey = 'global_used_fake_posts';
    const globalUsedFakePostsData = await redis.get(globalUsedFakePostsKey);
    const globalUsedFakePosts = new Set(globalUsedFakePostsData ? JSON.parse(globalUsedFakePostsData) : []);
    
    // Estimate total available fake posts (this would be the count from kiroService.ts)
    const estimatedTotalFakePosts = 25; // Update this based on actual count
    
    res.json({
      success: true,
      usedPosts: globalUsedFakePosts.size,
      totalPosts: estimatedTotalFakePosts,
      availablePosts: estimatedTotalFakePosts - globalUsedFakePosts.size,
      usagePercentage: Math.round((globalUsedFakePosts.size / estimatedTotalFakePosts) * 100)
    });

  } catch (error) {
    console.error('Error getting fake post stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fake post statistics'
    });
  }
});

// Reset leaderboard (moderators only)
router.post('/reset-leaderboard', async (_req, res): Promise<void> => {
  try {
    // Check if user is moderator
    const isModerator = await checkIsModerator();
    
    if (!isModerator) {
      res.status(403).json({
        success: false,
        error: 'Access denied. Only moderators can reset the leaderboard.',
      });
      return;
    }

    // Reset the global leaderboard
    await clearGlobalLeaderboard();
    
    res.json({
      success: true,
      message: 'Leaderboard has been reset successfully!',
    });
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset leaderboard',
    });
  }
});

// API-prefixed reset leaderboard
router.post('/api/reset-leaderboard', async (_req, res): Promise<void> => {
  try {
    const isModerator = await checkIsModerator();
    if (!isModerator) {
      res.status(403).json({ success: false, error: 'Access denied. Only moderators can reset the leaderboard.' });
      return;
    }
    await clearGlobalLeaderboard();
    res.json({ success: true, message: 'Leaderboard has been reset successfully!' });
  } catch (error) {
    console.error('Error resetting leaderboard (api):', error);
    res.status(500).json({ success: false, error: 'Failed to reset leaderboard' });
  }
});

// Game-specific endpoints (existing Redis-based)
router.post('/api/save-score', async (req, res): Promise<void> => {
  try {
    const { username, score, accuracy } = req.body;
    const { postId } = context;

    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    // Save score to Redis with post-specific key
    const scoreKey = `scores:${postId}`;
    const scoreData = {
      username: username || 'Anonymous',
      score: parseInt(score) || 0,
      accuracy: parseInt(accuracy) || 0,
      timestamp: Date.now(),
    };

    // Use Redis hash to store individual scores with timestamp as field
    const scoreField = `${Date.now()}-${scoreData.username}`;
    await redis.hSet(scoreKey, { [scoreField]: JSON.stringify(scoreData) });

    res.json({
      status: 'success',
      message: 'Score saved successfully',
    });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save score',
    });
  }
});

router.get('/api/leaderboard', async (_req, res): Promise<void> => {
  try {
    const { postId } = context;

    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    // Get all scores from Redis hash
    const scoreKey = `scores:${postId}`;
    const allScores = await redis.hGetAll(scoreKey);

    // Parse and sort scores
    const leaderboard = Object.values(allScores)
      .map((scoreStr) => {
        try {
          return JSON.parse(scoreStr);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 50) // Top 50 scores
      .map((scoreData, index) => ({
        rank: index + 1,
        ...scoreData,
      }));

    res.json({
      status: 'success',
      leaderboard,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch leaderboard',
      leaderboard: [],
    });
  }
});

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
