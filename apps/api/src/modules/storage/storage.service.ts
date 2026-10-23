import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly s3Client: S3Client | null;
  private readonly useS3: boolean;
  private readonly s3Bucket: string;
  private readonly s3Region: string;

  // File upload security configuration
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  private readonly DANGEROUS_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.sh', '.bash',
    '.ps1', '.vbs', '.js', '.jar', '.app', '.deb',
    '.rpm', '.dmg', '.pkg', '.msi', '.scr'
  ];

  constructor(private configService: ConfigService) {
    // Determine storage mode (S3 or local)
    this.useS3 = this.configService.get<string>('STORAGE_TYPE') === 's3';
    this.s3Bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';
    this.s3Region = this.configService.get<string>('AWS_REGION') || 'us-east-1';

    if (this.useS3) {
      // Initialize S3 client
      this.s3Client = new S3Client({
        region: this.s3Region,
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
        },
      });
      this.logger.log(`Storage configured for S3: ${this.s3Bucket}`);
    } else {
      this.s3Client = null;
      this.ensureUploadDir();
      this.logger.log('Storage configured for local filesystem');
    }
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Upload directory ready: ${this.uploadDir}`);
    } catch (error) {
      this.logger.error(`Failed to create upload directory`, error);
    }
  }

  async uploadFile(fileName: string, buffer: Buffer, contentType?: string): Promise<string> {
    // SECURITY: Validate file size
    if (buffer.length > this.MAX_FILE_SIZE) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // SECURITY: Validate MIME type
    if (contentType && !this.ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new BadRequestException(`File type '${contentType}' is not allowed. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`);
    }

    // SECURITY: Validate file extension
    const fileExt = path.extname(fileName).toLowerCase();
    if (this.DANGEROUS_EXTENSIONS.includes(fileExt)) {
      throw new BadRequestException(`File extension '${fileExt}' is not allowed for security reasons`);
    }

    // SECURITY: Sanitize filename (remove dangerous characters)
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    if (this.useS3) {
      return this.uploadToS3(sanitizedFileName, buffer, contentType);
    } else {
      return this.uploadLocally(sanitizedFileName, buffer);
    }
  }

  private async uploadToS3(fileName: string, buffer: Buffer, contentType?: string): Promise<string> {
    try {
      const key = `uploads/${fileName}`;
      
      const upload = new Upload({
        client: this.s3Client!,
        params: {
          Bucket: this.s3Bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType || 'application/octet-stream',
          // SECURITY FIX: Changed from 'public-read' to 'private'
          // Use presigned URLs for access instead of public ACL
          ACL: 'private',
        },
      });

      await upload.done();
      
      // Return the public S3 URL
      const url = `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/${key}`;
      this.logger.log(`File uploaded to S3: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${fileName}`, error);
      throw error;
    }
  }

  private async uploadLocally(fileName: string, buffer: Buffer): Promise<string> {
    const filePath = path.join(this.uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    
    // Return the public URL path
    return `/uploads/${fileName}`;
  }
}
