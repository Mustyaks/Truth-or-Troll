import { useState, useEffect } from 'react';
import { generateFakePost, fetchRealPost } from '../../shared/kiroService';
import { getBalancedQuestion, trackFakePost } from '../../shared/apiService';

interface Post {
  id: string;
  title: string;
  body: string;
  subreddit: string;
  author: string;
  upvotes: number;
  isReal: boolean;
}

interface GameRoundProps {
  onGameComplete: (finalScore: number, correctAnswers: number) => void;
  onViewLeaderboard: () => void;
  username: string;
  onAnswerSubmitted?: () => void;
}

type FeedbackState = {
  show: boolean;
  isCorrect: boolean;
  message: string;
};

// Expanded mock data pool
const allMockPosts: Post[] = [
  {
    id: '1',
    title: 'TIL that octopuses have three hearts and blue blood',
    body: 'I was reading about marine biology and discovered that octopuses are incredible creatures. Two hearts pump blood to the gills, while the third pumps blood to the rest of the body. Their blood is blue because it contains copper-based hemocyanin instead of iron-based hemoglobin.',
    subreddit: 'todayilearned',
    author: 'marine_enthusiast',
    upvotes: 15420,
    isReal: true
  },
  {
    id: '2',
    title: 'My cat learned to open doors and now terrorizes the neighborhood',
    body: 'So my cat Whiskers figured out how to open door handles by jumping and hanging on them. Now he lets himself into neighbors\' houses and steals their food. The whole street has a group chat about "Whiskers sightings." I\'m considering getting him a tiny cape.',
    subreddit: 'cats',
    author: 'whiskers_parent',
    upvotes: 8934,
    isReal: false
  },
  {
    id: '3',
    title: 'Found this 500-year-old book in my grandmother\'s attic',
    body: 'While cleaning out my late grandmother\'s attic, I discovered what appears to be a medieval manuscript. The pages are made of vellum and the text is in Latin. I contacted a local university and they\'re sending an expert to authenticate it. Could be worth millions!',
    subreddit: 'mildlyinteresting',
    author: 'attic_explorer',
    upvotes: 23156,
    isReal: true
  },
  {
    id: '4',
    title: 'My neighbor\'s WiFi password is "password123" and they work in cybersecurity',
    body: 'I couldn\'t believe it when I saw their network name "CyberSecPro_Home" with the most basic password ever. I left an anonymous note in their mailbox suggesting they might want to practice what they preach. The irony is killing me.',
    subreddit: 'facepalm',
    author: 'wifi_detective',
    upvotes: 12847,
    isReal: false
  },
  {
    id: '5',
    title: 'TIL honey never spoils and archaeologists have found edible honey in ancient Egyptian tombs',
    body: 'Honey has an indefinite shelf life due to its low moisture content and acidic pH. The oldest known sample was found in King Tut\'s tomb and was still perfectly edible after 3000+ years. The antibacterial properties of honey make it naturally self-preserving.',
    subreddit: 'todayilearned',
    author: 'history_buff_42',
    upvotes: 45231,
    isReal: true
  },
  {
    id: '6',
    title: 'Update: My houseplant has been writing me passive-aggressive notes',
    body: 'Remember my post about finding tiny notes near my fiddle leaf fig? Well, it escalated. This morning I found a note that said "Your watering schedule is inconsistent and frankly, disappointing." I\'m starting to think my roommate is pranking me, but the handwriting is so tiny...',
    subreddit: 'houseplants',
    author: 'plant_whisperer',
    upvotes: 7892,
    isReal: false
  }
];

const PostCard = ({
  post,
  onVote,
  disabled,
  selectedVote,
  showResult
}: {
  post: Post;
  onVote: (postId: string, vote: 'real' | 'fake') => void;
  disabled: boolean;
  selectedVote?: 'real' | 'fake' | undefined;
  showResult: boolean;
}) => {
  const getButtonStyle = (buttonType: 'real' | 'fake') => {
    if (!showResult) {
      // Normal state
      if (buttonType === 'real') {
        return disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-green-500 hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/25 transform hover:scale-105';
      } else {
        return disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-red-500 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105';
      }
    }

    // Result state - show correct answer
    const isCorrectButton = (buttonType === 'real' && post.isReal) || (buttonType === 'fake' && !post.isReal);
    const wasSelected = selectedVote === buttonType;

    if (isCorrectButton) {
      return 'bg-green-600 ring-2 ring-green-300 shadow-lg shadow-green-500/25'; // Correct answer
    } else if (wasSelected && !isCorrectButton) {
      return 'bg-red-600 ring-2 ring-red-300 shadow-lg shadow-red-500/25'; // Wrong selection
    } else {
      return 'bg-gray-400'; // Not selected
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 space-y-4 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 ${showResult ? 'transform scale-105 shadow-2xl' : ''
      } group`}>
      {/* Reddit-style header */}
      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">r</span>
          </div>
          <span className="font-medium text-gray-700">r/{post.subreddit}</span>
        </div>
        <span className="text-gray-300">•</span>
        <span className="hover:text-gray-700 transition-colors">u/{post.author}</span>
        <span className="text-gray-300">•</span>
        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          <span className="font-medium text-gray-600">{post.upvotes.toLocaleString()}</span>
        </div>
      </div>

      {/* Post title */}
      <h3 className="font-semibold text-base sm:text-lg text-gray-900 leading-tight group-hover:text-gray-800 transition-colors">
        {post.title}
      </h3>

      {/* Post body */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-gray-200">
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          {post.body}
        </p>
      </div>

      {/* Voting buttons */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
        <button
          onClick={() => onVote(post.id, 'real')}
          disabled={disabled}
          className={`flex-1 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 active:scale-95 ${getButtonStyle('real')}`}
        >
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Real Post</span>
          </span>
        </button>
        <button
          onClick={() => onVote(post.id, 'fake')}
          disabled={disabled}
          className={`flex-1 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 active:scale-95 ${getButtonStyle('fake')}`}
        >
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Fake Post</span>
          </span>
        </button>
      </div>

      {/* Result indicator */}
      {showResult && (
        <div className="text-center pt-3 animate-fadeIn">
          <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold ${post.isReal ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
            {post.isReal ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Real Reddit Post</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>AI Generated</span>
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export const GameRound = ({ onGameComplete, onViewLeaderboard, username, onAnswerSubmitted }: GameRoundProps) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentPosts, setCurrentPosts] = useState<Post[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>({ show: false, isCorrect: false, message: '' });
  const [votingDisabled, setVotingDisabled] = useState(false);
  const [selectedVote, setSelectedVote] = useState<{ postId: string; vote: 'real' | 'fake' } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [questionPoolStatus, setQuestionPoolStatus] = useState<{
    used: number;
    total: number;
    refreshed: boolean;
    balance: { truth: number; troll: number };
    questionType: 'truth' | 'troll';
  }>({
    used: 0,
    total: 16,
    refreshed: false,
    balance: { truth: 0, troll: 0 },
    questionType: 'truth'
  });

  // Generate balanced posts for current round with duplicate prevention
  const generateRoundPosts = async (): Promise<Post[]> => {
    try {
      // Get balanced question selection from server
      const questionResponse = await getBalancedQuestion(sessionId);

      if (!questionResponse.success) {
        console.warn('Failed to get balanced question, using fallback');
      }

      // Update question pool status
      setQuestionPoolStatus({
        used: questionResponse.usedCount,
        total: questionResponse.totalAvailable,
        refreshed: questionResponse.poolRefreshed,
        balance: questionResponse.balance,
        questionType: questionResponse.questionType
      });

      // Log pool refresh
      if (questionResponse.poolRefreshed) {
        console.log('🔄 Question pool has been refreshed - starting fresh cycle');
      }

      const selectedSubreddit = questionResponse.subreddit;
      const questionType = questionResponse.questionType;

      // Generate both real and fake posts, but mark the correct one based on server selection
      const [realPostData, fakePostData] = await Promise.all([
        fetchRealPost(selectedSubreddit),
        generateFakePost(selectedSubreddit.toLowerCase())
      ]);

      // Track the fake post usage to prevent duplicates across all players
      if (fakePostData.id) {
        try {
          await trackFakePost(fakePostData.id);
        } catch (error) {
          console.error('Failed to track fake post usage:', error);
        }
      }

      // Create posts with correct truth/troll assignment
      let truthPost: Post, trollPost: Post;

      if (questionType === 'truth') {
        // This round should feature a real post as the "truth"
        truthPost = {
          id: `real-${realPostData.id}`,
          title: realPostData.title,
          body: realPostData.body,
          subreddit: realPostData.subreddit,
          author: realPostData.author,
          upvotes: realPostData.upvotes,
          isReal: true
        };

        trollPost = {
          id: `fake-${currentRound}-${Date.now()}`,
          title: fakePostData.title,
          body: fakePostData.body,
          subreddit: fakePostData.subreddit,
          author: fakePostData.author,
          upvotes: fakePostData.upvotes,
          isReal: false
        };
      } else {
        // This round should feature a fake post as the "troll"
        truthPost = {
          id: `real-${realPostData.id}`,
          title: realPostData.title,
          body: realPostData.body,
          subreddit: realPostData.subreddit,
          author: realPostData.author,
          upvotes: realPostData.upvotes,
          isReal: true
        };

        trollPost = {
          id: `fake-${currentRound}-${Date.now()}`,
          title: fakePostData.title,
          body: fakePostData.body,
          subreddit: fakePostData.subreddit,
          author: fakePostData.author,
          upvotes: fakePostData.upvotes,
          isReal: false
        };
      }

      // Always return one real and one fake post, randomly shuffled
      return Math.random() > 0.5 ? [truthPost, trollPost] : [trollPost, truthPost];

    } catch (error) {
      console.error('Failed to fetch/generate posts:', error);

      // Fallback to static mock posts if both API calls fail
      const realPosts = allMockPosts.filter(post => post.isReal);
      const fakePosts = allMockPosts.filter(post => !post.isReal);

      if (realPosts.length === 0 || fakePosts.length === 0) {
        return allMockPosts.slice(0, 2);
      }

      const randomReal = realPosts[Math.floor(Math.random() * realPosts.length)]!;
      const randomFake = fakePosts[Math.floor(Math.random() * fakePosts.length)]!;

      return Math.random() > 0.5 ? [randomReal, randomFake] : [randomFake, randomReal];
    }
  };

  // Initialize first round
  useEffect(() => {
    const initializeRound = async () => {
      setLoading(true);
      const posts = await generateRoundPosts();
      setCurrentPosts(posts);
      setLoading(false);
    };
    initializeRound();
  }, []);

  const handleVote = async (postId: string, vote: 'real' | 'fake') => {
    if (votingDisabled) return;

    const post = currentPosts.find(p => p.id === postId);
    if (!post) return;

    setVotingDisabled(true);
    setSelectedVote({ postId, vote });
    setShowResults(true);

    // Check if vote is correct
    const isCorrect = (vote === 'real' && post.isReal) || (vote === 'fake' && !post.isReal);
    const points = isCorrect ? 100 : 0;

    setScore(prev => prev + points);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    setFeedback({
      show: true,
      isCorrect,
      message: isCorrect ? 'Correct! 🎉' : 'Oops! 😅'
    });

    // No per-answer submissions; leaderboard updates after session ends
    onAnswerSubmitted?.();

    // After 2 seconds, move to next round or end game
    setTimeout(async () => {
      if (currentRound >= 10) {
        const finalCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);
        onGameComplete(score + points, finalCorrectAnswers);
      } else {
        // Next round
        setLoading(true);
        setCurrentRound(prev => prev + 1);
        const nextPosts = await generateRoundPosts();
        setCurrentPosts(nextPosts);
        setFeedback({ show: false, isCorrect: false, message: '' });
        setVotingDisabled(false);
        setSelectedVote(null);
        setShowResults(false);
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="max-h-[700px] overflow-y-auto scroll-smooth pr-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <span className="text-orange-500">🎯</span>
              <span>Truth or Troll</span>
            </h1>
            <div className="flex items-center space-x-4 text-sm sm:text-base text-gray-600">
              <span className="flex items-center space-x-1">
                <span className="font-medium">Round</span>
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">{currentRound}/10</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="font-medium">Score</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">{score}</span>
              </span>
            </div>
          </div>
          <button
            onClick={onViewLeaderboard}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Leaderboard</span>
          </button>
        </div>

        {/* Feedback Message */}
        {feedback.show && (
          <div className={`mb-6 p-4 rounded-lg text-center font-bold text-xl transition-all duration-500 transform ${feedback.isCorrect
            ? 'bg-green-100 text-green-800 border border-green-300'
            : 'bg-red-100 text-red-800 border border-red-300'
            } animate-pulse`}>
            {feedback.message}
            {feedback.isCorrect && <span className="block text-sm mt-1">+100 points!</span>}
          </div>
        )}

        {/* Instructions */}
        {!feedback.show && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-center space-y-2">
              <p className="text-blue-800 font-medium">
                One post is real from Reddit, one is AI-generated. Can you tell which is which?
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-blue-600">
                <span>📊 Questions: {questionPoolStatus.used}/{questionPoolStatus.total}</span>
                <span>⚖️ Balance: {questionPoolStatus.balance.truth}T / {questionPoolStatus.balance.troll}F</span>
                <span className={`px-2 py-1 rounded-full ${questionPoolStatus.questionType === 'truth'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
                  }`}>
                  {questionPoolStatus.questionType === 'truth' ? '✓ Truth Round' : '✗ Troll Round'}
                </span>
                {questionPoolStatus.refreshed && (
                  <span className="bg-blue-100 px-2 py-1 rounded-full">🔄 Pool refreshed!</span>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-orange-800 text-center font-medium">
              🔄 Fetching balanced questions from Reddit...
            </p>
          </div>
        )}

        {/* Posts Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-3 animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <div className="flex-1 h-10 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1 h-10 bg-gray-300 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {currentPosts.map((post) => (
              <PostCard
                key={`${post.id}-${currentRound}`}
                post={post}
                onVote={handleVote}
                disabled={votingDisabled}
                selectedVote={selectedVote?.postId === post.id ? selectedVote.vote : undefined}
                showResult={showResults}
              />
            ))}
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex space-x-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${i < currentRound - 1 ? 'bg-orange-500' :
                  i === currentRound - 1 ? 'bg-orange-400 animate-pulse' :
                    'bg-gray-300'
                  }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">Round {currentRound} of 10</p>
        </div>
        </div>
      </div>
    </div>
  );
};
