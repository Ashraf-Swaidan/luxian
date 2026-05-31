import { IsString, IsOptional } from 'class-validator';

export class CheckoutDto {
  @IsOptional()
  @IsString()
  shippingAddress?: string;
}
