import { IsOptional, IsString } from 'class-validator';

export class UpdateProductImageDto {
  @IsString()
  @IsOptional()
  altText?: string | null;
}
