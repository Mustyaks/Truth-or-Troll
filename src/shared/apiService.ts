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

export interface LeaderboardResponse {
  topPlayers: [string, LeaderboardEntry][];
}

export async function submitAnswer(username: string, correct: boolean): Promise<SubmitAnswerResponse> {
  try {
    const response = await fetch('/api/submit-answer', {
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
    const response = await fetch('/api/leaderboard-kv');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}
