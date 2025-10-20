import { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { GameRound } from './components/GameRound';
import { Leaderboard } from './components/Leaderboard';
// Local leaderboard function
const addScore = (username: string, score: number, totalQuestions: number) => {
  try {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    const accuracy = Math.round((score / (totalQuestions * 100)) * 100);

    leaderboard.push({
      username,
      score,
      accuracy,
      timestamp: Date.now()
    });

    // Keep only the latest 50 scores
    const sortedLeaderboard = leaderboard
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 50);

    localStorage.setItem('leaderboard', JSON.stringify(sortedLeaderboard));
  } catch (error) {
    console.error('Error saving score to local leaderboard:', error);
  }
};
import { submitGameScore } from '../shared/apiService';

type Screen = 'splash' | 'game' | 'leaderboard';

export const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [gameScore, setGameScore] = useState<number | undefined>();
  const [username, setUsername] = useState<string>('');
  const [leaderboardKey, setLeaderboardKey] = useState(0);

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
    setCurrentScreen('game');
    setGameScore(undefined);
  };

  const handleGameComplete = async (finalScore: number, correctCount: number) => {
    setGameScore(finalScore);

    // Save score to both local and global leaderboards
    addScore(username, finalScore, totalQuestions);

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
    setCurrentScreen('game');
    setGameScore(undefined);
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
