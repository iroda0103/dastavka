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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const upload_service_1 = require("./upload.service");
const auth_guard_1 = require("../modules/auth/auth.guard");
let UploadController = class UploadController {
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    async uploadSingle(file, req) {
        const uploadedFile = await this.uploadService.uploadFile(file, req['user'].id);
        return {
            message: 'File uploaded successfully',
            file: uploadedFile,
        };
    }
    async uploadMultiple(files, req) {
        const uploadedFiles = await this.uploadService.uploadMultipleFiles(files, req['user'].id);
        return {
            message: 'Files uploaded successfully',
            files: uploadedFiles,
        };
    }
    async getFile(filename, res) {
        const file = await this.uploadService.getFileByFilename(filename);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        const buffer = await this.uploadService.getFileBuffer(filename);
        res.set({
            'Content-Type': file.mimetype,
            'Content-Length': file.size.toString(),
            'Content-Disposition': `inline; filename="${file.originalName}"`,
        });
        res.send(buffer);
    }
    async getUserFiles(userId) {
        const files = await this.uploadService.getUserFiles(userId);
        return { files };
    }
    async getFileDetails(id) {
        const file = await this.uploadService.getFileById(id);
        if (!file) {
            return { message: 'File not found' };
        }
        return { file };
    }
    async deleteFile(id) {
        const deleted = await this.uploadService.deleteFile(id);
        return {
            message: deleted ? 'File deleted successfully' : 'File not found',
        };
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('single'),
    (0, common_1.UseGuards)(auth_guard_1.IsLoggedIn, new auth_guard_1.HasRole(['admin', 'restaurant'])),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Request]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadSingle", null);
__decorate([
    (0, common_1.Post)('multiple'),
    (0, common_1.UseGuards)(auth_guard_1.IsLoggedIn, new auth_guard_1.HasRole(['admin', 'restaurant'])),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Request]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadMultiple", null);
__decorate([
    (0, common_1.Get)('file/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getFile", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getUserFiles", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getFileDetails", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "deleteFile", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [upload_service_1.UploadService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map