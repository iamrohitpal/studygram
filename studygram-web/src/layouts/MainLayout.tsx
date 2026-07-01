import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { toggleTheme } from '../features/uiSlice';
import { logout } from '../features/authSlice';
import { apiClient } from '../utils/apiClient';
import {
  Home,
  Search,
  PlusSquare,
  Bookmark,
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
  const { themeMode } = useSelector((state: RootState) => state.ui);
  
  const sidebarOpen = true;
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      if (response && response.data) {
        setNotifications(response.data.map((n: any) => ({
          id: String(n.id),
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          createdAt: new Date(n.createdAt).toLocaleDateString()
        })));
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
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

  const menuItems = [
    { name: 'Home Feed', icon: <Home className="w-5 h-5" />, path: '/' },
    { name: 'Search', icon: <Search className="w-5 h-5" />, path: '/search' },
    { name: 'Study Reels', icon: <Film className="w-5 h-5" />, path: '/reels' }
  ];

  if (user) {
    menuItems.push(
      { name: 'Messages', icon: <MessageCircle className="w-5 h-5" />, path: '/chat' },
      { name: 'Upload Center', icon: <PlusSquare className="w-5 h-5" />, path: '/upload' },
      { name: 'Saved Content', icon: <Bookmark className="w-5 h-5" />, path: '/saved' },
      { name: 'Profile', icon: <User className="w-5 h-5" />, path: `/profile` },
      { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' }
    );
  }

  const getMobileHeaderTitle = () => {
    if (location.pathname === '/') return 'StudyGram';
    if (location.pathname === '/search') return 'Explore';
    if (location.pathname === '/reels') return 'Study Reels';
    if (location.pathname === '/upload') return 'New Post';
    if (location.pathname === '/saved') return 'Saved Content';
    if (location.pathname.startsWith('/profile')) return user?.username || 'Profile';
    if (location.pathname === '/settings') return 'Settings';
    return 'StudyGram';
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 smooth-transition ${themeMode === 'dark' ? 'dark-theme' : ''}`}>
      {/* Top Navbar for Mobile */}
      <header className="flex md:hidden items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-[110]">
        <h1 className={`text-xl font-bold font-heading ${location.pathname === '/' ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent' : 'text-slate-800 dark:text-slate-100'}`}>
          {getMobileHeaderTitle()}
        </h1>
        <div className="flex items-center gap-1">
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
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
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
      <main className="flex-1 min-w-0 flex flex-col md:h-screen md:overflow-y-auto overflow-x-hidden">
        <div className={location.pathname.startsWith('/chat') ? "w-full h-full flex-1" : "max-w-7xl mx-auto w-full p-4 md:p-8 flex-1 pb-20 md:pb-8"}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden flex items-center justify-around bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 fixed bottom-0 left-0 right-0 py-2 z-[110]">
        {menuItems.filter(item => item.path !== '/search' && item.path !== '/saved').slice(0, 5).map((item) => {
          const isActive = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 p-2 transition-all ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
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
          notifications.map((notif) => (
            <MenuItem key={notif.id} onClick={handleNotifClose} sx={{ borderBottom: '1px solid rgba(0,0,0,0.03)', py: 1.5 }}>
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
          ))
        )}
      </MuiMenu>
    </div>
  );
};
