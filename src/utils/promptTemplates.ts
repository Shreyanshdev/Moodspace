/**
 * Predefined prompt templates for quick wallpaper generation
 */

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  prompt: string;
  mood?: string;
  style?: string;
  tags: string[];
  description: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Nature & Landscapes
  {
    id: "nature-sunset",
    name: "Serene Sunset",
    category: "nature",
    prompt: "A breathtaking sunset over a calm ocean with vibrant orange, pink, and purple hues reflecting on the water, peaceful and serene atmosphere",
    mood: "peaceful",
    style: "realistic",
    tags: ["nature", "sunset", "ocean", "peaceful"],
    description: "Beautiful sunset over ocean",
  },
  {
    id: "nature-forest",
    name: "Mystical Forest",
    category: "nature",
    prompt: "A mystical forest with tall trees, soft sunlight filtering through leaves, foggy atmosphere, magical and ethereal",
    mood: "mysterious",
    style: "fantasy",
    tags: ["nature", "forest", "mystical", "fog"],
    description: "Enchanted forest scene",
  },
  {
    id: "nature-mountain",
    name: "Mountain Vista",
    category: "nature",
    prompt: "Majestic snow-capped mountains at sunrise, dramatic clouds, pristine wilderness, epic and inspiring",
    mood: "energetic",
    style: "realistic",
    tags: ["nature", "mountains", "sunrise", "epic"],
    description: "Epic mountain landscape",
  },

  // Abstract & Artistic
  {
    id: "abstract-cyberpunk",
    name: "Cyberpunk Neon",
    category: "abstract",
    prompt: "Futuristic cyberpunk cityscape with neon lights, holographic displays, rain-soaked streets, vibrant colors, high-tech atmosphere",
    mood: "energetic",
    style: "cyberpunk",
    tags: ["abstract", "cyberpunk", "neon", "futuristic"],
    description: "Cyberpunk cityscape",
  },
  {
    id: "abstract-minimalist",
    name: "Minimalist Geometry",
    category: "abstract",
    prompt: "Clean minimalist design with geometric shapes, soft pastel colors, negative space, modern and elegant",
    mood: "calm",
    style: "minimalist",
    tags: ["abstract", "minimalist", "geometric", "modern"],
    description: "Minimalist geometric design",
  },
  {
    id: "abstract-aurora",
    name: "Aurora Borealis",
    category: "abstract",
    prompt: "Northern lights dancing across a starry night sky, vibrant green and purple waves, ethereal and magical",
    mood: "mysterious",
    style: "abstract",
    tags: ["abstract", "aurora", "stars", "night"],
    description: "Aurora borealis display",
  },

  // Space & Cosmos
  {
    id: "space-nebula",
    name: "Cosmic Nebula",
    category: "space",
    prompt: "Colorful cosmic nebula with swirling clouds of gas and dust, distant stars, deep space, vibrant and mesmerizing",
    mood: "mysterious",
    style: "abstract",
    tags: ["space", "nebula", "cosmic", "stars"],
    description: "Cosmic nebula scene",
  },
  {
    id: "space-planet",
    name: "Alien Planet",
    category: "space",
    prompt: "Exotic alien planet with strange landscapes, multiple moons in the sky, otherworldly colors, sci-fi atmosphere",
    mood: "mysterious",
    style: "fantasy",
    tags: ["space", "planet", "sci-fi", "alien"],
    description: "Alien planet landscape",
  },

  // Urban & City
  {
    id: "urban-night",
    name: "City Lights",
    category: "urban",
    prompt: "Urban cityscape at night with glowing skyscrapers, city lights, bustling streets, modern and vibrant",
    mood: "energetic",
    style: "realistic",
    tags: ["urban", "city", "night", "lights"],
    description: "City at night",
  },
  {
    id: "urban-aerial",
    name: "Aerial View",
    category: "urban",
    prompt: "Bird's eye view of a modern city, geometric patterns of streets and buildings, aerial perspective, architectural",
    mood: "calm",
    style: "minimalist",
    tags: ["urban", "aerial", "architecture", "geometric"],
    description: "Aerial city view",
  },

  // Fantasy & Dream
  {
    id: "fantasy-castle",
    name: "Floating Castle",
    category: "fantasy",
    prompt: "Magical floating castle in the clouds, ethereal architecture, soft pastel colors, dreamy and whimsical",
    mood: "peaceful",
    style: "fantasy",
    tags: ["fantasy", "castle", "clouds", "magical"],
    description: "Floating castle in clouds",
  },
  {
    id: "fantasy-forest",
    name: "Enchanted Woods",
    category: "fantasy",
    prompt: "Enchanted forest with glowing mushrooms, fireflies, magical creatures, warm golden light, fairy tale atmosphere",
    mood: "peaceful",
    style: "fantasy",
    tags: ["fantasy", "forest", "magical", "glowing"],
    description: "Enchanted forest scene",
  },

  // Dark & Moody
  {
    id: "dark-storm",
    name: "Stormy Night",
    category: "dark",
    prompt: "Dramatic storm clouds over a dark landscape, lightning strikes, moody atmosphere, powerful and intense",
    mood: "mysterious",
    style: "realistic",
    tags: ["dark", "storm", "lightning", "dramatic"],
    description: "Stormy night scene",
  },
  {
    id: "dark-gothic",
    name: "Gothic Architecture",
    category: "dark",
    prompt: "Gothic cathedral with intricate details, dramatic shadows, moonlight, mysterious and elegant",
    mood: "mysterious",
    style: "realistic",
    tags: ["dark", "gothic", "architecture", "moonlight"],
    description: "Gothic cathedral",
  },

  // Calm & Peaceful
  {
    id: "calm-beach",
    name: "Tropical Paradise",
    category: "calm",
    prompt: "Tropical beach with crystal clear water, palm trees, white sand, sunny day, peaceful and relaxing",
    mood: "peaceful",
    style: "realistic",
    tags: ["calm", "beach", "tropical", "paradise"],
    description: "Tropical beach paradise",
  },
  {
    id: "calm-japanese",
    name: "Japanese Garden",
    category: "calm",
    prompt: "Traditional Japanese garden with cherry blossoms, koi pond, stone lanterns, zen atmosphere, peaceful and serene",
    mood: "peaceful",
    style: "minimalist",
    tags: ["calm", "japanese", "garden", "zen"],
    description: "Japanese zen garden",
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get templates by mood
 */
export function getTemplatesByMood(mood: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((t) => t.mood === mood);
}

/**
 * Get templates by style
 */
export function getTemplatesByStyle(style: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((t) => t.style === style);
}

/**
 * Search templates
 */
export function searchTemplates(query: string): PromptTemplate[] {
  const lowerQuery = query.toLowerCase();
  return PROMPT_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

