import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      // Splash Screen Configuration for Reddit Post
      appDisplayName: 'Truth or Troll',
      backgroundUri: 'default-splash.png',
      buttonLabel: '🎮 Play Game',
      description:
        'Test your ability to distinguish real Reddit posts from AI-generated fakes. Challenge your detective skills!',
      heading: '🎯 Truth or Troll',
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameType: 'truth-or-troll',
      version: '1.0.0',
      created: Date.now(),
    },
    subredditName: subredditName,
    title: '🎯 Truth or Troll - Can You Spot the Fake Reddit Posts? 🕵️',
  });
};
