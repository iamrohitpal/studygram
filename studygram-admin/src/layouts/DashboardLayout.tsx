import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { toggleTheme, toggleSidebar } from '../features/adminUiSlice';
import { loginAdmin, logoutAdmin } from '../features/adminAuthSlice';
import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  FolderTree,
  FileText,
  Bell,
  Mail,
  Activity,
  Share2,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Layers,
  ChevronDown
} from 'lucide-react';
import { IconButton, Dialog, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import { apiClient } from '../utils/apiClient';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { adminUser } = useSelector((state: RootState) => state.adminAuth);
  const { themeMode, sidebarCollapsed } = useSelector((state: RootState) => state.adminUi);
  const { reports } = useSelector((state: RootState) => state.moderation);

  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [newName, setNewName] = React.useState(adminUser?.fullName || '');
  const [newEmail, setNewEmail] = React.useState(adminUser?.email || '');
  const [newPassword, setNewPassword] = React.useState('');

  React.useEffect(() => {
    if (adminUser) {
      setNewName(adminUser.fullName);
      setNewEmail(adminUser.email);
    }
  }, [adminUser]);

  React.useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [menuOpen]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newPassword) {
        await apiClient.post('/auth/change-password', {
          currentPassword: 'password123',
          newPassword
        });
      }

      const updatedUser = {
        ...adminUser!,
        fullName: newName,
        email: newEmail
      };

      dispatch(loginAdmin({
        user: updatedUser,
        token: localStorage.getItem('studygram_admin_token') || ''
      }));

      alert('Profile successfully updated.');
      setEditOpen(false);
      setNewPassword('');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    }
  };

  const menuItems = [
    {
      name: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/'
    },
    {
      name: 'User Management',
      icon: <Users className="w-5 h-5" />,
      path: '/users'
    },
    {
      name: 'Categories',
      icon: <FolderTree className="w-5 h-5" />,
      path: '/categories'
    },
    {
      name: 'Content Moderation',
      icon: <FileText className="w-5 h-5" />,
      path: '/content'
    },
    {
      name: 'Reports Queue',
      icon: <ShieldAlert className="w-5 h-5" />,
      path: '/reports',
      badge: pendingReportsCount > 0 ? pendingReportsCount : undefined
    },
    {
      name: 'Reminders',
      icon: <Bell className="w-5 h-5" />,
      path: '/reminders'
    },
    {
      name: 'Notification Center',
      icon: <Mail className="w-5 h-5" />,
      path: '/notifications'
    },
    {
      name: 'Analytics Dashboard',
      icon: <Activity className="w-5 h-5" />,
      path: '/analytics'
    },
    {
      name: 'Social Integration',
      icon: <Share2 className="w-5 h-5" />,
      path: '/social'
    },
    {
      name: 'Platform Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/settings'
    },
  ];

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate('/login');
  };

  return (
    <div className={`h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 smooth-transition ${themeMode === 'dark' ? 'dark-theme' : ''}`}>
      {/* Top Header */}
      <header className="bg-[#0b1329] text-white border-b border-slate-800 py-3.5 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50 h-[60px]">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600/25 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold font-heading text-white tracking-tight">StudyGram Admin</span>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 bg-[#1e293b] text-slate-350 hover:text-white rounded-xl border border-slate-800 transition cursor-pointer"
          >
            {themeMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button className="p-2 bg-[#1e293b] text-slate-350 hover:text-white rounded-xl border border-slate-800 transition cursor-pointer relative">
            <Bell className="w-4 h-4" />
            {pendingReportsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {/* Profile Menu Toggle */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="flex items-center gap-2 cursor-pointer hover:bg-[#1e293b] p-1.5 rounded-xl transition"
            >
              <div className="w-8 h-8 bg-indigo-500 text-white flex items-center justify-center font-extrabold rounded-full text-xs">
                {adminUser?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold leading-none text-white">{adminUser?.fullName}</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">{adminUser?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold truncate">{adminUser?.fullName}</p>
                  <p className="text-[10px] text-slate-400 truncate">@{adminUser?.username}</p>
                </div>
                <button
                  onClick={() => {
                    setEditOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center gap-2 cursor-pointer transition"
                >
                  <Settings className="w-4 h-4 text-indigo-500" />
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 cursor-pointer transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container below Header */}
      <div className="flex pt-[60px] h-screen overflow-hidden">
        {/* Sidebar — Fixed, full height below header */}
        <aside className={`fixed top-[60px] left-0 bottom-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col smooth-transition z-40 ${sidebarCollapsed ? 'w-20' : 'w-64'
          }`}>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto themed-scrollbar">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    {item.icon}
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge !== undefined && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer — Toggle Button at Bottom */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <IconButton
              size="small"
              onClick={() => dispatch(toggleSidebar())}
              sx={{
                bgcolor: 'rgba(79,70,229,0.08)',
                '&:hover': { bgcolor: 'rgba(79,70,229,0.16)' },
                borderRadius: '10px',
                width: 36,
                height: 36,
              }}
            >
              {sidebarCollapsed
                ? <ChevronRight className="w-5 h-5 text-indigo-500" />
                : <ChevronLeft className="w-5 h-5 text-indigo-500" />}
            </IconButton>
          </div>
        </aside>

        {/* Main Content Pane — scrollable, offset by sidebar width */}
        <div className={`flex flex-col min-w-0 overflow-y-auto h-full smooth-transition admin-content-scroll ${sidebarCollapsed ? 'ml-20' : 'ml-64'} flex-1`}>
          {/* Content Subheader (shows page title) */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-6 flex justify-between items-center">
            <h2 className="text-base font-bold font-heading">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Admin Panel'}
            </h2>
          </div>

          {/* Content Body */}
          <main className="p-6 md:p-8 flex-1 max-w-6xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '24px', p: 1 }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit', fontWeight: 700 }}>
          Edit Admin Profile
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSaveProfile} className="space-y-4 mt-2">
            <TextField
              label="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Email Address"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="New Password (optional)"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              fullWidth
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setEditOpen(false)} variant="text">
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Save Profile
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
