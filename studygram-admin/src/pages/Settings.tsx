import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { updatePlatformSettings } from '../features/moderationSlice';
import { Settings as SettingsIcon, Globe, Image, Shield, Save } from 'lucide-react';
import { TextField, Switch } from '@mui/material';

export const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const { platform } = useSelector((state: RootState) => state.moderation);

  const [siteName, setSiteName] = useState(platform.siteName);
  const [contactEmail, setContactEmail] = useState(platform.contactEmail);
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState(platform.cloudinaryCloudName);
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState(platform.cloudinaryApiKey);
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState(platform.cloudinaryApiSecret);
  const [security2FA, setSecurity2FA] = useState(platform.security2FA);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updatePlatformSettings({
      siteName,
      contactEmail,
      cloudinaryCloudName,
      cloudinaryApiKey,
      cloudinaryApiSecret,
      security2FA
    }));
    alert('System platform settings successfully updated.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm font-heading flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-500" />
            Platform & Cloud Settings
          </h3>
          <p className="text-xs text-slate-500 mt-1">Configure global application variables, assets storage, and system safety toggles.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Platform Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="font-bold text-xs font-heading flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              General Platform Settings
            </h4>
            <TextField
              label="Application Name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              size="small"
              fullWidth
              required
            />
            <TextField
              label="Contact / Support Email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              size="small"
              fullWidth
              required
            />
          </div>

          {/* Cloudinary Configuration */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="font-bold text-xs font-heading flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-2">
              <Image className="w-4 h-4 text-indigo-500" />
              Cloudinary Media Settings
            </h4>
            <TextField
              label="Cloud Name"
              value={cloudinaryCloudName}
              onChange={(e) => setCloudinaryCloudName(e.target.value)}
              size="small"
              fullWidth
              required
            />
            <TextField
              label="API Key"
              value={cloudinaryApiKey}
              onChange={(e) => setCloudinaryApiKey(e.target.value)}
              size="small"
              fullWidth
              required
            />
            <TextField
              label="API Secret"
              type="password"
              value={cloudinaryApiSecret}
              onChange={(e) => setCloudinaryApiSecret(e.target.value)}
              size="small"
              fullWidth
              required
            />
          </div>

          {/* Security & 2FA */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="font-bold text-xs font-heading flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              Console Security
            </h4>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
              <div>
                <span className="block text-xs font-semibold">Enforce 2FA</span>
                <span className="text-[10px] text-slate-400">Require MFA for moderator logins.</span>
              </div>
              <Switch checked={security2FA} onChange={(e) => setSecurity2FA(e.target.checked)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800/40">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl text-xs transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Platform Config
          </button>
        </div>
      </form>
    </div>
  );
};
