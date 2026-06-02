import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  contactPerson?: string | null;

  @IsEmail()
  @IsOptional()
  email?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  phone?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
