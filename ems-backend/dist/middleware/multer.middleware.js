"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfilePictureMiddleware = exports.uploadEventImagesMiddleware = exports.uploadPayslipMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const s3_1 = __importDefault(require("../config/s3"));
// Ensure upload directory exists
const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'payslips');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Storage configuration
const storage = multer_1.default.diskStorage({
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
const fileFilter = (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    }
    else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};
exports.uploadPayslipMiddleware = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
const eventImageFileFilter = (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed'), false);
    }
};
// Event Images S3 Configuration
exports.uploadEventImagesMiddleware = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3_1.default,
        bucket: process.env.AWS_S3_BUCKET_NAME || '',
        acl: 'public-read',
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: (_req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `events/event-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
        },
    }),
    fileFilter: eventImageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per image
    },
});
// Profile Picture S3 Configuration
exports.uploadProfilePictureMiddleware = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3_1.default,
        bucket: process.env.AWS_S3_BUCKET_NAME || '',
        acl: 'public-read',
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            // Use userId in the filename to help enforce "one photo" and organize better
            const userId = req.user?.id || 'unknown';
            const uniqueSuffix = Date.now();
            cb(null, `profiles/user-${userId}-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
        },
    }),
    fileFilter: eventImageFileFilter, // Reuse image filter
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
    },
});
//# sourceMappingURL=multer.middleware.js.map