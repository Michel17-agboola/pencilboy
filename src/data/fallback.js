export const FALLBACK_CATEGORIES = [
  { id: "new-in", name: "NEW IN", slug: "new-in" },
  { id: "tops", name: "TOPS", slug: "tops" },
  { id: "bottoms", name: "BOTTOMS", slug: "bottoms" },
  { id: "headgear", name: "HEADGEAR", slug: "headgear" },
  { id: "hoodies", name: "HOODIES & SWEATS", slug: "hoodies-sweats" },
  { id: "jackets", name: "JACKETS", slug: "jackets" },
  { id: "footwear", name: "FOOTWEAR", slug: "footwear" },
  { id: "accessories", name: "ACCESSORIES", slug: "accessories" },
  { id: "collectibles", name: "COLLECTIBLES", slug: "collectibles" },
  { id: "bags", name: "BAGS", slug: "bags" },
];

export const FALLBACK_PRODUCTS = [
  {
    id: "demo-1",
    name: "MARK TEE",
    slug: "mark-tee",
    price: 45000,
    category: "T-SHIRTS",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85"
    ],
    sizes: ["S", "M", "L", "XL"],
    stock: 8,
    featured: true,
    status: "PUBLISHED"
  },
  {
    id: "demo-2",
    name: "PENCIL HOODIE",
    slug: "pencil-hoodie",
    price: 75000,
    category: "HOODIES",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85"
    ],
    sizes: ["S", "M", "L", "XL"],
    stock: 4,
    featured: true,
    status: "PUBLISHED"
  },
  {
    id: "demo-3",
    name: "FIRST MARK CAP",
    slug: "first-mark-cap",
    price: 30000,
    category: "ACCESSORIES",
    images: [
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=85"
    ],
    sizes: ["OS"],
    stock: 12,
    featured: false,
    status: "PUBLISHED"
  }
];

export const FALLBACK_DROPS = [
  {
    id: "drop-1",
    number: "001",
    name: "THE FIRST MARK",
    subtitle: "LAGOS / 2026",
    description: "A position, a moment, a mark.",
    hero_image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85",
    status: "PUBLISHED"
  }
];

export const FALLBACK_STORIES = [
  {
    id: "story-1",
    title: "THE CITY IS THE STUDIO",
    category: "LAGOS",
    excerpt: "PENCILBOY moves through the city, not around it.",
    cover_image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=85",
    status: "PUBLISHED"
  },
  {
    id: "story-2",
    title: "PEOPLE MAKE THE MARK",
    category: "PEOPLE",
    excerpt: "The people, places and nights behind the first mark.",
    cover_image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
    status: "PUBLISHED"
  },
  {
    id: "story-3",
    title: "AFTER DARK / LAGOS",
    category: "NIGHT",
    excerpt: "A look at the city after the lights change.",
    cover_image:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85",
    status: "PUBLISHED"
  }
];

export const FALLBACK_LOOKBOOK = [
  {
    id: "look-1",
    title: "FIRST MARK",
    category: "PEOPLE",
    location: "LAGOS",
    image_url:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85",
    status: "PUBLISHED"
  },
  {
    id: "look-2",
    title: "STREET STUDY",
    category: "STREET",
    location: "LAGOS",
    image_url:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85",
    status: "PUBLISHED"
  },
  {
    id: "look-3",
    title: "STUDIO 001",
    category: "STUDIO",
    location: "LAGOS",
    image_url:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=85",
    status: "PUBLISHED"
  },
  {
    id: "look-4",
    title: "NIGHT STUDY",
    category: "NIGHT",
    location: "LAGOS",
    image_url:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=85",
    status: "PUBLISHED"
  }
];
