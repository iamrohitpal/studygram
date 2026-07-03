import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { addMessage, updateConversationList, setTyping, setOnlineStatus, setMessageSeen } from '../features/chatSlice';
import { setHasNewPosts, setHasNewReels } from '../features/uiSlice';
import type { ChatMessage } from '../features/chatSlice';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    // The backend runs on port 7000, as configured in the setup
    const newSocket = io('http://localhost:7000', {
      auth: {
        token
      }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    // Real-time chat events
    newSocket.on('new_message', (message: ChatMessage) => {
      dispatch(addMessage(message));
    });

    newSocket.on('conversation_updated', (data: { conversationId: number, lastMessage: ChatMessage }) => {
      dispatch(updateConversationList(data));
    });

    newSocket.on('typing', (data: { conversationId: number, username: string }) => {
      dispatch(setTyping({ conversationId: data.conversationId, username: data.username }));
    });

    newSocket.on('stop_typing', (data: { conversationId: number }) => {
      dispatch(setTyping({ conversationId: data.conversationId, username: null }));
    });

    newSocket.on('new_post_from_following', () => {
      dispatch(setHasNewPosts(true));
    });

    newSocket.on('new_reel_from_following', () => {
      dispatch(setHasNewReels(true));
    });

    newSocket.on('user_online', (data: { userId: number }) => {
      dispatch(setOnlineStatus({ userId: data.userId, online: true }));
    });

    newSocket.on('user_offline', (data: { userId: number, lastSeen: string }) => {
      dispatch(setOnlineStatus({ userId: data.userId, online: false, lastSeen: data.lastSeen }));
    });

    newSocket.on('online_status_result', (statuses: { [userId: number]: boolean }) => {
      Object.keys(statuses).forEach(userId => {
        dispatch(setOnlineStatus({ userId: Number(userId), online: statuses[Number(userId)] }));
      });
    });

    newSocket.on('message_seen', (data: { conversationId: number, messageId?: number }) => {
      dispatch(setMessageSeen(data));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, dispatch]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
