import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { updateProfile } from '../../src/features/authSlice';
import { PostCard } from '../components/PostCard';
import { Avatar } from '../components/Avatar';
import { Edit2, Grid, Bookmark, BookOpen, Camera, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

export const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username: paramUsername } = useParams<{ username?: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const targetUsername = paramUsername || user?.username;
  const isCurrentUser = !paramUsername || paramUsername === user?.username;
  
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [editOpen, setEditOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileData, setProfileData] = useState<any>(user);
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Followers/Following lists state
  const [listModalOpen, setListModalOpen] = useState(false);
  const [listModalType, setListModalType] = useState<'followers' | 'following'>('followers');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [listsLoading, setListsLoading] = useState(false);

  useEffect(() => {
    if (targetUsername) {
      fetchProfileAndPosts();
    }
  }, [targetUsername]);

  const fetchProfileAndPosts = async () => {
    setLoading(true);
    try {
      // Get profile
      const profRes = await apiClient.get(`/profile/${targetUsername}`);
      if (profRes && profRes.data) {
        setProfileData(profRes.data);
      }

      // Get posts feed (filter locally for user posts)
      const postsRes = await apiClient.get('/posts/feed');
      if (postsRes && postsRes.data) {
        const mapped = postsRes.data.map((p: any) => ({
          id: String(p.id),
          authorName: p.user?.name || 'Anonymous User',
          authorUsername: p.user?.username || 'anonymous',
          authorId: p.user?.id,
          authorAvatar: p.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=6366f1&color=fff`,
          type: p.contentType === 'note' ? 'notes' : p.contentType,
          mediaUrl: p.mediaUrl,
          notesTitle: p.title,
          notesPages: 4,
          caption: p.description,
          category: p.category?.name || 'General',
          tags: [],
          likesCount: p.likesCount || 0,
          hasLiked: p.hasLiked || false,
          hasSaved: p.hasSaved || false,
          createdAt: new Date(p.createdAt).toLocaleDateString()
        }));

        setPosts(mapped.filter((p: any) => p.authorUsername === (paramUsername || user?.username)));
      }

      // Get saved posts
      const savedRes = await apiClient.get('/posts/saved');
      if (savedRes && savedRes.data) {
        const mappedSaved = savedRes.data.map((p: any) => ({
          id: String(p.id),
          authorName: p.user?.name || 'Anonymous User',
          authorUsername: p.user?.username || 'anonymous',
          authorId: p.user?.id,
          authorAvatar: p.user?.profileImage,
          type: p.contentType === 'note' ? 'notes' : p.contentType,
          mediaUrl: p.mediaUrl,
          notesTitle: p.title,
          notesPages: 4,
          caption: p.description,
          category: 'Bookmarked',
          tags: [],
          likesCount: p.likesCount || 0,
          hasLiked: p.hasLiked || false,
          hasSaved: p.hasSaved || true,
          createdAt: new Date(p.createdAt).toLocaleDateString()
        }));
        setSavedPosts(mappedSaved);
      }

    } catch (err) {
      console.error('Error fetching profile detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.put('/profile', {
        name: fullName,
        bio: bio
      });
      if (response && response.data) {
        dispatch(updateProfile({ fullName, bio }));
        setProfileData((prev: any) => ({
          ...prev,
          name: fullName,
          bio: bio
        }));
      }
      setEditOpen(false);
    } catch (e) {
      console.error('Error saving profile changes:', e);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const res = await apiClient.put('/profile', formData);
        if (res && res.data) {
          const newAvatar = res.data.profileImage;
          dispatch(updateProfile({ avatarUrl: newAvatar }));
          setProfileData((prev: any) => ({ ...prev, profileImage: newAvatar }));
        }
      } catch (err) {
        console.error('Error updating avatar:', err);
      }
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('cover', file);

      try {
        const res = await apiClient.put('/profile', formData);
        if (res && res.data) {
          const newCover = res.data.coverImage;
          dispatch(updateProfile({ coverUrl: newCover }));
          setProfileData((prev: any) => ({ ...prev, coverImage: newCover, coverUrl: newCover }));
        }
      } catch (err) {
        console.error('Error updating banner:', err);
      }
    }
  };

  const openUserList = async (type: 'followers' | 'following') => {
    if (!profileData?.id) return;
    setListModalType(type);
    setListModalOpen(true);
    setListsLoading(true);
    setUsersList([]);
    try {
      const res = await apiClient.get(`/profile/${profileData.id}/${type}`);
      if (res.data) {
        if (type === 'followers') {
          setUsersList(res.data.map((f: any) => f.follower));
        } else {
          setUsersList(res.data.map((f: any) => f.following));
        }
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
    } finally {
      setListsLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!profileData?.id) return;
    try {
      const res = await apiClient.post('/chat/conversation', { otherUserId: profileData.id });
      if (res && res.data) {
        import('../features/chatSlice').then(({ setActiveConversation }) => {
          dispatch(setActiveConversation(res.data.id));
          navigate('/chat');
        });
      }
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  const handleToggleFollow = async (userId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await apiClient.post('/profile/toggle-follow', { followingId: userId });
      if (res && res.data) {
        const followed = res.data.followed;
        setProfileData((prev: any) => ({
          ...prev,
          isFollowing: followed,
          followersCount: followed ? (prev.followersCount || 0) + 1 : Math.max(0, (prev.followersCount || 0) - 1)
        }));
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const handleListUserFollow = async (userId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await apiClient.post('/profile/toggle-follow', { followingId: userId });
      if (res && res.data) {
        const followed = res.data.followed;
        
        setUsersList(prev => prev.map(u => {
          if (u.id === userId) {
            return { ...u, isFollowing: followed };
          }
          return u;
        }));

        if (isCurrentUser) {
          setProfileData((prev: any) => ({
            ...prev,
            followingCount: followed ? (prev.followingCount || 0) + 1 : Math.max(0, (prev.followingCount || 0) - 1)
          }));
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input type="file" id="cover-upload" accept="image/*" className="hidden" onChange={handleCoverChange} />
      <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={handleAvatarChange} />

      {/* Profile Header Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {/* Cover Photo */}
        <div className="h-40 md:h-52 relative bg-slate-200 dark:bg-slate-950">
          {profileData?.coverImage || profileData?.coverUrl ? (
            <img src={profileData.coverImage || profileData.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : null}
          <button 
            onClick={() => document.getElementById('cover-upload')?.click()}
            className="absolute right-4 bottom-4 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 cursor-pointer hover:scale-105 transition"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Info Details */}
        <div className="px-6 pb-6 relative">
          {/* Avatar */}
          <div className="relative -mt-16 md:-mt-20 mb-4 inline-block group">
            <Avatar
              src={profileData?.profileImage}
              name={profileData?.name || profileData?.fullName || 'User'}
              className="w-24 h-24 md:w-32 md:h-32 border-4 border-white dark:border-slate-900 shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
            <button 
              onClick={() => document.getElementById('avatar-upload')?.click()}
              className="absolute bottom-1 right-1 p-1.5 bg-indigo-600 rounded-full text-white ring-2 ring-white dark:ring-slate-900 cursor-pointer hover:scale-110 hover:bg-indigo-500 shadow-sm transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold font-heading">{profileData?.name || profileData?.fullName}</h2>
              <p className="text-sm text-slate-500">@{profileData?.username}</p>
            </div>
            
            {isCurrentUser ? (
              <button
                onClick={() => {
                  setFullName(profileData?.name || profileData?.fullName || '');
                  setBio(profileData?.bio || '');
                  setEditOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-semibold py-2 px-4 rounded-xl text-sm transition cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleFollow(profileData?.id)}
                  className={`inline-flex items-center justify-center gap-2 font-semibold py-2 px-6 rounded-xl text-sm transition cursor-pointer ${
                    profileData?.isFollowing 
                      ? 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {profileData?.isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={handleStartChat}
                  className="inline-flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-semibold py-2 px-4 rounded-xl text-sm transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
              </div>
            )}
          </div>

          {/* Bio */}
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
            {profileData?.bio || 'No bio added yet.'}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 border-t border-slate-100 dark:border-slate-800/40 pt-4">
            <div onClick={() => setActiveTab('posts')} className="cursor-pointer hover:opacity-75 transition">
              <span className="block text-lg font-bold font-heading">{posts.length}</span>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Posts</span>
            </div>
            <div onClick={() => openUserList('followers')} className="cursor-pointer hover:opacity-75 transition">
              <span className="block text-lg font-bold font-heading">{profileData?.followersCount || 0}</span>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Followers</span>
            </div>
            <div onClick={() => openUserList('following')} className="cursor-pointer hover:opacity-75 transition">
              <span className="block text-lg font-bold font-heading">{profileData?.followingCount || 0}</span>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'posts'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Grid className="w-4 h-4" />
          Uploads ({posts.length})
        </button>
        {isCurrentUser && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saved ({savedPosts.length})
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-semibold">
            Loading profile content...
          </div>
        ) : activeTab === 'posts' ? (
          posts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
              <BookOpen className="w-12 h-12 text-slate-350 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No posts uploaded yet</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )
        ) : (
          savedPosts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
              <Bookmark className="w-12 h-12 text-slate-350 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No bookmarked posts yet</p>
            </div>
          ) : (
            savedPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              p: 1,
            }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit', fontWeight: 700 }}>Edit Profile</DialogTitle>
        <DialogContent>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
            <TextField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setEditOpen(false)} variant="text">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Followers/Following List Dialog */}
      <Dialog
        open={listModalOpen}
        onClose={() => setListModalOpen(false)}
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
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', fontFamily: 'Outfit', textTransform: 'capitalize' }}>
          {listModalType}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <div className="flex flex-col min-h-[300px] max-h-[500px] overflow-y-auto p-4 space-y-4">
            {listsLoading ? (
              <p className="text-center text-sm text-slate-500 py-8 animate-pulse">Loading...</p>
            ) : usersList.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-8">No {listModalType} found.</p>
            ) : (
              usersList.map((u) => (
                <div 
                  key={u.id} 
                  onClick={() => {
                    setListModalOpen(false);
                    navigate(`/profile/${u.username}`);
                  }}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition cursor-pointer"
                >
                  <Avatar src={u.profileImage} name={u.name || u.username} className="w-12 h-12" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{u.name || u.username}</p>
                    <p className="text-xs text-slate-500 truncate">@{u.username}</p>
                  </div>
                  {user && user.id !== u.id && (
                    <button
                      onClick={(e) => handleListUserFollow(u.id, e)}
                      className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors ${
                        u.isFollowing 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {u.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
