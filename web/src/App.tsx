import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import GeneratorPage from './pages/GeneratorPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import HistoryDetailPage from './pages/HistoryDetailPage';
import AuthPage from './pages/AuthPage';
import SharePage from './pages/SharePage';
import PricingPage from './pages/PricingPage';
import AdminPage from './pages/AdminPage';
import JoinTeamPage from './pages/JoinTeamPage';

export default function App() {
  return (
    <Routes>
      <Route path="/share/:id" element={<SharePage />} />
      <Route path="/join/:token" element={<JoinTeamPage />} />
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="generate/:moduleId" element={<GeneratorPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="history/:id" element={<HistoryDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}
