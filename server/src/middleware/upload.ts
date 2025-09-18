import multer from 'multer';
import { join, extname } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { env } from '../env';

const uploadDir = env.UPLOAD_DIR;

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const allowedMimes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm'
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'general';

    if (file.fieldname === 'playerPhoto') subfolder = 'players';
    else if (file.fieldname === 'eventPhoto') subfolder = 'events';
    else if (file.fieldname === 'blogImage') subfolder = 'blog';
    else if (file.fieldname === 'sponsorLogo') subfolder = 'sponsors';
    else if (file.fieldname === 'leadershipPhoto') subfolder = 'leadership';
    else if (file.fieldname === 'highlight') subfolder = 'highlights';

    const fullPath = join(uploadDir, subfolder);

    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }

    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedMimes.join(', ')}`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024
  }
});

export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount = 10) => upload.array(fieldName, maxCount);