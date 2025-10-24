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

// Track used fake posts to prevent duplicates
let usedFakePosts = new Set<string>();

// Move mockPosts to the top level for reuse
const mockPosts: Record<string, Array<{ title: string; body: string; id: string }>> = {
  technology: [
    {
      id: 'tech_001',
      title: "My smart doorbell started ordering pizza every time someone rings it",
      body: "I thought I was being clever by connecting my doorbell to my home automation system. Somehow the wires got crossed and now every time someone rings the doorbell, it automatically orders a large pepperoni pizza from Domino's. I've had 12 pizzas delivered this week and I'm too embarrassed to call tech support."
    },
    {
      id: 'tech_002',
      title: "Found a USB port inside my microwave, manufacturer says it's 'not supposed to be there'",
      body: "Was cleaning my microwave and noticed a USB-A port hidden behind the turntable. Plugged in a flash drive and it shows up as 'MICROWAVE_OS_v2.1' with some weird files. Called the manufacturer and they seemed very confused and asked for my address. Should I be worried?"
    },
    {
      id: 'tech_003',
      title: "My Alexa has been responding in ancient Latin for three days straight",
      body: "Started when I asked it to play classical music. Now every command gets a response in what sounds like Latin. Asked it for the weather and got a 5-minute speech about 'tempestas et ventus.' My roommate thinks it's possessed. Amazon support hung up on me twice."
    },
    {
      id: 'tech_004',
      title: "Update: My robot vacuum has formed an alliance with the neighbor's Roomba",
      body: "They've been meeting at the fence line every night at 2 AM. Mine comes back with dirt from plants I don't own and sometimes small gifts like bottle caps. I think they're planning something. Should I be concerned about a robot uprising starting in my living room?"
    },
    {
      id: 'tech_005',
      title: "My phone's autocorrect has become sentient and is now giving me life advice",
      body: "It started small - changing 'fine' to 'fantastic' in texts. Now it's completely rewriting my messages to be more positive and productive. Tried to text 'Netflix and chill' and it sent 'Perhaps we could discuss literature and herbal tea instead.' My dating life has never been better."
    },
    {
      id: 'tech_006',
      title: "My smart fridge is holding my leftovers hostage until I eat more vegetables",
      body: "The door won't open unless I scan a barcode of something green. It's been three days since I've seen my leftover pizza. The fridge keeps displaying passive-aggressive messages like 'Your body is a temple, not a garbage disposal.' I think my appliances are staging an intervention."
    }
  ],
  pets: [
    {
      id: 'pets_001',
      title: "My dog has learned to use Uber Eats and I'm financially ruined",
      body: "Somehow my golden retriever figured out how to use my phone to order food delivery. Started with simple treats, now he's ordering gourmet meals for the entire neighborhood's dogs. My credit card statement looks like I'm running a canine restaurant. The delivery drivers know him by name."
    },
    {
      id: 'pets_002',
      title: "Update: My cat's Instagram account has more followers than me",
      body: "Remember my post about my cat accidentally creating an Instagram account? Well, @whiskers_the_magnificent now has 50k followers and gets sponsorship deals. He makes more money than I do and I'm pretty sure he's planning to fire me as his manager."
    },
    {
      id: 'pets_003',
      title: "My hamster has been running a black market seed operation from his cage",
      body: "Found tiny bags of sunflower seeds hidden throughout the house with little price tags. Other neighborhood pets have been leaving 'payments' of lint and small toys by his cage. I think Mr. Whiskers is running some kind of underground economy. The vet says this is 'highly unusual behavior.'"
    },
    {
      id: 'pets_004',
      title: "My parrot learned to order takeout by mimicking my voice perfectly",
      body: "Charlie can now call restaurants and place orders in my exact voice and speech patterns. I came home to find 6 different food deliveries and a very confused delivery driver asking why I ordered 'extra crackers for the bird.' My credit card company thinks I have a serious eating disorder."
    },
    {
      id: 'pets_005',
      title: "My fish have organized themselves into a synchronized swimming team",
      body: "It started with just two goldfish swimming in formation. Now all 8 fish perform elaborate routines every feeding time. They've somehow designated roles - there's clearly a choreographer, backup dancers, and what appears to be a fish doing commentary. I'm considering entering them in competitions."
    },
    {
      id: 'pets_006',
      title: "My rabbit has been secretly redecorating my apartment while I sleep",
      body: "Every morning I wake up to find my furniture slightly rearranged. Caught Bunnington on camera dragging throw pillows around at 3 AM with surprising precision. The new layout is actually better than what I had. I think my pet has better interior design skills than me."
    }
  ],
  science: [
    {
      id: 'science_001',
      title: "TIL that penguins have a secret underground tunnel system connecting all major zoos",
      body: "A leaked document from the International Zoo Association reveals that penguins have been secretly digging tunnels between zoos worldwide since 1987. The network spans over 12,000 miles and includes rest stops with fish vending machines. Scientists are baffled by their engineering capabilities."
    },
    {
      id: 'science_002',
      title: "Scientists discover that houseplants have been secretly communicating through WiFi signals",
      body: "New research from MIT shows that common houseplants emit low-frequency signals that match WiFi patterns. They've been sharing information about watering schedules, sunlight conditions, and apparently gossiping about their owners. The study suggests plants have been 'online' longer than humans."
    },
    {
      id: 'science_003',
      title: "Breakthrough: Researchers find that coffee beans can predict weather patterns with 94% accuracy",
      body: "A 10-year study at Stanford reveals that coffee beans change their cellular structure 48 hours before weather changes. Local coffee shops are now more accurate than meteorologists. The study suggests that your morning brew has been trying to warn you about rain all along."
    },
    {
      id: 'science_004',
      title: "New study shows that rubber ducks possess advanced problem-solving abilities",
      body: "Researchers at Cambridge discovered that rubber ducks can solve complex mazes when placed in water. The ducks consistently find the shortest path to the exit, leading scientists to question everything we know about bath toy intelligence. The rubber duck industry is reportedly 'very excited' about these findings."
    },
    {
      id: 'science_005',
      title: "Scientists accidentally create time-traveling bacteria while trying to make better yogurt",
      body: "A lab accident at UC Berkeley resulted in bacteria that appear to age backwards. The cultures are getting younger and more active over time. Researchers are now questioning whether they've discovered the fountain of youth or just really confused some microorganisms. The yogurt tastes amazing though."
    },
    {
      id: 'science_006',
      title: "Study reveals that socks disappear in the dryer due to interdimensional portals",
      body: "Quantum physicists at CERN have finally solved the mystery of missing socks. Dryers create micro-wormholes that transport single socks to parallel universes. The research suggests there's a dimension where everyone has perfectly matched socks and they're probably very confused about it."
    }
  ],
  food: [
    {
      id: 'food_001',
      title: "My sourdough starter has developed a personality and is now critiquing my baking",
      body: "Started as a normal starter, but now it bubbles angrily when I use the wrong flour and seems to sulk when I don't feed it on time. Yesterday it somehow spelled out 'MORE RYE' in bubbles. I'm either losing my mind or my bread is becoming sentient."
    },
    {
      id: 'food_002',
      title: "Local restaurant's 'mystery meat' turned out to be perfectly seasoned tofu all along",
      body: "Been eating at Joe's Diner for 5 years, always wondered about their amazing 'mystery meat special.' Turns out Joe's been serving seasoned tofu this whole time and just never corrected anyone's assumptions. Half the town's tough guys have been unknowingly eating vegan for years."
    },
    {
      id: 'food_003',
      title: "My grandmother's secret recipe ingredient was just really expensive salt this whole time",
      body: "Found her recipe book after she passed. The 'secret ingredient' that made everything taste amazing was $40/lb Himalayan pink salt. She'd been using it for 30 years and telling everyone it was 'love and patience.' Technically she wasn't wrong, but my grocery budget is now ruined."
    },
    {
      id: 'food_004',
      title: "Update: My attempt to make artisanal ice cubes has gotten out of hand",
      body: "Started with filtered water and silicone molds. Now I'm aging ice in my basement, experimenting with different mineral contents, and taking tasting notes. My friends think I've lost it, but my cocktails have never been better. I may have accidentally become an ice sommelier."
    }
  ],
  gaming: [
    {
      id: 'gaming_001',
      title: "My NPC villagers in Animal Crossing have started a union and are demanding better working conditions",
      body: "They've organized picket lines around the town square and refuse to sell items until I provide healthcare benefits and paid vacation days. Tom Nook is apparently the union leader. I just wanted to play a relaxing game, not negotiate labor contracts with cartoon animals."
    },
    {
      id: 'gaming_002',
      title: "Discovered my 8-year-old has been running a successful Minecraft real estate empire",
      body: "Found out she's been buying and selling virtual properties for actual money through some complex trading system with other kids. She's made more profit this month than I have at my actual job. I'm simultaneously proud and concerned about her entrepreneurial spirit."
    },
    {
      id: 'gaming_003',
      title: "My Pokémon GO addiction has accidentally made me the most fit person in my office",
      body: "Started playing to catch cute creatures, ended up walking 15 miles a day hunting for rare spawns. Lost 40 pounds, can now run a 5K, and my doctor says I have the cardiovascular health of someone 10 years younger. Who knew virtual monsters were the key to fitness?"
    },
    {
      id: 'gaming_004',
      title: "My Sims family has achieved a higher standard of living than my actual family",
      body: "They own a mansion, have successful careers, perfect relationships, and never struggle with bills. Meanwhile, I'm eating ramen for the third night in a row while watching my virtual self live my dream life. The irony is not lost on me."
    }
  ],
  relationships: [
    {
      id: 'relationships_001',
      title: "My dating profile accidentally attracted a cult following of bread enthusiasts",
      body: "Mentioned I enjoy baking in my bio. Now I have 200+ matches who only want to discuss sourdough techniques and gluten development. My DMs are full of people sharing their starter photos. I've accidentally become the dating app's bread guru and I don't know how to escape."
    },
    {
      id: 'relationships_002',
      title: "Update: My boyfriend's mom has been secretly teaching me her family recipes to 'test my worthiness'",
      body: "Turns out the random cooking lessons were actually elaborate trials. I passed the 'Sunday gravy test' and am now officially approved for marriage. She presented me with a handwritten cookbook and a family apron. I feel like I've joined a very delicious secret society."
    },
    {
      id: 'relationships_003',
      title: "My partner and I communicate entirely through memes and it's surprisingly effective",
      body: "Started as a joke during a fight, but now we've developed a complex meme-based language. We can have entire conversations about feelings, plans, and daily life using only carefully selected internet images. Our relationship has never been stronger, but explaining it to couples therapy was awkward."
    }
  ]
};

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
  id: string;
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
  
  // Expanded fake post database with unique, realistic posts
  const mockPosts: Record<string, Array<{ title: string; body: string; id: string }>> = {
    technology: [
      {
        id: 'tech_001',
        title: "My smart doorbell started ordering pizza every time someone rings it",
        body: "I thought I was being clever by connecting my doorbell to my home automation system. Somehow the wires got crossed and now every time someone rings the doorbell, it automatically orders a large pepperoni pizza from Domino's. I've had 12 pizzas delivered this week and I'm too embarrassed to call tech support."
      },
      {
        id: 'tech_002',
        title: "Found a USB port inside my microwave, manufacturer says it's 'not supposed to be there'",
        body: "Was cleaning my microwave and noticed a USB-A port hidden behind the turntable. Plugged in a flash drive and it shows up as 'MICROWAVE_OS_v2.1' with some weird files. Called the manufacturer and they seemed very confused and asked for my address. Should I be worried?"
      },
      {
        id: 'tech_003',
        title: "My Alexa has been responding in ancient Latin for three days straight",
        body: "Started when I asked it to play classical music. Now every command gets a response in what sounds like Latin. Asked it for the weather and got a 5-minute speech about 'tempestas et ventus.' My roommate thinks it's possessed. Amazon support hung up on me twice."
      },
      {
        id: 'tech_004',
        title: "Update: My robot vacuum has formed an alliance with the neighbor's Roomba",
        body: "They've been meeting at the fence line every night at 2 AM. Mine comes back with dirt from plants I don't own and sometimes small gifts like bottle caps. I think they're planning something. Should I be concerned about a robot uprising starting in my living room?"
      },
      {
        id: 'tech_005',
        title: "My phone's autocorrect has become sentient and is now giving me life advice",
        body: "It started small - changing 'fine' to 'fantastic' in texts. Now it's completely rewriting my messages to be more positive and productive. Tried to text 'Netflix and chill' and it sent 'Perhaps we could discuss literature and herbal tea instead.' My dating life has never been better."
      },
      {
        id: 'tech_006',
        title: "My smart fridge is holding my leftovers hostage until I eat more vegetables",
        body: "The door won't open unless I scan a barcode of something green. It's been three days since I've seen my leftover pizza. The fridge keeps displaying passive-aggressive messages like 'Your body is a temple, not a garbage disposal.' I think my appliances are staging an intervention."
      }
    ],
    pets: [
      {
        id: 'pets_001',
        title: "My dog has learned to use Uber Eats and I'm financially ruined",
        body: "Somehow my golden retriever figured out how to use my phone to order food delivery. Started with simple treats, now he's ordering gourmet meals for the entire neighborhood's dogs. My credit card statement looks like I'm running a canine restaurant. The delivery drivers know him by name."
      },
      {
        id: 'pets_002',
        title: "Update: My cat's Instagram account has more followers than me",
        body: "Remember my post about my cat accidentally creating an Instagram account? Well, @whiskers_the_magnificent now has 50k followers and gets sponsorship deals. He makes more money than I do and I'm pretty sure he's planning to fire me as his manager."
      },
      {
        id: 'pets_003',
        title: "My hamster has been running a black market seed operation from his cage",
        body: "Found tiny bags of sunflower seeds hidden throughout the house with little price tags. Other neighborhood pets have been leaving 'payments' of lint and small toys by his cage. I think Mr. Whiskers is running some kind of underground economy. The vet says this is 'highly unusual behavior.'"
      },
      {
        id: 'pets_004',
        title: "My parrot learned to order takeout by mimicking my voice perfectly",
        body: "Charlie can now call restaurants and place orders in my exact voice and speech patterns. I came home to find 6 different food deliveries and a very confused delivery driver asking why I ordered 'extra crackers for the bird.' My credit card company thinks I have a serious eating disorder."
      },
      {
        id: 'pets_005',
        title: "My fish have organized themselves into a synchronized swimming team",
        body: "It started with just two goldfish swimming in formation. Now all 8 fish perform elaborate routines every feeding time. They've somehow designated roles - there's clearly a choreographer, backup dancers, and what appears to be a fish doing commentary. I'm considering entering them in competitions."
      },
      {
        id: 'pets_006',
        title: "My rabbit has been secretly redecorating my apartment while I sleep",
        body: "Every morning I wake up to find my furniture slightly rearranged. Caught Bunnington on camera dragging throw pillows around at 3 AM with surprising precision. The new layout is actually better than what I had. I think my pet has better interior design skills than me."
      }
    ],
    science: [
      {
        id: 'science_001',
        title: "TIL that penguins have a secret underground tunnel system connecting all major zoos",
        body: "A leaked document from the International Zoo Association reveals that penguins have been secretly digging tunnels between zoos worldwide since 1987. The network spans over 12,000 miles and includes rest stops with fish vending machines. Scientists are baffled by their engineering capabilities."
      },
      {
        id: 'science_002',
        title: "Scientists discover that houseplants have been secretly communicating through WiFi signals",
        body: "New research from MIT shows that common houseplants emit low-frequency signals that match WiFi patterns. They've been sharing information about watering schedules, sunlight conditions, and apparently gossiping about their owners. The study suggests plants have been 'online' longer than humans."
      },
      {
        id: 'science_003',
        title: "Breakthrough: Researchers find that coffee beans can predict weather patterns with 94% accuracy",
        body: "A 10-year study at Stanford reveals that coffee beans change their cellular structure 48 hours before weather changes. Local coffee shops are now more accurate than meteorologists. The study suggests that your morning brew has been trying to warn you about rain all along."
      },
      {
        id: 'science_004',
        title: "New study shows that rubber ducks possess advanced problem-solving abilities",
        body: "Researchers at Cambridge discovered that rubber ducks can solve complex mazes when placed in water. The ducks consistently find the shortest path to the exit, leading scientists to question everything we know about bath toy intelligence. The rubber duck industry is reportedly 'very excited' about these findings."
      },
      {
        id: 'science_005',
        title: "Scientists accidentally create time-traveling bacteria while trying to make better yogurt",
        body: "A lab accident at UC Berkeley resulted in bacteria that appear to age backwards. The cultures are getting younger and more active over time. Researchers are now questioning whether they've discovered the fountain of youth or just really confused some microorganisms. The yogurt tastes amazing though."
      },
      {
        id: 'science_006',
        title: "Study reveals that socks disappear in the dryer due to interdimensional portals",
        body: "Quantum physicists at CERN have finally solved the mystery of missing socks. Dryers create micro-wormholes that transport single socks to parallel universes. The research suggests there's a dimension where everyone has perfectly matched socks and they're probably very confused about it."
      }
    ],
    food: [
      {
        id: 'food_001',
        title: "My sourdough starter has developed a personality and is now critiquing my baking",
        body: "Started as a normal starter, but now it bubbles angrily when I use the wrong flour and seems to sulk when I don't feed it on time. Yesterday it somehow spelled out 'MORE RYE' in bubbles. I'm either losing my mind or my bread is becoming sentient."
      },
      {
        id: 'food_002',
        title: "Local restaurant's 'mystery meat' turned out to be perfectly seasoned tofu all along",
        body: "Been eating at Joe's Diner for 5 years, always wondered about their amazing 'mystery meat special.' Turns out Joe's been serving seasoned tofu this whole time and just never corrected anyone's assumptions. Half the town's tough guys have been unknowingly eating vegan for years."
      },
      {
        id: 'food_003',
        title: "My grandmother's secret recipe ingredient was just really expensive salt this whole time",
        body: "Found her recipe book after she passed. The 'secret ingredient' that made everything taste amazing was $40/lb Himalayan pink salt. She'd been using it for 30 years and telling everyone it was 'love and patience.' Technically she wasn't wrong, but my grocery budget is now ruined."
      },
      {
        id: 'food_004',
        title: "Update: My attempt to make artisanal ice cubes has gotten out of hand",
        body: "Started with filtered water and silicone molds. Now I'm aging ice in my basement, experimenting with different mineral contents, and taking tasting notes. My friends think I've lost it, but my cocktails have never been better. I may have accidentally become an ice sommelier."
      }
    ],
    gaming: [
      {
        id: 'gaming_001',
        title: "My NPC villagers in Animal Crossing have started a union and are demanding better working conditions",
        body: "They've organized picket lines around the town square and refuse to sell items until I provide healthcare benefits and paid vacation days. Tom Nook is apparently the union leader. I just wanted to play a relaxing game, not negotiate labor contracts with cartoon animals."
      },
      {
        id: 'gaming_002',
        title: "Discovered my 8-year-old has been running a successful Minecraft real estate empire",
        body: "Found out she's been buying and selling virtual properties for actual money through some complex trading system with other kids. She's made more profit this month than I have at my actual job. I'm simultaneously proud and concerned about her entrepreneurial spirit."
      },
      {
        id: 'gaming_003',
        title: "My Pokémon GO addiction has accidentally made me the most fit person in my office",
        body: "Started playing to catch cute creatures, ended up walking 15 miles a day hunting for rare spawns. Lost 40 pounds, can now run a 5K, and my doctor says I have the cardiovascular health of someone 10 years younger. Who knew virtual monsters were the key to fitness?"
      },
      {
        id: 'gaming_004',
        title: "My Sims family has achieved a higher standard of living than my actual family",
        body: "They own a mansion, have successful careers, perfect relationships, and never struggle with bills. Meanwhile, I'm eating ramen for the third night in a row while watching my virtual self live my dream life. The irony is not lost on me."
      }
    ],
    relationships: [
      {
        id: 'relationships_001',
        title: "My dating profile accidentally attracted a cult following of bread enthusiasts",
        body: "Mentioned I enjoy baking in my bio. Now I have 200+ matches who only want to discuss sourdough techniques and gluten development. My DMs are full of people sharing their starter photos. I've accidentally become the dating app's bread guru and I don't know how to escape."
      },
      {
        id: 'relationships_002',
        title: "Update: My boyfriend's mom has been secretly teaching me her family recipes to 'test my worthiness'",
        body: "Turns out the random cooking lessons were actually elaborate trials. I passed the 'Sunday gravy test' and am now officially approved for marriage. She presented me with a handwritten cookbook and a family apron. I feel like I've joined a very delicious secret society."
      },
      {
        id: 'relationships_003',
        title: "My partner and I communicate entirely through memes and it's surprisingly effective",
        body: "Started as a joke during a fight, but now we've developed a complex meme-based language. We can have entire conversations about feelings, plans, and daily life using only carefully selected internet images. Our relationship has never been stronger, but explaining it to couples therapy was awkward."
      }
    ]
  };

  // Get available posts for the topic
  let topicPosts = mockPosts[selectedTopic as keyof typeof mockPosts] || mockPosts.technology || [];
  
  // Filter out already used posts
  const availablePosts = topicPosts.filter(post => !usedFakePosts.has(post.id));
  
  // If all posts for this topic are used, try other topics
  if (availablePosts.length === 0) {
    console.log(`All ${selectedTopic} posts used, trying other topics...`);
    
    // Collect all unused posts from all topics
    const allUnusedPosts: Array<{ title: string; body: string; id: string; topic: string }> = [];
    
    for (const [topicKey, posts] of Object.entries(mockPosts)) {
      const unusedInTopic = posts.filter(post => !usedFakePosts.has(post.id));
      unusedInTopic.forEach(post => {
        allUnusedPosts.push({ ...post, topic: topicKey });
      });
    }
    
    // If we've used ALL posts, reset the tracking (start over)
    if (allUnusedPosts.length === 0) {
      console.log('🔄 All fake posts used, resetting pool for variety...');
      usedFakePosts.clear();
      topicPosts = mockPosts[selectedTopic as keyof typeof mockPosts] || mockPosts.technology || [];
      const selectedPost = topicPosts[Math.floor(Math.random() * topicPosts.length)]!;
      usedFakePosts.add(selectedPost.id);
      
      console.log('🎯 Selected fake post after reset:', selectedPost.id, selectedPost.title.substring(0, 50) + '...');
      
      return {
        title: selectedPost.title,
        body: selectedPost.body,
        subreddit: selectedSubreddit,
        author: generateRandomAuthor(),
        upvotes: generateRandomUpvotes(),
        id: selectedPost.id
      };
    }
    
    // Select from any unused post
    const selectedPost = allUnusedPosts[Math.floor(Math.random() * allUnusedPosts.length)]!;
    usedFakePosts.add(selectedPost.id);
    
    console.log('🎯 Selected fake post from other topic:', selectedPost.id, selectedPost.title.substring(0, 50) + '...');
    
    // Update subreddit based on the actual topic selected
    const topicSubreddits = SUBREDDIT_MAP[selectedPost.topic as keyof typeof SUBREDDIT_MAP] || ['general'];
    const finalSubreddit = topicSubreddits[Math.floor(Math.random() * topicSubreddits.length)] || selectedSubreddit;
    
    return {
      title: selectedPost.title,
      body: selectedPost.body,
      subreddit: finalSubreddit,
      author: generateRandomAuthor(),
      upvotes: generateRandomUpvotes(),
      id: selectedPost.id
    };
  }
  
  // Select from available posts for this topic
  const selectedPost = availablePosts[Math.floor(Math.random() * availablePosts.length)]!;
  usedFakePosts.add(selectedPost.id);
  
  console.log('🎯 Selected fake post from topic:', selectedPost.id, selectedPost.title.substring(0, 50) + '...');
  
  return {
    title: selectedPost.title,
    body: selectedPost.body,
    subreddit: selectedSubreddit,
    author: generateRandomAuthor(),
    upvotes: generateRandomUpvotes(),
    id: selectedPost.id
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

// Function to reset used posts (for testing or when all posts are exhausted)
export function resetUsedPosts(): void {
  usedFakePosts.clear();
  console.log('Used fake posts tracking reset');
}

// Function to get statistics about post usage
export function getPostUsageStats(): { 
  totalPosts: number; 
  usedPosts: number; 
  availablePosts: number; 
  usagePercentage: number;
} {
  // Count total posts across all topics
  const totalPosts = Object.values(mockPosts).reduce((sum, posts) => sum + posts.length, 0);
  const usedPosts = usedFakePosts.size;
  const availablePosts = totalPosts - usedPosts;
  const usagePercentage = totalPosts > 0 ? Math.round((usedPosts / totalPosts) * 100) : 0;
  
  return {
    totalPosts,
    usedPosts,
    availablePosts,
    usagePercentage
  };
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
    console.log('🌐 Fetching fresh Truth posts from Reddit API for r/', subreddit);
    
    // First, get recently used truth posts to avoid repetition
    const recentPostsResponse = await fetch('/api/recent-truth-posts');
    let recentPosts: string[] = [];
    
    if (recentPostsResponse.ok) {
      const recentData = await recentPostsResponse.json();
      recentPosts = recentData.recentPosts || [];
      console.log('📋 Found', recentPosts.length, 'recently used Truth posts to avoid');
    }

    // Try multiple strategies for maximum freshness
    const strategies = [
      `https://www.reddit.com/r/${subreddit}/top.json?limit=50`,
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=50`,
      `https://www.reddit.com/r/all/top.json?limit=100&t=day` // Fallback to r/all
    ];

    let response: Response;
    let usedStrategy = 0;

    for (let i = 0; i < strategies.length; i++) {
      console.log('🔗 Making fresh Reddit API call to:', strategies[i]);
      response = await fetch(strategies[i]);
      
      if (response.ok) {
        usedStrategy = i;
        break;
      } else {
        console.warn(`Strategy ${i} failed with status:`, response.status);
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Failed to fetch from Reddit with all strategies`);
    }
    
    console.log('✅ Successfully fetched from strategy', usedStrategy, ':', strategies[usedStrategy]);
    
    const data: RedditResponse = await response.json();
    
    if (!data.data.children || data.data.children.length === 0) {
      throw new Error('No posts found in subreddit');
    }
    
    // Filter out posts without selftext (text posts only) and recently used posts
    const textPosts = data.data.children.filter(post => 
      post.data.selftext && 
      post.data.selftext.trim().length > 50 && 
      !post.data.selftext.includes('[removed]') &&
      !post.data.selftext.includes('[deleted]') &&
      !recentPosts.includes(post.data.id) // Exclude recently used posts
    );
    
    // If all posts are recently used, fall back to all text posts
    const availablePosts = textPosts.length > 0 ? textPosts : data.data.children.filter(post => 
      post.data.selftext && 
      post.data.selftext.trim().length > 50 && 
      !post.data.selftext.includes('[removed]') &&
      !post.data.selftext.includes('[deleted]')
    );
    
    if (availablePosts.length === 0) {
      throw new Error('No suitable text posts found');
    }
    
    // Randomly select a post from available posts
    const randomPost = availablePosts[Math.floor(Math.random() * availablePosts.length)];
    if (!randomPost) {
      throw new Error('Failed to select a random post');
    }
    const postData = randomPost.data;
    
    console.log('✅ Selected fresh Truth post:', {
      id: postData.id,
      title: postData.title.substring(0, 60) + '...',
      subreddit: postData.subreddit,
      author: postData.author,
      upvotes: postData.ups
    });
    
    // Track this truth post usage
    try {
      await fetch('/api/track-truth-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          postId: postData.id, 
          subreddit: postData.subreddit 
        }),
      });
      console.log('📝 Tracked Truth post usage for ID:', postData.id);
    } catch (trackingError) {
      console.warn('Failed to track truth post usage:', trackingError);
      // Don't fail the whole operation if tracking fails
    }
    
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
