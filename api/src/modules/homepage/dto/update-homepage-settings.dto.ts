import {
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateHomepageSettingsDto {
  @ValidateIf((_, value) => value != null && value !== '')
  @IsUUID()
  @IsOptional()
  latestCollectionId?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsUUID()
  @IsOptional()
  trendingCollectionId?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsUUID()
  @IsOptional()
  bannerCollectionId?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsUrl()
  @IsOptional()
  bannerImageUrl?: string | null;

  @IsString()
  @MaxLength(40)
  @IsOptional()
  bannerButtonText?: string;
}
