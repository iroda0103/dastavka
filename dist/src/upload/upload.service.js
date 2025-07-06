"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_service_1 = require("../database/database.service");
const schema_1 = require("../database/schema");
const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");
const drizzle_orm_1 = require("drizzle-orm");
let UploadService = UploadService_1 = class UploadService {
    constructor(databaseService, configService) {
        this.databaseService = databaseService;
        this.configService = configService;
        this.logger = new common_1.Logger(UploadService_1.name);
        this.uploadsPath = this.configService.get('UPLOADS_PATH', './uploads');
        this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 10485760);
        this.allowedMimeTypes = this.configService
            .get('ALLOWED_MIME_TYPES', 'image/jpeg,image/png,image/gif,application/pdf,text/plain')
            .split(',');
        this.logger.log('Upload service initialized');
        this.logger.debug(`Uploads path: ${this.uploadsPath}`);
        this.logger.debug(`Max file size: ${this.maxFileSize} bytes`);
        this.logger.debug(`Allowed MIME types: ${this.allowedMimeTypes.join(', ')}`);
        this.ensureUploadDirectory();
    }
    async ensureUploadDirectory() {
        try {
            await fs.access(this.uploadsPath);
            this.logger.debug(`Upload directory exists: ${this.uploadsPath}`);
        }
        catch {
            this.logger.log(`Creating upload directory: ${this.uploadsPath}`);
            await fs.mkdir(this.uploadsPath, { recursive: true });
        }
    }
    generateUniqueFilename(originalName) {
        const timestamp = Date.now();
        const randomBytes = crypto.randomBytes(8).toString('hex');
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension);
        return `${baseName}_${timestamp}_${randomBytes}${extension}`;
    }
    validateFile(file) {
        if (!file) {
            this.logger.warn('File validation failed: No file provided');
            throw new common_1.BadRequestException('No file provided');
        }
        if (file.size > this.maxFileSize) {
            this.logger.warn(`File validation failed: File size (${file.size} bytes) exceeds limit of ${this.maxFileSize} bytes`);
            throw new common_1.BadRequestException(`File size exceeds limit of ${this.maxFileSize} bytes`);
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            this.logger.warn(`File validation failed: File type ${file.mimetype} is not allowed`);
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed`);
        }
        this.logger.debug(`File validation passed for ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
    }
    async uploadFile(file, uploadedBy) {
        this.logger.log(`Starting file upload: ${file.originalname}${uploadedBy ? ` by user ${uploadedBy}` : ''}`);
        this.validateFile(file);
        const filename = this.generateUniqueFilename(file.originalname);
        const filePath = path.join(this.uploadsPath, filename);
        const fileUrl = `/uploads/${filename}`;
        this.logger.debug(`Generated unique filename: ${filename}`);
        try {
            this.logger.debug(`Writing file to disk: ${filePath}`);
            await fs.writeFile(filePath, file.buffer);
            const fileData = {
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
                .insert(schema_1.files)
                .values(fileData)
                .returning();
            this.logger.log(`File uploaded successfully: ${filename} (ID: ${savedFile.id})`);
            return savedFile;
        }
        catch (error) {
            this.logger.error(`File upload failed: ${error.message}`, error.stack);
            try {
                this.logger.debug(`Cleaning up file from disk: ${filePath}`);
                await fs.unlink(filePath);
            }
            catch (unlinkError) {
                this.logger.warn(`Failed to clean up file: ${unlinkError.message}`);
            }
            throw new common_1.BadRequestException('Failed to upload file');
        }
    }
    async uploadMultipleFiles(fileList, uploadedBy) {
        this.logger.log(`Starting bulk upload of ${fileList.length} files${uploadedBy ? ` by user ${uploadedBy}` : ''}`);
        const uploadPromises = fileList.map((file) => this.uploadFile(file, uploadedBy));
        try {
            const results = await Promise.all(uploadPromises);
            this.logger.log(`Successfully uploaded ${results.length} files`);
            return results;
        }
        catch (error) {
            this.logger.error(`Bulk upload failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getFileById(id) {
        this.logger.debug(`Retrieving file with ID: ${id}`);
        const [file] = await this.databaseService.db
            .select()
            .from(schema_1.files)
            .where((0, drizzle_orm_1.eq)(schema_1.files.id, id));
        if (file) {
            this.logger.debug(`Found file: ${file.filename}`);
        }
        else {
            this.logger.debug(`No file found with ID: ${id}`);
        }
        return file || null;
    }
    async getFileByFilename(filename) {
        this.logger.debug(`Retrieving file with filename: ${filename}`);
        const [file] = await this.databaseService.db
            .select()
            .from(schema_1.files)
            .where((0, drizzle_orm_1.eq)(schema_1.files.filename, filename));
        if (file) {
            this.logger.debug(`Found file with ID: ${file.id}`);
        }
        else {
            this.logger.debug(`No file found with filename: ${filename}`);
        }
        return file || null;
    }
    async getUserFiles(userId) {
        this.logger.debug(`Retrieving files for user: ${userId}`);
        const userFiles = await this.databaseService.db
            .select()
            .from(schema_1.files)
            .where((0, drizzle_orm_1.eq)(schema_1.files.uploadedBy, userId));
        this.logger.debug(`Found ${userFiles.length} files for user ${userId}`);
        return userFiles;
    }
    async deleteFile(id) {
        this.logger.log(`Attempting to delete file with ID: ${id}`);
        const file = await this.getFileById(id);
        if (!file) {
            this.logger.warn(`Delete failed: File with ID ${id} not found`);
            throw new common_1.NotFoundException('File not found');
        }
        try {
            this.logger.debug(`Deleting file from disk: ${file.path}`);
            await fs.unlink(file.path);
        }
        catch (error) {
            this.logger.warn(`Failed to delete file from disk: ${file.path}`, error.stack);
        }
        this.logger.debug(`Deleting file record from database: ${id}`);
        const result = await this.databaseService.db
            .delete(schema_1.files)
            .where((0, drizzle_orm_1.eq)(schema_1.files.id, id));
        const success = result.rowCount > 0;
        if (success) {
            this.logger.log(`Successfully deleted file: ${file.filename} (ID: ${id})`);
        }
        else {
            this.logger.warn(`Database delete operation returned no affected rows for file ID: ${id}`);
        }
        return success;
    }
    async getFileBuffer(filename) {
        this.logger.debug(`Getting file buffer for: ${filename}`);
        const file = await this.getFileByFilename(filename);
        if (!file) {
            this.logger.warn(`File not found in database: ${filename}`);
            throw new common_1.NotFoundException('File not found');
        }
        try {
            this.logger.debug(`Reading file from disk: ${file.path}`);
            const buffer = await fs.readFile(file.path);
            this.logger.debug(`Successfully read file: ${filename} (${buffer.length} bytes)`);
            return buffer;
        }
        catch (error) {
            this.logger.error(`Failed to read file from disk: ${file.path}`, error.stack);
            throw new common_1.NotFoundException(`File not found on disk error with: ${error}`);
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map