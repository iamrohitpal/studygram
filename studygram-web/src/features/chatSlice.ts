import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  message: string;
  messageType: 'text' | 'image' | 'video' | 'pdf' | 'file' | 'audio' | 'emoji' | 'reply';
  attachmentUrl?: string;
  createdAt: string;
  seen?: boolean;
  sender: {
    id: number;
    username: string;
    profileImage?: string;
  };
}

export interface Conversation {
  id: number;
  type: 'private' | 'group';
  name: string;
  avatar?: string;
  unreadCount?: number;
  lastMessage: {
    text: string;
    createdAt: string;
    senderId: number;
  } | null;
  participants: {
    id: number;
    username: string;
    name: string;
    profileImage?: string;
  }[];
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: number | null;
  messages: { [conversationId: number]: ChatMessage[] };
  onlineUsers: { [userId: number]: { online: boolean; lastSeen?: string } };
  typingStatus: { [conversationId: number]: string }; // username of person typing
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  onlineUsers: {},
  typingStatus: {}
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    setActiveConversation: (state, action: PayloadAction<number | null>) => {
      state.activeConversationId = action.payload;
      if (action.payload !== null) {
        const existing = state.conversations.find(c => c.id === action.payload);
        if (existing) {
          existing.unreadCount = 0;
        }
      }
    },
    setMessages: (state, action: PayloadAction<{ conversationId: number; messages: ChatMessage[] }>) => {
      state.messages[action.payload.conversationId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const convId = action.payload.conversationId;
      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }
      // Add to messages list if it doesn't already exist
      if (!state.messages[convId].some(m => m.id === action.payload.id)) {
        state.messages[convId].push(action.payload);
      }
      
      // Update last message in conversations list
      const existing = state.conversations.find(c => c.id === convId);
      if (existing) {
        existing.lastMessage = {
          text: action.payload.messageType === 'text' ? action.payload.message : `[${action.payload.messageType}]`,
          createdAt: action.payload.createdAt,
          senderId: action.payload.senderId
        };
        if (state.activeConversationId !== action.payload.conversationId) {
          existing.unreadCount = (existing.unreadCount || 0) + 1;
        }
        // Move to top
        state.conversations = [
          existing,
          ...state.conversations.filter(c => c.id !== convId)
        ];
      }
    },
    updateConversationList: (state, action: PayloadAction<{ conversationId: number; lastMessage: ChatMessage; unreadCount?: number }>) => {
      const existing = state.conversations.find(c => c.id === action.payload.conversationId);
      if (existing) {
        existing.lastMessage = {
          text: action.payload.lastMessage.messageType === 'text' ? action.payload.lastMessage.message : `[${action.payload.lastMessage.messageType}]`,
          createdAt: action.payload.lastMessage.createdAt,
          senderId: action.payload.lastMessage.senderId
        };
        if (action.payload.unreadCount !== undefined) {
          existing.unreadCount = action.payload.unreadCount;
        } else if (state.activeConversationId !== action.payload.conversationId) {
          existing.unreadCount = (existing.unreadCount || 0) + 1;
        }
        state.conversations = [
          existing,
          ...state.conversations.filter(c => c.id !== action.payload.conversationId)
        ];
      }
    },
    setTyping: (state, action: PayloadAction<{ conversationId: number; username: string | null }>) => {
      if (action.payload.username) {
        state.typingStatus[action.payload.conversationId] = action.payload.username;
      } else {
        delete state.typingStatus[action.payload.conversationId];
      }
    },
    setOnlineStatus: (state, action: PayloadAction<{ userId: number; online: boolean; lastSeen?: string }>) => {
      state.onlineUsers[action.payload.userId] = {
        online: action.payload.online,
        lastSeen: action.payload.lastSeen || state.onlineUsers[action.payload.userId]?.lastSeen
      };
    },
    setMessageSeen: (state, action: PayloadAction<{ conversationId: number; messageId?: number }>) => {
      const convMsgs = state.messages[action.payload.conversationId];
      if (convMsgs) {
        if (action.payload.messageId) {
          const msg = convMsgs.find(m => m.id === action.payload.messageId);
          if (msg) msg.seen = true;
        } else {
          convMsgs.forEach(m => m.seen = true);
        }
      }
    }
  }
});

export const { 
  setConversations, 
  setActiveConversation, 
  setMessages, 
  addMessage, 
  updateConversationList,
  setTyping, 
  setOnlineStatus,
  setMessageSeen
} = chatSlice.actions;

export default chatSlice.reducer;
