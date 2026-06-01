import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProductImageDto {
  @IsUrl()
  url!: string;

  @IsString()
  @IsOptional()
  altText?: string;
}
