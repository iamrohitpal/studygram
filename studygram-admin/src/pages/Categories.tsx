import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit3, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { apiClient } from '../utils/apiClient';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/categories');
      if (res.status === 'success') {
        const mapped = res.data.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          description: c.slug || '',
          postCount: 0
        }));
        setCategories(mapped);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setEditId(null);
    setOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setName(cat.name);
    setDescription(cat.description);
    setEditId(cat.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const icon = 'book';

    try {
      if (editId) {
        await apiClient.put(`/admin/categories/${editId}`, { name, slug, icon });
      } else {
        await apiClient.post('/admin/categories', { name, slug, icon });
      }
      fetchCategories();
      setOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save category.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this study category?')) {
      try {
        await apiClient.delete(`/admin/categories/${id}`);
        fetchCategories();
      } catch (err: any) {
        alert(err.message || 'Failed to delete category.');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-sm font-semibold text-slate-500">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm font-heading flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-indigo-500" />
            Category Management
          </h3>
          <p className="text-xs text-slate-500 mt-1">Configure subjects, exams, and topics for students to tag notes.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Category
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-extrabold text-sm font-heading">{cat.name}</span>
                <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                  {cat.postCount} uploads
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{cat.description || 'No description provided.'}</p>
            </div>
            
            <div className="flex justify-end gap-1.5 mt-5 border-t border-slate-100 dark:border-slate-800/40 pt-3">
              <Tooltip title="Edit Subject">
                <IconButton size="small" onClick={() => handleOpenEdit(cat)}>
                  <Edit3 className="w-4 h-4 text-indigo-500" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Subject">
                <IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}>
                  <Trash className="w-4 h-4" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      {/* Category Editor Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '24px', p: 1 }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit', fontWeight: 700 }}>
          {editId ? 'Update Category' : 'Create Category'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <TextField
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setOpen(false)} variant="text">
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                {editId ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
