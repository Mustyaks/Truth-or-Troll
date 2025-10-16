export interface LeaderboardEntry {
  username: string;
  score: number;
  timestamp: number;
  accuracy: number;
}

const LEADERBOARD_KEY = 'truth-or-troll-leaderboard';
const MAX_ENTRIES = 50; // Keep top 50 scores

function getStorage() {
  try {
    // Check if we're in a browser environment
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      return (globalThis as any).localStorage;
    }
    return null;
  } catch {
    return null;
  }
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const storage = getStorage();
    if (!storage) return []; // Server-side or no localStorage
    
    const stored = storage.getItem(LEADERBOARD_KEY);
    if (!stored) return [];
    
    const entries: LeaderboardEntry[] = JSON.parse(stored);
    return entries.sort((a, b) => b.score - a.score); // Sort by score descending
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return [];
  }
}

export function addScore(username: string, score: number, totalRounds: number = 10): void {
  try {
    const currentLeaderboard = getLeaderboard();
    const accuracy = Math.round((score / (totalRounds * 100)) * 100); // Calculate accuracy percentage
    
    const newEntry: LeaderboardEntry = {
      username: username.trim() || 'Anonymous',
      score,
      timestamp: Date.now(),
      accuracy
    };
    
    // Add new entry
    currentLeaderboard.push(newEntry);
    
    // Sort by score and keep only top entries
    const sortedEntries = currentLeaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);
    
    const storage = getStorage();
    if (storage) {
      storage.setItem(LEADERBOARD_KEY, JSON.stringify(sortedEntries));
    }
  } catch (error) {
    console.error('Error saving score:', error);
  }
}

export function getUserRank(username: string, _score: number): number {
  const leaderboard = getLeaderboard();
  const userEntries = leaderboard.filter(entry => 
    entry.username.toLowerCase() === username.toLowerCase()
  );
  
  if (userEntries.length === 0) return -1;
  
  // Find the rank of the user's best score
  const bestUserScore = Math.max(...userEntries.map(entry => entry.score));
  const rank = leaderboard.findIndex(entry => entry.score === bestUserScore) + 1;
  
  return rank;
}

export function clearLeaderboard(): void {
  try {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(LEADERBOARD_KEY);
    }
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
  }
}
