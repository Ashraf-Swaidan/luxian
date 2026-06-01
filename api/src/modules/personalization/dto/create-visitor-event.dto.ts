import { VisitorEventType } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateVisitorEventDto {
  @IsString()
  @MaxLength(64)
  visitorId!: string;

  @IsEnum(VisitorEventType)
  eventType!: VisitorEventType;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  collectionId?: string;

  @ValidateIf((o: CreateVisitorEventDto) => o.eventType === VisitorEventType.SEARCH)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
