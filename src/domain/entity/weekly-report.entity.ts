import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Customer } from './customer.entity';

@Entity('weekly_reports')
@Unique('uq_weekly_customer_date', ['customerId', 'reportDate'])
@Index('idx_weekly_reports_customer_date', ['customerId', 'reportDate'])
export class WeeklyReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: false })
  customerId!: string;

  @Column({ name: 'report_date', type: 'date', nullable: false })
  reportDate!: Date;

  @Column({ name: 'period_start', type: 'date', nullable: false })
  periodStart!: Date;

  @Column({ name: 'persona', type: 'varchar', length: 50, nullable: false })
  persona!: string;

  @Column({
    name: 'wants_ratio',
    type: 'numeric',
    precision: 5,
    scale: 4,
    nullable: false,
  })
  wantsRatio!: number;

  @Column({
    name: 'needs_ratio',
    type: 'numeric',
    precision: 5,
    scale: 4,
    nullable: false,
  })
  needsRatio!: number;

  @Column({ name: 'total_expenses', type: 'bigint', nullable: false })
  totalExpenses!: number;

  @Column({
    name: 'anomaly_count',
    type: 'integer',
    default: 0,
    nullable: false,
  })
  anomalyCount: number = 0;

  @Column({ name: 'report_text', type: 'text', nullable: false })
  reportText!: string;

  @CreateDateColumn({ name: 'generated_at' })
  generatedAt!: Date;

  @ManyToOne(() => Customer, (customer) => customer.weeklyReports, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;
}
