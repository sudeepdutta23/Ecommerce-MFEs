import { type Product } from '@ecom/types';

const categoryEmoji: Record<string, string> = {
  Smartphones: '📱',
  Audio: '🎧',
  Wearables: '⌚',
  'Daily Essentials': '🧺',
  Electronics: '💻',
  Fashion: '👕',
  'Home & Kitchen': '🍳',
  Beauty: '💄',
};

/** Placeholder product visual until real imagery lands. */
export function productEmojiFor(product: Product): string {
  return categoryEmoji[product.category] ?? '📦';
}
