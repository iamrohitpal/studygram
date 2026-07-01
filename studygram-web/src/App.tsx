import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './features/store';
import type { RootState } from './features/store';
import { getMuiTheme } from './theme/theme';
import { SocketProvider } from './contexts/SocketContext';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { logout } from './features/authSlice';

// Loading indicator
import { Loader2 } from 'lucide-react';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      <span className="text-sm font-semibold text-slate-500">Loading StudyGram...</span>
    </div>
  </div>
);

// Lazy Loaded Pages
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Search = lazy(() => import('./pages/Search').then(module => ({ default: module.Search })));
const Reels = lazy(() => import('./pages/Reels').then(module => ({ default: module.Reels })));
const Upload = lazy(() => import('./pages/Upload').then(module => ({ default: module.Upload })));
const Saved = lazy(() => import('./pages/Saved').then(module => ({ default: module.Saved })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const Chat = lazy(() => import('./pages/Chat').then(module => ({ default: module.Chat })));

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(module => ({ default: module.Register })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(module => ({ default: module.ResetPassword })));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail').then(module => ({ default: module.VerifyEmail })));

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100">Oops, something went wrong.</h2>
            <p className="text-sm text-slate-500">We hit an error loading this section. Please try reloading the app.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-xl transition cursor-pointer"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { themeMode } = useSelector((state: RootState) => state.ui);
  const muiTheme = getMuiTheme(themeMode);
  const dispatch = useDispatch();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  React.useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout());
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [dispatch]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Main Layout wrapper for both public and protected routes */}
            <Route element={<MainLayout />}>
              {/* Public Routes (accessible to guests and users) */}
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/reels" element={<Reels />} />

              {/* Protected Routes (require login) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/upload" element={<Upload />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:conversationId" element={<Chat />} />
              </Route>
            </Route>

            {/* Public/Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Route>

            {/* Fallback */}
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
        <SocketProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </SocketProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
