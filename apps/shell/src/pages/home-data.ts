/** Static marketing content for the shell landing page (placeholder visuals). */

export interface HeroSlide {
  eyebrow: string;
  title: string;
  subtitle: string;
  emoji: string;
  /** Tailwind background class for the banner. */
  bgClass: string;
}

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: 'Best Deal Online on smart watches',
    title: 'SMART WEARABLE.',
    subtitle: 'UP TO 80% OFF',
    emoji: '⌚',
    bgClass: 'bg-navy',
  },
  {
    eyebrow: 'Latest flagship smartphones',
    title: 'GALAXY SERIES.',
    subtitle: 'UP TO 40% OFF',
    emoji: '📱',
    bgClass: 'bg-brand-700',
  },
  {
    eyebrow: 'Fresh groceries every morning',
    title: 'DAILY ESSENTIALS.',
    subtitle: 'UP TO 50% OFF',
    emoji: '🥦',
    bgClass: 'bg-emerald-800',
  },
];

export interface HomeDeal {
  id: string;
  name: string;
  price: number;
  mrp: number;
  emoji: string;
}

export const smartphoneDeals: HomeDeal[] = [
  { id: 'deal-1', name: 'Galaxy S22 Ultra', price: 32999, mrp: 74999, emoji: '📱' },
  { id: 'deal-2', name: 'Galaxy M13 (4GB | 64 GB)', price: 10499, mrp: 14999, emoji: '📱' },
  { id: 'deal-3', name: 'Galaxy M33 (4GB | 64 GB)', price: 16999, mrp: 24999, emoji: '📱' },
  { id: 'deal-4', name: 'Galaxy M53 (4GB | 64 GB)', price: 31999, mrp: 40999, emoji: '📱' },
  { id: 'deal-5', name: 'Galaxy S22 Ultra', price: 67999, mrp: 85999, emoji: '📱' },
];

export interface HomeCategory {
  icon: string;
  label: string;
  active?: boolean;
}

export const topCategories: HomeCategory[] = [
  { icon: '📱', label: 'Mobile', active: true },
  { icon: '💄', label: 'Cosmetics' },
  { icon: '🖥️', label: 'Electronics' },
  { icon: '🛋️', label: 'Furniture' },
  { icon: '⌚', label: 'Watches' },
  { icon: '🪴', label: 'Decor' },
  { icon: '👜', label: 'Accessories' },
];

export interface BrandPromo {
  id: string;
  chip: string;
  tagline: string;
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
    emoji: '📱',
    cardClass: 'bg-navy text-white',
    chipClass: 'bg-white/10 text-white',
  },
  {
    id: 'realme',
    chip: 'realme',
    tagline: 'UP TO 80% OFF',
    emoji: '📱',
    cardClass: 'bg-[#f5da5b] text-slate-900',
    chipClass: 'bg-white text-slate-900',
  },
  {
    id: 'xiaomi',
    chip: 'mi XIAOMI',
    tagline: 'UP TO 80% OFF',
    emoji: '📱',
    cardClass: 'bg-[#f8931f] text-white',
    chipClass: 'bg-white/20 text-white',
  },
];

export interface EssentialItem {
  icon: string;
  label: string;
  offer: string;
}

export const dailyEssentials: EssentialItem[] = [
  { icon: '🧺', label: 'Daily Essentials', offer: 'UP TO 50% OFF' },
  { icon: '🥦', label: 'Vegetables', offer: 'UP TO 50% OFF' },
  { icon: '🍎', label: 'Fruits', offer: 'UP TO 50% OFF' },
  { icon: '🍓', label: 'Strawberry', offer: 'UP TO 50% OFF' },
  { icon: '🥭', label: 'Mango', offer: 'UP TO 50% OFF' },
  { icon: '🍒', label: 'Cherry', offer: 'UP TO 50% OFF' },
];
