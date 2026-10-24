import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    // Generate secure random name
    const randomHex = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomHex}${ext}`);
  },
});

const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // Prevent double extensions like file.php.jpg
    const baseName = path.basename(file.originalname, ext);
    if (baseName.includes('.')) {
      return cb(new Error('Tên tệp tin không hợp lệ (không cho phép tệp có nhiều phần mở rộng).'));
    }

    if (!allowedMimes.includes(file.mimetype) || !allowedExtensions.includes(ext)) {
      return cb(new Error('Chỉ chấp nhận các tệp ảnh định dạng JPG, PNG, WEBP, GIF, SVG.'));
    }

    cb(null, true);
  },
});
