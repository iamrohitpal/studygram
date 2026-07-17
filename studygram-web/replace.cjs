const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/Profile.tsx',
  'src/pages/Search.tsx',
  'src/pages/Saved.tsx',
  'src/pages/Home.tsx',
  'src/pages/Reels.tsx',
  'src/layouts/MainLayout.tsx',
  'src/layouts/AuthLayout.tsx',
  'src/components/PostCard.tsx'
];

files.forEach(f => {
  const fullPath = path.join(__dirname, f);
  if(!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace all unsplash avatar links with the UI Avatars link
  content = content.replace(/'https:\/\/images\.unsplash\.com\/photo-1535713875002-d1d0cf377fde\?w=150'/g, "`https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=6366f1&color=fff`");
  
  // also replace AuthLayout
  content = content.replace(/"https:\/\/images\.unsplash\.com\/photo-1507003211169-0a1dd7228f2d\?w=80"/g, "`https://ui-avatars.com/api/?name=${encodeURIComponent('StudyGram')}&background=6366f1&color=fff`");

  fs.writeFileSync(fullPath, content);
});

console.log("Replaced avatars successfully");
