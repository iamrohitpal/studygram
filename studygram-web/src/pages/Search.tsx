import React, { useState, useEffect } from 'react';
import { PostCard } from '../components/PostCard';
import { Search as SearchIcon, User, Layers, BookOpen } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'categories'>('posts');
  
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        executeSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const executeSearch = async () => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    try {
      const response = await apiClient.get(`/search?q=${encodeURIComponent(query)}&page=1&limit=10`);
      if (response && response.data) {
        if (response.data.posts.length < 10 && response.data.users.length < 10 && response.data.categories.length < 10) {
          setHasMore(false);
        }
        // Map posts
        const mappedPosts = response.data.posts.map((p: any) => ({
          id: String(p.id),
          authorName: p.user?.name || 'Anonymous User',
          authorUsername: p.user?.username || 'anonymous',
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

        setPosts(mappedPosts);

        // Map users
        const mappedUsers = response.data.users.map((u: any) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          avatar: u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=6366f1&color=fff`,
          bio: u.bio || '',
          isFollowing: u.isFollowing || false
        }));
        setUsers(mappedUsers);

        // Map categories
        setCategories(response.data.categories || []);
      }
    } catch (err) {
      console.error('Error executing search:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || !query.trim()) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await apiClient.get(`/search?q=${encodeURIComponent(query)}&page=${nextPage}&limit=10`);
      if (response && response.data) {
        if (response.data.posts.length === 0 && response.data.users.length === 0 && response.data.categories.length === 0) {
          setHasMore(false);
        } else {
          // Map posts
          const mappedPosts = response.data.posts.map((p: any) => ({
            id: String(p.id),
            authorName: p.user?.name || 'Anonymous User',
            authorUsername: p.user?.username || 'anonymous',
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

          setPosts(prev => [...prev, ...mappedPosts]);

          // Map users
          const mappedUsers = response.data.users.map((u: any) => ({
            id: u.id,
            name: u.name,
            username: u.username,
            avatar: u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=6366f1&color=fff`,
            bio: u.bio || '',
            isFollowing: u.isFollowing || false
          }));
          setUsers(prev => [...prev, ...mappedUsers]);
          setCategories(prev => [...prev, ...(response.data.categories || [])]);
          setPage(nextPage);
        }
      }
    } catch (err) {
      console.error('Error loading more search results:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, loadingMore, query]);

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, posts, notes, or categories..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
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
          <BookOpen className="w-4 h-4" />
          Posts ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          Categories ({categories.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {loading ? (
          <p className="text-center text-slate-500 py-12">Searching...</p>
        ) : (
          <>
            {activeTab === 'posts' && (
              posts.length === 0 ? (
                <p className="text-center text-slate-500 py-12">No matching posts found</p>
              ) : (
                posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              )
            )}

            {activeTab === 'users' && (
              users.length === 0 ? (
                <p className="text-center text-slate-500 py-12">No matching users found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map(userItem => (
                    <div key={userItem.username} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex gap-4 items-start shadow-sm animate-fade-in">
                      <img src={userItem.avatar} alt={userItem.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{userItem.name}</h4>
                        <p className="text-xs text-slate-500">@{userItem.username}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {userItem.bio}
                        </p>
                      </div>
                      <button 
                        onClick={async () => {
                          try {
                            await apiClient.post('/profile/follow', { followingId: userItem.id });
                            alert('Follow status updated!');
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="text-xs font-bold border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        Toggle Follow
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'categories' && (
              categories.length === 0 ? (
                <p className="text-center text-slate-500 py-12">No categories found</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:border-indigo-500 cursor-pointer transition-all shadow-sm">
                      <span className="font-bold text-sm font-heading">{cat.name}</span>
                      <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                        {cat.slug}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
            
            {loadingMore && (
              <div className="py-6 text-center text-sm font-semibold text-slate-500 animate-pulse">
                Loading more results...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
