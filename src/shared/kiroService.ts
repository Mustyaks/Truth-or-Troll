// Topics for generating diverse fake posts
const TOPICS = [
  'technology',
  'pets',
  'food',
  'travel',
  'gaming',
  'science',
  'relationships',
  'work',
  'hobbies',
  'movies',
  'books',
  'fitness',
  'music',
  'art',
  'nature'
];

// Subreddits that match our topics
const SUBREDDIT_MAP: Record<string, string[]> = {
  technology: ['technology', 'programming', 'gadgets', 'apple', 'android'],
  pets: ['cats', 'dogs', 'aww', 'pets', 'AnimalsBeingBros'],
  food: ['food', 'cooking', 'recipes', 'FoodPorn', 'mealprep'],
  travel: ['travel', 'backpacking', 'solotravel', 'EarthPorn', 'CityPorn'],
  gaming: ['gaming', 'pcgaming', 'nintendo', 'PS5', 'xbox'],
  science: ['science', 'todayilearned', 'space', 'biology', 'physics'],
  relationships: ['relationships', 'dating_advice', 'AmItheAsshole', 'relationship_advice'],
  work: ['jobs', 'careerguidance', 'antiwork', 'WorkReform', 'cscareerquestions'],
  hobbies: ['DIY', 'crafts', 'woodworking', 'gardening', 'photography'],
  movies: ['movies', 'MovieDetails', 'marvelstudios', 'StarWars', 'netflix'],
  books: ['books', 'booksuggestions', 'Fantasy', 'scifi', 'writing'],
  fitness: ['fitness', 'bodyweightfitness', 'running', 'yoga', 'loseit'],
  music: ['Music', 'WeAreTheMusicMakers', 'spotify', 'vinyl', 'guitar'],
  art: ['Art', 'drawing', 'painting', 'DigitalArt', 'crafts'],
  nature: ['NatureIsFuckingLit', 'EarthPorn', 'wildlifephotography', 'hiking', 'camping']
};

export async function generateFakePost(topic?: string): Promise<{ 
  title: string; 
  body: string; 
  subreddit: string;
  author: string;
  upvotes: number;
}> {
  // Select random topic if none provided
  const selectedTopic = topic || TOPICS[Math.floor(Math.random() * TOPICS.length)] || 'technology';
  const subreddits = SUBREDDIT_MAP[selectedTopic as keyof typeof SUBREDDIT_MAP] || ['general'];
  const selectedSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)] || 'general';
  
  // TODO: Replace this mock implementation with actual Kiro AI generation
  // Example call structure:
  // const response = await kiro.generate({
  //   prompt: `Generate a realistic Reddit post about ${selectedTopic} for r/${selectedSubreddit}. 
  //            Include a compelling title and detailed body text that sounds authentic.`,
  //   maxTokens: 200,
  //   temperature: 0.8
  // });
  
  // Mock implementation for now
  const mockPosts: Record<string, Array<{ title: string; body: string }>> = {
    technology: [
      {
        title: "My smart doorbell started ordering pizza every time someone rings it",
        body: "I thought I was being clever by connecting my doorbell to my home automation system. Somehow the wires got crossed and now every time someone rings the doorbell, it automatically orders a large pepperoni pizza from Domino's. I've had 12 pizzas delivered this week and I'm too embarrassed to call tech support."
      },
      {
        title: "Found a USB port inside my microwave, manufacturer says it's 'not supposed to be there'",
        body: "Was cleaning my microwave and noticed a USB-A port hidden behind the turntable. Plugged in a flash drive and it shows up as 'MICROWAVE_OS_v2.1' with some weird files. Called the manufacturer and they seemed very confused and asked for my address. Should I be worried?"
      }
    ],
    pets: [
      {
        title: "My dog has learned to use Uber Eats and I'm financially ruined",
        body: "Somehow my golden retriever figured out how to use my phone to order food delivery. Started with simple treats, now he's ordering gourmet meals for the entire neighborhood's dogs. My credit card statement looks like I'm running a canine restaurant. The delivery drivers know him by name."
      },
      {
        title: "Update: My cat's Instagram account has more followers than me",
        body: "Remember my post about my cat accidentally creating an Instagram account? Well, @whiskers_the_magnificent now has 50k followers and gets sponsorship deals. He makes more money than I do and I'm pretty sure he's planning to fire me as his manager."
      }
    ],
    science: [
      {
        title: "TIL that penguins have a secret underground tunnel system connecting all major zoos",
        body: "A leaked document from the International Zoo Association reveals that penguins have been secretly digging tunnels between zoos worldwide since 1987. The network spans over 12,000 miles and includes rest stops with fish vending machines. Scientists are baffled by their engineering capabilities."
      },
      {
        title: "Scientists discover that houseplants have been secretly communicating through WiFi signals",
        body: "New research from MIT shows that common houseplants emit low-frequency signals that match WiFi patterns. They've been sharing information about watering schedules, sunlight conditions, and apparently gossiping about their owners. The study suggests plants have been 'online' longer than humans."
      }
    ]
  };

  const topicPosts = mockPosts[selectedTopic as keyof typeof mockPosts] || mockPosts.technology || [];
  if (topicPosts.length === 0) {
    // Fallback to technology posts
    const fallbackPosts = mockPosts.technology || [];
    if (fallbackPosts.length === 0) {
      throw new Error('No mock posts available');
    }
    const selectedPost = fallbackPosts[Math.floor(Math.random() * fallbackPosts.length)]!;
    
    return {
      title: selectedPost.title,
      body: selectedPost.body,
      subreddit: selectedSubreddit,
      author: generateRandomAuthor(),
      upvotes: generateRandomUpvotes()
    };
  }
  
  const selectedPost = topicPosts[Math.floor(Math.random() * topicPosts.length)]!;
  
  return {
    title: selectedPost.title,
    body: selectedPost.body,
    subreddit: selectedSubreddit,
    author: generateRandomAuthor(),
    upvotes: generateRandomUpvotes()
  };
}

function generateRandomAuthor(): string {
  const authors = [
    'confused_user_2024', 'tech_enthusiast_42', 'random_redditor', 'throwaway_account_123',
    'daily_observer', 'curious_mind_99', 'life_is_weird', 'unexpected_discovery',
    'modern_problems_', 'digital_native_2k', 'mystery_solver', 'reality_check_'
  ];
  
  const randomAuthor = authors[Math.floor(Math.random() * authors.length)] || 'anonymous_user';
  return randomAuthor + Math.floor(Math.random() * 1000);
}

function generateRandomUpvotes(): number {
  return Math.floor(Math.random() * 15000) + 1000;
}

export function getRandomTopic(): string {
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  return topic || 'technology';
}

// Reddit API types
interface RedditPost {
  data: {
    title: string;
    selftext: string;
    author: string;
    ups: number;
    subreddit: string;
    id: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

export async function fetchRealPost(subreddit: string): Promise<{
  title: string;
  body: string;
  subreddit: string;
  author: string;
  upvotes: number;
  id: string;
}> {
  try {
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=50`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Reddit: ${response.status}`);
    }
    
    const data: RedditResponse = await response.json();
    
    if (!data.data.children || data.data.children.length === 0) {
      throw new Error('No posts found in subreddit');
    }
    
    // Filter out posts without selftext (text posts only)
    const textPosts = data.data.children.filter(post => 
      post.data.selftext && 
      post.data.selftext.trim().length > 50 && 
      !post.data.selftext.includes('[removed]') &&
      !post.data.selftext.includes('[deleted]')
    );
    
    if (textPosts.length === 0) {
      throw new Error('No suitable text posts found');
    }
    
    // Randomly select a post
    const randomPost = textPosts[Math.floor(Math.random() * textPosts.length)];
    if (!randomPost) {
      throw new Error('Failed to select a random post');
    }
    const postData = randomPost.data;
    
    return {
      title: postData.title,
      body: postData.selftext.length > 300 
        ? postData.selftext.substring(0, 300) + '...' 
        : postData.selftext,
      subreddit: postData.subreddit,
      author: postData.author,
      upvotes: postData.ups,
      id: postData.id
    };
    
  } catch (error) {
    console.error('Error fetching real Reddit post:', error);
    
    // Fallback to a curated real post if API fails
    const fallbackPosts = [
      {
        title: 'What\'s a skill that seems impressive but is actually easy to learn?',
        body: 'I\'m looking for something I can pick up relatively quickly that will make people think I\'m more talented than I actually am. Any suggestions?',
        subreddit: 'AskReddit',
        author: 'curious_learner',
        upvotes: 15420,
        id: 'fallback1'
      },
      {
        title: 'People who work night shifts, what\'s the weirdest thing you\'ve experienced?',
        body: 'Working nights can be pretty surreal. What\'s the strangest, most unexplainable, or just plain weird thing that\'s happened to you during a night shift?',
        subreddit: 'AskReddit',
        author: 'night_owl_worker',
        upvotes: 23156,
        id: 'fallback2'
      },
      {
        title: 'What\'s something that everyone seems to love but you just don\'t get?',
        body: 'We all have those things that are universally praised but just don\'t click with us. What\'s yours and why do you think you feel differently about it?',
        subreddit: 'AskReddit',
        author: 'contrarian_view',
        upvotes: 18934,
        id: 'fallback3'
      }
    ];
    
    const selectedFallback = fallbackPosts[Math.floor(Math.random() * fallbackPosts.length)];
    if (!selectedFallback) {
      throw new Error('No fallback posts available');
    }
    return selectedFallback;
  }
}
