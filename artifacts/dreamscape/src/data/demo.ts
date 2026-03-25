export interface World {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  color: string;
  projectCount: number;
  artifactCount: number;
  tags: string[];
}

export interface Project {
  id: string;
  worldId: string;
  name: string;
  description: string;
  status: "active" | "archived" | "draft";
  artifactCount: number;
  createdAt: string;
}

export interface Artifact {
  id: string;
  projectId: string;
  worldId: string;
  title: string;
  description: string;
  type: "image" | "text" | "3d" | "audio" | "video";
  thumbnail: string;
  prompt: string;
  createdAt: string;
  tags: string[];
  resolution?: string;
  likes: number;
}

export interface GenerationRecord {
  id: string;
  prompt: string;
  type: "image" | "text" | "3d" | "audio" | "video";
  status: "completed" | "processing" | "failed";
  result?: string;
  artifactId?: string;
  worldName: string;
  projectName: string;
  createdAt: string;
  duration?: number;
}

const GRADIENTS = [
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-700",
];

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1475274047050-1d0c55b7e72a?w=600&h=400&fit=crop",
];

export const worlds: World[] = [
  {
    id: "w1",
    name: "Celestial Forge",
    description: "A cosmic smithy where stars are hammered into existence. Swirling nebulae of molten gold and sapphire surround ancient forges that shape reality itself.",
    thumbnail: PLACEHOLDER_IMAGES[0],
    color: GRADIENTS[0],
    projectCount: 4,
    artifactCount: 28,
    tags: ["cosmic", "creation", "fantasy"],
  },
  {
    id: "w2",
    name: "Neon Abyss",
    description: "A sunken cyberpunk metropolis beneath miles of dark ocean, where bioluminescent creatures swim through flooded server rooms.",
    thumbnail: PLACEHOLDER_IMAGES[1],
    color: GRADIENTS[1],
    projectCount: 3,
    artifactCount: 19,
    tags: ["cyberpunk", "underwater", "sci-fi"],
  },
  {
    id: "w3",
    name: "Verdant Mechanism",
    description: "An overgrown clockwork garden where botanical and mechanical life have fused into a self-perpetuating ecosystem.",
    thumbnail: PLACEHOLDER_IMAGES[2],
    color: GRADIENTS[2],
    projectCount: 2,
    artifactCount: 14,
    tags: ["steampunk", "nature", "mechanical"],
  },
  {
    id: "w4",
    name: "Ember Sanctum",
    description: "A volcanic cathedral carved from obsidian and fire. Ancient rituals of light and shadow play across its crystalline walls.",
    thumbnail: PLACEHOLDER_IMAGES[3],
    color: GRADIENTS[3],
    projectCount: 3,
    artifactCount: 22,
    tags: ["volcanic", "sacred", "dark-fantasy"],
  },
  {
    id: "w5",
    name: "Prism Drift",
    description: "Floating crystal islands refract light into impossible spectrums, creating rainbow storms and prismatic auroras.",
    thumbnail: PLACEHOLDER_IMAGES[4],
    color: GRADIENTS[4],
    projectCount: 2,
    artifactCount: 11,
    tags: ["crystal", "ethereal", "surreal"],
  },
  {
    id: "w6",
    name: "Void Archive",
    description: "An infinite library suspended in the spaces between dimensions, where every book contains a universe.",
    thumbnail: PLACEHOLDER_IMAGES[5],
    color: GRADIENTS[5],
    projectCount: 3,
    artifactCount: 17,
    tags: ["cosmic", "knowledge", "dimensional"],
  },
];

export const projects: Project[] = [
  { id: "p1", worldId: "w1", name: "Stellar Anvil Series", description: "Forging new constellations from raw cosmic material", status: "active", artifactCount: 12, createdAt: "2025-12-01" },
  { id: "p2", worldId: "w1", name: "Nebula Portraits", description: "Character studies of the cosmic blacksmiths", status: "active", artifactCount: 8, createdAt: "2025-11-15" },
  { id: "p3", worldId: "w1", name: "Forge Blueprints", description: "Technical drawings of celestial forging apparatus", status: "draft", artifactCount: 5, createdAt: "2026-01-10" },
  { id: "p4", worldId: "w1", name: "Star Birth Sequences", description: "Animated sequences of stellar creation events", status: "active", artifactCount: 3, createdAt: "2026-02-20" },
  { id: "p5", worldId: "w2", name: "Deep Circuit Exploration", description: "Mapping the submerged server farms of the old world", status: "active", artifactCount: 9, createdAt: "2025-10-05" },
  { id: "p6", worldId: "w2", name: "Biolume Creatures", description: "A bestiary of the bioluminescent fauna", status: "active", artifactCount: 6, createdAt: "2025-12-20" },
  { id: "p7", worldId: "w2", name: "Pressure Zone Anthems", description: "Soundscapes from the deepest pressure levels", status: "archived", artifactCount: 4, createdAt: "2025-08-14" },
  { id: "p8", worldId: "w3", name: "Gear Bloom Catalog", description: "Documenting hybrid botanical-mechanical species", status: "active", artifactCount: 10, createdAt: "2026-01-02" },
  { id: "p9", worldId: "w3", name: "Clockwork Seasons", description: "Time-lapse studies of the mechanism's seasonal cycles", status: "draft", artifactCount: 4, createdAt: "2026-03-01" },
  { id: "p10", worldId: "w4", name: "Obsidian Rituals", description: "Capturing the fire ceremonies of the Ember Sanctum", status: "active", artifactCount: 11, createdAt: "2025-09-12" },
  { id: "p11", worldId: "w4", name: "Crystal Resonance", description: "Sonic exploration of the sanctum's singing walls", status: "active", artifactCount: 7, createdAt: "2025-11-30" },
  { id: "p12", worldId: "w4", name: "Shadow Calligraphy", description: "Light-and-shadow patterns traced by ancient fire dances", status: "draft", artifactCount: 4, createdAt: "2026-02-15" },
  { id: "p13", worldId: "w5", name: "Spectrum Storms", description: "Capturing the rainbow tempests between crystal islands", status: "active", artifactCount: 7, createdAt: "2026-01-18" },
  { id: "p14", worldId: "w5", name: "Prism Architecture", description: "Building designs inspired by natural refraction", status: "draft", artifactCount: 4, createdAt: "2026-03-05" },
  { id: "p15", worldId: "w6", name: "Infinite Stacks", description: "Visual explorations of the endless bookshelves", status: "active", artifactCount: 8, createdAt: "2025-10-22" },
  { id: "p16", worldId: "w6", name: "Dimensional Portals", description: "Gateway illustrations between library sections", status: "active", artifactCount: 5, createdAt: "2025-12-08" },
  { id: "p17", worldId: "w6", name: "Lost Manuscripts", description: "Recreating pages from books that never existed", status: "active", artifactCount: 4, createdAt: "2026-02-01" },
];

export const artifacts: Artifact[] = [
  { id: "a1", projectId: "p1", worldId: "w1", title: "The First Anvil", description: "The primordial forge where the first star was shaped", type: "image", thumbnail: PLACEHOLDER_IMAGES[0], prompt: "A cosmic anvil floating in deep space, surrounded by swirling nebula gases in gold and sapphire", createdAt: "2025-12-02", tags: ["hero", "cosmic"], resolution: "2048x2048", likes: 142 },
  { id: "a2", projectId: "p1", worldId: "w1", title: "Molten Constellation", description: "A newly forged constellation cooling in the void", type: "image", thumbnail: PLACEHOLDER_IMAGES[6], prompt: "A constellation being formed from molten starlight, dripping with golden fire", createdAt: "2025-12-05", tags: ["stars", "creation"], resolution: "1920x1080", likes: 98 },
  { id: "a3", projectId: "p2", worldId: "w1", title: "The Star Smith", description: "Portrait of the master cosmic blacksmith", type: "image", thumbnail: PLACEHOLDER_IMAGES[7], prompt: "Portrait of a celestial being made of starlight, wielding a cosmic hammer", createdAt: "2025-11-18", tags: ["character", "portrait"], resolution: "1024x1024", likes: 231 },
  { id: "a4", projectId: "p5", worldId: "w2", title: "Sunken Server Hall", description: "Bioluminescent jellyfish illuminate drowned data centers", type: "image", thumbnail: PLACEHOLDER_IMAGES[1], prompt: "Underwater data center with glowing jellyfish swimming between server racks, neon cyberpunk aesthetic", createdAt: "2025-10-08", tags: ["environment", "cyberpunk"], resolution: "2560x1440", likes: 187 },
  { id: "a5", projectId: "p5", worldId: "w2", title: "Circuit Reef", description: "Where silicon meets coral in a symbiotic dance", type: "image", thumbnail: PLACEHOLDER_IMAGES[8], prompt: "A coral reef made of circuit boards and fiber optic cables, bioluminescent", createdAt: "2025-10-12", tags: ["hybrid", "underwater"], resolution: "1920x1080", likes: 156 },
  { id: "a6", projectId: "p6", worldId: "w2", title: "Abyssal Data Leviathan", description: "A massive creature that feeds on corrupted data streams", type: "image", thumbnail: PLACEHOLDER_IMAGES[9], prompt: "A gigantic bioluminescent sea creature with circuit-pattern skin, swimming through data streams", createdAt: "2025-12-22", tags: ["creature", "monster"], resolution: "2048x2048", likes: 312 },
  { id: "a7", projectId: "p8", worldId: "w3", title: "Gear Blossom", description: "A flower that blooms with the precision of clockwork", type: "image", thumbnail: PLACEHOLDER_IMAGES[2], prompt: "A mechanical flower with brass petals and emerald crystalline centers, steampunk botanical", createdAt: "2026-01-05", tags: ["botanical", "steampunk"], resolution: "1024x1024", likes: 204 },
  { id: "a8", projectId: "p8", worldId: "w3", title: "Root Network", description: "Underground root systems made of copper tubing and gears", type: "image", thumbnail: PLACEHOLDER_IMAGES[10], prompt: "Cross-section view of underground root system made of copper pipes and tiny gears", createdAt: "2026-01-08", tags: ["mechanical", "nature"], resolution: "1920x1080", likes: 89 },
  { id: "a9", projectId: "p10", worldId: "w4", title: "Obsidian Cathedral", description: "The grand entrance to the Ember Sanctum", type: "image", thumbnail: PLACEHOLDER_IMAGES[3], prompt: "A massive cathedral carved from obsidian, with rivers of lava flowing through its walls", createdAt: "2025-09-15", tags: ["architecture", "volcanic"], resolution: "2560x1440", likes: 267 },
  { id: "a10", projectId: "p10", worldId: "w4", title: "Fire Dance Ritual", description: "Ancient beings perform the ceremony of eternal flame", type: "image", thumbnail: PLACEHOLDER_IMAGES[11], prompt: "Ethereal fire spirits performing a ceremonial dance around an obsidian altar", createdAt: "2025-09-20", tags: ["ritual", "fire"], resolution: "2048x2048", likes: 178 },
  { id: "a11", projectId: "p13", worldId: "w5", title: "Rainbow Storm", description: "A chromatic tempest tears through the crystal islands", type: "image", thumbnail: PLACEHOLDER_IMAGES[4], prompt: "A violent storm made of pure rainbow light crashing against floating crystal islands", createdAt: "2026-01-20", tags: ["storm", "prismatic"], resolution: "2560x1440", likes: 145 },
  { id: "a12", projectId: "p15", worldId: "w6", title: "The Infinite Shelf", description: "Looking down an endless corridor of dimensional bookshelves", type: "image", thumbnail: PLACEHOLDER_IMAGES[5], prompt: "An infinitely long library corridor stretching into a vanishing point, with glowing portals between shelves", createdAt: "2025-10-25", tags: ["library", "infinite"], resolution: "1920x1080", likes: 198 },
];

export const generationHistory: GenerationRecord[] = [
  { id: "g1", prompt: "A cosmic anvil floating in deep space, surrounded by swirling nebula gases in gold and sapphire", type: "image", status: "completed", result: PLACEHOLDER_IMAGES[0], artifactId: "a1", worldName: "Celestial Forge", projectName: "Stellar Anvil Series", createdAt: "2025-12-02T14:30:00Z", duration: 12 },
  { id: "g2", prompt: "A constellation being formed from molten starlight, dripping with golden fire", type: "image", status: "completed", result: PLACEHOLDER_IMAGES[6], artifactId: "a2", worldName: "Celestial Forge", projectName: "Stellar Anvil Series", createdAt: "2025-12-05T09:15:00Z", duration: 18 },
  { id: "g3", prompt: "Underwater data center with glowing jellyfish swimming between server racks", type: "image", status: "completed", result: PLACEHOLDER_IMAGES[1], artifactId: "a4", worldName: "Neon Abyss", projectName: "Deep Circuit Exploration", createdAt: "2025-10-08T16:45:00Z", duration: 15 },
  { id: "g4", prompt: "A massive cathedral carved from obsidian with rivers of lava flowing through its walls", type: "image", status: "completed", result: PLACEHOLDER_IMAGES[3], artifactId: "a9", worldName: "Ember Sanctum", projectName: "Obsidian Rituals", createdAt: "2025-09-15T11:20:00Z", duration: 22 },
  { id: "g5", prompt: "A mechanical forest with trees made of brass gears and emerald crystal leaves", type: "image", status: "completed", result: PLACEHOLDER_IMAGES[2], worldName: "Verdant Mechanism", projectName: "Gear Bloom Catalog", createdAt: "2026-01-05T08:00:00Z", duration: 14 },
  { id: "g6", prompt: "An infinitely long library corridor stretching into a vanishing point", type: "image", status: "completed", result: PLACEHOLDER_IMAGES[5], artifactId: "a12", worldName: "Void Archive", projectName: "Infinite Stacks", createdAt: "2025-10-25T13:30:00Z", duration: 16 },
  { id: "g7", prompt: "Crystal islands floating in a sea of rainbow light with prismatic auroras above", type: "image", status: "completed", result: PLACEHOLDER_IMAGES[4], artifactId: "a11", worldName: "Prism Drift", projectName: "Spectrum Storms", createdAt: "2026-01-20T10:45:00Z", duration: 20 },
  { id: "g8", prompt: "A sentient nebula cloud forming into the shape of a cosmic dragon", type: "image", status: "processing", worldName: "Celestial Forge", projectName: "Star Birth Sequences", createdAt: "2026-03-25T08:00:00Z" },
  { id: "g9", prompt: "Deep ocean trench with bioluminescent circuit patterns on the walls", type: "image", status: "failed", worldName: "Neon Abyss", projectName: "Deep Circuit Exploration", createdAt: "2026-03-24T22:10:00Z" },
  { id: "g10", prompt: "A clockwork butterfly emerging from a brass chrysalis surrounded by gear-flowers", type: "image", status: "completed", result: PLACEHOLDER_IMAGES[10], worldName: "Verdant Mechanism", projectName: "Gear Bloom Catalog", createdAt: "2026-03-20T15:30:00Z", duration: 11 },
];

export function getWorldById(id: string): World | undefined {
  return worlds.find(w => w.id === id);
}

export function getProjectsByWorld(worldId: string): Project[] {
  return projects.filter(p => p.worldId === worldId);
}

export function getArtifactsByProject(projectId: string): Artifact[] {
  return artifacts.filter(a => a.projectId === projectId);
}

export function getArtifactsByWorld(worldId: string): Artifact[] {
  return artifacts.filter(a => a.worldId === worldId);
}

export function getArtifactById(id: string): Artifact | undefined {
  return artifacts.find(a => a.id === id);
}
