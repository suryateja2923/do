"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageUtils = void 0;
const exceptions_1 = require("./exceptions");
const constants_1 = require("../constants");
const path_1 = __importDefault(require("path"));
class StorageUtils {
    /**
     * Validates file size, extension, and mime-type based on bucket category
     */
    static validateUpload(file, category) {
        const isImage = category === 'image';
        const maxSize = isImage
            ? constants_1.FILE_UPLOAD_LIMITS.IMAGE_MAX_SIZE
            : constants_1.FILE_UPLOAD_LIMITS.DOCUMENT_MAX_SIZE;
        const allowedMimes = isImage
            ? constants_1.FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_MIMES
            : constants_1.FILE_UPLOAD_LIMITS.ALLOWED_DOCUMENT_MIMES;
        // 1. Check size limits
        if (file.size > maxSize) {
            const mbSize = maxSize / (1024 * 1024);
            throw new exceptions_1.BadRequestException(`File size exceeds configured limit of ${mbSize}MB`);
        }
        // 2. Validate MIME type
        if (!allowedMimes.includes(file.mimetype)) {
            throw new exceptions_1.BadRequestException(`Invalid file type. Allowed formats: ${isImage ? 'JPEG, PNG, WEBP' : 'PDF, DOCX'}`);
        }
        // 3. Double-check extension
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const allowedExts = isImage
            ? ['.jpg', '.jpeg', '.png', '.webp']
            : ['.pdf', '.doc', '.docx'];
        if (!allowedExts.includes(ext)) {
            throw new exceptions_1.BadRequestException(`Unsupported file extension: ${ext}`);
        }
    }
    /**
     * Generates a unique, sanitized file name for storage bucket
     */
    static generateUniqueName(originalname) {
        const ext = path_1.default.extname(originalname).toLowerCase();
        const sanitizedBase = path_1.default
            .basename(originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '_') // sanitize
            .toLowerCase();
        const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        return `${sanitizedBase}_${uniqueSuffix}${ext}`;
    }
    /**
     * Resolves target bucket storage path structures
     */
    static resolveBucketPath(category, entityId, filename) {
        return `${category}/${entityId}/${filename}`;
    }
}
exports.StorageUtils = StorageUtils;
exports.default = StorageUtils;
