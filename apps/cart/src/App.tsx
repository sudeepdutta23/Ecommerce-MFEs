import { Route, Routes } from 'react-router-dom';
import { CartProvider } from '@/features/cart/CartProvider';
import { CartPage } from '@/features/cart/CartPage';
import './styles/index.css';

/**
 * Exposed root of the cart MFE. Routes are relative so the shell can mount it
 * under /cart/* while standalone dev serves it at /.
 */
export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route index element={<CartPage />} />
      </Routes>
    </CartProvider>
  );
}
