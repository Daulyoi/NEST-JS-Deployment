import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyReport } from '../../../../domain/entity/monthly-report.entity';

@Injectable()
export class GetMonthlyReportDetailUseCase {
  constructor(
    @InjectRepository(MonthlyReport)
    private readonly reportRepository: Repository<MonthlyReport>,
  ) {}

  async execute(customerId: string, reportId: string): Promise<MonthlyReport> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId, customerId },
    });
    if (!report) throw new NotFoundException('Laporan bulanan tidak ditemukan');
    return report;
  }
}
