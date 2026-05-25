import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeeklyReport } from '../../../../domain/entity/weekly-report.entity';

@Injectable()
export class GetWeeklyReportsUseCase {
  constructor(
    @InjectRepository(WeeklyReport)
    private readonly reportRepository: Repository<WeeklyReport>,
  ) {}

  async execute(customerId: string, limit = 10): Promise<WeeklyReport[]> {
    return this.reportRepository.find({
      where: { customerId },
      order: { reportDate: 'DESC' },
      take: limit,
    });
  }
}
