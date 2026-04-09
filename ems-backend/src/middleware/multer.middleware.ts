import multer from 'multer';
import path from 'path';
import fs from 'fs';
import multerS3 from 'multer-s3';
import s3Client from '../config/s3';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'payslips');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, _file, cb) => {
    // We'll rename the file later in the service to include userId, month, year
    // For now, give it a temporary unique name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `temp-${uniqueSuffix}.pdf`);
  },
});

// File filter - only PDFs
const fileFilter = (_req: any, file: any, cb: any) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

export const uploadPayslipMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const eventImageFileFilter = (_req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed'), false);
  }
};

// Event Images S3 Configuration
export const uploadEventImagesMiddleware = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME || '',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `events/event-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: eventImageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per image
  },
});

// Profile Picture S3 Configuration
export const uploadProfilePictureMiddleware = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME || '',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req: any, file: any, cb: any) => {
      // Use userId in the filename to help enforce "one photo" and organize better
      const userId = req.user?.id || 'unknown';
      const uniqueSuffix = Date.now();
      cb(null, `profiles/user-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: eventImageFileFilter, // Reuse image filter
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
  },
});
