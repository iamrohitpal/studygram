import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { flagPost, deleteReportedPost } from '../features/moderationSlice';
import { FileText, Flag, Trash, BookOpen, Video } from 'lucide-react';
import { IconButton, Tooltip } from '@mui/material';

export const Content: React.FC = () => {
  const dispatch = useDispatch();
  const { posts } = useSelector((state: RootState) => state.moderation);

  const handleFlagToggle = (postId: string, currentFlag: boolean) => {
    dispatch(flagPost({ postId, isFlagged: !currentFlag }));
  };

  const handleDelete = (postId: string) => {
    if (confirm('Are you sure you want to delete this post permanently from the user portal?')) {
      dispatch(deleteReportedPost({ postId }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
        <h3 className="font-extrabold text-sm font-heading flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          Content Management
        </h3>
        <p className="text-xs text-slate-500 mt-1">Review active uploads, toggle warning flags, or delete inappropriate submissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.length === 0 ? (
          <div className="md:col-span-2 text-center py-12 bg-white dark:bg-slate-900 border rounded-3xl">
            <p className="text-sm text-slate-500">No active posts to display</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex gap-5 items-start shadow-sm">
              
              {/* Media Preview Box */}
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
                {post.type === 'notes' ? (
                  <BookOpen className="w-8 h-8 text-indigo-500" />
                ) : post.type === 'video' ? (
                  <Video className="w-8 h-8 text-rose-500" />
                ) : (
                  <img src={post.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Meta Info */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded-full">
                      {post.type}
                    </span>
                    <span className="text-xs font-semibold block mt-1">@{post.authorUsername}</span>
                  </div>
                  {post.isFlagged && (
                    <span className="text-[10px] font-bold text-rose-650 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Flagged
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{post.caption}</p>

                {/* Actions */}
                <div className="flex justify-end gap-1 border-t border-slate-100 dark:border-slate-800/40 pt-2">
                  <Tooltip title={post.isFlagged ? 'Remove Warning Flag' : 'Flag Post'}>
                    <IconButton size="small" onClick={() => handleFlagToggle(post.id, post.isFlagged)}>
                      <Flag className={`w-4 h-4 ${post.isFlagged ? 'text-rose-500 fill-current' : 'text-slate-400'}`} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Content">
                    <IconButton size="small" color="error" onClick={() => handleDelete(post.id)}>
                      <Trash className="w-4 h-4" />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
