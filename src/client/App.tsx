import { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { GameRound } from './components/GameRound';
import { Leaderboard } from './components/Leaderboard';
import { addScore } from '../shared/leaderboardService';

type Screen = 'splash' | 'game' | 'leaderboard';

export const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [gameScore, setGameScore] = useState<number | undefined>();
  const [username, setUsername] = useState<string>('');
  useEffect(() => {
    // Detect if we're running inside a Reddit post
    const checkPostEnvironment = () => {
      // Check for Reddit's post environment indicators
      const isRedditPost = window.parent !== window || 
                          window.location !== window.parent.location ||
                          document.referrer.includes('reddit.com');
      // Could use this for post-specific behavior if needed
      console.log('Running in Reddit post:', isRedditPost);
    };

    checkPostEnvironment();
  }, []);

  const handlePlayClick = (playerUsername: string) => {
    setUsername(playerUsername || 'Anonymous');
    setCurrentScreen('game');
    setGameScore(undefined);
  };

  const handleGameComplete = (finalScore: number) => {
    setGameScore(finalScore);
    // Save score to leaderboard
    addScore(username, finalScore, 10);
    setCurrentScreen('leaderboard');
  };

  const handleViewLeaderboard = () => {
    setCurrentScreen('leaderboard');
  };

  const handlePlayAgain = () => {
    setCurrentScreen('game');
    setGameScore(undefined);
  };

  const handleBackToSplash = () => {
    setCurrentScreen('splash');
  };

  switch (currentScreen) {
    case 'splash':
      return <SplashScreen onPlayClick={handlePlayClick} />;
    
    case 'game':
      return (
        <GameRound
          onGameComplete={handleGameComplete}
          onViewLeaderboard={handleViewLeaderboard}
          username={username}
        />
      );
    
    case 'leaderboard':
      return (
        <Leaderboard
          onPlayAgain={handlePlayAgain}
          onBackToSplash={handleBackToSplash}
          currentUserScore={gameScore}
          currentUsername={username}
        />
      );
    
    default:
      return <SplashScreen onPlayClick={handlePlayClick} />;
  }
};
