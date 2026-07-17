const fs = require('fs');
const path = require('path');

function replaceUnsplash(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceUnsplash(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const before = content;
      content = content.replace(/'https:\/\/images\.unsplash\.com\/[^']*'/g, "(typeof action !== 'undefined' && action.payload && action.payload.user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(action.payload.user.name || action.payload.user.username || 'User')}&background=6366f1&color=fff` : `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=6366f1&color=fff`)");
      
      // actually, a safer generic replacement for slices since they might have dummy data:
      content = before.replace(/'https:\/\/images\.unsplash\.com\/[^']*'/g, "`https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`");

      if (before !== content) {
        fs.writeFileSync(fullPath, content);
        console.log("Updated", fullPath);
      }
    }
  }
}

replaceUnsplash(path.join(__dirname, 'src'));
