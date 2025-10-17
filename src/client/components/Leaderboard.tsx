import { useEffect, useState } from 'react';
import { getLeaderboard as getKVLeaderboard } from '../../shared/apiService';
import { getLeaderboard, clearLeaderboard, type LeaderboardEntry } from '../../shared/leaderboardService';

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
  const [kvLeaderboard, setKvLeaderboard] = useState<Array<[string, { score: number; plays: number }]>>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showKvLeaderboard, setShowKvLeaderboard] = useState(true);

  useEffect(() => {
    // Load both leaderboards
    setLeaderboard(getLeaderboard());

    // Fetch KV leaderboard from server
    const fetchKvLeaderboard = async () => {
      try {
        const response = await getKVLeaderboard();
        setKvLeaderboard(response.topPlayers);
      } catch (error) {
        console.error('Failed to fetch KV leaderboard:', error);
        setShowKvLeaderboard(false);
      }
    };

    fetchKvLeaderboard();
  }, []);

  const handleClearLeaderboard = () => {
    clearLeaderboard();
    setLeaderboard([]);
    setShowClearConfirm(false);
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
                  <span>{showKvLeaderboard ? 'Answer Accuracy Rankings' : 'Game Score Rankings'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {showKvLeaderboard ? 'Based on correct answers per attempt' : 'Based on total game scores'}
                </p>
              </div>
              <button
                onClick={() => setShowKvLeaderboard(!showKvLeaderboard)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                Switch View
              </button>
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
                {showKvLeaderboard ? (
                  // KV Leaderboard (Answer-based)
                  kvLeaderboard.length > 0 ? (
                    kvLeaderboard.map(([username, stats], index) => (
                      <tr key={username} className={`group transition-all duration-200 ${username.toLowerCase() === currentUsername?.toLowerCase()
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
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${username.toLowerCase() === currentUsername?.toLowerCase() ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                              }`}>
                              {username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className={`font-semibold text-sm sm:text-base ${username.toLowerCase() === currentUsername?.toLowerCase() ? 'text-orange-700' : 'text-gray-900'}`}>
                                {username}
                              </span>
                              {username.toLowerCase() === currentUsername?.toLowerCase() && (
                                <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                                  You
                                </span>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                {stats.plays} attempts
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-center">
                          <div className="font-bold text-lg sm:text-xl text-gray-900">
                            {stats.score}
                          </div>
                          <div className="text-xs text-gray-500">correct</div>
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${(stats.score / stats.plays) >= 0.9 ? 'bg-green-100 text-green-700 border border-green-200' :
                            (stats.score / stats.plays) >= 0.8 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                              (stats.score / stats.plays) >= 0.7 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                            {stats.plays > 0 ? `${Math.round((stats.score / stats.plays) * 100)}%` : '0%'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        <div className="space-y-2">
                          <p className="text-lg">🎯 No answers submitted yet!</p>
                          <p className="text-sm">Play the game to see accuracy rankings.</p>
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
          {leaderboard.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 7a1 1 0 112 0v4a1 1 0 11-2 0V7z" clipRule="evenodd" />
              </svg>
              <span>Clear Scores</span>
            </button>
          )}
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-gray-100 transform animate-scaleIn">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Clear Leaderboard?</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  This will permanently delete all scores and rankings. This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleClearLeaderboard}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Clear All Scores
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
