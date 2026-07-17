import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const isMock = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'mock_key';

function saveLocalMock(fileBuffer: Buffer, folder: string, ext = 'bin'): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    try {
      const dir = path.join(process.cwd(), 'uploads', folder);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
      const filepath = path.join(dir, filename);
      fs.writeFileSync(filepath, fileBuffer);

      // Return mock response resembling Cloudinary response
      const port = process.env.PORT || 7000;
      const url = `http://localhost:${port}/uploads/${folder}/${filename}`;
      resolve({
        secure_url: url,
        public_id: filename,
        format: ext,
        resource_type: 'raw',
        bytes: fileBuffer.length
      } as any);
    } catch (err) {
      reject(err);
    }
  });
}

export class CloudinaryUploader {
  static async uploadImage(fileBuffer: Buffer): Promise<UploadApiResponse> {
    if (isMock) {
      return saveLocalMock(fileBuffer, 'images', 'jpg');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'studygram/images',
          resource_type: 'image',
          transformation: [
            { width: 1080, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  static async uploadVideo(fileBuffer: Buffer): Promise<UploadApiResponse> {
    if (isMock) {
      return saveLocalMock(fileBuffer, 'videos', 'mp4');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'studygram/videos',
          resource_type: 'video',
          chunk_size: 6000000 // 6MB chunking
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  static async uploadRaw(fileBuffer: Buffer, filename: string): Promise<UploadApiResponse> {
    if (isMock) {
      const ext = path.extname(filename).substring(1) || 'pdf';
      return saveLocalMock(fileBuffer, 'notes', ext);
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'studygram/notes',
          resource_type: 'raw',
          public_id: filename
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        }
      );
      uploadStream.end(fileBuffer);
    });
  }
}
