import {
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { IsHexColor } from './hex-color.validator';

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
  @IsUUID()
  @IsOptional()
  pairLeftCollectionId?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsUUID()
  @IsOptional()
  pairRightCollectionId?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsUUID()
  @IsOptional()
  heroCollectionId?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsUrl()
  @IsOptional()
  heroImageUrl?: string | null;

  @IsString()
  @MaxLength(24)
  @IsOptional()
  heroWordmark?: string | null;

  @IsString()
  @MaxLength(40)
  @IsOptional()
  heroEyebrow?: string | null;

  @IsString()
  @MaxLength(60)
  @IsOptional()
  heroHeading?: string | null;

  @IsString()
  @MaxLength(160)
  @IsOptional()
  heroTagline?: string | null;

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

  @ValidateIf((_, value) => value != null && value !== '')
  @IsHexColor()
  @IsOptional()
  heroBackgroundColor?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsHexColor()
  @IsOptional()
  heroTextColor?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsHexColor()
  @IsOptional()
  heroCtaBackgroundColor?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsHexColor()
  @IsOptional()
  heroCtaTextColor?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsHexColor()
  @IsOptional()
  bannerCtaBackgroundColor?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsHexColor()
  @IsOptional()
  bannerCtaTextColor?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsHexColor()
  @IsOptional()
  mosaicBackgroundColor?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsHexColor()
  @IsOptional()
  mosaicTextColor?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsHexColor()
  @IsOptional()
  mosaicCtaBackgroundColor?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsHexColor()
  @IsOptional()
  mosaicCtaTextColor?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsHexColor()
  @IsOptional()
  pairGradientStartColor?: string | null;

  @ValidateIf((_, value) => value != null && value !== '')
  @IsHexColor()
  @IsOptional()
  pairGradientEndColor?: string | null;
}
