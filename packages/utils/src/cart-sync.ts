import { type CartItem } from '@ecom/types';
import { getAuthToken } from './auth-session';
import { assetUrl, cartApi, type ServerCart, type StorefrontProduct } from './backend-api';
import { addCartItem, getCartCount, getCartItems, saveCartItems } from './cart-storage';
import { eventBus } from './event-bus';

/**
 * The cart across MFEs. For a signed-in customer the backend owns it, and cart-storage holds a copy
 * for the shell's badge. A guest's cart exists only in this browser, because the backend has no guest
 * carts; it moves to the account at sign-in (mergeGuestCart).
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Store the server's cart locally and tell everyone. Images are kept: the cart API returns none. */
export function mirrorServerCart(cart: ServerCart): CartItem[] {
  const images = new Map(getCartItems().map((item) => [item.productId, item.imageUrl]));
  const items: CartItem[] = cart.lines.map((line) => ({
    productId: line.productId,
    name: line.name,
    price: line.unitPrice,
    currency: cart.currency,
    quantity: line.quantity,
    imageUrl: images.get(line.productId),
    sellerName: line.seller.name,
    problem: line.problem,
  }));
  saveCartItems(items);
  eventBus.emit('cart:changed', { count: getCartCount(items) });
  return items;
}

export async function refreshCart(): Promise<ServerCart | null> {
  if (!getAuthToken()) return null;
  const cart = await cartApi.get();
  mirrorServerCart(cart);
  return cart;
}

/** Add one unit. The API sets absolute quantities, so it is sent the current one plus one. */
export async function addProductToCart(product: {
  id: string;
  name: string;
  price: number;
  currency: string;
  imageUrl?: string;
}): Promise<void> {
  if (!getAuthToken()) {
    const items = addCartItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      imageUrl: product.imageUrl,
    });
    eventBus.emit('cart:changed', { count: getCartCount(items) });
    return;
  }
  const lines = getCartItems();
  const quantity = (lines.find((item) => item.productId === product.id)?.quantity ?? 0) + 1;
  const cart = await cartApi.setQuantity(product.id, quantity);
  if (product.imageUrl && !lines.some((item) => item.productId === product.id)) {
    saveCartItems([...lines, { productId: product.id, name: product.name, price: product.price, currency: product.currency, quantity, imageUrl: product.imageUrl }]);
  }
  mirrorServerCart(cart);
}

/**
 * Call right after sign-in: moves the guest's lines to the account, one request per line because the API
 * has no bulk merge. A line that cannot be added (no longer on sale) is dropped, not fatal.
 */
export async function mergeGuestCart(): Promise<void> {
  const guest = getCartItems().filter((item) => UUID.test(item.productId));
  const server = await cartApi.get();
  for (const item of guest) {
    const existing = server.lines.find((line) => line.productId === item.productId)?.quantity ?? 0;
    try {
      await cartApi.setQuantity(item.productId, Math.max(existing, item.quantity));
    } catch {
      // Sold out or withdrawn since it was added.
    }
  }
  await refreshCart();
}

export function firstImageUrl(product: Pick<StorefrontProduct, 'images'>): string | undefined {
  return product.images[0] ? assetUrl(product.images[0]) : undefined;
}
