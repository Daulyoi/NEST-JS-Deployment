import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  username!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password!: string;

  @ApiPropertyOptional({ example: '1995-06-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'Sari' })
  @IsOptional()
  @IsString()
  mothersMaidenName?: string;

  @ApiPropertyOptional({ example: 'Urban Middle' })
  @IsOptional()
  @IsString()
  demographicSegment?: string;

  @ApiPropertyOptional({ example: 5000000 })
  @IsOptional()
  @IsNumber()
  monthlyIncome?: number;

  @ApiPropertyOptional({ example: 1000000 })
  @IsOptional()
  @IsNumber()
  savingsGoal?: number;

  @ApiPropertyOptional({ example: '123456', description: 'PIN 6 digit angka' })
  @IsOptional()
  @IsString()
  @Length(6, 6, { message: 'MPIN harus tepat 6 karakter' })
  @Matches(/^\d{6}$/, { message: 'MPIN harus berupa 6 digit angka' })
  mpin?: string;
}
