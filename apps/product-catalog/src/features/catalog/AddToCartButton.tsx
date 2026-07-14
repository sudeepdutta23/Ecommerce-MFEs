import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { type Product } from '@ecom/types';
import { Button, cn, type ButtonProps } from '@ecom/ui';
import { useCatalogStore } from './CatalogProvider';

const ADDED_FEEDBACK_MS = 1200;

export type AddToCartButtonProps = { product: Product } & Omit<ButtonProps, 'onClick' | 'children'>;

/** Add-to-cart button with transient "✓ Added" feedback, shared by card and overview. */
export const AddToCartButton = observer(function AddToCartButton({
  product,
  className,
  ...rest
}: AddToCartButtonProps) {
  const store = useCatalogStore();
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleAdd = () => {
    store.addToCart(product);
    setJustAdded(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setJustAdded(false), ADDED_FEEDBACK_MS);
  };

  return (
    <Button
      className={cn(justAdded && 'animate-pop !bg-positive hover:!bg-positive', className)}
      onClick={handleAdd}
      {...rest}
    >
      {justAdded ? '✓ Added to cart' : 'Add to cart'}
    </Button>
  );
});
