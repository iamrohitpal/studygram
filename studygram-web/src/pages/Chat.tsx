import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { setConversations } from '../features/chatSlice';
import { apiClient } from '../utils/apiClient';
import { useSocket } from '../contexts/SocketContext';
import { ConversationList } from '../components/chat/ConversationList';
import { ChatWindow } from '../components/chat/ChatWindow';

export const Chat: React.FC = () => {
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();
  const activeConversationId = useSelector((state: RootState) => state.chat.activeConversationId);
  const conversations = useSelector((state: RootState) => state.chat.conversations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await apiClient.get('/chat/conversations');
        if (res && res.data) {
          dispatch(setConversations(res.data));
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [dispatch]);

  // Join chat rooms on connect
  useEffect(() => {
    if (socket && isConnected && conversations.length > 0) {
      const userIds = new Set<number>();
      conversations.forEach(c => {
        socket.emit('join_conversation', c.id);
        c.participants.forEach(p => userIds.add(p.id));
      });
      socket.emit('check_online_status', Array.from(userIds));
    }
  }, [socket, isConnected, conversations]);

  return (
    <div className="flex w-full h-full bg-white dark:bg-slate-950 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      {/* Left Sidebar - Conversations */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 ${activeConversationId ? 'hidden md:block' : 'block'}`}>
        <ConversationList loading={loading} />
      </div>

      {/* Right Content - Chat Window */}
      <div className={`flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        {activeConversationId ? (
          <ChatWindow conversationId={activeConversationId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 mb-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Messages</h2>
            <p className="text-slate-500 dark:text-slate-400">Send private photos and messages to a friend or group.</p>
          </div>
        )}
      </div>
    </div>
  );
};
