import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { updateReminderSettings, addReminderTemplate, deleteReminderTemplate } from '../features/moderationSlice';
import { Bell, Clock, Plus, Trash, Check } from 'lucide-react';
import { Switch, TextField, Button, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';

export const Reminders: React.FC = () => {
  const dispatch = useDispatch();
  const { reminder } = useSelector((state: RootState) => state.moderation);
  
  const [isEnabled, setIsEnabled] = useState(reminder.isEnabled);
  const [dailyTime, setDailyTime] = useState(reminder.dailyTime);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSaveSettings = () => {
    dispatch(updateReminderSettings({ dailyTime, isEnabled }));
    alert('Daily study reminder settings updated.');
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    dispatch(addReminderTemplate({ title, content }));
    setOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
        <div>
          <h3 className="font-extrabold text-sm font-heading flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Daily Reminder Settings
          </h3>
          <p className="text-xs text-slate-500 mt-1">Configure automated push notifications sent to students to prompt daily study sessions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/40">
            <div>
              <span className="block text-xs font-semibold">Enable Reminders</span>
              <span className="text-[10px] text-slate-400">Toggle automated daily alerts.</span>
            </div>
            <Switch checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Preferred Daily Send Time
            </label>
            <input
              type="time"
              value={dailyTime}
              onChange={(e) => setDailyTime(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleSaveSettings}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl text-xs transition cursor-pointer self-stretch md:self-auto flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Save Reminder Config
          </button>
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
          <div>
            <h3 className="font-extrabold text-sm font-heading flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" />
              Notification Templates
            </h3>
            <p className="text-xs text-slate-500 mt-1">Manage content templates used for daily reminder alerts.</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reminder.templates.map(t => (
            <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <span className="font-bold text-xs block">{t.title}</span>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed italic">
                  "{t.content}"
                </p>
              </div>
              <div className="flex justify-end mt-4 border-t border-slate-100 dark:border-slate-800/40 pt-2">
                <IconButton size="small" color="error" onClick={() => dispatch(deleteReminderTemplate(t.id))}>
                  <Trash className="w-4 h-4" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Dialog */}
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
        <DialogTitle sx={{ fontFamily: 'Outfit', fontWeight: 700 }}>New Reminder Template</DialogTitle>
        <DialogContent>
          <form onSubmit={handleCreateTemplate} className="space-y-4 mt-2">
            <TextField
              label="Template Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Notification Message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Use {{username}} for dynamic replacement"
              multiline
              rows={3}
              fullWidth
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setOpen(false)} variant="text">
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
