import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionTypeEnum } from '../../../../domain/enums/transaction-type.enum';

export class CreateTransactionDto {
  @ApiProperty({ example: 'uuid-of-customer' })
  @IsUUID()
  customerId!: string;

  @ApiPropertyOptional({ example: 'uuid-of-account' })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiProperty({
    enum: TransactionTypeEnum,
    example: TransactionTypeEnum.DEBIT,
  })
  @IsEnum(TransactionTypeEnum)
  transactionType!: TransactionTypeEnum;

  @ApiProperty({ example: 'Makan & Minum' })
  @IsString()
  @IsNotEmpty()
  subCategory!: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ example: 5000000 })
  @IsOptional()
  @IsNumber()
  runningBalance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '2026-05-01T10:00:00Z' })
  @IsDateString()
  transactionTimestamp!: string;
}
