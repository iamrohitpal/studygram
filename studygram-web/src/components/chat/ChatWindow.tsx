import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../features/store';
import { setActiveConversation, setMessages } from '../../features/chatSlice';
import { ArrowLeft, Phone, Video, Info, Loader2 } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { MessageInput } from './MessageInput';
import { MessageBubble } from './MessageBubble';
import { useSocket } from '../../contexts/SocketContext';

import { useNavigate } from 'react-router-dom';

export const ChatWindow: React.FC<{ conversationId: number }> = ({ conversationId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const conversation = useSelector((state: RootState) => state.chat.conversations.find(c => c.id === conversationId));
  const messages = useSelector((state: RootState) => state.chat.messages[conversationId] || []);
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);
  const typingUser = useSelector((state: RootState) => state.chat.typingStatus[conversationId]);

  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { socket, isConnected } = useSocket();

  // Derive conversation context
  const otherParticipant = conversation?.participants.find(p => String(p.id) !== String(currentUser?.id)) || conversation?.participants[0];
  const isOnline = otherParticipant ? onlineUsers[otherParticipant.id]?.online : false;

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/chat/messages/${conversationId}`);
        if (res && res.data) {
          // Messages come from backend DESC, we want them ASC for chat display
          const ascMessages = [...res.data.rows].reverse();
          dispatch(setMessages({ conversationId, messages: ascMessages }));
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    // Auto-scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Mark last received message as seen
    if (messages.length > 0 && socket && isConnected) {
      const lastMsg = messages[messages.length - 1];
      if (String(lastMsg.senderId) !== String(currentUser?.id) && !lastMsg.seen) {
        socket.emit('message_seen', { messageId: lastMsg.id, conversationId });
      }
    }
  }, [messages, typingUser, socket, isConnected, conversationId, currentUser]);

  if (!conversation || !otherParticipant) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="h-16 flex-shrink-0 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(setActiveConversation(null))}
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <img
                src={conversation.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.name)}&background=6366f1&color=fff`}
                alt={conversation.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
                {conversation.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isOnline ? 'Active now' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : (
          <>
            {/* View Profile prompt */}
            <div className="flex flex-col items-center justify-center py-8 mb-4">
              <img
                src={conversation.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.name)}&background=6366f1&color=fff`}
                alt={conversation.name}
                className="w-24 h-24 rounded-full object-cover mb-4 shadow-md"
              />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{conversation.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">StudyGram • {conversation.type === 'private' ? 'Personal' : 'Group'}</p>
              <button 
                onClick={() => otherParticipant?.username && navigate(`/profile/${otherParticipant.username}`)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                View Profile
              </button>
            </div>

            {messages.map((msg, index) => {
              const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;
              const isMe = String(msg.senderId) === String(currentUser?.id);
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMe={isMe}
                  showAvatar={showAvatar && !isMe}
                />
              );
            })}

            {typingUser && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm italic pl-12">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 sticky bottom-0 z-10">
        <MessageInput conversationId={conversationId} />
      </div>
    </div>
  );
};
