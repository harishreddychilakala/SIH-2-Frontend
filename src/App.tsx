import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { RecommendPage } from './pages/RecommendPage';
import { RecommendationResultPage } from './pages/RecommendationResultPage';
import { ComparePage } from './pages/ComparePage';
import { CommoditiesPage } from './pages/CommoditiesPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { ChatbotPage } from './pages/ChatbotPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Marketing & Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/recommend" element={<RecommendPage />} />
              <Route path="/chat" element={<ChatbotPage />} />
              <Route path="/chatbot" element={<Navigate to="/chat" replace />} />
              <Route path="/recommendation/:id" element={<RecommendationResultPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/commodities" element={<CommoditiesPage />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;

