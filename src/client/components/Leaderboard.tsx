import { useEffect, useState } from 'react';
import {
  getLeaderboard as getGlobalLeaderboard,
  checkModeratorStatus,
  resetLeaderboard as resetServerLeaderboard,
  type GlobalLeaderboardEntry
} from '../../shared/apiService';

// Local leaderboard types and functions
interface LeaderboardEntry {
  username: string;
  score: number;
  accuracy: number;
  timestamp: number;
}

const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const stored = localStorage.getItem('leaderboard');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const clearLeaderboard = (): void => {
  localStorage.removeItem('leaderboard');
};

interface LeaderboardProps {
  onPlayAgain: () => void;
  onBackToSplash: () => void;
  currentUserScore?: number | undefined;
  currentUsername?: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return `#${rank}`;
  }
};

const LeaderboardRow = ({
  entry,
  rank,
  isCurrentUser = false
}: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser?: boolean;
}) => (
  <tr className={`group transition-all duration-200 ${isCurrentUser
    ? 'bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400'
    : 'hover:bg-gray-50 hover:shadow-sm'
    }`}>
    <td className="px-3 sm:px-4 py-4 text-center">
      <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-sm sm:text-base ${rank <= 3 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' :
        'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
        } transition-all duration-200`}>
        {getRankIcon(rank)}
      </div>
    </td>
    <td className="px-3 sm:px-4 py-4">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${isCurrentUser ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'
          }`}>
          {entry.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <span className={`font-semibold text-sm sm:text-base ${isCurrentUser ? 'text-orange-700' : 'text-gray-900'}`}>
            {entry.username}
          </span>
          {isCurrentUser && (
            <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
              You
            </span>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {new Date(entry.timestamp).toLocaleDateString()}
          </div>
        </div>
      </div>
    </td>
    <td className="px-3 sm:px-4 py-4 text-center">
      <div className="font-bold text-lg sm:text-xl text-gray-900">
        {entry.score.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500">points</div>
    </td>
    <td className="px-3 sm:px-4 py-4 text-center">
      <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${entry.accuracy >= 90 ? 'bg-green-100 text-green-700 border border-green-200' :
        entry.accuracy >= 80 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
          entry.accuracy >= 70 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
            'bg-red-100 text-red-700 border border-red-200'
        }`}>
        {entry.accuracy >= 90 ? '🔥' : entry.accuracy >= 80 ? '⚡' : entry.accuracy >= 70 ? '👍' : '💪'} {entry.accuracy}%
      </span>
    </td>
  </tr>
);

export const Leaderboard = ({ onPlayAgain, onBackToSplash, currentUserScore, currentUsername }: LeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [leaderboardStats, setLeaderboardStats] = useState({
    totalPlayers: 0,
    totalGames: 0,
    averageScore: 0,
    topScore: 0
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(true);
  const [isModerator, setIsModerator] = useState(false);
  const [showModResetConfirm, setShowModResetConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const fetchGlobalLeaderboard = async () => {
    try {
      const response = await getGlobalLeaderboard();
      if (response.success) {
        setGlobalLeaderboard(response.leaderboard);
        setLeaderboardStats(response.stats);
      } else {
        console.error('Failed to fetch global leaderboard:', response.error);
        setShowGlobalLeaderboard(false);
      }
    } catch (error) {
      console.error('Failed to fetch global leaderboard:', error);
      setShowGlobalLeaderboard(false);
    }
  };

  useEffect(() => {
    // Load both leaderboards
    setLeaderboard(getLeaderboard());

    // Fetch global leaderboard from server
    fetchGlobalLeaderboard();

    // Check if current user is a moderator
    const checkModerator = async () => {
      try {
        const modStatus = await checkModeratorStatus();
        setIsModerator(modStatus.isModerator);
      } catch (error) {
        console.error('Failed to check moderator status:', error);
      }
    };

    checkModerator();

    // Set up periodic refresh for real-time updates
    const interval = setInterval(fetchGlobalLeaderboard, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const handleClearLeaderboard = () => {
    clearLeaderboard();
    setLeaderboard([]);
    setShowClearConfirm(false);
  };

  const handleModeratorReset = async () => {
    setResetLoading(true);
    try {
      const result = await resetServerLeaderboard();

      if (result.success) {
        // Clear both leaderboards
        setGlobalLeaderboard([]);
        setLeaderboardStats({
          totalPlayers: 0,
          totalGames: 0,
          averageScore: 0,
          topScore: 0
        });
        clearLeaderboard();
        setLeaderboard([]);

        // Show success message
        alert(result.message || 'Global leaderboard has been reset successfully!');
      } else {
        alert(result.error || 'Failed to reset leaderboard');
      }
    } catch (error) {
      console.error('Error resetting leaderboard:', error);
      alert('Failed to reset leaderboard');
    } finally {
      setResetLoading(false);
      setShowModResetConfirm(false);
    }
  };

  const isCurrentUserEntry = (entry: LeaderboardEntry, _index: number) => {
    if (!currentUsername || !currentUserScore) return false;
    return entry.username.toLowerCase() === currentUsername.toLowerCase() &&
      entry.score === currentUserScore;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 flex items-center justify-center space-x-3">
            <span className="text-4xl sm:text-5xl">🏆</span>
            <span>Leaderboard</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Top Truth or Troll players worldwide</p>
        </div>

        {/* Global Stats Display */}
        {showGlobalLeaderboard && leaderboardStats.totalPlayers > 0 && (
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white rounded-xl shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h2 className="text-lg sm:text-xl font-bold flex items-center justify-center space-x-2 mb-4">
                <span>🌍</span>
                <span>Global Stats</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold">{leaderboardStats.totalPlayers}</p>
                  <p className="text-blue-100 text-xs sm:text-sm">Players</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold">{leaderboardStats.totalGames}</p>
                  <p className="text-blue-100 text-xs sm:text-sm">Games</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold">{leaderboardStats.averageScore}</p>
                  <p className="text-blue-100 text-xs sm:text-sm">Avg Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold">{leaderboardStats.topScore}</p>
                  <p className="text-blue-100 text-xs sm:text-sm">High Score</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Score Display */}
        {currentUserScore !== undefined && (
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white rounded-xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center space-x-2">
                <span>🎉</span>
                <span>Your Latest Score</span>
              </h2>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">{currentUserScore}</p>
              <p className="text-orange-100 text-sm sm:text-base">
                {currentUserScore >= 800 ? "Outstanding! You're a master detective! 🕵️" :
                  currentUserScore >= 600 ? "Great job! Keep playing to improve your ranking! 🚀" :
                    currentUserScore >= 400 ? "Good start! Practice makes perfect! 💪" :
                      "Keep trying! You'll get better with practice! 🎯"}
              </p>
            </div>
          </div>
        )}
        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <span className="text-orange-500">📊</span>
                  <span>{showGlobalLeaderboard ? 'Global Leaderboard' : 'Local Game Scores'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {showGlobalLeaderboard ? 'Shared across all players - persists between sessions' : 'Your local browser scores only'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={fetchGlobalLeaderboard}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setShowGlobalLeaderboard(!showGlobalLeaderboard)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                >
                  Switch View
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Accuracy
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {showGlobalLeaderboard ? (
                  // Global Leaderboard (Persistent across all players)
                  globalLeaderboard.length > 0 ? (
                    globalLeaderboard.map((entry, index) => (
                      <tr key={entry.username} className={`group transition-all duration-200 ${entry.username.toLowerCase() === currentUsername?.toLowerCase()
                        ? 'bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400'
                        : 'hover:bg-gray-50 hover:shadow-sm'
                        }`}>
                        <td className="px-3 sm:px-4 py-4 text-center">
                          <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-sm sm:text-base ${index < 3 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' :
                            'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                            } transition-all duration-200`}>
                            {getRankIcon(index + 1)}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-4">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${entry.username.toLowerCase() === currentUsername?.toLowerCase() ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                              }`}>
                              {entry.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className={`font-semibold text-sm sm:text-base ${entry.username.toLowerCase() === currentUsername?.toLowerCase() ? 'text-orange-700' : 'text-gray-900'}`}>
                                {entry.username}
                              </span>
                              {entry.username.toLowerCase() === currentUsername?.toLowerCase() && (
                                <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                                  You
                                </span>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                {entry.gamesPlayed} games • {new Date(entry.lastPlayed).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-center">
                          <div className="font-bold text-lg sm:text-xl text-gray-900">
                            {entry.score}
                          </div>
                          <div className="text-xs text-gray-500">points</div>
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${entry.accuracy >= 90 ? 'bg-green-100 text-green-700 border border-green-200' :
                            entry.accuracy >= 80 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                              entry.accuracy >= 70 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                            {entry.accuracy >= 90 ? '🔥' : entry.accuracy >= 80 ? '⚡' : entry.accuracy >= 70 ? '👍' : '💪'} {entry.accuracy}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        <div className="space-y-3">
                          <p className="text-lg">🌟 No players yet!</p>
                          <p className="text-sm">Be the first to set a score on the global leaderboard.</p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                            <p className="text-blue-800 text-xs font-medium">
                              🌍 This leaderboard is shared by all players and persists between sessions
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                ) : (
                  // Original localStorage Leaderboard (Game-based)
                  leaderboard.length > 0 ? (
                    leaderboard.slice(0, 10).map((entry, index) => (
                      <LeaderboardRow
                        key={`${entry.username}-${entry.timestamp}`}
                        entry={entry}
                        rank={index + 1}
                        isCurrentUser={isCurrentUserEntry(entry, index)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        <div className="space-y-2">
                          <p className="text-lg">🎯 No game scores yet!</p>
                          <p className="text-sm">Complete a full game to see scores here.</p>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span>Play Again</span>
          </button>
          <button
            onClick={onBackToSplash}
            className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Main Menu</span>
          </button>

          {/* Moderator Reset Button */}
          {isModerator && (globalLeaderboard.length > 0 || leaderboard.length > 0) && (
            <button
              onClick={() => setShowModResetConfirm(true)}
              disabled={resetLoading}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 sm:px-6 py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
              <span>{resetLoading ? 'Resetting...' : 'Reset All Scores'}</span>
            </button>
          )}

          {/* Local Clear Button */}
          {leaderboard.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 7a1 1 0 112 0v4a1 1 0 11-2 0V7z" clipRule="evenodd" />
              </svg>
              <span>Clear Local Scores</span>
            </button>
          )}
        </div>

        {/* Local Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-gray-100 transform animate-scaleIn">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Clear Local Scores?</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  This will clear your local game scores only. Server leaderboard will remain intact.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleClearLeaderboard}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Clear Local Scores
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Moderator Reset Confirmation Modal */}
        {showModResetConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-gray-100 transform animate-scaleIn">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">🛡️ Moderator Reset</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  <strong>Warning:</strong> This will permanently delete ALL leaderboard data for everyone in this subreddit. This action cannot be undone.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-purple-800 text-xs font-medium">
                    Only subreddit moderators can perform this action
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleModeratorReset}
                  disabled={resetLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  {resetLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <span>Reset All Leaderboards</span>
                  )}
                </button>
                <button
                  onClick={() => setShowModResetConfirm(false)}
                  disabled={resetLoading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.2s ease-out;
          }
        `}</style>

        {/* Stats Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Rankings update in real-time • Challenge your friends to beat your score!</p>
        </div>
      </div>
    </div>
  );
};
