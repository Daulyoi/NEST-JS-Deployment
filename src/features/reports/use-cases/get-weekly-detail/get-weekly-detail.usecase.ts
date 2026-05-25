import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetectedAnomaly } from '../../../../domain/entity/detected-anomaly.entity';
import { WeeklyReport } from '../../../../domain/entity/weekly-report.entity';

export interface WeeklyReportDetail {
  report: WeeklyReport;
  anomalies: DetectedAnomaly[];
}

@Injectable()
export class GetWeeklyReportDetailUseCase {
  constructor(
    @InjectRepository(WeeklyReport)
    private readonly reportRepository: Repository<WeeklyReport>,
    @InjectRepository(DetectedAnomaly)
    private readonly anomalyRepository: Repository<DetectedAnomaly>,
  ) {}

  async execute(customerId: string, reportId: string): Promise<WeeklyReportDetail> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId, customerId },
    });
    if (!report) throw new NotFoundException('Laporan mingguan tidak ditemukan');

    const anomalies = await this.anomalyRepository.find({
      where: { weeklyReportId: reportId },
      order: { detectedAt: 'DESC' },
    });

    return { report, anomalies };
  }
}
