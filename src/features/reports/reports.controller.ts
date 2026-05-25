import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RequireAuth } from '../../auth/decorators/auth.decorator';
import { DataResponse } from '../../infrastructure/core/http/http-response';
import { GetMonthlyReportsUseCase, GetWeeklyReportsUseCase } from './use-cases';

@ApiTags('Reports')
@ApiBearerAuth()
@RequireAuth()
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly getWeeklyUseCase: GetWeeklyReportsUseCase,
    private readonly getMonthlyUseCase: GetMonthlyReportsUseCase,
  ) {}

  @Get('weekly/:customerId')
  @ApiOperation({ summary: 'Ambil laporan mingguan customer' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getWeekly(
    @Param('customerId') customerId: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.getWeeklyUseCase.execute(customerId, limit ?? 10);
    return new DataResponse(
      HttpStatus.OK,
      'Laporan mingguan berhasil diambil',
      data,
    );
  }

  @Get('monthly/:customerId')
  @ApiOperation({ summary: 'Ambil laporan bulanan customer' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMonthly(
    @Param('customerId') customerId: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.getMonthlyUseCase.execute(customerId, limit ?? 12);
    return new DataResponse(
      HttpStatus.OK,
      'Laporan bulanan berhasil diambil',
      data,
    );
  }
}
