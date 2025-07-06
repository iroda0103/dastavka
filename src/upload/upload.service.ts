import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { files, File, NewFile } from '../database/schema';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import { eq } from 'drizzle-orm';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadsPath: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {
    this.uploadsPath = this.configService.get('UPLOADS_PATH', './uploads');
    this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 10485760); // 10MB
    this.allowedMimeTypes = this.configService
      .get(
        'ALLOWED_MIME_TYPES',
        'image/jpeg,image/png,image/gif,application/pdf,text/plain',
      )
      .split(',');

    this.logger.log('Upload service initialized');
    this.logger.debug(`Uploads path: ${this.uploadsPath}`);
    this.logger.debug(`Max file size: ${this.maxFileSize} bytes`);
    this.logger.debug(
      `Allowed MIME types: ${this.allowedMimeTypes.join(', ')}`,
    );

    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadsPath);
      this.logger.debug(`Upload directory exists: ${this.uploadsPath}`);
    } catch {
      this.logger.log(`Creating upload directory: ${this.uploadsPath}`);
      await fs.mkdir(this.uploadsPath, { recursive: true });
    }
  }

  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    return `${baseName}_${timestamp}_${randomBytes}${extension}`;
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      this.logger.warn('File validation failed: No file provided');
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      this.logger.warn(
        `File validation failed: File size (${file.size} bytes) exceeds limit of ${this.maxFileSize} bytes`,
      );
      throw new BadRequestException(
        `File size exceeds limit of ${this.maxFileSize} bytes`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(
        `File validation failed: File type ${file.mimetype} is not allowed`,
      );
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed`,
      );
    }

    this.logger.debug(
      `File validation passed for ${file.originalname} (${file.size} bytes, ${file.mimetype})`,
    );
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadedBy?: number,
  ): Promise<File> {
    this.logger.log(
      `Starting file upload: ${file.originalname}${uploadedBy ? ` by user ${uploadedBy}` : ''}`,
    );
    this.validateFile(file);

    const filename = this.generateUniqueFilename(file.originalname);
    const filePath = path.join(this.uploadsPath, filename);
    const fileUrl = `/uploads/${filename}`;

    this.logger.debug(`Generated unique filename: ${filename}`);

    try {
      // Save file to disk
      this.logger.debug(`Writing file to disk: ${filePath}`);
      await fs.writeFile(filePath, file.buffer);

      // Save file record to database
      const fileData: Omit<NewFile, 'id' | 'createdAt' | 'updatedAt'> = {
        originalName: file.originalname,
        filename,
        mimetype: file.mimetype,
        size: file.size,
        path: filePath,
        url: fileUrl,
        uploadedBy,
      };

      this.logger.debug('Saving file record to database');
      const [savedFile] = await this.databaseService.db
        .insert(files)
        .values(fileData)
        .returning();

      this.logger.log(
        `File uploaded successfully: ${filename} (ID: ${savedFile.id})`,
      );
      return savedFile;
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`, error.stack);

      // Clean up file if database save fails
      try {
        this.logger.debug(`Cleaning up file from disk: ${filePath}`);
        await fs.unlink(filePath);
      } catch (unlinkError) {
        this.logger.warn(`Failed to clean up file: ${unlinkError.message}`);
      }

      throw new BadRequestException('Failed to upload file');
    }
  }

  async uploadMultipleFiles(
    fileList: Express.Multer.File[],
    uploadedBy?: number,
  ): Promise<File[]> {
    this.logger.log(
      `Starting bulk upload of ${fileList.length} files${uploadedBy ? ` by user ${uploadedBy}` : ''}`,
    );

    const uploadPromises = fileList.map((file) =>
      this.uploadFile(file, uploadedBy),
    );

    try {
      const results = await Promise.all(uploadPromises);
      this.logger.log(`Successfully uploaded ${results.length} files`);
      return results;
    } catch (error) {
      this.logger.error(`Bulk upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getFileById(id: number): Promise<File | null> {
    this.logger.debug(`Retrieving file with ID: ${id}`);

    const [file] = await this.databaseService.db
      .select()
      .from(files)
      .where(eq(files.id, id));

    if (file) {
      this.logger.debug(`Found file: ${file.filename}`);
    } else {
      this.logger.debug(`No file found with ID: ${id}`);
    }

    return file || null;
  }

  async getFileByFilename(filename: string): Promise<File | null> {
    this.logger.debug(`Retrieving file with filename: ${filename}`);

    const [file] = await this.databaseService.db
      .select()
      .from(files)
      .where(eq(files.filename, filename));

    if (file) {
      this.logger.debug(`Found file with ID: ${file.id}`);
    } else {
      this.logger.debug(`No file found with filename: ${filename}`);
    }

    return file || null;
  }

  async getUserFiles(userId: number): Promise<File[]> {
    this.logger.debug(`Retrieving files for user: ${userId}`);

    const userFiles = await this.databaseService.db
      .select()
      .from(files)
      .where(eq(files.uploadedBy, userId));

    this.logger.debug(`Found ${userFiles.length} files for user ${userId}`);
    return userFiles;
  }

  async deleteFile(id: number): Promise<boolean> {
    this.logger.log(`Attempting to delete file with ID: ${id}`);

    const file = await this.getFileById(id);
    if (!file) {
      this.logger.warn(`Delete failed: File with ID ${id} not found`);
      throw new NotFoundException('File not found');
    }

    try {
      // Delete file from disk
      this.logger.debug(`Deleting file from disk: ${file.path}`);
      await fs.unlink(file.path);
    } catch (error) {
      this.logger.warn(
        `Failed to delete file from disk: ${file.path}`,
        error.stack,
      );
    }

    // Delete record from database
    this.logger.debug(`Deleting file record from database: ${id}`);
    const result = await this.databaseService.db
      .delete(files)
      .where(eq(files.id, id));

    const success = result.rowCount > 0;
    if (success) {
      this.logger.log(
        `Successfully deleted file: ${file.filename} (ID: ${id})`,
      );
    } else {
      this.logger.warn(
        `Database delete operation returned no affected rows for file ID: ${id}`,
      );
    }

    return success;
  }

  async getFileBuffer(filename: string): Promise<Buffer> {
    this.logger.debug(`Getting file buffer for: ${filename}`);

    const file = await this.getFileByFilename(filename);
    if (!file) {
      this.logger.warn(`File not found in database: ${filename}`);
      throw new NotFoundException('File not found');
    }

    try {
      this.logger.debug(`Reading file from disk: ${file.path}`);
      const buffer = await fs.readFile(file.path);
      this.logger.debug(
        `Successfully read file: ${filename} (${buffer.length} bytes)`,
      );
      return buffer;
    } catch (error) {
      this.logger.error(
        `Failed to read file from disk: ${file.path}`,
        error.stack,
      );
      throw new NotFoundException(
        `File not found on disk error with: ${error}`,
      );
    }
  }
}
