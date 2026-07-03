import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Volume2, VolumeX, ArrowLeft, Film, X } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { Avatar } from '../components/Avatar';
import { useSelector } from 'react-redux';
import type { RootState } from '../features/store';

export interface ReelItem {
  id: string;
  title: string;
  caption: string;
  mediaUrl: string;
  authorName: string;
  authorAvatar: string;
  likesCount: number;
  commentsCount: number;
  category: string;
}

export interface CommentData {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
}

const ReelCard: React.FC<{
  reel: ReelItem;
  isMuted: boolean;
  onMuteToggle: () => void;
  onCommentClick: () => void;
  active: boolean;
}> = ({ reel, isMuted, onMuteToggle, onCommentClick, active }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(() => {
    const localLikes = JSON.parse(localStorage.getItem('user_likes') || '[]');
    return localLikes.includes(String(reel.id));
  });
  const [saved, setSaved] = useState(() => {
    const localSaves = JSON.parse(localStorage.getItem('user_saves') || '[]');
    return localSaves.includes(String(reel.id));
  });
  const [likes, setLikes] = useState(reel.likesCount);

  useEffect(() => {
    setLikes(reel.likesCount);
    const localLikes = JSON.parse(localStorage.getItem('user_likes') || '[]');
    setLiked(localLikes.includes(String(reel.id)));
    const localSaves = JSON.parse(localStorage.getItem('user_saves') || '[]');
    setSaved(localSaves.includes(String(reel.id)));
  }, [reel]);

  /* play / pause based on visibility */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [active]);

  const handleLike = async () => {
    const orig = liked;
    const newLiked = !orig;
    setLiked(newLiked);
    setLikes(p => p + (newLiked ? 1 : -1));

    const localLikes = JSON.parse(localStorage.getItem('user_likes') || '[]');
    if (newLiked) {
      if (!localLikes.includes(String(reel.id))) localLikes.push(String(reel.id));
    } else {
      const idx = localLikes.indexOf(String(reel.id));
      if (idx > -1) localLikes.splice(idx, 1);
    }
    localStorage.setItem('user_likes', JSON.stringify(localLikes));

    try { await apiClient.post('/posts/like', { postId: Number(reel.id) }); } catch (_) {}
  };

  const handleSave = async () => {
    const orig = saved;
    const newSaved = !orig;
    setSaved(newSaved);

    const localSaves = JSON.parse(localStorage.getItem('user_saves') || '[]');
    if (newSaved) {
      if (!localSaves.includes(String(reel.id))) localSaves.push(String(reel.id));
    } else {
      const idx = localSaves.indexOf(String(reel.id));
      if (idx > -1) localSaves.splice(idx, 1);
    }
    localStorage.setItem('user_saves', JSON.stringify(localSaves));

    try { await apiClient.post('/posts/save', { postId: Number(reel.id) }); } catch (_) {}
  };

  return (
    <div className="relative w-full h-full bg-black flex-shrink-0 snap-start snap-always">
      <video
        ref={videoRef}
        src={reel.mediaUrl}
        loop
        playsInline
        muted={isMuted}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/10 to-transparent z-10 pointer-events-none" />

      {/* mute */}
      <button
        onClick={onMuteToggle}
        className="absolute top-[170px] md:top-24 right-4 z-20 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition cursor-pointer"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* right action rail */}
      <div className="absolute right-3 bottom-[76px] md:bottom-8 z-20 flex flex-col items-center gap-5">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className={`p-3 rounded-full backdrop-blur-md transition group-hover:scale-110 shadow-lg ${liked ? 'bg-rose-500/70' : 'bg-black/40 hover:bg-rose-500/40'}`}>
            <Heart className={`w-6 h-6 ${liked ? 'fill-white text-white' : 'text-white'}`} />
          </div>
          <span className="text-xs font-bold text-white drop-shadow-md">{likes}</span>
        </button>

        <button onClick={onCommentClick} className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className="p-3 bg-black/40 hover:bg-white/20 backdrop-blur-md rounded-full transition group-hover:scale-110 shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold text-white drop-shadow-md">{reel.commentsCount}</span>
        </button>

        <button onClick={handleSave} className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className={`p-3 rounded-full backdrop-blur-md transition group-hover:scale-110 shadow-lg ${saved ? 'bg-indigo-500/70' : 'bg-black/40 hover:bg-indigo-500/40'}`}>
            <span className="text-white text-lg leading-none">{saved ? '★' : '☆'}</span>
          </div>
        </button>
      </div>

      {/* bottom info */}
      <div className="absolute left-4 bottom-[76px] md:bottom-8 z-20 max-w-[75%] space-y-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={reel.authorAvatar}
            name={reel.authorName || 'User'}
            className="w-10 h-10 ring-2 ring-indigo-500 shadow-lg"
          />
          <span className="font-extrabold text-white text-[15px] drop-shadow-lg">@{reel.authorName}</span>
        </div>
        <h4 className="font-bold text-white text-[15px] drop-shadow-lg leading-snug">{reel.title}</h4>
        <p className="text-xs text-white/90 line-clamp-2 leading-relaxed drop-shadow-lg">{reel.caption}</p>
      </div>
    </div>
  );
};

export const Reels: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // comments sheet state
  const [showComments, setShowComments] = useState(false);
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsHasMore, setCommentsHasMore] = useState(true);
  const [commentsLoadingMore, setCommentsLoadingMore] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      if (response && response.data) {
        setCategories([{ id: 'all', name: 'All' }, ...response.data]);
      }
    } catch (e) {
      console.error('Error fetching categories for reels:', e);
    }
  };

  const selectCategory = async (cat: any) => {
    setSelectedCategory(cat);
    setLoading(true);
    setPage(1);
    setHasMore(true);
    try {
      const catParam = cat.id === 'all' ? '' : `&categoryId=${cat.id}`;
      const response = await apiClient.get(`/posts/feed?page=1&limit=10&contentType=video${catParam}`);
      if (response && response.data) {
        if (response.data.length < 10) setHasMore(false);
        const mapped = mapReels(response.data);
        setReels(mapped);
      }
    } catch (e) {
      console.error('Error loading reels:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreReels = async () => {
    if (loadingMore || !hasMore || !selectedCategory) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const catParam = selectedCategory.id === 'all' ? '' : `&categoryId=${selectedCategory.id}`;
      const response = await apiClient.get(`/posts/feed?page=${nextPage}&limit=10&contentType=video${catParam}`);
      if (response && response.data) {
        if (response.data.length === 0) {
          setHasMore(false);
        } else {
          const mapped = mapReels(response.data);
          setReels(prev => [...prev, ...mapped]);
          setPage(nextPage);
        }
      }
    } catch (e) {
      console.error('Error loading more reels:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  const mapReels = (data: any[]) => {
    return data.map((p: any) => ({
      id: String(p.id),
      title: p.title,
      caption: p.description,
      mediaUrl: p.mediaUrl,
      authorName: p.user?.name || 'Anonymous Creator',
      authorAvatar: p.user?.profileImage,
      likesCount: p.likesCount || 0,
      commentsCount: p.commentsCount || 0,
      category: p.category?.name || 'General'
    }));
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollY = scrollContainerRef.current.scrollTop;
    const height = scrollContainerRef.current.clientHeight;
    const index = Math.round(scrollY / height);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
    
    // Check if we reached the last few reels to load more
    if (index >= reels.length - 2 && !loadingMore && hasMore) {
      loadMoreReels();
    }
  };

  const openComments = async (reelId: string) => {
    setActiveReelId(reelId);
    setShowComments(true);
    setCommentsPage(1);
    setCommentsHasMore(true);
    try {
      const response = await apiClient.get(`/posts/${reelId}/comments?page=1&limit=10`);
      if (response.data) {
        if (response.data.length < 10) setCommentsHasMore(false);
        const mapped = response.data.map((c: any) => ({
          id: String(c.id),
          authorName: c.user?.name || 'User',
          authorAvatar: c.user?.profileImage,
          content: c.comment,
          timestamp: new Date(c.createdAt).toLocaleDateString()
        }));
        setComments(mapped);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const loadMoreComments = async () => {
    if (commentsLoadingMore || !commentsHasMore || !activeReelId) return;
    setCommentsLoadingMore(true);
    try {
      const nextPage = commentsPage + 1;
      const response = await apiClient.get(`/posts/${activeReelId}/comments?page=${nextPage}&limit=10`);
      if (response.data) {
        if (response.data.length === 0) {
          setCommentsHasMore(false);
        } else {
          const mapped = response.data.map((c: any) => ({
            id: String(c.id),
            authorName: c.user?.name || 'User',
            authorAvatar: c.user?.profileImage,
            content: c.comment,
            timestamp: new Date(c.createdAt).toLocaleDateString()
          }));
          setComments(prev => [...prev, ...mapped]);
          setCommentsPage(nextPage);
        }
      }
    } catch (err) {
      console.error('Error loading more comments:', err);
    } finally {
      setCommentsLoadingMore(false);
    }
  };

  const handleCommentsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMoreComments();
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !activeReelId) return;
    try {
      const response = await apiClient.post('/posts/comment', {
        postId: Number(activeReelId),
        content: commentText.trim()
      });
      if (response.data) {
        const newComment: CommentData = {
          id: String(response.data.id),
          authorName: user.fullName,
          authorAvatar: user.avatarUrl,
          content: commentText.trim(),
          timestamp: 'Just now'
        };
        setComments(prev => [...prev, newComment]);
        setCommentText('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  if (!selectedCategory) {
    return (
      <div className="space-y-6 min-h-[80vh] flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-3xl mb-2">
              <Film className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold font-heading">Study Reels</h2>
            <p className="text-sm text-slate-500">Select a category to start watching short educational videos.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition shadow-sm hover:shadow-md"
              >
                <span className="text-2xl mb-2">🎓</span>
                <span className="font-bold text-sm font-heading">{cat.name}</span>
                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Explore Video Notes</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] md:relative md:z-auto bg-black md:bg-transparent md:flex-1 md:flex md:flex-col md:items-center md:justify-center">
      {/* Top Header Overlay for Player */}
      <div className="absolute top-0 inset-x-0 z-30 pt-[76px] pb-4 px-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none md:pt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setReels([]);
            }}
            className="p-2 bg-black/40 backdrop-blur-md text-white rounded-full cursor-pointer pointer-events-auto hover:bg-black/60 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-bold text-lg font-heading text-white">{selectedCategory.name} Reels</h3>
          </div>
        </div>
        
        {/* Horizontal Category Pill Strip */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory.id === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-full md:h-[700px] md:max-w-md md:rounded-[40px] md:overflow-hidden md:border-[8px] md:border-slate-800 md:shadow-2xl relative bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center h-full text-white font-bold animate-pulse">Loading reels...</div>
        ) : reels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-8 text-center space-y-4">
            <p className="font-semibold text-lg">No reels available for this category yet.</p>
            <button
              onClick={() => setSelectedCategory(null)}
              className="bg-indigo-600 hover:bg-indigo-500 font-semibold py-2 px-5 rounded-xl transition text-sm cursor-pointer"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
          >
            {reels.map((reel, index) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                isMuted={isMuted}
                onMuteToggle={() => setIsMuted(!isMuted)}
                onCommentClick={() => openComments(reel.id)}
                active={index === activeIndex}
              />
            ))}
            {loadingMore && (
              <div className="h-full flex items-center justify-center shrink-0 w-full snap-start relative bg-slate-900 rounded-3xl">
                <div className="text-white font-medium animate-pulse">Loading more reels...</div>
              </div>
            )}
            {!hasMore && reels.length > 0 && (
              <div className="h-full flex flex-col items-center justify-center shrink-0 w-full snap-start relative bg-slate-900 rounded-3xl p-8 text-center space-y-4">
                <Film className="w-12 h-12 text-slate-700" />
                <h3 className="text-white font-bold text-xl font-heading">You're all caught up!</h3>
                <p className="text-slate-400 text-sm max-w-[200px]">You've seen all the reels in this category.</p>
                <button onClick={() => setSelectedCategory(null)} className="mt-4 bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm">
                  Explore More
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Comments Sheet ── */}
      {showComments && (
        <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center pb-[64px] md:pb-0" onClick={() => setShowComments(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg h-[65vh] md:h-auto md:max-h-[70vh] bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-fadeInUp flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold font-heading text-sm">Comments <span className="text-slate-400 font-normal">({comments.length})</span></h3>
              <button onClick={() => setShowComments(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Scrollable Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" onScroll={handleCommentsScroll}>
              {comments.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">No comments yet. Be the first!</p>
              ) : (
                <>
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar
                        src={comment.authorAvatar}
                        name={comment.authorName}
                        className="w-8 h-8"
                      />
                      <div>
                        <div className="bg-slate-50 dark:bg-slate-850/50 p-3 rounded-2xl rounded-tl-none">
                          <p className="text-xs font-semibold">{comment.authorName}</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed font-sans">
                            {comment.content}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 ml-2 mt-1 block">{comment.timestamp}</span>
                      </div>
                    </div>
                  ))}
                  {commentsLoadingMore && (
                    <p className="text-center text-xs text-slate-500 py-2 animate-pulse">Loading more comments...</p>
                  )}
                </>
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-full px-4 py-2 text-sm transition"
              />
              <button 
                type="submit" 
                disabled={!commentText.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white p-2 rounded-full transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rotate-135" /> 
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
