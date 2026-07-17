import React, { useState, useEffect } from 'react';
import {
  Share2, Save, Eye, EyeOff, RefreshCw, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { apiClient } from '../utils/apiClient';

// Brand icons as inline SVGs (no extra package needed)
const InstagramSVG = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FacebookSVG = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedInSVG = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const YouTubeSVG = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const XSVG = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface SocialSettings {
  instagramKey: string;
  facebookKey: string;
  linkedinKey: string;
  youtubeKey: string;
  xKey: string;
}

interface PlatformConfig {
  key: keyof SocialSettings;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  docsUrl: string;
  description: string;
}

const platforms: PlatformConfig[] = [
  {
    key: 'instagramKey',
    label: 'Instagram',
    placeholder: 'Instagram Client Secret / Access Token',
    icon: <InstagramSVG />,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/20',
    borderColor: 'border-pink-200 dark:border-pink-800/40',
    docsUrl: 'https://developers.facebook.com/docs/instagram-api',
    description: 'Instagram Graph API / Basic Display API token for cross-posting content.',
  },
  {
    key: 'facebookKey',
    label: 'Facebook',
    placeholder: 'Facebook Graph API Token',
    icon: <FacebookSVG />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800/40',
    docsUrl: 'https://developers.facebook.com/docs/graph-api',
    description: 'Facebook Graph API page access token for auto-posting study content.',
  },
  {
    key: 'linkedinKey',
    label: 'LinkedIn',
    placeholder: 'LinkedIn OAuth Access Token',
    icon: <LinkedInSVG />,
    color: 'text-sky-700',
    bgColor: 'bg-sky-50 dark:bg-sky-950/20',
    borderColor: 'border-sky-200 dark:border-sky-800/40',
    docsUrl: 'https://developer.linkedin.com/docs/guide/v2',
    description: 'LinkedIn OAuth 2.0 token to share notes and posts to your organization page.',
  },
  {
    key: 'youtubeKey',
    label: 'YouTube',
    placeholder: 'YouTube Data API v3 Key',
    icon: <YouTubeSVG />,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800/40',
    docsUrl: 'https://developers.google.com/youtube/v3/getting-started',
    description: 'YouTube Data API v3 key for embedding channel content and search results.',
  },
  {
    key: 'xKey',
    label: 'X (Twitter)',
    placeholder: 'X Bearer Token / API v2 Secret',
    icon: <XSVG />,
    color: 'text-slate-800 dark:text-slate-100',
    bgColor: 'bg-slate-100 dark:bg-slate-800/30',
    borderColor: 'border-slate-200 dark:border-slate-700/40',
    docsUrl: 'https://developer.twitter.com/en/docs',
    description: 'X (formerly Twitter) Developer API v2 Bearer Token for tweet sharing.',
  },
];

export const SocialIntegration: React.FC = () => {
  const [settings, setSettings] = useState<SocialSettings>({
    instagramKey: '',
    facebookKey: '',
    linkedinKey: '',
    youtubeKey: '',
    xKey: '',
  });

  const [loadingFetch, setLoadingFetch] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const fetchSettings = async () => {
    setLoadingFetch(true);
    try {
      const res = await apiClient.get('/admin/social');
      if (res.status === 'success') {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load social settings:', err);
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: keyof SocialSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaveStatus('idle');
  };

  const toggleVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await apiClient.put('/admin/social', settings);
      if (res.status === 'success') {
        setSaveStatus('success');
        setSaveMessage(res.message || 'Social integration settings saved successfully.');
      }
    } catch (err: any) {
      setSaveStatus('error');
      setSaveMessage(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2.5">
              <Share2 className="w-6 h-6 text-indigo-300" />
              Social Media Integration
            </h2>
            <p className="text-xs text-indigo-200">
              Connect your platform to external social networks for cross-posting and engagement.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loadingFetch}
            title="Refresh settings"
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingFetch ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Save Status Banner */}
      {saveStatus !== 'idle' && (
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-semibold ${
          saveStatus === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40'
        }`}>
          {saveStatus === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <XCircle className="w-4 h-4 flex-shrink-0" />
          }
          {saveMessage}
        </div>
      )}

      {/* Form */}
      {loadingFetch ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          {platforms.map((platform) => {
            const isVisible = showKeys[platform.key] ?? false;
            const value = settings[platform.key];
            const hasValue = value.trim().length > 0;

            return (
              <div
                key={platform.key}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  {/* Platform Identity */}
                  <div className="flex items-center gap-4 md:w-56 flex-shrink-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${platform.bgColor} border ${platform.borderColor}`}>
                      <span className={platform.color}>{platform.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm font-heading">{platform.label}</p>
                      <a
                        href={platform.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-indigo-500 hover:underline font-semibold"
                      >
                        View API Docs →
                      </a>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="flex-1 space-y-1.5">
                    <p className="text-[11px] text-slate-500 leading-relaxed">{platform.description}</p>
                    <div className="relative">
                      <input
                        type={isVisible ? 'text' : 'password'}
                        value={value}
                        onChange={(e) => handleChange(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono placeholder:font-sans placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility(platform.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition"
                        title={isVisible ? 'Hide key' : 'Show key'}
                      >
                        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Connection Status Pill */}
                  <div className="md:flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      hasValue
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${hasValue ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {hasValue ? 'Connected' : 'Not Set'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 text-white font-semibold py-2.5 px-7 rounded-xl text-sm transition cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Integration Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
