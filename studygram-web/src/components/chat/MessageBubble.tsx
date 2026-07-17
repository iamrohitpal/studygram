import React from 'react';
import { Avatar } from '../Avatar';
import type { ChatMessage } from '../../features/chatSlice';

export const MessageBubble: React.FC<{ message: ChatMessage; isMe: boolean; showAvatar: boolean }> = ({ message, isMe, showAvatar }) => {
  return (
    <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && (
        <div className="w-8 flex-shrink-0">
          {showAvatar && (
            <Avatar
              src={message.sender.profileImage}
              name={message.sender.username}
              className="w-8 h-8"
            />
          )}
        </div>
      )}

      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {message.attachmentUrl && (
          <div className={`mb-1 overflow-hidden rounded-2xl ${isMe ? 'bg-indigo-600' : 'bg-white dark:bg-slate-800'}`}>
            {message.messageType === 'image' ? (
              <img src={message.attachmentUrl} alt="attachment" className="max-w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity" />
            ) : message.messageType === 'video' ? (
              <video src={message.attachmentUrl} controls className="max-w-full max-h-64 rounded-2xl" />
            ) : (
              <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className="block p-4 underline text-sm">
                Download Attachment
              </a>
            )}
          </div>
        )}

        {message.message && (
          <div className={`px-4 py-2 rounded-2xl ${
            isMe 
              ? 'bg-indigo-600 text-white rounded-br-sm' 
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-bl-sm shadow-sm'
          }`}>
            <p className="text-[15px] whitespace-pre-wrap break-words">{message.message}</p>
          </div>
        )}

        {/* Small timestamp and status */}
        <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
          <span className="text-[11px] text-slate-400">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {/* Read receipt placeholders for my messages */}
          {isMe && (
            <span className={`text-${message.seen ? 'green' : 'indigo'}-500`}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={message.seen ? "M5 13l4 4L19 7 M5 18l4 4L19 12" : "M5 13l4 4L19 7"} />
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
