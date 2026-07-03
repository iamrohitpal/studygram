import React, { useState, useEffect, useRef } from 'react';
import { PostCard } from '../components/PostCard';
import { PostSkeleton } from '../components/PostSkeleton';
import { Sparkles, Brain, Award, TrendingUp } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../features/store';
import { apiClient } from '../utils/apiClient';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([{ id: 'all', name: 'All' }]);
  const [selectedCategory, setSelectedCategory] = useState<any>({ id: 'all', name: 'All' });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [trendingTags, setTrendingTags] = useState<{tag: string, count: number}[]>([]);
  const [topCreators, setTopCreators] = useState<any[]>([]);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, page, selectedCategory]);

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const catParam = selectedCategory.id === 'all' ? '' : `&categoryId=${selectedCategory.id}`;
      const res = await apiClient.get(`/posts/feed?page=${nextPage}&limit=10${catParam}`);
      if (res && res.data) {
        if (res.data.length === 0) {
          setHasMore(false);
        } else {
          const mapped = mapPosts(res.data);
          setPosts(prev => [...prev, ...mapped]);
          setPage(nextPage);
        }
      }
    } catch (err) {
      console.error('Error loading more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const mapPosts = (data: any[]) => {
    return data.map((p: any) => ({
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
      commentsCount: p.commentsCount || 0,
      hasLiked: p.hasLiked || false,
      hasSaved: p.hasSaved || false,
      createdAt: new Date(p.createdAt).toLocaleDateString()
    }));
  };

  const fetchInitialData = async (catId: string = 'all') => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    try {
      const catParam = catId === 'all' ? '' : `&categoryId=${catId}`;
      const postsRes = await apiClient.get(`/posts/feed?page=1&limit=10${catParam}`);
      if (postsRes && postsRes.data) {
        if (postsRes.data.length < 10) setHasMore(false);
        setPosts(mapPosts(postsRes.data));
      }

      // Fetch categories
      if (categories.length <= 1) {
        const catRes = await apiClient.get('/categories');
        if (catRes && catRes.data) {
          setCategories([{ id: 'all', name: 'All' }, ...catRes.data]);
        }
      }
      // Fetch tags and creators
      try {
        const [tagsRes, creatorsRes] = await Promise.all([
          apiClient.get('/posts/trending-tags'),
          apiClient.get('/users/top-creators')
        ]);
        if (tagsRes?.data) setTrendingTags(tagsRes.data);
        if (creatorsRes?.data) setTopCreators(creatorsRes.data);
      } catch (err) {
        console.error('Error loading trending/creators:', err);
      }
      
    } catch (err) {
      console.error('Error loading feed data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat: any) => {
    setSelectedCategory(cat);
    fetchInitialData(cat.id);
  };

  const filteredPosts = posts;

  const handleToggleFollow = async (creatorId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await apiClient.post('/profile/follow', { followingId: creatorId });
      if (res && res.data) {
        const followed = res.data.followed;
        setTopCreators(prev => prev.map(c => {
          if (c.id === creatorId) {
            return { ...c, isFollowing: followed };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const renderSuggestedCreators = () => {
    if (topCreators.length === 0) return null;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden my-6">
        <h3 className="font-extrabold font-heading text-lg mb-4 text-slate-800 dark:text-slate-100">Suggested for you</h3>
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2 snap-x">
          {topCreators.map(creator => (
            <div key={creator.id || creator.handle} className="snap-start min-w-[160px] max-w-[160px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3">
              <Avatar src={creator.profileImage} name={creator.name} className="w-20 h-20 shadow-sm" />
              <div className="w-full">
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:text-indigo-600 transition" onClick={() => navigate(`/profile/${creator.handle.substring(1)}`)}>{creator.name}</p>
                <p className="text-xs text-slate-500 truncate">{creator.handle}</p>
              </div>
              <button
                onClick={(e) => handleToggleFollow(creator.id, e)}
                className={`w-full text-xs font-bold py-2 rounded-xl transition-colors ${
                  creator.isFollowing 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {creator.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
      {/* Main Left Column */}
      <div className="space-y-8 max-w-3xl w-full mx-auto lg:mx-0">
        
        {/* Welcome Banner */}
        <div className="group bg-gradient-to-br from-indigo-600 via-indigo-700 to-fuchsia-700 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20 transition-transform hover:scale-[1.02] duration-300">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/10 transition-colors duration-500"></div>
          <div className="absolute right-4 top-4 opacity-10 animate-pulse group-hover:scale-110 transition-transform duration-500">
            <Brain className="w-40 h-40" />
          </div>
          <div className="relative z-10 space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Tip of the Day
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-heading leading-tight tracking-tight">
              Keep the momentum going!
            </h2>
            <p className="text-sm md:text-base text-indigo-100/90 leading-relaxed font-medium">
              "Use the Pomodoro technique: study for 25 minutes, take a 5-minute break. Repeat 4 times then take a longer break. Stay focused!"
            </p>
          </div>
        </div>

      {/* Categories Filter Carousel */}
      <div className="sticky top-0 z-20 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-y border-slate-200/50 dark:border-slate-800/50 -mx-4 px-4 py-3 mb-6 shadow-sm">
        <div className="overflow-x-auto custom-scrollbar pb-1">
           <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 snap-x">
            {categories.map((cat, i) => (
              <button 
                key={i}
                onClick={() => handleCategorySelect(cat)}
                className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm
                  ${selectedCategory.id === cat.id 
                    ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-semibold">
            No posts found in this category.
          </div>
        ) : (
          filteredPosts.map((post, index) => (
            <React.Fragment key={post.id}>
              <PostCard post={post} />
              {/* Insert suggested creators after the 2nd post (index 1), or after the last post if there are less than 2 */}
              {(index === 1 || (filteredPosts.length === 1 && index === 0)) && renderSuggestedCreators()}
            </React.Fragment>
          ))
        )}

        {/* Loading Skeletons for older pages */}
        <div ref={loaderRef} className="py-4 text-center">
            {loadingMore && <div className="text-slate-500 font-medium">Loading more posts...</div>}
            {!hasMore && posts.length > 0 && <div className="text-slate-400 font-medium">You've reached the end!</div>}
          </div>
        </div>
      </div>

      {/* Right Sidebar (Responsive: bottom on mobile, right on desktop) */}
      <div className="flex flex-col space-y-8 lg:sticky lg:top-[88px] h-max order-last">
        {/* Trending Tags Widget */}
        {trendingTags.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-shadow">
            <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-100">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold font-heading text-lg">Trending Tags</h3>
            </div>
            <div className="space-y-4">
              {trendingTags.map((t) => (
                <div key={t.tag} className="flex flex-col group cursor-pointer">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    {t.tag}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{t.count} posts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Links (moved to auth page) */}
      </div>
    </div>
  );
};
