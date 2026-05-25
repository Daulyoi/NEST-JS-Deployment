import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyReport } from '../../../../domain/entity/monthly-report.entity';

@Injectable()
export class GetMonthlyReportsUseCase {
  constructor(
    @InjectRepository(MonthlyReport)
    private readonly reportRepository: Repository<MonthlyReport>,
  ) {}

  async execute(customerId: string, limit = 12): Promise<MonthlyReport[]> {
    return this.reportRepository.find({
      where: { customerId },
      order: { targetMonth: 'DESC' },
      take: limit,
    });
  }
}
