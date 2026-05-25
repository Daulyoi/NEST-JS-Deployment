import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Customer } from '../../domain/entity/customer.entity';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  private get fastapiUrl(): string {
    return this.config.get<string>('app.fastapi.url') ?? '';
  }

  private get internalKey(): string {
    return this.config.get<string>('app.fastapi.internalKey') ?? '';
  }

  private get schedulerHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Internal-Key': this.internalKey,
    };
  }

  // Every Sunday night 23:59 WIB (UTC+7 → UTC 16:59 Sunday)
  @Cron('59 16 * * 0')
  async triggerWeeklyReport(): Promise<void> {
    this.logger.log('Triggering weekly scheduler...');
    try {
      const response = await firstValueFrom(
        this.httpService.post<{ job_id: string }>(
          `${this.fastapiUrl}/scheduler/weekly`,
          { customer_ids: [], dry_run: false },
          { headers: this.schedulerHeaders, timeout: 10_000 },
        ),
      );
      this.logger.log(`Weekly job queued: ${response.data.job_id}`);
    } catch (err: unknown) {
      this.logger.error(`Weekly trigger failed: ${(err as Error).message}`);
    }
  }

  // Last day of month 23:59 WIB (UTC+7 → UTC 16:59 last day)
  @Cron('59 16 L * *')
  async triggerMonthlyReport(): Promise<void> {
    this.logger.log('Triggering monthly scheduler...');
    try {
      const response = await firstValueFrom(
        this.httpService.post<{ job_id: string }>(
          `${this.fastapiUrl}/scheduler/monthly`,
          { customer_ids: [], dry_run: false },
          { headers: this.schedulerHeaders, timeout: 10_000 },
        ),
      );
      this.logger.log(`Monthly job queued: ${response.data.job_id}`);
    } catch (err: unknown) {
      this.logger.error(`Monthly trigger failed: ${(err as Error).message}`);
    }
  }

  // Reset wants/needs ratio on 1st of month 00:00 WIB
  // (UTC 17:00 on last day = WIB 00:00 next day = tanggal 1)
  @Cron('0 17 L * *')
  async resetMonthlyRatios(): Promise<void> {
    this.logger.log('Resetting monthly ratios to 0...');
    try {
      await this.customerRepository
        .createQueryBuilder()
        .update(Customer)
        .set({ currentWantsRatio: 0, currentNeedsRatio: 0 })
        .execute();
      this.logger.log('Monthly ratios reset successfully.');
    } catch (err: unknown) {
      this.logger.error(`Reset failed: ${(err as Error).message}`);
    }
  }
}
