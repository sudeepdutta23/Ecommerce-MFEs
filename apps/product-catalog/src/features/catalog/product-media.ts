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

const productEmoji: Record<string, string> = {
  'p-7': '🍓',
  'p-8': '🥭',
};

/** Placeholder product visual until real imagery lands. */
export function productEmojiFor(product: Product): string {
  return productEmoji[product.id] ?? categoryEmoji[product.category] ?? '📦';
}
