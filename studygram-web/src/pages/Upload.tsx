import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../features/store';
import { apiClient } from '../utils/apiClient';
import {
  Image,
  Video,
  FileText,
  Calendar,
  Tag,
  Loader2,
  CheckCircle2,
  Share2
} from 'lucide-react';

export const Upload: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [postType, setPostType] = useState<'image' | 'video' | 'notes'>('image');
  const [caption, setCaption] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [tagsInput, setTagsInput] = useState('');
  const [notesTitle, setNotesTitle] = useState('');
  const [notesPages, setNotesPages] = useState(1);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
  
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [connectedAccounts, setConnectedAccounts] = useState<any>(null);
  const [publishTo, setPublishTo] = useState<Record<string, boolean>>({});

  // Load categories dynamically
  useEffect(() => {
    fetchCategories();
    fetchConnectedAccounts();
  }, []);

  const fetchConnectedAccounts = async () => {
    try {
      const response = await apiClient.get('/social-auth/accounts');
      if (response.data) {
        setConnectedAccounts(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch social accounts', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      if (response && response.data) {
        setCategories(response.data);
        if (response.data.length > 0) {
          setSelectedCategoryId(response.data[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption || !user || !selectedCategoryId) return;

    setPublishing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', postType === 'notes' ? notesTitle || 'Lecture Notes' : caption.substring(0, 40));
      formData.append('description', caption);
      formData.append('categoryId', String(selectedCategoryId));
      formData.append('visibility', visibility);

      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      // Add cross-publish platforms
      const selectedPlatforms = Object.entries(publishTo)
        .filter(([_, isSelected]) => isSelected)
        .map(([platform]) => platform);
      
      if (selectedPlatforms.length > 0) {
        formData.append('publishTo', JSON.stringify(selectedPlatforms));
      }

      await apiClient.post('/posts', formData);

      setPublishing(false);
      setSuccess(true);
      
      // Reset form
      setCaption('');
      setTagsInput('');
      setNotesTitle('');
      setNotesPages(1);
      setMediaFile(null);
      setMediaPreview(null);
      setScheduleEnabled(false);
      setScheduleDateTime('');
      setVisibility('public');
    } catch (err: any) {
      setPublishing(false);
      setError(err.message || 'Failed to upload post.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
          Upload Center
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Share files, notes, or videos with the study community.
        </p>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
          {error}
        </div>
      )}

      {success ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold font-heading">Post Published Successfully!</h3>
          <p className="text-sm text-slate-500">
            Your new post has been published and is visible on your home feed.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl transition cursor-pointer"
          >
            Create Another Post
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post Content Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
              {/* Post Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Post Content Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPostType('image');
                      setMediaPreview(null);
                      setMediaFile(null);
                    }}
                    className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-2xl transition cursor-pointer ${
                      postType === 'image'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <Image className="w-6 h-6" />
                    <span className="text-xs font-bold">Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPostType('video');
                      setMediaPreview(null);
                      setMediaFile(null);
                    }}
                    className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-2xl transition cursor-pointer ${
                      postType === 'video'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <Video className="w-6 h-6" />
                    <span className="text-xs font-bold">Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPostType('notes');
                      setMediaPreview(null);
                      setMediaFile(null);
                    }}
                    className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-2xl transition cursor-pointer ${
                      postType === 'notes'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-xs font-bold">Study Notes</span>
                  </button>
                </div>
              </div>

              {/* Notes Specific Fields */}
              {postType === 'notes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={notesTitle}
                      onChange={(e) => setNotesTitle(e.target.value)}
                      placeholder="e.g. Mitosis Cycle Handwritten Notes"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Total Pages
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={notesPages}
                      onChange={(e) => setNotesPages(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Post Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe your study session, lecture notes or content..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Media File Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Attach Media / Document File
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-6 text-center transition relative">
                  {mediaPreview ? (
                    <div className="space-y-4">
                      {postType === 'video' ? (
                        <video src={mediaPreview} className="max-h-[180px] mx-auto rounded-xl" controls />
                      ) : postType === 'notes' ? (
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border max-w-xs mx-auto">
                          <FileText className="w-12 h-12 text-indigo-600" />
                          <span className="text-xs font-bold mt-2 truncate w-full">{mediaFile?.name}</span>
                        </div>
                      ) : (
                        <img src={mediaPreview} alt="Preview" className="max-h-[180px] mx-auto rounded-xl object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPreview(null);
                          setMediaFile(null);
                        }}
                        className="text-xs text-rose-500 font-semibold underline cursor-pointer"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-center text-slate-400">
                        {postType === 'image' ? <Image className="w-10 h-10" /> : postType === 'video' ? <Video className="w-10 h-10" /> : <FileText className="w-10 h-10" />}
                      </div>
                      <p className="text-xs text-slate-500">
                        Drag and drop your file here, or{' '}
                        <span className="text-indigo-600 font-semibold cursor-pointer">browse</span>
                      </p>
                      <span className="text-[10px] text-slate-400">Supports PNG, JPG, MP4, PDF up to 25MB</span>
                      <input
                        type="file"
                        accept={postType === 'image' ? 'image/*' : postType === 'video' ? 'video/*' : '.pdf'}
                        onChange={handleMediaChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Categorization & Scheduling Side Panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Post Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'followers')}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="public">Public (Everyone)</option>
                  <option value="followers">My Followers Only</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Add Tags (comma separated)
                </label>
                <div className="relative">
                  <Tag className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. reactjs, upsc2026, study"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Scheduler */}
              <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Schedule Post
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleEnabled}
                      onChange={(e) => setScheduleEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                {scheduleEnabled && (
                  <input
                    type="datetime-local"
                    value={scheduleDateTime}
                    onChange={(e) => setScheduleDateTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                )}
              </div>

              {/* Cross-Publish To */}
              {connectedAccounts && Object.values(connectedAccounts).some(v => v === true) && (
                <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 space-y-3">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-slate-400" />
                    Cross-Publish To
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(connectedAccounts).map(([platform, isConnected]) => {
                      if (!isConnected) return null;
                      const isSelected = publishTo[platform] || false;
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => setPublishTo(prev => ({ ...prev, [platform]: !isSelected }))}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition cursor-pointer capitalize ${
                            isSelected 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-400'
                          }`}
                        >
                          {platform}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={publishing}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-75 disabled:hover:scale-100 cursor-pointer"
              >
                {publishing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  scheduleEnabled ? 'Schedule Post' : 'Publish Now'
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
