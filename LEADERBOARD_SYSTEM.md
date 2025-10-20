# Truth or Troll - Leaderboard System Documentation

## ✅ **System Overview**

The leaderboard system is fully connected to backend endpoints and tracks player results in real-time. Here's how it works:

## 🔧 **Backend Endpoints**

### `/submit-answer` (POST)
- **Purpose**: Records each individual answer from players
- **Request Body**: `{ username: string, correct: boolean }`
- **Functionality**:
  - Gets current leaderboard from Redis (`global_leaderboard` key)
  - Initializes new users with `{ score: 0, plays: 0 }`
  - Increments `plays` counter for every answer
  - Increments `score` counter only for correct answers
  - Saves updated leaderboard back to Redis
- **Response**: `{ success: true, leaderboard: userStats }`

### `/leaderboard` (GET)
- **Purpose**: Returns top 10 players sorted by score
- **Functionality**:
  - Retrieves leaderboard from Redis
  - Sorts players by score (descending)
  - Returns top 10 players
- **Response**: `{ topPlayers: [[username, stats], ...] }`

## 🎮 **Client Integration**

### **Answer Submission**
Every time a player clicks "Real Post" or "Fake Post":

```javascript
// In GameRound.tsx - handleVote function
const isCorrect = (vote === 'real' && post.isReal) || (vote === 'fake' && !post.isReal);

// Submit to backend
await submitAnswer(username, isCorrect);
```

This calls:
```javascript
fetch("/submit-answer", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, correct: isCorrect }),
});
```

### **Leaderboard Display**
The leaderboard component:
- Fetches data on mount from `/leaderboard`
- Refreshes automatically every 10 seconds
- Has manual refresh button
- Shows dual view (answer accuracy vs game scores)

## 📊 **Dual Leaderboard System**

### **1. Answer Accuracy Leaderboard** (Primary - Server-based)
- **Data Source**: Redis via `/leaderboard` endpoint
- **Tracks**: Individual answers across all games
- **Metrics**: 
  - Total correct answers (`score`)
  - Total attempts (`plays`)
  - Accuracy percentage (`score/plays * 100`)
- **Updates**: Real-time after each answer

### **2. Game Score Leaderboard** (Secondary - localStorage-based)
- **Data Source**: Browser localStorage
- **Tracks**: Complete game sessions (0-1000 points)
- **Metrics**:
  - Final game score
  - Overall accuracy percentage
  - Timestamp of completion
- **Updates**: After completing full 10-round games

## 🔄 **Real-time Updates**

### **Automatic Refresh**
- Leaderboard refreshes every 10 seconds when viewing
- Force refresh when navigating to leaderboard after answers
- Manual refresh button available

### **Answer Flow**
1. Player answers "Truth" or "Troll"
2. Client calculates if answer is correct
3. `submitAnswer(username, correct)` called immediately
4. Server updates Redis leaderboard
5. Visual feedback shown to player
6. Leaderboard data refreshed on next view

## 🏆 **Leaderboard Features**

### **Visual Elements**
- **Top 3 Rankings**: Special trophy icons and gradient backgrounds
- **Current User Highlighting**: Orange gradient for user's own entries
- **Accuracy Badges**: Color-coded percentage indicators
- **User Avatars**: Circular avatars with user initials
- **Real-time Stats**: Shows attempts and accuracy

### **Dual View Toggle**
- **Answer Accuracy View**: Shows performance across all individual answers
- **Game Score View**: Shows complete game session results
- **Switch Button**: Easy toggle between views
- **Refresh Button**: Manual data refresh capability

## 🔧 **Technical Implementation**

### **Data Storage**
- **Redis Key**: `global_leaderboard`
- **Data Structure**: 
```json
{
  "username1": { "score": 15, "plays": 20 },
  "username2": { "score": 12, "plays": 15 }
}
```

### **Error Handling**
- Graceful fallbacks if server calls fail
- Continues working with localStorage if backend unavailable
- Console logging for debugging
- User-friendly error states

### **Performance**
- Efficient Redis operations
- Minimal data transfer (top 10 only)
- Client-side caching with periodic refresh
- Optimized re-renders with React keys

## ✅ **Verification Checklist**

- [x] `/submit-answer` endpoint implemented and working
- [x] `/leaderboard` endpoint implemented and working  
- [x] Every answer submission calls backend
- [x] Leaderboard fetches from backend
- [x] Real-time updates working
- [x] Dual leaderboard system functional
- [x] Error handling implemented
- [x] Visual feedback and UI polish complete
- [x] Build process successful

## 🚀 **Ready for Deployment**

The leaderboard system is fully functional and ready for production deployment on Reddit's Devvit platform. Players will see their progress tracked in real-time across all game sessions!
