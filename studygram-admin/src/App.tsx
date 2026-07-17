import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './features/store';
import type { RootState } from './features/store';
import { getAdminTheme } from './theme/theme';

// Layouts & Protected Router
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';

import { Loader2 } from 'lucide-react';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      <span className="text-sm font-semibold text-slate-500">Loading console...</span>
    </div>
  </div>
);

// Lazy Loaded Pages
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Users = lazy(() => import('./pages/Users').then(m => ({ default: m.Users })));
const Categories = lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })));
const Content = lazy(() => import('./pages/Content').then(m => ({ default: m.Content })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Reminders = lazy(() => import('./pages/Reminders').then(m => ({ default: m.Reminders })));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter').then(m => ({ default: m.NotificationCenter })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const SocialIntegration = lazy(() => import('./pages/SocialIntegration').then(m => ({ default: m.SocialIntegration })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin').then(m => ({ default: m.AdminLogin })));

// Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <h2 className="text-xl font-bold font-heading">Console Error</h2>
            <p className="text-sm text-slate-500">Failed to render dashboard page component.</p>
            <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-4 py-2 rounded-xl">
              Reload Console
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { themeMode } = useSelector((state: RootState) => state.adminUi);
  const muiTheme = getAdminTheme(themeMode);

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Protected Dashboard Console */}
            <Route element={<AdminProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/content" element={<Content />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reminders" element={<Reminders />} />
                <Route path="/notifications" element={<NotificationCenter />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/social" element={<SocialIntegration />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Public Admin Routes */}
            <Route path="/login" element={<AdminLogin />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
