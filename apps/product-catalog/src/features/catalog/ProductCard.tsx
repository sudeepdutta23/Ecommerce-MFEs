import { Link } from 'react-router-dom';
import { type Product } from '@ecom/types';
import { Badge, DealCard } from '@ecom/ui';
import { AddToCartButton } from './AddToCartButton';
import { ProductMedia } from './ProductMedia';

export function ProductCard({
  product,
  /**
   * Route-relative link target for the overview page. The default works from
   * the catalog index route; pages on sibling routes pass e.g. `../${id}`.
   */
  to = product.id,
}: {
  product: Product;
  to?: string;
}) {
  return (
    <DealCard
      name={product.name}
      price={product.price}
      mrp={product.mrp}
      currency={product.currency}
      media={<ProductMedia product={product} />}
      stretchedLink={
        <Link
          to={to}
          aria-label={`View ${product.name}`}
          className="absolute inset-0 z-[5] rounded-card"
        />
      }
      footer={
        product.inStock ? (
          <AddToCartButton product={product} size="sm" className="w-full" />
        ) : (
          <Badge tone="negative">Out of stock</Badge>
        )
      }
    />
  );
}
