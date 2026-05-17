import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { LoginPage } from './pages/LoginPage';
import { RepDashboard } from './pages/RepDashboard';
import { SettingsPage } from './pages/SettingsPage';
import { OfflineBanner } from './components/OfflineBanner';
import { initDB } from './db';
import { initServiceWorker } from './services/pwa';
import './index.css';

// Initialize
initDB().catch(console.error);
initServiceWorker();

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-50">
      <OfflineBanner />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<RepDashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}
