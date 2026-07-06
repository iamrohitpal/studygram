import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../features/store';
import { apiClient } from '../utils/apiClient';
import { Avatar } from './Avatar';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookOpen,
  Send,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';

export interface CommentData {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorUsername?: string;
  content: string;
  timestamp: string;
}

export interface PostCardProps {
  post: {
    id: string;
    authorName: string;
    authorUsername: string;
    authorAvatar: string;
    type: 'image' | 'video' | 'notes';
    mediaUrl: string;
    notesTitle?: string;
    notesPages?: number;
    caption: string;
    category: string;
    tags: string[];
    likesCount: number;
    commentsCount?: number;
    viewsCount?: number;
    savesCount?: number;
    sharesCount?: number;
    hasLiked: boolean;
    hasSaved: boolean;
    createdAt: string;
    authorId?: number;
  };
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(post.hasLiked || false);
  const [hasSaved, setHasSaved] = useState(post.hasSaved || false);
  const [savesCount, setSavesCount] = useState(post.savesCount || 0);
  const [sharesCount, setSharesCount] = useState(post.sharesCount || 0);
  const [hasFollowed, setHasFollowed] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsHasMore, setCommentsHasMore] = useState(true);
  const [commentsLoadingMore, setCommentsLoadingMore] = useState(false);
  const [likesList, setLikesList] = useState<any[]>([]);
  const [showLikes, setShowLikes] = useState(false);
  const [loadingLikes, setLoadingLikes] = useState(false); // Can be enhanced later if API returns follow state per post author
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const isOwner = user && user.username === post.authorUsername;

  // Sync initial props
  useEffect(() => {
    setLikesCount(post.likesCount);
    setHasLiked(post.hasLiked || false);
    setHasSaved(post.hasSaved || false);
    setSavesCount(post.savesCount || 0);
    setSharesCount(post.sharesCount || 0);
    setCommentsCount(post.commentsCount || 0);
  }, [post]);

  // Load comments dynamically when dialog opens
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    try {
      setCommentsPage(1);
      setCommentsHasMore(true);
      const response = await apiClient.get(`/posts/${post.id}/comments?page=1&limit=10`);
      if (response.data) {
        if (response.data.length < 10) setCommentsHasMore(false);
        const mapped = response.data.map((c: any) => ({
          id: String(c.id),
          authorName: c.user?.name || 'User',
          authorUsername: c.user?.username,
          authorAvatar: c.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=6366f1&color=fff`,
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
    if (commentsLoadingMore || !commentsHasMore) return;
    setCommentsLoadingMore(true);
    try {
      const nextPage = commentsPage + 1;
      const response = await apiClient.get(`/posts/${post.id}/comments?page=${nextPage}&limit=10`);
      if (response.data) {
        if (response.data.length === 0) {
          setCommentsHasMore(false);
        } else {
          const mapped = response.data.map((c: any) => ({
            id: String(c.id),
            authorName: c.user?.name || 'User',
            authorUsername: c.user?.username,
            authorAvatar: c.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=6366f1&color=fff`,
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

  const fetchLikes = async () => {
    if (likesList.length > 0) return;
    setLoadingLikes(true);
    try {
      const response = await apiClient.get(`/posts/${post.id}/likes`);
      if (response.data) {
        setLikesList(response.data);
      }
    } catch (err) {
      console.error('Error fetching likes:', err);
    } finally {
      setLoadingLikes(false);
    }
  };

  const handleCommentsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMoreComments();
    }
  };

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const originalHasLiked = hasLiked;
      const newLiked = !originalHasLiked;
      setHasLiked(newLiked);
      setLikesCount(prev => Math.max(0, prev + (newLiked ? 1 : -1)));
      
      await apiClient.post('/posts/like', { postId: Number(post.id) });
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleSave = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const originalHasSaved = hasSaved;
      const newSaved = !originalHasSaved;
      setHasSaved(newSaved);
      setSavesCount(prev => Math.max(0, prev + (newSaved ? 1 : -1)));

      await apiClient.post('/posts/save', { postId: Number(post.id) });
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) { navigate('/login'); return; }
    if (!post.authorId) return;
    try {
      const newFollowed = !hasFollowed;
      setHasFollowed(newFollowed);
      
      await apiClient.post('/profile/follow', { followingId: Number(post.authorId) });
    } catch (err: any) {
      console.error('Error toggling follow:', err);
      // Revert state on error
      setHasFollowed(hasFollowed);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!commentText.trim()) return;

    try {
      const response = await apiClient.post('/posts/comment', {
        postId: Number(post.id),
        content: commentText.trim()
      });
      
      if (response.data) {
        const newComment: CommentData = {
          id: String(response.data.id),
          authorName: user.fullName,
          authorUsername: user.username,
          authorAvatar: user.avatarUrl,
          content: commentText.trim(),
          timestamp: 'Just now'
        };
        setComments(prev => [newComment, ...prev]);
        setCommentsCount(prev => prev + 1);
        setCommentText('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleShare = async () => {
    if (user) {
      try {
        await apiClient.post('/posts/share', { postId: Number(post.id) });
        setSharesCount(prev => prev + 1);
      } catch (err) {
        console.error('Error sharing post on backend:', err);
      }
    }

    if (navigator.share) {
      navigator.share({
        title: post.notesTitle || 'StudyGram Post',
        text: post.caption,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Post link copied to clipboard!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDeletePost = async () => {
    setAnchorEl(null);
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await apiClient.delete(`/posts/${post.id}`);
      window.location.reload(); 
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post.');
    }
  };

  return (
    <article className="group/card bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-500">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={post.authorAvatar}
            name={post.authorName || 'User'}
            className="w-10 h-10 ring-2 ring-indigo-500/10"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold hover:text-indigo-600 cursor-pointer">{post.authorName}</h3>
              {!isOwner && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <button 
                    onClick={handleFollowToggle}
                    className={`text-sm font-bold transition ${hasFollowed ? 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200' : 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-400'}`}
                  >
                    {hasFollowed ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500">@{post.authorUsername} • {post.createdAt}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider">
            {post.category}
          </span>
          {user && (
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreHorizontal className="w-5 h-5" />
            </IconButton>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-2">
        <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">
          {post.caption}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {post.tags?.map(tag => (
            <span key={tag} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Media Rendering */}
      {post.type === 'notes' ? (
        <div className="relative border-y border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-950 p-8 flex flex-col items-center justify-center min-h-[250px]">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/50 flex flex-col items-center text-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-inner">
              <BookOpen className="w-10 h-10" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold font-heading text-lg text-slate-800 dark:text-slate-100 truncate w-full">{post.notesTitle}</h4>
              <p className="text-sm font-semibold text-slate-500 mt-1">{post.notesPages || 4} pages • PDF Document</p>
              <a 
                href={post.mediaUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-white border border-transparent rounded-xl px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors"
              >
                View Study Notes
              </a>
            </div>
          </div>
        </div>
      ) : post.type === 'video' ? (
        <div className="relative bg-black flex items-center justify-center w-full max-h-[600px] overflow-hidden">
          <video src={post.mediaUrl} controls className="w-full h-full max-h-[600px] object-contain group-hover/card:scale-[1.02] transition-transform duration-700" />
        </div>
      ) : (
        <div className="relative w-full max-h-[600px] overflow-hidden bg-slate-50 dark:bg-slate-950 flex justify-center border-y border-slate-100 dark:border-slate-800">
          <img src={post.mediaUrl} alt="Post media" className="w-full h-full max-h-[600px] object-cover group-hover/card:scale-[1.02] transition-transform duration-700" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar snap-x">
          {user ? (
            <div className="flex gap-1 items-center">
              <button 
                onClick={handleLike}
                className="flex items-center justify-center gap-2 text-xs font-bold rounded-l-2xl px-3 py-2.5 transition-all duration-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-400 hover:text-rose-500"
              >
                <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current text-rose-500' : 'text-slate-500 dark:text-slate-400'}`} />
              </button>
              <button
                onClick={() => { setShowLikes(true); fetchLikes(); }}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-500 px-1 hover:underline"
              >
                {likesCount ?? 0}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs font-bold rounded-xl px-3 py-2 text-slate-600 dark:text-slate-400">
              <Heart className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              {likesCount ?? 0}
            </div>
          )}
          
          {user ? (
            <>
              <button
                onClick={() => setShowComments(true)}
                className="flex items-center justify-center gap-2 text-xs font-bold rounded-2xl px-4 py-2.5 text-slate-600 dark:text-slate-400 transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <MessageCircle className="w-5 h-5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors" />
                {commentsCount ?? 0}
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs font-bold rounded-xl px-3 py-2 text-slate-600 dark:text-slate-400">
              <MessageCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              {commentsCount ?? 0}
            </div>
          )}

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 text-xs font-bold rounded-2xl px-4 py-2.5 text-slate-600 dark:text-slate-400 transition-all duration-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <Share2 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Share</span>
            <span className="sm:hidden">{sharesCount}</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-xs font-bold rounded-xl px-3 py-2 text-slate-600 dark:text-slate-400 hidden sm:flex">
            <Eye className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            {post.viewsCount ?? 0}
          </div>
        </div>

        {user && (
          <button 
            onClick={handleSave}
            className={`flex items-center justify-center gap-2 text-xs font-bold rounded-2xl px-4 py-2.5 transition-all duration-300 ${
              hasSaved 
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 hover:shadow-lg hover:shadow-amber-500/20' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 dark:hover:text-amber-400'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${hasSaved ? 'fill-current text-amber-500' : 'text-slate-500 dark:text-slate-400'}`} />
            {savesCount}
          </button>
        )}
      </div>

      {/* Comments Dialog */}
      <Dialog
        open={showComments}
        onClose={() => setShowComments(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              bgcolor: 'background.paper',
            }
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', fontFamily: 'Outfit' }}>
          Comments
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <div className="flex flex-col h-[400px]">
            {/* Scrollable Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" onScroll={handleCommentsScroll}>
              {comments.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">No comments yet. Be the first!</p>
              ) : (
                <>
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div 
                        className="cursor-pointer flex-shrink-0" 
                        onClick={() => {
                          if (comment.authorUsername) {
                            navigate(`/profile/${comment.authorUsername}`);
                          }
                        }}
                      >
                        <Avatar
                          src={comment.authorAvatar}
                          name={comment.authorName || 'User'}
                          className="w-8 h-8 hover:opacity-80 transition"
                        />
                      </div>
                      <div>
                        <div className="bg-slate-50 dark:bg-slate-850/50 p-3 rounded-2xl rounded-tl-none">
                          <p 
                            className="text-xs font-semibold cursor-pointer hover:underline"
                            onClick={() => {
                              if (comment.authorUsername) {
                                navigate(`/profile/${comment.authorUsername}`);
                              }
                            }}
                          >
                            {comment.authorName}
                          </p>
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

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2 items-center bg-white dark:bg-slate-900">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Likes Dialog */}
      <Dialog
        open={showLikes}
        onClose={() => setShowLikes(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              bgcolor: 'background.paper',
            }
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', fontFamily: 'Outfit' }}>
          Likes
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <div className="flex flex-col max-h-[400px] overflow-y-auto p-2">
            {loadingLikes ? (
              <p className="text-center text-sm text-slate-500 py-8 animate-pulse">Loading...</p>
            ) : likesList.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-8">No likes yet.</p>
            ) : (
              likesList.map((liker) => (
                <div 
                  key={liker.id} 
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition"
                  onClick={() => navigate(`/profile/${liker.username}`)}
                >
                  <Avatar src={liker.profileImage} name={liker.name || liker.username} className="w-10 h-10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{liker.name || liker.username}</p>
                    <p className="text-xs text-slate-500 truncate">@{liker.username}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {isOwner && (
          <MenuItem onClick={handleDeletePost} sx={{ color: 'error.main' }}>
            Delete Post
          </MenuItem>
        )}
        <MenuItem onClick={() => setAnchorEl(null)}>Report Post</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Hide Post</MenuItem>
      </Menu>
    </article>
  );
};
