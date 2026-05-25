import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeeklyReport } from '../../../../domain/entity/weekly-report.entity';

@Injectable()
export class GetWeeklyReportDetailUseCase {
  constructor(
    @InjectRepository(WeeklyReport)
    private readonly reportRepository: Repository<WeeklyReport>,
  ) {}

  async execute(customerId: string, reportId: string): Promise<WeeklyReport> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId, customerId },
      relations: ['anomalies'],
    });
    if (!report) throw new NotFoundException('Laporan mingguan tidak ditemukan');
    return report;
  }
}
