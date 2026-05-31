import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AddCollectionProductDto {
  @IsUUID()
  productId: string;
}

export class AddCollectionProductsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  productIds: string[];
}

export class ReorderCollectionProductsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  productIds: string[];
}
