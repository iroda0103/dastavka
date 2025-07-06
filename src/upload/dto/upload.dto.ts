import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadFileDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean = false;
}
