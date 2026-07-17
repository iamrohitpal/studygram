import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ReportedItem {
  id: string;
  targetId: string; // post ID or user ID
  targetType: 'content' | 'user';
  reportedBy: string;
  reason: string;
  evidence: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface AdminUserItem {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'student' | 'moderator' | 'admin';
  uploadsCount: number;
  reportsCount: number;
  status: 'active' | 'suspended';
  bio?: string;
  joinedAt?: string;
}

export interface SystemPost {
  id: string;
  authorName: string;
  authorUsername: string;
  type: 'image' | 'video' | 'notes';
  mediaUrl: string;
  caption: string;
  notesTitle?: string;
  category: string;
  isFlagged: boolean;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  postCount: number;
}

export interface ReminderConfig {
  dailyTime: string;
  isEnabled: boolean;
  templates: { id: string; title: string; content: string }[];
}

export interface SocialConfig {
  instagramKey: string;
  facebookKey: string;
  linkedinKey: string;
  youtubeKey: string;
  xKey: string;
}

export interface PlatformConfig {
  siteName: string;
  contactEmail: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  security2FA: boolean;
}

interface ModerationState {
  reports: ReportedItem[];
  users: AdminUserItem[];
  posts: SystemPost[];
  categories: CategoryItem[];
  reminder: ReminderConfig;
  social: SocialConfig;
  platform: PlatformConfig;
}

const mockReports: ReportedItem[] = [
  {
    id: 'rep_1',
    targetId: 'post_1',
    targetType: 'content',
    reportedBy: 'Kunal Sen',
    reason: 'Copyright violation',
    evidence: 'Copied lecture slides from class resources without permission.',
    createdAt: '2 hours ago',
    status: 'pending',
  },
  {
    id: 'rep_2',
    targetId: 'u_4',
    targetType: 'user',
    reportedBy: 'Sarah Jenkins',
    reason: 'Spam comments',
    evidence: 'Posting promotional links across biology comments.',
    createdAt: '1 day ago',
    status: 'pending',
  }
];

const mockUsers: AdminUserItem[] = [
  {
    id: 'u_1',
    fullName: 'Aarav Mehta',
    username: 'aarav_codes',
    email: 'aarav@gmail.com',
    role: 'student',
    uploadsCount: 24,
    reportsCount: 1,
    status: 'active',
    bio: 'Computer science major. Coding daily.',
    joinedAt: 'June 2026',
  },
  {
    id: 'u_2',
    fullName: 'Nisha Roy',
    username: 'nisha_upsc',
    email: 'nisha@gmail.com',
    role: 'student',
    uploadsCount: 89,
    reportsCount: 0,
    status: 'active',
    bio: 'Preparing for UPSC. Stay disciplined.',
    joinedAt: 'May 2026',
  },
  {
    id: 'u_3',
    fullName: 'Sarah Jenkins',
    username: 'sarah_j',
    email: 'sarah@gmail.com',
    role: 'moderator',
    uploadsCount: 142,
    reportsCount: 0,
    status: 'active',
    bio: 'Language learning facilitator.',
    joinedAt: 'April 2026',
  },
  {
    id: 'u_4',
    fullName: 'Rajesh Kumar',
    username: 'rajesh_k',
    email: 'rajesh@gmail.com',
    role: 'student',
    uploadsCount: 12,
    reportsCount: 4,
    status: 'suspended',
    bio: 'Physics enthusiast.',
    joinedAt: 'January 2026',
  }
];

const mockPosts: SystemPost[] = [
  {
    id: 'post_1',
    authorName: 'Aarav Mehta',
    authorUsername: 'aarav_codes',
    type: 'notes',
    mediaUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800',
    caption: 'Here are my React 19 architecture notes.',
    notesTitle: 'React 19 Server Components Cheat Sheet',
    category: 'Programming',
    isFlagged: true,
    createdAt: '3 hours ago',
  },
  {
    id: 'post_2',
    authorName: 'Nisha Roy',
    authorUsername: 'nisha_upsc',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    caption: 'My UPSC exam desk setup.',
    category: 'UPSC',
    isFlagged: false,
    createdAt: '5 hours ago',
  }
];

const mockCategories: CategoryItem[] = [
  { id: 'cat_1', name: 'Programming', description: 'Web development, Python, algorithms', postCount: 124 },
  { id: 'cat_2', name: 'Mathematics', description: 'Calculus, algebra, discrete math', postCount: 89 },
  { id: 'cat_3', name: 'Science', description: 'Physics, biology, microscope notes', postCount: 62 },
  { id: 'cat_4', name: 'UPSC', description: 'Civil services exam preps', postCount: 204 },
  { id: 'cat_5', name: 'SSC', description: 'Staff selection preps', postCount: 110 },
  { id: 'cat_6', name: 'Language Learning', description: 'IELTS, TOEFL, vocabulary guides', postCount: 95 },
  { id: 'cat_7', name: 'Motivation', description: 'Desk setups, quotes, schedules', postCount: 40 },
];

const defaultReminder: ReminderConfig = {
  dailyTime: '08:00',
  isEnabled: true,
  templates: [
    { id: 't_1', title: 'Daily Study Streak', content: 'Hey {{username}}! Time to keep your study streak alive. Review your saved notes now.' },
    { id: 't_2', title: 'Morning Motivation', content: 'Good morning! "Success is the sum of small efforts repeated daily." Let\'s study.' }
  ]
};

const defaultSocial: SocialConfig = {
  instagramKey: 'ig_live_token_18239x813',
  facebookKey: 'fb_graph_key_92813133',
  linkedinKey: 'li_auth_code_x8291a',
  youtubeKey: 'yt_data_v3_key_0281b',
  xKey: 'x_api_v2_secret_92831'
};

const defaultPlatform: PlatformConfig = {
  siteName: 'StudyGram User Portal',
  contactEmail: 'support@studygram.com',
  cloudinaryCloudName: 'studygram-assets',
  cloudinaryApiKey: '829183928192839',
  cloudinaryApiSecret: '**************************',
  security2FA: false
};

const initialState: ModerationState = {
  reports: mockReports,
  users: mockUsers,
  posts: mockPosts,
  categories: mockCategories,
  reminder: defaultReminder,
  social: defaultSocial,
  platform: defaultPlatform,
};

const moderationSlice = createSlice({
  name: 'moderation',
  initialState,
  reducers: {
    resolveReport(state, action: PayloadAction<{ reportId: string; resolution: 'resolved' | 'dismissed' }>) {
      const report = state.reports.find(r => r.id === action.payload.reportId);
      if (report) {
        report.status = action.payload.resolution;
      }
    },
    deleteReportedPost(state, action: PayloadAction<{ postId: string; reportId?: string }>) {
      state.posts = state.posts.filter(p => p.id !== action.payload.postId);
      if (action.payload.reportId) {
        state.reports = state.reports.filter(r => r.id !== action.payload.reportId);
      }
    },
    flagPost(state, action: PayloadAction<{ postId: string; isFlagged: boolean }>) {
      const post = state.posts.find(p => p.id === action.payload.postId);
      if (post) {
        post.isFlagged = action.payload.isFlagged;
      }
    },
    toggleUserStatus(state, action: PayloadAction<string>) {
      const user = state.users.find(u => u.id === action.payload);
      if (user) {
        user.status = user.status === 'active' ? 'suspended' : 'active';
      }
    },
    deleteUser(state, action: PayloadAction<string>) {
      state.users = state.users.filter(u => u.id !== action.payload);
    },
    changeUserRole(state, action: PayloadAction<{ userId: string; role: 'student' | 'moderator' | 'admin' }>) {
      const user = state.users.find(u => u.id === action.payload.userId);
      if (user) {
        user.role = action.payload.role;
      }
    },
    createCategory(state, action: PayloadAction<{ name: string; description: string }>) {
      state.categories.push({
        id: `cat_${Math.random()}`,
        name: action.payload.name,
        description: action.payload.description,
        postCount: 0
      });
    },
    updateCategory(state, action: PayloadAction<{ id: string; name: string; description: string }>) {
      const category = state.categories.find(c => c.id === action.payload.id);
      if (category) {
        category.name = action.payload.name;
        category.description = action.payload.description;
      }
    },
    deleteCategory(state, action: PayloadAction<string>) {
      state.categories = state.categories.filter(c => c.id !== action.payload);
    },
    updateReminderSettings(state, action: PayloadAction<{ dailyTime: string; isEnabled: boolean }>) {
      state.reminder.dailyTime = action.payload.dailyTime;
      state.reminder.isEnabled = action.payload.isEnabled;
    },
    addReminderTemplate(state, action: PayloadAction<{ title: string; content: string }>) {
      state.reminder.templates.push({
        id: `t_${Math.random()}`,
        title: action.payload.title,
        content: action.payload.content
      });
    },
    deleteReminderTemplate(state, action: PayloadAction<string>) {
      state.reminder.templates = state.reminder.templates.filter(t => t.id !== action.payload);
    },
    updateSocialSettings(state, action: PayloadAction<SocialConfig>) {
      state.social = action.payload;
    },
    updatePlatformSettings(state, action: PayloadAction<PlatformConfig>) {
      state.platform = action.payload;
    }
  },
});

export const {
  resolveReport,
  deleteReportedPost,
  flagPost,
  toggleUserStatus,
  deleteUser,
  changeUserRole,
  createCategory,
  updateCategory,
  deleteCategory,
  updateReminderSettings,
  addReminderTemplate,
  deleteReminderTemplate,
  updateSocialSettings,
  updatePlatformSettings
} = moderationSlice.actions;

export default moderationSlice.reducer;
export type { ModerationState };
