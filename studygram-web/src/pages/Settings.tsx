import React, { useState, useEffect } from 'react';
import {
  Lock,
  Share2,
  Globe,
  Bell
} from 'lucide-react';
import { Switch } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { apiClient } from '../utils/apiClient';

export const Settings: React.FC = () => {
  // Privacy States
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowTags, setAllowTags] = useState(true);
  
  // Notification states
  const [realTime, setRealTime] = useState(true);
  const [reminders, setReminders] = useState(true);

  // Social account connections
  const [connected, setConnected] = useState({
    instagram: false,
    facebook: false,
    linkedin: false,
    youtube: false,
    twitter: false,
  });

  useEffect(() => {
    fetchConnectedAccounts();
  }, []);

  const fetchConnectedAccounts = async () => {
    try {
      const response = await apiClient.get('/social-auth/accounts');
      if (response.data) {
        setConnected({
          instagram: response.data.instagram,
          facebook: response.data.facebook,
          linkedin: response.data.linkedin,
          youtube: response.data.youtube,
          twitter: response.data.twitter,
        });
      }
    } catch (err) {
      console.error('Failed to fetch social accounts', err);
    }
  };

  const toggleConnection = async (key: keyof typeof connected) => {
    try {
      if (connected[key]) {
        // Disconnect
        await apiClient.delete(`/social-auth/disconnect/${key}`);
      } else {
        // Connect
        await apiClient.post(`/social-auth/connect/${key}`);
      }
      // Re-fetch to ensure sync with backend
      fetchConnectedAccounts();
    } catch (err) {
      console.error(`Failed to toggle connection for ${key}`, err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
          Settings
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Configure profile privacy, notifications, and cross-platform integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Configuration Categories */}
        <div className="md:col-span-2 space-y-6">
          {/* Privacy Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-md font-bold font-heading flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-500" />
              Privacy & Security
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                <div>
                  <span className="block text-xs font-semibold">Private Profile</span>
                  <span className="text-[10px] text-slate-500">Only approved followers can view your uploads and notes.</span>
                </div>
                <Switch checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                <div>
                  <span className="block text-xs font-semibold">Allow Tagging</span>
                  <span className="text-[10px] text-slate-500">Allow other students to tag you in their posts or study groups.</span>
                </div>
                <Switch checked={allowTags} onChange={(e) => setAllowTags(e.target.checked)} />
              </div>
            </div>
          </div>

          {/* Connected Social Accounts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-md font-bold font-heading flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-500" />
              Cross-Platform Integrations
            </h3>
            <p className="text-xs text-slate-500">
              Automatically publish your study notes, guides, and upload links to your active social networks.
            </p>

            <div className="space-y-3">
              {/* Instagram */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                <div className="flex items-center gap-3">
                  <InstagramIcon className="w-5 h-5 text-pink-500" />
                  <div>
                    <span className="block text-xs font-semibold">Instagram</span>
                    <span className="text-[10px] text-slate-500">Connect to share posts to your stories.</span>
                  </div>
                </div>
                  <button
                    type="button"
                    onClick={() => toggleConnection('instagram')}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all hover:scale-[1.05] active:scale-[0.95] cursor-pointer ${
                      connected.instagram
                        ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-200 dark:border-rose-800'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                  {connected.instagram ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* LinkedIn */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                <div className="flex items-center gap-3">
                  <LinkedInIcon className="w-5 h-5 text-blue-650" />
                  <div>
                    <span className="block text-xs font-semibold">LinkedIn</span>
                    <span className="text-[10px] text-slate-500">Connect to publish notes & certifications.</span>
                  </div>
                </div>
                  <button
                    type="button"
                    onClick={() => toggleConnection('linkedin')}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all hover:scale-[1.05] active:scale-[0.95] cursor-pointer ${
                      connected.linkedin
                        ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-200 dark:border-rose-800'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                  {connected.linkedin ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* Facebook */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                <div className="flex items-center gap-3">
                  <FacebookIcon className="w-5 h-5 text-blue-800" />
                  <div>
                    <span className="block text-xs font-semibold">Facebook</span>
                    <span className="text-[10px] text-slate-500">Connect to publish to study group pages.</span>
                  </div>
                </div>
                  <button
                    type="button"
                    onClick={() => toggleConnection('facebook')}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all hover:scale-[1.05] active:scale-[0.95] cursor-pointer ${
                      connected.facebook
                        ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-200 dark:border-rose-800'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                  {connected.facebook ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* YouTube */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                <div className="flex items-center gap-3">
                  <YouTubeIcon className="w-5 h-5 text-red-650" />
                  <div>
                    <span className="block text-xs font-semibold">YouTube</span>
                    <span className="text-[10px] text-slate-500">Connect to link lecture video playlists.</span>
                  </div>
                </div>
                  <button
                    type="button"
                    onClick={() => toggleConnection('youtube')}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all hover:scale-[1.05] active:scale-[0.95] cursor-pointer ${
                      connected.youtube
                        ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-200 dark:border-rose-800'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                  {connected.youtube ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Notifications & Status */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-md font-bold font-heading flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" />
              Notifications
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold">Real-time Push</span>
                <Switch checked={realTime} onChange={(e) => setRealTime(e.target.checked)} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold">Study Reminders</span>
                <Switch checked={reminders} onChange={(e) => setReminders(e.target.checked)} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-3 shadow-sm">
            <div className="flex justify-center text-indigo-600">
              <Globe className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <h4 className="font-bold text-xs">PWA Offline Capabilities</h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              StudyGram is optimized to run offline. Your notes, bookmarks, and configurations are saved locally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
