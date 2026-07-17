import React, { useState } from 'react';
import {
  Users as UsersIcon,
  Search,
  Ban,
  ShieldCheck,
  Download,
  Trash,
  KeyRound,
  Eye,
  Info
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  Button
} from '@mui/material';

import { apiClient } from '../utils/apiClient';
import { useEffect } from 'react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  // Selected User details dialog
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/admin/users');
      if (res.status === 'success') {
        const mapped = res.data.map((u: any) => ({
          id: String(u.id),
          fullName: u.name || 'Anonymous User',
          username: u.username,
          email: u.email,
          role: u.role || 'student',
          uploadsCount: 0,
          reportsCount: 0,
          status: u.status || 'active',
          bio: u.bio,
          joinedAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filters
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = roleFilter === 'All' || u.role === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Paginated chunk
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleStatusToggle = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const targetStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await apiClient.post('/admin/users/status', { userId: Number(userId), status: targetStatus });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user permanently? This will erase all their uploads and notes.')) {
      try {
        await apiClient.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch (err: any) {
        alert(err.message || 'Failed to delete user.');
      }
    }
  };

  const handleResetPassword = async (userId: string, username: string) => {
    const newPassword = prompt(`Enter a new password for @${username}:`);
    if (!newPassword) return;
    try {
      await apiClient.post(`/admin/users/${userId}/reset-password`, { newPassword });
      alert(`Password for @${username} has been reset successfully.`);
    } catch (err: any) {
      alert(err.message || 'Failed to reset password.');
    }
  };

  // CSV Export utility
  const exportToCSV = () => {
    const headers = ['ID', 'Full Name', 'Username', 'Email', 'Role', 'Uploads', 'Reports Received', 'Status'];
    const rows = filteredUsers.map(u => [
      u.id,
      u.fullName,
      u.username,
      u.email,
      u.role,
      u.uploadsCount,
      u.reportsCount,
      u.status
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `studygram_users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="text-center py-12 text-sm font-semibold text-slate-500">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm font-heading flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-indigo-500" />
            Super Admin User Management
          </h3>
          <p className="text-xs text-slate-500 mt-1">Manage user roles, review profiles, reset credentials, or suspend access.</p>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={exportToCSV}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs transition cursor-pointer shadow-md shadow-indigo-500/10"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, or email..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none"
        >
          <option value="All">All Roles</option>
          <option value="Student">Student</option>
          <option value="Moderator">Moderator</option>
          <option value="Admin">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Data Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '24px', boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'background.paper' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><span className="text-xs font-bold font-heading uppercase text-slate-500">User Details</span></TableCell>
              <TableCell><span className="text-xs font-bold font-heading uppercase text-slate-500">Email</span></TableCell>
              <TableCell><span className="text-xs font-bold font-heading uppercase text-slate-500">Role</span></TableCell>
              <TableCell align="center"><span className="text-xs font-bold font-heading uppercase text-slate-500">Uploads</span></TableCell>
              <TableCell align="center"><span className="text-xs font-bold font-heading uppercase text-slate-500">Reports</span></TableCell>
              <TableCell align="center"><span className="text-xs font-bold font-heading uppercase text-slate-500">Status</span></TableCell>
              <TableCell align="right"><span className="text-xs font-bold font-heading uppercase text-slate-500">Actions</span></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <p className="text-xs text-slate-500 py-6">No users found matching requirements.</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <div>
                      <span className="font-semibold text-xs block">{user.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">@{user.username}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-xs text-slate-650 dark:text-slate-400">{user.email}</span></TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      size="small"
                      onChange={(e) => {
                        const newRole = e.target.value as any;
                        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                        alert(`User @${user.username} role updated locally to ${newRole}.`);
                      }}
                      sx={{ fontSize: '11px', borderRadius: '8px', height: '28px', minWidth: '100px' }}
                    >
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="moderator">Moderator</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="superadmin">Super Admin</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell align="center"><span className="text-xs font-bold">{user.uploadsCount}</span></TableCell>
                  <TableCell align="center">
                    <span className={`text-xs font-bold ${user.reportsCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {user.reportsCount}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      user.status === 'active'
                        ? 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex justify-end gap-1">
                      <Tooltip title="View Profile Detail">
                        <IconButton size="small" onClick={() => setSelectedUser(user)}>
                          <Eye className="w-4 h-4 text-slate-500" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset Password">
                        <IconButton size="small" onClick={() => handleResetPassword(user.id, user.username)}>
                          <KeyRound className="w-4 h-4 text-indigo-500" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.status === 'active' ? 'Suspend User' : 'Activate User'}>
                        <IconButton
                          size="small"
                          color={user.status === 'active' ? 'error' : 'success'}
                          onClick={() => handleStatusToggle(user.id)}
                        >
                          {user.status === 'active' ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Account">
                        <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                          <Trash className="w-4 h-4" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      {filteredUsers.length > rowsPerPage && (
        <div className="flex justify-end gap-2 pt-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(prev => prev - 1)}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            Previous
          </button>
          <button
            disabled={(page + 1) * rowsPerPage >= filteredUsers.length}
            onClick={() => setPage(prev => prev + 1)}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* Selected User Details Dialog */}
      <Dialog
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '24px', p: 1 }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit', fontWeight: 700, display: 'flex', items: 'center', gap: 1 }}>
          <Info className="w-5 h-5 text-indigo-500" />
          User Profile Details
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          {selectedUser && (
            <div className="space-y-3">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Full Name</span>
                <span className="text-sm font-semibold">{selectedUser.fullName}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Username</span>
                <span className="text-sm font-medium">@{selectedUser.username}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Email Address</span>
                <span className="text-sm font-medium">{selectedUser.email}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Bio</span>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                  {selectedUser.bio || 'No profile bio provided.'}
                </p>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Account Joined</span>
                <span className="text-xs font-semibold">{selectedUser.joinedAt || 'N/A'}</span>
              </div>
              <div className="flex justify-end pt-3">
                <Button variant="contained" onClick={() => setSelectedUser(null)}>
                  Close Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
