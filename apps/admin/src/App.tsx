import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAdmin } from '@/features/admin/RequireAdmin';
import { AdminLayout } from '@/features/admin/AdminLayout';
import { OverviewPage } from '@/features/admin/pages/OverviewPage';
import { OrdersPage } from '@/features/admin/pages/OrdersPage';
import { ProductsPage } from '@/features/admin/pages/ProductsPage';
import { AuditPage } from '@/features/admin/pages/AuditPage';
import './styles/index.css';

/**
 * Exposed root of the admin MFE. Routes are relative so the shell can mount
 * it under /admin/* while standalone dev serves it at /. Everything sits
 * behind RequireAdmin — only sessions with role 'admin' get past the gate.
 */
export default function App() {
  return (
    <RequireAdmin>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
      </Routes>
    </RequireAdmin>
  );
}
