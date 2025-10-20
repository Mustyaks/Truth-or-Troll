# Moderator Leaderboard Reset Feature

## 🛡️ **Security Overview**

A secure leaderboard reset feature has been implemented that allows only subreddit moderators to reset all leaderboard data. This feature includes proper authentication, authorization, and user interface elements.

## 🔧 **Backend Implementation**

### **Endpoints Added**

#### `/is-moderator` (GET)
- **Purpose**: Check if the current user is a subreddit moderator
- **Authentication**: Uses Reddit's built-in user context
- **Authorization**: Fetches moderator list from Reddit API
- **Response**: 
```json
{
  "success": true,
  "isModerator": boolean,
  "username": "current_user"
}
```

#### `/reset-leaderboard` (POST)
- **Purpose**: Reset all leaderboard data (moderators only)
- **Security Checks**:
  1. User authentication (must be logged in)
  2. Subreddit context validation
  3. Moderator permission verification
- **Action**: Deletes `global_leaderboard` key from Redis
- **Response**: 
```json
{
  "success": true,
  "message": "Leaderboard has been reset successfully!"
}
```

### **Security Features**
- **Authentication**: Verifies user is logged in via `reddit.getCurrentUsername()`
- **Authorization**: Cross-references user with subreddit moderator list
- **Context Validation**: Ensures subreddit context is available
- **Error Handling**: Proper HTTP status codes (401, 403, 500)
- **Audit Trail**: Server-side logging of reset attempts

## 🎨 **Frontend Implementation**

### **Moderator Detection**
- Automatically checks moderator status on leaderboard load
- Caches moderator status to avoid repeated API calls
- Only shows reset button to verified moderators

### **UI Elements**

#### **Moderator Reset Button**
- **Visibility**: Only appears for moderators when leaderboard has data
- **Styling**: Purple theme to distinguish from regular user actions
- **States**: Normal, loading, disabled
- **Icon**: Key/shield icon to indicate administrative action

#### **Confirmation Modal**
- **Security Warning**: Clear indication this affects all users
- **Visual Design**: Purple theme with warning icons
- **Loading State**: Shows spinner during reset operation
- **Error Handling**: Displays error messages if reset fails

### **User Experience**
- **Clear Labeling**: "Reset All Scores" vs "Clear Local Scores"
- **Visual Hierarchy**: Moderator actions clearly distinguished
- **Confirmation Flow**: Two-step process to prevent accidental resets
- **Feedback**: Success/error messages via alerts
- **Real-time Updates**: Leaderboard clears immediately on success

## 🔒 **Security Measures**

### **Server-Side Security**
1. **User Authentication**: Must be logged into Reddit
2. **Moderator Verification**: Cross-checks with Reddit's moderator API
3. **Subreddit Context**: Validates request is within proper subreddit
4. **Rate Limiting**: Inherent through Reddit's API rate limits
5. **Error Sanitization**: No sensitive data in error responses

### **Client-Side Security**
1. **UI Hiding**: Reset button only visible to moderators
2. **Confirmation Required**: Two-step confirmation process
3. **Loading States**: Prevents multiple simultaneous requests
4. **Error Handling**: Graceful degradation if permissions change

## 📊 **Feature Comparison**

| Feature | Local Clear | Moderator Reset |
|---------|-------------|-----------------|
| **Scope** | User's browser only | All users globally |
| **Data Affected** | localStorage scores | Redis leaderboard |
| **Permission** | Any user | Moderators only |
| **Reversible** | No | No |
| **Confirmation** | Single modal | Enhanced warning modal |
| **Visual Theme** | Red (danger) | Purple (admin) |

## 🚀 **Usage Instructions**

### **For Moderators**
1. Navigate to the leaderboard
2. Purple "Reset All Scores" button appears (if moderator)
3. Click button to open confirmation modal
4. Review warning about permanent deletion
5. Click "Reset All Leaderboards" to confirm
6. Wait for success confirmation

### **For Regular Users**
- Reset button is not visible
- Can still use "Clear Local Scores" for their own data
- Will see updated leaderboard if moderator performs reset

## ✅ **Testing Checklist**

- [x] Moderator detection works correctly
- [x] Non-moderators cannot see reset button
- [x] Reset endpoint requires moderator permissions
- [x] Confirmation modal prevents accidental resets
- [x] Loading states work during reset operation
- [x] Success/error messages display properly
- [x] Leaderboard updates immediately after reset
- [x] Both local and server leaderboards are cleared
- [x] Build process completes without errors

## 🛠️ **Technical Details**

### **Reddit API Integration**
```javascript
// Get moderators list
const moderators = await reddit.getModerators({ subredditName });
const moderatorList = await moderators.all();
const isModerator = moderatorList.some(mod => mod.username === currentUser);
```

### **Redis Operations**
```javascript
// Reset leaderboard
await redis.del('global_leaderboard');
```

### **Client API Calls**
```javascript
// Check moderator status
const modStatus = await checkModeratorStatus();

// Reset leaderboard
const result = await resetLeaderboard();
```

## 🔐 **Security Considerations**

1. **No Client-Side Security**: All security checks happen server-side
2. **Reddit API Trust**: Relies on Reddit's moderator API for authorization
3. **Context Validation**: Ensures operations happen in correct subreddit
4. **Audit Logging**: Server logs all reset attempts for monitoring
5. **Error Handling**: No sensitive information leaked in error messages

The moderator reset feature is now fully implemented with robust security measures and a polished user interface! 🛡️
