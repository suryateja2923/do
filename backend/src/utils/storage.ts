import { BadRequestException } from './exceptions';
import { FILE_UPLOAD_LIMITS } from '../constants';
import path from 'path';

export interface FileUploadPayload {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export class StorageUtils {
  /**
   * Validates file size, extension, and mime-type based on bucket category
   */
  public static validateUpload(
    file: FileUploadPayload,
    category: 'image' | 'document'
  ): void {
    const isImage = category === 'image';
    const maxSize = isImage
      ? FILE_UPLOAD_LIMITS.IMAGE_MAX_SIZE
      : FILE_UPLOAD_LIMITS.DOCUMENT_MAX_SIZE;
    const allowedMimes = isImage
      ? FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_MIMES
      : FILE_UPLOAD_LIMITS.ALLOWED_DOCUMENT_MIMES;

    // 1. Check size limits
    if (file.size > maxSize) {
      const mbSize = maxSize / (1024 * 1024);
      throw new BadRequestException(`File size exceeds configured limit of ${mbSize}MB`);
    }

    // 2. Validate MIME type
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed formats: ${isImage ? 'JPEG, PNG, WEBP' : 'PDF, DOCX'}`
      );
    }

    // 3. Double-check extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = isImage
      ? ['.jpg', '.jpeg', '.png', '.webp']
      : ['.pdf', '.doc', '.docx'];

    if (!allowedExts.includes(ext)) {
      throw new BadRequestException(`Unsupported file extension: ${ext}`);
    }
  }

  /**
   * Generates a unique, sanitized file name for storage bucket
   */
  public static generateUniqueName(originalname: string): string {
    const ext = path.extname(originalname).toLowerCase();
    const sanitizedBase = path
      .basename(originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_') // sanitize
      .toLowerCase();
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    return `${sanitizedBase}_${uniqueSuffix}${ext}`;
  }

  /**
   * Resolves target bucket storage path structures
   */
  public static resolveBucketPath(
    category: 'property-images' | 'profile-images' | 'owner-documents' | 'tenant-documents' | 'complaints' | 'receipts',
    entityId: string,
    filename: string
  ): string {
    return `${category}/${entityId}/${filename}`;
  }
}

export default StorageUtils;
