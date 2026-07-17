import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import { PostCard } from '../components/PostCard';
import { PostSkeleton } from '../components/PostSkeleton';
import { ArrowLeft } from 'lucide-react';

export const SinglePost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await apiClient.get(`/posts/${postId}`);
        if (response.data) {
          setPost(response.data);
        } else {
          setError('Post not found');
        }
      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError(err.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8">
        <PostSkeleton />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold font-heading text-slate-800 dark:text-slate-100 mb-2">Post Not Found</h2>
        <p className="text-slate-500 mb-6">{error || "This post doesn't exist or has been removed."}</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl transition"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-6">
      <div className="mb-6 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100">Post</h1>
      </div>
      <PostCard post={post} />
    </div>
  );
};
