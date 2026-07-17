import multer from 'multer';

// Use memory storage for Cloudinary streaming uploads
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // max 50MB file size (videos can be large)
  }
});
