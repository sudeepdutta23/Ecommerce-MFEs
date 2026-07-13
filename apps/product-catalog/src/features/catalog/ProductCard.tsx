import { observer } from 'mobx-react-lite';
import { type Product } from '@ecom/types';
import { Badge, Button, DealCard } from '@ecom/ui';
import { useCatalogStore } from './CatalogProvider';

const categoryEmoji: Record<string, string> = {
  Smartphones: '📱',
  Audio: '🎧',
  Wearables: '⌚',
  'Daily Essentials': '🧺',
};

const productEmoji: Record<string, string> = {
  'p-7': '🍓',
  'p-8': '🥭',
};

export const ProductCard = observer(function ProductCard({ product }: { product: Product }) {
  const store = useCatalogStore();

  return (
    <DealCard
      name={product.name}
      price={product.price}
      mrp={product.mrp}
      currency={product.currency}
      media={<span aria-hidden>{productEmoji[product.id] ?? categoryEmoji[product.category] ?? '📦'}</span>}
      footer={
        product.inStock ? (
          <Button size="sm" className="w-full" onClick={() => store.addToCart(product)}>
            Add to cart
          </Button>
        ) : (
          <Badge tone="negative">Out of stock</Badge>
        )
      }
    />
  );
});
