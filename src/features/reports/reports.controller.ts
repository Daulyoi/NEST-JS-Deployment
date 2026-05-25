import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RequireAuth } from '../../auth/decorators/auth.decorator';
import { DataResponse } from '../../infrastructure/core/http/http-response';
import {
  GetMonthlyReportDetailUseCase,
  GetMonthlyReportsUseCase,
  GetWeeklyReportDetailUseCase,
  GetWeeklyReportsUseCase,
} from './use-cases';

@ApiTags('Reports')
@ApiBearerAuth()
@RequireAuth()
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly getWeeklyUseCase: GetWeeklyReportsUseCase,
    private readonly getWeeklyDetailUseCase: GetWeeklyReportDetailUseCase,
    private readonly getMonthlyUseCase: GetMonthlyReportsUseCase,
    private readonly getMonthlyDetailUseCase: GetMonthlyReportDetailUseCase,
  ) {}

  @Get('weekly/:customerId')
  @ApiOperation({ summary: 'List laporan mingguan customer' })
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

  @Get('weekly/:customerId/:reportId')
  @ApiOperation({ summary: 'Detail laporan mingguan beserta anomali' })
  async getWeeklyDetail(
    @Param('customerId') customerId: string,
    @Param('reportId') reportId: string,
  ) {
    const data = await this.getWeeklyDetailUseCase.execute(
      customerId,
      reportId,
    );
    return new DataResponse(
      HttpStatus.OK,
      'Detail laporan mingguan berhasil diambil',
      data,
    );
  }

  @Get('monthly/:customerId')
  @ApiOperation({ summary: 'List laporan bulanan customer' })
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

  @Get('monthly/:customerId/:reportId')
  @ApiOperation({ summary: 'Detail laporan bulanan' })
  async getMonthlyDetail(
    @Param('customerId') customerId: string,
    @Param('reportId') reportId: string,
  ) {
    const data = await this.getMonthlyDetailUseCase.execute(
      customerId,
      reportId,
    );
    return new DataResponse(
      HttpStatus.OK,
      'Detail laporan bulanan berhasil diambil',
      data,
    );
  }
}
