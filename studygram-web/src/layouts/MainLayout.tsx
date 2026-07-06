import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { toggleTheme, setHasNewPosts, setHasNewReels } from '../features/uiSlice';
import { logout } from '../features/authSlice';
import { apiClient } from '../utils/apiClient';
import {
  Home,
  Search,
  PlusSquare,
  Bell,
  Settings,
  LogOut,
  User,
  Sun,
  Moon,
  Film,
  MessageCircle
} from 'lucide-react';
import {
  Badge,
  IconButton,
  Menu as MuiMenu,
  MenuItem
} from '@mui/material';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);
  const { themeMode, hasNewPosts, hasNewReels } = useSelector((state: RootState) => state.ui);
  const { conversations } = useSelector((state: RootState) => state.chat);

  const totalUnreadChats = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

  const sidebarOpen = true;
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifPage, setNotifPage] = useState(1);
  const [notifHasMore, setNotifHasMore] = useState(true);
  const [notifLoadingMore, setNotifLoadingMore] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (location.pathname === '/') {
      dispatch(setHasNewPosts(false));
    }
    if (location.pathname === '/reels') {
      dispatch(setHasNewReels(false));
    }
  }, [location.pathname, dispatch]);

  const fetchNotifications = async () => {
    try {
      setNotifPage(1);
      setNotifHasMore(true);
      const response = await apiClient.get('/notifications?page=1&limit=10');
      if (response && response.data) {
        if (response.data.length < 10) setNotifHasMore(false);
        setNotifications(response.data.map((n: any) => ({
          id: String(n.id),
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          postId: n.postId,
          createdAt: new Date(n.createdAt).toLocaleDateString()
        })));
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  const loadMoreNotifications = async () => {
    if (notifLoadingMore || !notifHasMore) return;
    setNotifLoadingMore(true);
    try {
      const nextPage = notifPage + 1;
      const response = await apiClient.get(`/notifications?page=${nextPage}&limit=10`);
      if (response && response.data) {
        if (response.data.length === 0) {
          setNotifHasMore(false);
        } else {
          const newNotifs = response.data.map((n: any) => ({
            id: String(n.id),
            title: n.title,
            message: n.message,
            isRead: n.isRead,
            postId: n.postId,
            createdAt: new Date(n.createdAt).toLocaleDateString()
          }));
          setNotifications(prev => [...prev, ...newNotifs]);
          setNotifPage(nextPage);
        }
      }
    } catch (e) {
      console.error('Error loading more notifications:', e);
    } finally {
      setNotifLoadingMore(false);
    }
  };

  const handleNotifScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMoreNotifications();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
    // Mark notifications read on the backend
    notifications.forEach(async (n) => {
      if (!n.isRead) {
        try {
          await apiClient.put(`/notifications/${n.id}/read`);
        } catch (err) {
          console.error(err);
        }
      }
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleMenuClick = (path: string) => {
    if (path === '/') {
      if (location.pathname === '/') {
        window.location.reload();
      } else {
        navigate('/');
      }
    } else {
      navigate(path);
    }
  };

  const menuItems = [
    {
      name: 'Home Feed',
      icon: (
        <Badge color="error" variant="dot" invisible={!hasNewPosts}>
          <Home className="w-5 h-5" />
        </Badge>
      ),
      path: '/'
    },
    { name: 'Search', icon: <Search className="w-5 h-5" />, path: '/search' },
    {
      name: 'Study Reels',
      icon: (
        <Badge color="error" variant="dot" invisible={!hasNewReels}>
          <Film className="w-5 h-5" />
        </Badge>
      ),
      path: '/reels'
    }
  ];

  if (user) {
    menuItems.push(
      {
        name: 'Messages',
        icon: (
          <Badge color="error" variant="dot" invisible={totalUnreadChats === 0}>
            <MessageCircle className="w-5 h-5" />
          </Badge>
        ),
        path: '/chat'
      },
      { name: 'Upload Center', icon: <PlusSquare className="w-5 h-5" />, path: '/upload' },
      { name: 'Profile', icon: <User className="w-5 h-5" />, path: `/profile` },
      { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' }
    );
  }

  const getMobileHeaderTitle = () => {
    if (location.pathname === '/') return 'StudyGram';
    if (location.pathname === '/search') return 'Explore';
    if (location.pathname === '/reels') return 'Study Reels';
    if (location.pathname === '/upload') return 'New Post';
    if (location.pathname.startsWith('/profile')) return user?.username || 'Profile';
    if (location.pathname === '/settings') return 'Settings';
    return 'StudyGram';
  };

  return (
    <div className={`h-[100dvh] w-full flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 smooth-transition ${themeMode === 'dark' ? 'dark-theme' : ''}`}>
      {/* Top Navbar for Mobile */}
      <header className="flex md:hidden items-center justify-between px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-[110] shadow-sm">
        <h1 className={`text-xl font-extrabold font-heading tracking-tight ${location.pathname === '/' ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent' : 'text-slate-800 dark:text-slate-100'}`}>
          {getMobileHeaderTitle()}
        </h1>
        <div className="flex items-center gap-1.5">
          {location.pathname.startsWith('/profile') && user && (
            <>
              <IconButton size="small" onClick={() => navigate('/settings')}>
                <Settings className="w-5 h-5" />
              </IconButton>
              <IconButton size="small" onClick={handleLogout} color="error">
                <LogOut className="w-5 h-5" />
              </IconButton>
            </>
          )}
          <IconButton size="small" onClick={() => dispatch(toggleTheme())}>
            {themeMode === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </IconButton>
          <IconButton size="small" onClick={handleNotifOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <Bell className="w-5 h-5" />
            </Badge>
          </IconButton>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 p-5 h-screen sticky top-0 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent font-heading cursor-pointer" onClick={() => navigate('/')}>
            StudyGram
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => handleMenuClick(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
              >
                {item.icon}
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User Card at bottom of Desktop Sidebar */}
        <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar
                  src={user.avatarUrl}
                  name={user.fullName || 'User'}
                  className="w-10 h-10 ring-2 ring-indigo-500/20"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <IconButton size="small" onClick={() => dispatch(toggleTheme())}>
                  {themeMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </IconButton>
                <IconButton size="small" onClick={handleNotifOpen}>
                  <Badge badgeContent={unreadCount} color="error">
                    <Bell className="w-4 h-4" />
                  </Badge>
                </IconButton>
                <IconButton size="small" onClick={handleLogout} color="error">
                  <LogOut className="w-4 h-4" />
                </IconButton>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors"
              >
                Log In
              </button>
              <div className="flex justify-center">
                <IconButton size="small" onClick={() => dispatch(toggleTheme())}>
                  {themeMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </IconButton>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto overflow-x-hidden relative">
        <div className={location.pathname.startsWith('/chat') ? "w-full h-full flex-1" : "max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8 flex-1 pb-24 md:pb-8"}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden flex items-center justify-around bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 fixed bottom-0 left-0 right-0 py-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-[110] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {menuItems.filter(item => item.path !== '/search' && item.path !== '/saved').slice(0, 5).map((item) => {
          const isActive = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
          return (
            <button
              key={item.name}
              onClick={() => handleMenuClick(item.path)}
              className={`flex flex-col items-center gap-0.5 p-2 transition-all ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* Notifications Popover Menu */}
      <MuiMenu
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleNotifClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxHeight: 400,
              borderRadius: '16px',
              border: themeMode === 'light' ? '1px solid #e2e8f0' : '1px solid #1f2937',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              bgcolor: themeMode === 'light' ? '#ffffff' : '#111827',
            }
          }
        }}
      >
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="font-bold font-heading">Notifications</span>
          {unreadCount > 0 && <span className="text-xs text-indigo-500 font-semibold">{unreadCount} new</span>}
        </div>

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-500">
            No notifications yet
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[300px]" onScroll={handleNotifScroll}>
            {notifications.map((notif) => (
              <MenuItem key={notif.id} onClick={() => {
                handleNotifClose();
                if (notif.postId) {
                  navigate(`/post/${notif.postId}`);
                }
              }} sx={{ borderBottom: '1px solid rgba(0,0,0,0.03)', py: 1.5 }}>
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{notif.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-normal leading-relaxed mt-0.5">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{notif.createdAt}</span>
                  </div>
                </div>
              </MenuItem>
            ))}
            {notifLoadingMore && (
              <div className="p-3 text-center text-xs text-slate-500 animate-pulse">
                Loading older notifications...
              </div>
            )}
          </div>
        )}
      </MuiMenu>
    </div>
  );
};
