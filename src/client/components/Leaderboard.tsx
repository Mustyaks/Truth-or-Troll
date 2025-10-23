import { useEffect, useState } from 'react';
import {
  getLeaderboard as getGlobalLeaderboard,
  checkModeratorStatus,
  resetLeaderboard as resetServerLeaderboard,
  type GlobalLeaderboardEntry
} from '../../shared/apiService';

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

export const Leaderboard = ({ onPlayAgain, onBackToSplash, currentUserScore, currentUsername }: LeaderboardProps) => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [leaderboardStats, setLeaderboardStats] = useState({
    totalPlayers: 0,
    totalGames: 0,
    averageScore: 0,
    topScore: 0
  });
  const [isModerator, setIsModerator] = useState(false);
  const [showModResetConfirm, setShowModResetConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchGlobalLeaderboard = async () => {
    try {
      const response = await getGlobalLeaderboard();
      if (response.success) {
        setGlobalLeaderboard(response.leaderboard);
        setLeaderboardStats(response.stats);
      } else {
        console.error('Failed to fetch global leaderboard:', response.error);
      }
    } catch (error) {
      console.error('Failed to fetch global leaderboard:', error);
    }
  };

  useEffect(() => {
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
    const interval = setInterval(fetchGlobalLeaderboard, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleModeratorReset = async () => {
    setResetLoading(true);
    try {
      const result = await resetServerLeaderboard();

      if (result.success) {
        // Clear leaderboard
        setGlobalLeaderboard([]);
        setLeaderboardStats({
          totalPlayers: 0,
          totalGames: 0,
          averageScore: 0,
          topScore: 0
        });

        // Show success toast
        showToast('Leaderboard cleared successfully.', 'success');
      } else {
        showToast('Failed to clear leaderboard. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error resetting leaderboard:', error);
      showToast('Failed to clear leaderboard. Please try again.', 'error');
    } finally {
      setResetLoading(false);
      setShowModResetConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4">
      <div className="max-w-5xl mx-auto">
        <div className="max-h-[700px] overflow-y-auto scroll-smooth pr-2">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 flex items-center justify-center space-x-3">
            <span className="text-4xl sm:text-5xl">🏆</span>
            <span>Leaderboard</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Top Truth or Troll players worldwide</p>
        </div>

        {/* Global Stats Display */}
        {leaderboardStats.totalPlayers > 0 && (
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
                  <span>Global Leaderboard</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Shared across all players - persists between sessions
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
                {/* Moderator Clear Scores Button */}
                {isModerator && globalLeaderboard.length > 0 && (
                  <button
                    onClick={() => setShowModResetConfirm(true)}
                    disabled={resetLoading}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{resetLoading ? 'Clearing...' : 'Clear Scores'}</span>
                  </button>
                )}
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
                {globalLeaderboard.length > 0 ? (
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
                                {entry.gamesPlayed} games • {new Date(entry.lastPlayed).toLocaleString()}
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

        </div>

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
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Clear Leaderboard</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Are you sure you want to clear all leaderboard scores? This action cannot be undone.
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
                      <span>Clearing...</span>
                    </>
                  ) : (
                    <span>Confirm</span>
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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <div className={`px-6 py-4 rounded-xl shadow-lg border-l-4 flex items-center space-x-3 ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {toast.type === 'success' ? (
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
