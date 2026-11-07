import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAdmin } from '@/features/admin/RequireAdmin';
import { AdminLayout } from '@/features/admin/AdminLayout';
import { OverviewPage } from '@/features/admin/pages/OverviewPage';
import { UsersPage } from '@/features/admin/pages/UsersPage';
import { OrganizationsPage } from '@/features/admin/pages/OrganizationsPage';
import { CategoriesPage } from '@/features/admin/pages/CategoriesPage';
import { RolesPage } from '@/features/admin/pages/RolesPage';
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
          <Route path="users" element={<UsersPage />} />
          <Route path="organizations" element={<OrganizationsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
      </Routes>
    </RequireAdmin>
  );
}
