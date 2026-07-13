import { Route, Routes } from 'react-router-dom';
import { CatalogProvider } from '@/features/catalog/CatalogProvider';
import { CatalogPage } from '@/features/catalog/CatalogPage';
import './styles/index.css';

/**
 * Exposed root of the product-catalog MFE. Routes are relative so the shell
 * can mount it under /catalog/* while standalone dev serves it at /.
 */
export default function App() {
  return (
    <CatalogProvider>
      <Routes>
        <Route index element={<CatalogPage />} />
      </Routes>
    </CatalogProvider>
  );
}
