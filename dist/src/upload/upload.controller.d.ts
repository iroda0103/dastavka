import { Response } from 'express';
import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadSingle(file: Express.Multer.File, req: Request): Promise<{
        message: string;
        file: {
            url: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
            path: string;
            uploadedBy: number;
        };
    }>;
    uploadMultiple(files: Express.Multer.File[], req: Request): Promise<{
        message: string;
        files: {
            url: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
            path: string;
            uploadedBy: number;
        }[];
    }>;
    getFile(filename: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserFiles(userId: number): Promise<{
        files: {
            url: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
            path: string;
            uploadedBy: number;
        }[];
    }>;
    getFileDetails(id: number): Promise<{
        message: string;
        file?: undefined;
    } | {
        file: {
            url: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
            path: string;
            uploadedBy: number;
        };
        message?: undefined;
    }>;
    deleteFile(id: number): Promise<{
        message: string;
    }>;
}
