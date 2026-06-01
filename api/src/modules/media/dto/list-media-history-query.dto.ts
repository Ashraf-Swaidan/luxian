import { MediaOwnerType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListMediaHistoryQueryDto {
  @IsEnum(MediaOwnerType)
  ownerType!: MediaOwnerType;

  @IsString()
  ownerId!: string;

  @IsString()
  @IsOptional()
  slot?: string;
}
