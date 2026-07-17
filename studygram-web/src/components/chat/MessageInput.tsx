import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { Image, Paperclip, Smile, Send, X, Loader2 } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import EmojiPicker from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';

export const MessageInput: React.FC<{ conversationId: number }> = ({ conversationId }) => {
  const { socket, isConnected } = useSocket();
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    // Typing indicator logic
    if (socket && isConnected) {
      socket.emit('typing', { conversationId });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { conversationId });
      }, 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (selected.type.startsWith('image/') || selected.type.startsWith('video/')) {
        setPreviewUrl(URL.createObjectURL(selected));
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!text.trim() && !file) || !socket || !isConnected) return;

    let attachmentUrl = undefined;
    let messageType = 'text';

    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await apiClient.post('/chat/upload', formData);
        if (res && res.data) {
          attachmentUrl = res.data.mediaUrl;
          messageType = res.data.contentType;
        }
      } catch (err) {
        console.error('File upload failed:', err);
        setUploading(false);
        return; // Stop sending if upload fails
      }
      setUploading(false);
    }

    socket.emit('send_message', {
      conversationId,
      message: text.trim(),
      messageType,
      attachmentUrl
    });

    socket.emit('stop_typing', { conversationId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setText('');
    removeFile();
  };

  return (
    <form onSubmit={handleSend} className="flex flex-col w-full relative">
      {file && (
        <div className="mb-2 inline-flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl relative max-w-sm">
          {previewUrl ? (
            file.type.startsWith('image/') ? (
              <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
            ) : (
              <video src={previewUrl} className="h-16 w-16 object-cover rounded-lg" />
            )
          ) : (
            <div className="h-16 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <Paperclip className="w-6 h-6 text-slate-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="absolute -top-2 -right-2 p-1 bg-slate-900 text-white rounded-full hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-2 shadow-sm transition-all relative">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <Smile className="w-6 h-6" />
        </button>

        {showEmojiPicker && (
          <div ref={pickerRef} className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-2xl">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}

        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Message..."
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[15px] py-1.5 px-2 text-slate-900 dark:text-white placeholder-slate-500"
          disabled={uploading}
        />

        <div className="flex items-center gap-1 pr-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            disabled={uploading}
          >
            <Image className="w-6 h-6" />
          </button>

          {(text.trim() || file) ? (
            <button
              type="submit"
              disabled={uploading || !isConnected}
              className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors ml-1 shadow-sm disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <Smile className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
};
