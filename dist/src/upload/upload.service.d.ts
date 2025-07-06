import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { File } from '../database/schema';
export declare class UploadService {
    private readonly databaseService;
    private readonly configService;
    private readonly logger;
    private readonly uploadsPath;
    private readonly maxFileSize;
    private readonly allowedMimeTypes;
    constructor(databaseService: DatabaseService, configService: ConfigService);
    private ensureUploadDirectory;
    private generateUniqueFilename;
    private validateFile;
    uploadFile(file: Express.Multer.File, uploadedBy?: number): Promise<File>;
    uploadMultipleFiles(fileList: Express.Multer.File[], uploadedBy?: number): Promise<File[]>;
    getFileById(id: number): Promise<File | null>;
    getFileByFilename(filename: string): Promise<File | null>;
    getUserFiles(userId: number): Promise<File[]>;
    deleteFile(id: number): Promise<boolean>;
    getFileBuffer(filename: string): Promise<Buffer>;
}
