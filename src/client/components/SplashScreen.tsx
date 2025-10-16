import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onPlayClick: (username: string) => void;
}

export const SplashScreen = ({ onPlayClick }: SplashScreenProps) => {
  const [username, setUsername] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayClick = () => {
    setShowUsernameInput(true);
  };

  const handleStartGame = () => {
    onPlayClick(username);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStartGame();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-red-600 text-white px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
        {/* Main title with staggered animation */}
        <div className="space-y-6">
          <h1 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <span className="inline-block animate-pulse">Truth</span>
            <span className="text-yellow-300 mx-2 sm:mx-4">or</span>
            <span className="inline-block animate-pulse delay-300">Troll</span>
          </h1>
          
          <p className={`text-lg sm:text-xl md:text-2xl font-medium opacity-90 transition-all duration-1000 delay-300 ${
            isLoaded ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Can you spot the fake Reddit posts?
          </p>
        </div>
        
        {!showUsernameInput ? (
          <div className={`space-y-6 transition-all duration-1000 delay-500 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <button
              onClick={handlePlayClick}
              className="group bg-white text-orange-600 px-8 sm:px-12 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:scale-105 hover:shadow-orange-500/25 active:scale-95 relative overflow-hidden"
            >
              <span className="relative z-10">Play Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </button>
            
            <p className="text-sm sm:text-base opacity-75 max-w-md mx-auto leading-relaxed px-4">
              Test your ability to distinguish real Reddit posts from AI-generated fakes. 
              How many can you get right?
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 text-xs sm:text-sm opacity-80">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-300">⚡</span>
                <span>Real Reddit Posts</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-300">🤖</span>
                <span>AI Generated Fakes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-300">🏆</span>
                <span>Global Leaderboard</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-md mx-auto animate-fadeIn">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 space-y-6 border border-white/20 shadow-2xl">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold">Join the Game</h2>
                <p className="text-sm sm:text-base opacity-90">
                  Your score will be saved to the leaderboard
                </p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter username (optional)"
                  className="w-full px-4 py-3 sm:py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 text-base sm:text-lg"
                  maxLength={20}
                  autoFocus
                />
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleStartGame}
                    className="flex-1 bg-white text-orange-600 py-3 sm:py-4 px-6 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Start Game
                  </button>
                  <button
                    onClick={() => setShowUsernameInput(false)}
                    className="px-6 py-3 sm:py-4 rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all duration-200 font-medium"
                  >
                    Back
                  </button>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm opacity-70 text-center">
                Leave blank to play as "Anonymous"
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className={`absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-center transition-all duration-1000 delay-700 ${
        isLoaded ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <p className="text-xs sm:text-sm px-4">
          🎯 Challenge your friends • 🏆 Climb the leaderboard • 🔥 Beat the AI
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};
