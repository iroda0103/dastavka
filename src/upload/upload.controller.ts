import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { UploadFileDto } from './dto/upload.dto';
import { HasRole, IsLoggedIn } from '../modules/auth/auth.guard';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Uncomment if using auth
// import { GetUser } from '../auth/get-user.decorator'; // Uncomment if using auth

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @UseGuards(IsLoggedIn, new HasRole(['admin', 'restaurant'])) // Uncomment if using auth
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request, // Uncomment if using auth
  ) {
    const uploadedFile = await this.uploadService.uploadFile(
      file,
      req['user'].id, // Uncomment if using auth
      // undefined, // Remove this line if using auth
    );

    return {
      message: 'File uploaded successfully',
      file: uploadedFile,
    };
  }

  @Post('multiple')
  @UseGuards(IsLoggedIn, new HasRole(['admin', 'restaurant'])) // Uncomment if using auth
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request, // Uncomment if using auth
  ) {
    const uploadedFiles = await this.uploadService.uploadMultipleFiles(
      files,
      req['user'].id, // Uncomment if using auth
      // undefined, // Remove this line if using auth
    );

    return {
      message: 'Files uploaded successfully',
      files: uploadedFiles,
    };
  }

  @Get('file/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
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

  @Get('user/:userId')
  async getUserFiles(@Param('userId', ParseIntPipe) userId: number) {
    const files = await this.uploadService.getUserFiles(userId);
    return { files };
  }

  @Get(':id')
  async getFileDetails(@Param('id', ParseIntPipe) id: number) {
    const file = await this.uploadService.getFileById(id);
    if (!file) {
      return { message: 'File not found' };
    }
    return { file };
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard) // Uncomment if using auth
  async deleteFile(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.uploadService.deleteFile(id);
    return {
      message: deleted ? 'File deleted successfully' : 'File not found',
    };
  }
}
