import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  ValidateIf,
} from 'class-validator';

export class UpdateCollectionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase letters, numbers, and hyphens',
  })
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsUrl()
  @IsOptional()
  imageUrl?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
