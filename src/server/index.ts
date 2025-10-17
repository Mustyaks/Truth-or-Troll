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

// New leaderboard endpoints using KV store
router.post('/api/submit-answer', async (req, res): Promise<void> => {
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

router.get('/api/leaderboard-kv', async (_req, res): Promise<void> => {
  try {
    // Get leaderboard from Redis
    const leaderboardData = await redis.get('global_leaderboard');
    const leaderboard = leaderboardData ? JSON.parse(leaderboardData) : {};
    
    // Sort by score and get top 10
    const sorted = Object.entries(leaderboard)
      .sort(([, a], [, b]) => (b as any).score - (a as any).score)
      .slice(0, 10);
    
    res.json({
      topPlayers: sorted,
    });
  } catch (error) {
    console.error('Error fetching KV leaderboard:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch leaderboard',
      topPlayers: [],
    });
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
