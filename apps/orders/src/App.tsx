import { Route, Routes } from 'react-router-dom';
import { OrdersProvider } from '@/features/orders/OrdersProvider';
import { OrderDetailPage } from '@/features/orders/OrderDetailPage';
import { OrdersPage } from '@/features/orders/OrdersPage';
import './styles/index.css';

/**
 * Exposed root of the orders MFE. Routes are relative so the shell can mount
 * it under /orders/* while standalone dev serves it at /.
 */
export default function App() {
  return (
    <OrdersProvider>
      <Routes>
        <Route index element={<OrdersPage />} />
        <Route path=":orderId" element={<OrderDetailPage />} />
      </Routes>
    </OrdersProvider>
  );
}
