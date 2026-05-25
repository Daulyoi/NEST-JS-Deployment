import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RequireAuth } from '../../auth/decorators/auth.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { DataResponse } from '../../infrastructure/core/http/http-response';
import {
  CreateTransactionUseCase,
  GetTransactionsByUserUseCase,
} from './use-cases';
import { CreateTransactionDto } from './use-cases/create/create.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@RequireAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createUseCase: CreateTransactionUseCase,
    private readonly getByUserUseCase: GetTransactionsByUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tambah transaksi baru' })
  async create(@Body() dto: CreateTransactionDto) {
    const data = await this.createUseCase.execute(dto);
    return new DataResponse(HttpStatus.CREATED, 'Transaksi berhasil ditambahkan', data);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Ambil transaksi berdasarkan customer ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getByCustomer(
    @Param('customerId') customerId: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.getByUserUseCase.execute(customerId, limit ?? 50);
    return new DataResponse(HttpStatus.OK, 'Transaksi berhasil diambil', data);
  }
}
