💡 This project is submitted for the “Best Kiro Developer Experience” category. It demonstrates how Kiro can enhance rapid iteration, debugging, and component generation within Devvit Web.
# Truth or Troll

An interactive Reddit game that challenges players to distinguish between real Reddit posts and AI-generated fakes in a fast-paced 10-round format.

## What is Truth or Troll?

Truth or Troll is a deception detection game built on Reddit's Devvit platform that presents players with **one post per round** - either a genuine Reddit post fetched live from the Reddit API or a carefully crafted AI-generated fake. Players must decide whether each post is "Real" or "Fake" across 10 challenging rounds. The game features a sophisticated balanced question system that ensures fair distribution between truth and troll rounds, with fresh content fetched for every game session.

## What Makes This Game Innovative

- **Live Reddit Integration**: Each "Truth" round features posts fetched directly from Reddit's API in real-time, ensuring completely fresh content that players have never seen before
- **Balanced Question Algorithm**: Advanced backend system tracks question distribution to ensure fair 50/50 balance between real and fake posts across all players
- **Session-Based Freshness**: Every new game session fetches completely unique content with no caching, preventing players from memorizing answers
- **Sophisticated AI Detection Challenge**: Tests players' ability to identify subtle differences between authentic human writing and AI-generated content in an era of increasingly sophisticated AI
- **Reddit-Native Experience**: Seamlessly integrated into Reddit posts using Devvit, allowing gameplay without leaving the platform
- **Global Persistent Leaderboards**: Cross-session leaderboards that persist between games, with accuracy tracking and competitive rankings
- **Moderator Controls**: Subreddit moderators can reset leaderboards and manage game state
- **Mobile-Optimized Design**: Responsive interface designed for Reddit's mobile-first user base
- **Real-Time Feedback System**: Instant visual feedback with animated results and scoring

## How to Play

### Getting Started

1. **Launch the Game**: Click the "Play Now" button on the vibrant orange-to-red gradient splash screen to begin your Truth or Troll challenge
2. **Understand the Format**: You'll play through exactly 10 rounds, with each round presenting you with **one Reddit post** to analyze

### Core Gameplay

3. **Analyze Each Post**: In each round, you'll see a single Reddit post displayed with authentic formatting including:

   - Subreddit names (e.g., r/todayilearned, r/cats, r/mildlyinteresting, r/AskReddit)
   - Usernames and realistic upvote counts  
   - Post titles and detailed body content
   - Authentic Reddit styling and layout

4. **Make Your Decision**: For the post, choose between two options:

   - **"Real Post"** (green button) - If you believe it's genuine content fetched from Reddit's API
   - **"Fake Post"** (red button) - If you think it's AI-generated content designed to mimic Reddit posts

5. **Get Instant Feedback**: After voting, you'll immediately see:

   - Whether your choice was correct with animated feedback messages
   - Visual indicators showing if the post was real or AI-generated
   - Points earned (100 points for correct answers)
   - Button highlighting showing your selection and the correct answer

6. **Progress Through Rounds**: After 2 seconds of feedback, the game automatically advances to the next round with a fresh post

### Advanced Features

7. **Balanced Question System**: The game uses a sophisticated algorithm to ensure fair distribution of real vs fake posts across all players
8. **Fresh Content Every Session**: Each new game fetches completely unique posts from Reddit's API - no repeated content
9. **Track Your Progress**: Watch your progress through the animated 10-round indicator at the bottom, with your current round pulsing in orange
10. **Monitor Your Score**: Your running score is displayed in the header and updates in real-time as you play
11. **View Leaderboards**: Access the global leaderboard at any time during gameplay to see how you rank against other players worldwide

### Completion and Competition

12. **Complete the Game**: After all 10 rounds, you'll be automatically taken to the leaderboard to see your final results
13. **Check Your Stats**: View your final score, accuracy percentage, and compare against top players globally
14. **Play Again**: Use "Play Again" to start a fresh 10-round game with completely new content, or "Main Menu" to return to the splash screen

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
