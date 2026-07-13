import { Route, Routes } from 'react-router-dom';
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage';
import './styles/index.css';

/**
 * Exposed root of the analytics MFE. Routes are relative so the shell can
 * mount it under /analytics/* while standalone dev serves it at /.
 */
export default function App() {
  return (
    <Routes>
      <Route index element={<AnalyticsPage />} />
    </Routes>
  );
}
