import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectedAnomaly } from '../../domain/entity/detected-anomaly.entity';
import { MonthlyReport } from '../../domain/entity/monthly-report.entity';
import { WeeklyReport } from '../../domain/entity/weekly-report.entity';
import { ReportsController } from './reports.controller';
import { GetMonthlyReportsUseCase, GetWeeklyReportsUseCase } from './use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([WeeklyReport, MonthlyReport, DetectedAnomaly]),
  ],
  controllers: [ReportsController],
  providers: [GetWeeklyReportsUseCase, GetMonthlyReportsUseCase],
})
export class ReportsModule {}
