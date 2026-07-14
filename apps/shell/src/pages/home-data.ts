/** Static marketing content for the shell landing page. */

function unsplash(photoId: string, width = 800): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

export interface HeroSlide {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Full-bleed banner background photo. */
  image: string;
  /** Product close-up shown in the floating circle on the right. */
  artImage: string;
  /** Emoji fallback if the photos fail to load. */
  emoji: string;
  /** Tailwind background class behind the photo (also the loading fallback). */
  bgClass: string;
}

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: 'Best Deal Online on smart watches',
    title: 'SMART WEARABLE.',
    subtitle: 'UP TO 80% OFF',
    image: unsplash('photo-1579586337278-3befd40fd17a', 1600),
    artImage: unsplash('photo-1523275335684-37898b6baf30', 400),
    emoji: '⌚',
    bgClass: 'bg-gradient-to-br from-navy via-[#2c3654] to-[#151a30]',
  },
  {
    eyebrow: 'Latest flagship smartphones',
    title: 'GALAXY SERIES.',
    subtitle: 'UP TO 40% OFF',
    image: unsplash('photo-1610945265064-0e34e5519bbf', 1600),
    artImage: unsplash('photo-1592899677977-9c10ca588bbd', 400),
    emoji: '📱',
    bgClass: 'bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900',
  },
  {
    eyebrow: 'Fresh groceries every morning',
    title: 'DAILY ESSENTIALS.',
    subtitle: 'UP TO 50% OFF',
    image: unsplash('photo-1542838132-92c53300491e', 1600),
    artImage: unsplash('photo-1540420773420-3366772f4999', 400),
    emoji: '🥦',
    bgClass: 'bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950',
  },
];

export interface HomeDeal {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  /** Emoji fallback if the photo fails to load. */
  emoji: string;
}

export const smartphoneDeals: HomeDeal[] = [
  { id: 'deal-1', name: 'Galaxy S22 Ultra', price: 32999, mrp: 74999, image: unsplash('photo-1610945265064-0e34e5519bbf'), emoji: '📱' },
  { id: 'deal-2', name: 'Galaxy M13 (4GB | 64 GB)', price: 10499, mrp: 14999, image: unsplash('photo-1598327105666-5b89351aff97'), emoji: '📱' },
  { id: 'deal-3', name: 'Galaxy M33 (4GB | 64 GB)', price: 16999, mrp: 24999, image: unsplash('photo-1511707171634-5f897ff02aa9'), emoji: '📱' },
  { id: 'deal-4', name: 'Galaxy M53 (4GB | 64 GB)', price: 31999, mrp: 40999, image: unsplash('photo-1592899677977-9c10ca588bbd'), emoji: '📱' },
  { id: 'deal-5', name: 'Galaxy S22 Ultra', price: 67999, mrp: 85999, image: unsplash('photo-1512941937669-90a1b58e7e9c'), emoji: '📱' },
];

export interface HomeCategory {
  image: string;
  /** Emoji fallback if the photo fails to load. */
  icon: string;
  label: string;
  active?: boolean;
}

export const topCategories: HomeCategory[] = [
  { image: unsplash('photo-1511707171634-5f897ff02aa9', 400), icon: '📱', label: 'Mobile', active: true },
  { image: unsplash('photo-1596462502278-27bfdc403348', 400), icon: '💄', label: 'Cosmetics' },
  { image: unsplash('photo-1498049794561-7780e7231661', 400), icon: '🖥️', label: 'Electronics' },
  { image: unsplash('photo-1555041469-a586c61ea9bc', 400), icon: '🛋️', label: 'Furniture' },
  { image: unsplash('photo-1524592094714-0f0654e20314', 400), icon: '⌚', label: 'Watches' },
  { image: unsplash('photo-1513519245088-0e12902e5a38', 400), icon: '🪴', label: 'Decor' },
  { image: unsplash('photo-1553062407-98eeb64c6a62', 400), icon: '👜', label: 'Accessories' },
];

export interface BrandPromo {
  id: string;
  chip: string;
  tagline: string;
  image: string;
  /** Emoji fallback if the photo fails to load. */
  emoji: string;
  /** Tailwind classes for the card background and text tone. */
  cardClass: string;
  chipClass: string;
}

export const brandPromos: BrandPromo[] = [
  {
    id: 'apple',
    chip: 'IPHONE',
    tagline: 'UP TO 80% OFF',
    image: unsplash('photo-1592899677977-9c10ca588bbd', 400),
    emoji: '📱',
    cardClass: 'bg-navy text-white',
    chipClass: 'bg-white/10 text-white',
  },
  {
    id: 'realme',
    chip: 'realme',
    tagline: 'UP TO 80% OFF',
    image: unsplash('photo-1598327105666-5b89351aff97', 400),
    emoji: '📱',
    cardClass: 'bg-[#f5da5b] text-slate-900',
    chipClass: 'bg-white text-slate-900',
  },
  {
    id: 'xiaomi',
    chip: 'mi XIAOMI',
    tagline: 'UP TO 80% OFF',
    image: unsplash('photo-1512941937669-90a1b58e7e9c', 400),
    emoji: '📱',
    cardClass: 'bg-[#f8931f] text-white',
    chipClass: 'bg-white/20 text-white',
  },
];

export interface EssentialItem {
  image: string;
  /** Emoji fallback if the photo fails to load. */
  icon: string;
  label: string;
  offer: string;
}

export const dailyEssentials: EssentialItem[] = [
  { image: unsplash('photo-1506617564039-2f3b650b7010', 400), icon: '🧺', label: 'Daily Essentials', offer: 'UP TO 50% OFF' },
  { image: unsplash('photo-1540420773420-3366772f4999', 400), icon: '🥦', label: 'Vegetables', offer: 'UP TO 50% OFF' },
  { image: unsplash('photo-1610832958506-aa56368176cf', 400), icon: '🍎', label: 'Fruits', offer: 'UP TO 50% OFF' },
  { image: unsplash('photo-1464965911861-746a04b4bca6', 400), icon: '🍓', label: 'Strawberry', offer: 'UP TO 50% OFF' },
  { image: unsplash('photo-1553279768-865429fa0078', 400), icon: '🥭', label: 'Mango', offer: 'UP TO 50% OFF' },
  { image: unsplash('photo-1528821128474-27f963b062bf', 400), icon: '🍒', label: 'Cherry', offer: 'UP TO 50% OFF' },
];
