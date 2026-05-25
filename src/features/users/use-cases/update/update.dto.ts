import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '1995-06-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mothersMaidenName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  demographicSegment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monthlyIncome?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  savingsGoal?: number;
}
