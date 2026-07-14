import { type Product } from '@ecom/types';
import { ImageWithFallback, cn } from '@ecom/ui';
import { productEmojiFor } from './product-media';

/**
 * Product visual: the real photo when available, otherwise (or when the CDN
 * image fails to load) the emoji placeholder.
 */
export function ProductMedia({
  product,
  className,
  emojiClassName,
}: {
  product: Product;
  className?: string;
  emojiClassName?: string;
}) {
  const emoji = (
    <span aria-hidden className={emojiClassName}>
      {productEmojiFor(product)}
    </span>
  );

  if (!product.imageUrl) {
    return emoji;
  }

  return (
    <ImageWithFallback
      src={product.imageUrl}
      alt=""
      className={cn('h-full w-full object-cover', className)}
      fallback={emoji}
    />
  );
}
