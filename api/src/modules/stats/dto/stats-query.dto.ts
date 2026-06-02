import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class StatsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @IsIn(['balanced', 'units', 'revenue', 'profit', 'orders', 'spent'])
  rankBy?: 'balanced' | 'units' | 'revenue' | 'profit' | 'orders' | 'spent';
}

export class SalesStatsQueryDto extends StatsQueryDto {
  @IsOptional()
  @IsIn(['daily', 'monthly', 'yearly'])
  granularity?: 'daily' | 'monthly' | 'yearly' = 'daily';
}
