import React, { useEffect, useState } from 'react';
import { PostCard } from '../components/PostCard';
import { Bookmark, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

export const Saved: React.FC = () => {
  const navigate = useNavigate();
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/posts/saved');
      if (response && response.data) {
        const mapped = response.data.map((p: any) => ({
          id: String(p.id),
          authorName: p.user?.name || 'Anonymous User',
          authorUsername: p.user?.username || 'anonymous',
          authorAvatar: p.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=6366f1&color=fff`,
          type: p.contentType === 'note' ? 'notes' : p.contentType,
          mediaUrl: p.mediaUrl,
          notesTitle: p.title,
          notesPages: 4,
          caption: p.description,
          category: 'Bookmarked',
          tags: [],
          likesCount: p.likesCount || 0,
          hasLiked: p.post.hasLiked || false,
          hasSaved: p.post.hasSaved || true,
          createdAt: new Date(p.createdAt).toLocaleDateString()
        }));
        setSavedPosts(mapped);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
          Bookmarked Content
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Access your saved study materials, notes and references.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-semibold">
          Loading bookmarks...
        </div>
      ) : savedPosts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="flex justify-center text-slate-350">
            <Bookmark className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-bold font-heading">No bookmarks yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Bookmark posts on your home feed to store and review them later offline.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl transition cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            Explore Feed
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {savedPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
