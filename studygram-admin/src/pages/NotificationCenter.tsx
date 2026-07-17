import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { sendBroadcast } from '../features/notificationSlice';
import { Mail, Send, Radio } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField
} from '@mui/material';

export const NotificationCenter: React.FC = () => {
  const dispatch = useDispatch();
  const { broadcasts } = useSelector((state: RootState) => state.notification);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    dispatch(sendBroadcast({
      title,
      message,
      sentBy: 'Super Admin',
      recipientsCount: 1824, // total simulated user base
    }));

    alert('Broadcast notification sent to all active StudyGram users.');
    setTitle('');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Broadcast Sender Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-3">
            <Radio className="w-5 h-5 text-indigo-500 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-sm font-heading">Broadcast Alert</h3>
              <p className="text-[10px] text-slate-500">Send instant push alert to all users</p>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <TextField
              label="Alert Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="small"
              fullWidth
              required
            />
            <TextField
              label="Alert Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={4}
              size="small"
              fullWidth
              required
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
            >
              <Send className="w-4.5 h-4.5" />
              Broadcast Now
            </button>
          </form>
        </div>

        {/* Sent Alerts Log Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-3">
            <Mail className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="font-extrabold text-sm font-heading">Broadcast Logs</h3>
              <p className="text-[10px] text-slate-500">History of all community announcements</p>
            </div>
          </div>

          <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: 'none', border: '1px solid #e2e8f0', bgcolor: 'background.paper' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><span className="text-[10px] font-bold uppercase text-slate-500">Announcement</span></TableCell>
                  <TableCell><span className="text-[10px] font-bold uppercase text-slate-500">Sent By</span></TableCell>
                  <TableCell align="center"><span className="text-[10px] font-bold uppercase text-slate-500">Recipients</span></TableCell>
                  <TableCell align="right"><span className="text-[10px] font-bold uppercase text-slate-500">Date</span></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {broadcasts.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div>
                        <span className="font-semibold text-xs block">{b.title}</span>
                        <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{b.message}</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-xs">{b.sentBy}</span></TableCell>
                    <TableCell align="center"><span className="text-xs font-bold">{b.recipientsCount}</span></TableCell>
                    <TableCell align="right"><span className="text-[10px] text-slate-400 font-semibold">{b.sentAt}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

      </div>
    </div>
  );
};
