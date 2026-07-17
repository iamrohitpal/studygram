import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
}

export interface Post {
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
  comments: Comment[];
  hasLiked: boolean;
  hasSaved: boolean;
  createdAt: string;
}

interface PostsState {
  posts: Post[];
  savedPostIds: string[];
}

const mockPosts: Post[] = [
  {
    id: 'post_1',
    authorName: 'Aarav Mehta',
    authorUsername: 'aarav_codes',
    authorAvatar: `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`,
    type: 'notes',
    mediaUrl: `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`,
    notesTitle: 'React 19 Server Components Architecture Cheat Sheet',
    notesPages: 4,
    caption: 'Here are my condensed handwritten notes summarizing React Server Components (RSC) and server actions flow in React 19. Super helpful for reference!',
    category: 'Programming',
    tags: ['reactjs', 'webdev', 'javascript', 'notes'],
    likesCount: 142,
    comments: [
      {
        id: 'c1',
        authorName: 'Sarah Jenkins',
        authorAvatar: `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`,
        content: 'Wow! This is extremely clear and concise. Thanks for sharing.',
        timestamp: '1 hour ago'
      }
    ],
    hasLiked: false,
    hasSaved: true,
    createdAt: '3 hours ago',
  },
  {
    id: 'post_2',
    authorName: 'Nisha Roy',
    authorUsername: 'nisha_upsc',
    authorAvatar: `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`,
    type: 'image',
    mediaUrl: `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`,
    caption: 'My desk setup for UPSC Mains prep today. Focusing on ancient Indian history and geography notes. Consistency is key! 📖✨',
    category: 'UPSC',
    tags: ['upsc', 'studymotivation', 'history', 'desksetup'],
    likesCount: 389,
    comments: [
      {
        id: 'c2',
        authorName: 'Rajesh Kumar',
        authorAvatar: `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`,
        content: 'All the best! Your setup looks so focused.',
        timestamp: '4 hours ago'
      }
    ],
    hasLiked: true,
    hasSaved: false,
    createdAt: '5 hours ago',
  },
  {
    id: 'post_3',
    authorName: 'Dr. Evelyn Carter',
    authorUsername: 'evelyn_science',
    authorAvatar: `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`,
    type: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cell-division-under-microscope-41584-large.mp4', // we can use public video or simple mock
    caption: 'Fascinating footage of cell mitosis under a modern polarized microscope. Nature is incredibly structured. 🧬🔬',
    category: 'Science',
    tags: ['science', 'biology', 'education', 'microscope'],
    likesCount: 924,
    comments: [],
    hasLiked: false,
    hasSaved: false,
    createdAt: '1 day ago',
  }
];

const initialState: PostsState = {
  posts: mockPosts,
  savedPostIds: ['post_1'],
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    toggleLike(state, action: PayloadAction<string>) {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.hasLiked = !post.hasLiked;
        post.likesCount += post.hasLiked ? 1 : -1;
      }
    },
    toggleSave(state, action: PayloadAction<string>) {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.hasSaved = !post.hasSaved;
        if (post.hasSaved) {
          if (!state.savedPostIds.includes(post.id)) {
            state.savedPostIds.push(post.id);
          }
        } else {
          state.savedPostIds = state.savedPostIds.filter(id => id !== post.id);
        }
      }
    },
    addComment(state, action: PayloadAction<{ postId: string; content: string; authorName: string; authorAvatar: string }>) {
      const post = state.posts.find(p => p.id === action.payload.postId);
      if (post) {
        post.comments.push({
          id: Math.random().toString(),
          authorName: action.payload.authorName,
          authorAvatar: action.payload.authorAvatar,
          content: action.payload.content,
          timestamp: 'Just now',
        });
      }
    },
    addPost(state, action: PayloadAction<Omit<Post, 'id' | 'likesCount' | 'comments' | 'hasLiked' | 'hasSaved' | 'createdAt'>>) {
      state.posts.unshift({
        ...action.payload,
        id: `post_${Math.random().toString()}`,
        likesCount: 0,
        comments: [],
        hasLiked: false,
        hasSaved: false,
        createdAt: 'Just now',
      });
    },
  },
});

export const { toggleLike, toggleSave, addComment, addPost } = postsSlice.actions;
export default postsSlice.reducer;
export type { PostsState };
