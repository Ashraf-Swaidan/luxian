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

  @ValidateIf((_, value) => value != null && value !== '')
  @IsUrl()
  @IsOptional()
  brandImage1Url?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsUrl()
  @IsOptional()
  brandImage2Url?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsUrl()
  @IsOptional()
  brandImage3Url?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsUrl()
  @IsOptional()
  brandImage4Url?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsUrl()
  @IsOptional()
  brandImage5Url?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsUrl()
  @IsOptional()
  brandImage6Url?: string | null;
}
