# Truth or Troll - Deployment Guide

## Pre-Deployment Checklist

### ✅ Devvit Compliance
- [x] App uses Devvit Web framework
- [x] Server endpoints start with `/api/`
- [x] Client makes requests only to own server
- [x] No external API calls from client
- [x] Proper error handling for all endpoints
- [x] Redis integration for data persistence
- [x] Responsive design for mobile and desktop

### ✅ Interactive Post Requirements
- [x] App renders within Reddit post dimensions
- [x] Proper splash screen configuration
- [x] Post creation functionality
- [x] Menu integration for moderators
- [x] App install trigger configured

### ✅ Technical Requirements
- [x] TypeScript compilation without errors
- [x] ESLint passes without warnings
- [x] Build process completes successfully
- [x] All assets properly referenced
- [x] CSS optimized for post environment

## Deployment Steps

### 1. Validate Build
```bash
npm run validate
```

### 2. Test Locally
```bash
npm run dev
```
Visit the playtest URL to ensure everything works correctly.

### 3. Deploy to Reddit
```bash
npm run deploy
```

### 4. Publish for Review
```bash
npm run launch
```

## Post-Deployment Testing

### In Development Environment
1. Create a test post using the moderator menu
2. Verify splash screen displays correctly
3. Test game functionality (voting, scoring, leaderboard)
4. Check responsive behavior on mobile
5. Verify localStorage persistence works

### Key Features to Test
- [ ] Splash screen with username input
- [ ] Real Reddit post fetching
- [ ] AI post generation
- [ ] Voting mechanics with feedback
- [ ] Score calculation and persistence
- [ ] Leaderboard functionality
- [ ] Responsive design on all devices

## Configuration Files

### devvit.json
- Configured for Interactive Post deployment
- Includes proper menu items and triggers
- HTTP capabilities for Reddit API access

### Assets
- `assets/default-icon.png` - App icon for Reddit
- `assets/default-splash.png` - Splash background
- All assets must be under 1MB each

## Troubleshooting

### Common Issues
1. **Build Fails**: Check TypeScript errors with `npm run type-check`
2. **API Errors**: Verify all endpoints start with `/api/`
3. **Asset Loading**: Ensure all assets are in the `assets/` directory
4. **Post Creation**: Check server logs for Reddit API errors

### Debug Commands
```bash
# Check for type errors
npm run type-check

# Lint code
npm run lint

# Build without deployment
npm run build

# Test server endpoints
curl http://localhost:3000/api/init
```

## Reddit Review Process

1. **Automatic Review**: Apps for subreddits with <200 members
2. **Manual Review**: Apps for larger subreddits (can take 1-2 weeks)
3. **Review Criteria**:
   - Follows Reddit content policy
   - Provides value to users
   - Functions correctly
   - No spam or malicious behavior

## Support

- [Devvit Documentation](https://developers.reddit.com/docs)
- [Reddit Developer Community](https://www.reddit.com/r/Devvit)
- [GitHub Issues](https://github.com/reddit/devvit)
