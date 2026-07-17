import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Avatar } from '../Avatar';
import type { RootState } from '../../features/store';
import { setActiveConversation, setConversations } from '../../features/chatSlice';
import { Search, Edit, Loader2 } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { SearchUsersModal } from './SearchUsersModal';

export const ConversationList: React.FC<{ loading: boolean }> = ({ loading }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const conversations = useSelector((state: RootState) => state.chat.conversations);
  const activeConversationId = useSelector((state: RootState) => state.chat.activeConversationId);
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [creatingChatId, setCreatingChatId] = useState<number | null>(null);

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchedUsers([]);
      return;
    }
    const searchUsers = async () => {
      setIsSearchingUsers(true);
      try {
        const res = await apiClient.get(`/chat/search-users?query=${encodeURIComponent(searchQuery)}`);
        if (res && res.data) setSearchedUsers(res.data);
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setIsSearchingUsers(false);
      }
    };
    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const startChat = async (userId: number) => {
    setCreatingChatId(userId);
    try {
      const res = await apiClient.post('/chat/conversation', { otherUserId: userId });
      if (res && res.data) {
        const convRes = await apiClient.get('/chat/conversations');
        if (convRes && convRes.data) {
          dispatch(setConversations(convRes.data));
        }
        dispatch(setActiveConversation(res.data.id));
        setSearchQuery('');
      }
    } catch (err) {
      console.error('Error starting chat:', err);
    } finally {
      setCreatingChatId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
        <button
          onClick={() => setShowNewChat(true)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {searchQuery ? 'No conversations found.' : 'No messages yet.'}
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredConversations.map(conv => {
              const isActive = activeConversationId === conv.id;
              // Check if any OTHER participant is online
              const isOnline = conv.participants.some(p => String(p.id) !== String(currentUser?.id) && onlineUsers[p.id]?.online);

              return (
                <button
                  key={conv.id}
                  onClick={() => dispatch(setActiveConversation(conv.id))}
                  className={`flex items-center gap-3 p-3 mx-2 rounded-xl transition-colors text-left ${isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar
                      src={conv.avatar}
                      name={conv.name}
                      className="w-12 h-12"
                    />
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-white'}`}>
                        {conv.name}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                          {new Date(conv.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-sm truncate pr-2 ${isActive ? 'text-indigo-600 dark:text-indigo-300' : (conv.unreadCount ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-500 dark:text-slate-400')}`}>
                        {conv.lastMessage?.text || 'New conversation'}
                      </p>
                      {!!conv.unreadCount && (
                        <span className="flex-shrink-0 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Global User Search Results */}
            {searchQuery.trim().length >= 2 && (
              <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-2">Users</h3>
                {isSearchingUsers ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  </div>
                ) : searchedUsers.length === 0 ? (
                  <div className="text-sm text-slate-500 px-4 py-2 text-center">No users found.</div>
                ) : (
                  searchedUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => startChat(user.id)}
                      disabled={creatingChatId === user.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                    >
                      <Avatar src={user.profileImage} name={user.username} className="w-10 h-10" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{user.username}</p>
                        <p className="text-sm text-slate-500 truncate">{user.fullName || `@${user.username}`}</p>
                      </div>
                      {creatingChatId === user.id && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showNewChat && (
        <SearchUsersModal onClose={() => setShowNewChat(false)} />
      )}
    </div>
  );
};
