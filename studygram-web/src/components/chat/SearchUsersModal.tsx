import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, Loader2 } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { Avatar } from '../Avatar';
import { setActiveConversation, setConversations } from '../../features/chatSlice';

export const SearchUsersModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/chat/search-users?query=${encodeURIComponent(query)}`);
        if (res && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const startChat = async (userId: number) => {
    setCreating(true);
    try {
      const res = await apiClient.post('/chat/conversation', { otherUserId: userId });
      if (res && res.data) {
        // Refresh conversations to get full payload
        const convRes = await apiClient.get('/chat/conversations');
        if (convRes && convRes.data) {
          dispatch(setConversations(convRes.data));
        }
        dispatch(setActiveConversation(res.data.id));
        onClose();
      }
    } catch (err) {
      console.error('Error starting chat:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Message</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">To:</span>
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px] p-2">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : users.length > 0 ? (
            <div className="flex flex-col">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => startChat(user.id)}
                  disabled={creating}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left transition-colors"
                >
                  <Avatar
                    src={user.profileImage}
                    name={user.name}
                    className="w-10 h-10"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length > 1 ? (
            <div className="p-8 text-center text-slate-500">No account found.</div>
          ) : (
            <div className="p-8 text-center text-slate-500">Type a name to search.</div>
          )}
        </div>
      </div>
    </div>
  );
};
