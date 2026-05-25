import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectedAnomaly } from '../../domain/entity/detected-anomaly.entity';
import { MonthlyReport } from '../../domain/entity/monthly-report.entity';
import { WeeklyReport } from '../../domain/entity/weekly-report.entity';
import { ReportsController } from './reports.controller';
import {
  GetMonthlyReportDetailUseCase,
  GetMonthlyReportsUseCase,
  GetWeeklyReportDetailUseCase,
  GetWeeklyReportsUseCase,
} from './use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([WeeklyReport, MonthlyReport, DetectedAnomaly]),
  ],
  controllers: [ReportsController],
  providers: [
    GetWeeklyReportsUseCase,
    GetWeeklyReportDetailUseCase,
    GetMonthlyReportsUseCase,
    GetMonthlyReportDetailUseCase,
  ],
})
export class ReportsModule {}
