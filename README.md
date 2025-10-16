# Truth or Troll

An interactive Reddit game that challenges players to distinguish between real Reddit posts and AI-generated fakes.

## What is Truth or Troll?

Truth or Troll is a deception detection game built on Reddit's Devvit platform. Players are presented with pairs of Reddit posts in each round and must determine which ones are genuine content from real Reddit users versus cleverly crafted AI-generated content designed to fool them. The game tests your ability to spot subtle differences in writing style, content authenticity, and the telltale signs of AI-generated text across various subreddits like r/todayilearned, r/cats, r/mildlyinteresting, and more.

## What Makes This Game Unique

- **Reddit-Native Experience**: Built directly into Reddit posts using Devvit, allowing seamless gameplay within the Reddit ecosystem without leaving the platform
- **Real vs AI Challenge**: Tests players' ability to spot the subtle differences between authentic human-generated content and AI-generated posts in an era where AI content is becoming increasingly sophisticated
- **Dynamic Round System**: Each of the 10 rounds presents two posts side-by-side - one real and one fake - with randomized selection from an expanding pool of content
- **Instant Visual Feedback**: Immediate feedback after each vote with color-coded results showing correct answers, wrong selections, and point rewards
- **Competitive Scoring System**: Features a 10-round game format with 100 points per correct answer, building competitive tension and encouraging accuracy
- **Social Gaming**: Leverages Reddit's community aspect with global leaderboards, accuracy tracking, and the ability to challenge friends
- **Educational Value**: Helps users develop critical thinking skills for identifying AI-generated content in the digital age - a crucial skill for modern internet literacy
- **Mobile-First Design**: Optimized for mobile Reddit users with responsive design, touch-friendly interactions, and smooth animations
- **Real-Time Leaderboards**: Global rankings with accuracy percentages and live score updates that encourage repeat play

## How to Play

### Getting Started

1. **Launch the Game**: Click the "Play Now" button on the vibrant orange-to-red gradient splash screen to begin your Truth or Troll challenge
2. **Understand the Format**: You'll play through exactly 10 rounds, with each round presenting you with two Reddit posts to analyze

### Gameplay Mechanics

3. **Analyze the Posts**: In each round, you'll see two Reddit posts displayed side-by-side with authentic formatting including:

   - Subreddit names (e.g., r/todayilearned, r/cats, r/mildlyinteresting, r/facepalm, r/houseplants)
   - Usernames and realistic upvote counts
   - Post titles and detailed body content
   - Authentic Reddit styling and layout

4. **Make Your Decision**: For each post, choose between two options:

   - **"Real Post"** (green button) - If you believe it's genuine content from a real Reddit user
   - **"Fake Post"** (red button) - If you think it's AI-generated content designed to mimic Reddit posts

5. **Get Instant Feedback**: After voting, you'll immediately see:

   - Whether your choice was correct with animated feedback messages
   - Visual indicators showing which post was real vs AI-generated
   - Points earned (100 points for correct answers)
   - Button highlighting showing your selection and the correct answer

6. **Progress Through Rounds**: After 2 seconds of feedback, the game automatically advances to the next round with fresh posts

### Progression and Competition

7. **Track Your Progress**: Watch your progress through the animated 10-round indicator at the bottom, with your current round pulsing in orange
8. **Monitor Your Score**: Your running score is displayed in the header and updates in real-time as you play
9. **View Leaderboards**: Access the global leaderboard at any time during gameplay to see how you rank against other players
10. **Complete the Game**: After all 10 rounds, you'll be automatically taken to the leaderboard to see your final results
11. **Check Your Stats**: View your final score, compare against top players, and see accuracy percentages
12. **Play Again**: Use "Play Again" to start a fresh 10-round game or "Main Menu" to return to the splash screen

## Technology Stack

- [Devvit](https://developers.reddit.com/): Reddit's developer platform for building immersive games
- [React](https://react.dev/): Frontend UI framework
- [TypeScript](https://www.typescriptlang.org/): Type safety and better development experience
- [Vite](https://vite.dev/): Fast build tool and development server
- [Express](https://expressjs.com/): Backend API server
- [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework for styling
- [Redis](https://redis.io/): Data persistence through Devvit's Redis integration

## Development Setup

> Make sure you have Node.js 22+ installed on your machine before running!

1. Clone this repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open the provided Reddit playtest URL to test the game
5. Edit game components in `src/client/components/` to customize gameplay

## Game Architecture

The game follows a client-server architecture:

- **Client** (`src/client/`): React-based frontend with game UI and user interactions
- **Server** (`src/server/`): Express API endpoints for game logic and Reddit integration
- **Shared** (`src/shared/`): TypeScript types and interfaces used by both client and server

### Key Components

- `SplashScreen.tsx`: Eye-catching entry point that invites players to start the game
- `GameRound.tsx`: Core gameplay component for presenting posts and collecting user choices
- API endpoints for game state management, scoring, and leaderboard functionality

## Available Commands

- `npm run dev`: Start development server with live Reddit integration testing
- `npm run build`: Build both client and server for production
- `npm run deploy`: Upload new version to Reddit
- `npm run launch`: Publish app for Reddit review and approval
- `npm run login`: Authenticate with Reddit developers platform
- `npm run check`: Run TypeScript checks, linting, and code formatting

## Development Notes

- The game runs within Reddit posts as a webview application
- Backend API calls are automatically authenticated through Reddit's system
- Use `npm run dev` and the provided playtest URL for full functionality testing
- Game state persists using Redis through Devvit's data storage capabilities

## Deployment

1. Build the application: `npm run build`
2. Deploy to Reddit: `npm run deploy`
3. Publish for review: `npm run launch`
4. Once approved, the game will be available to Reddit communities
