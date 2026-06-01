import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class ReorderProductImagesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  imageIds!: string[];
}
