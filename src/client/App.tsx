import { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { GameRound } from './components/GameRound';
import { Leaderboard } from './components/Leaderboard';
import { submitGameScore } from '../shared/apiService';

type Screen = 'splash' | 'game' | 'leaderboard';

export const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [gameScore, setGameScore] = useState<number | undefined>();
  const [username, setUsername] = useState<string>('');
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const [gameSessionKey, setGameSessionKey] = useState(0);

  const [totalQuestions] = useState(10);
  useEffect(() => {
    // Fetch Reddit username from server
    const fetchUsername = async () => {
      try {
        const response = await fetch('/api/init');
        if (response.ok) {
          const data = await response.json();
          setUsername(data.username || 'Anonymous');
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
        setUsername('Anonymous');
      }
    };

    fetchUsername();

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

  const handlePlayClick = () => {
    console.log('🎮 Starting new game session - forcing fresh Truth post fetch');
    setCurrentScreen('game');
    setGameScore(undefined);
    setGameSessionKey(prev => prev + 1); // Force GameRound component remount
  };

  const handleGameComplete = async (finalScore: number, correctCount: number) => {
    setGameScore(finalScore);

    try {
      // Submit to global leaderboard
      await submitGameScore(username, finalScore, correctCount, totalQuestions);
      console.log('Score submitted to global leaderboard');
    } catch (error) {
      console.error('Failed to submit to global leaderboard:', error);
    }

    setCurrentScreen('leaderboard');
  };

  const handleViewLeaderboard = () => {
    setCurrentScreen('leaderboard');
  };

  const handlePlayAgain = () => {
    console.log('🔄 Starting new game session (Play Again) - forcing fresh Truth post fetch');
    setCurrentScreen('game');
    setGameScore(undefined);
    setGameSessionKey(prev => prev + 1); // Force GameRound component remount
  };

  const handleBackToSplash = () => {
    setCurrentScreen('splash');
  };

  const handleAnswerSubmitted = () => {
    // Force leaderboard refresh by updating key
    setLeaderboardKey(prev => prev + 1);
  };

  switch (currentScreen) {
    case 'splash':
      return <SplashScreen onPlayClick={handlePlayClick} username={username} />;

    case 'game':
      return (
        <GameRound
          key={gameSessionKey}
          onGameComplete={handleGameComplete}
          onViewLeaderboard={handleViewLeaderboard}
          username={username}
          onAnswerSubmitted={handleAnswerSubmitted}
        />
      );

    case 'leaderboard':
      return (
        <Leaderboard
          key={leaderboardKey}
          onPlayAgain={handlePlayAgain}
          onBackToSplash={handleBackToSplash}
          currentUserScore={gameScore}
          currentUsername={username}
        />
      );

    default:
      return <SplashScreen onPlayClick={handlePlayClick} username={username} />;
  }
};
