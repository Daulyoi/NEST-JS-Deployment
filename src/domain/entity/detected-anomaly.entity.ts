import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Transaction } from './transaction.entity';
import { WeeklyReport } from './weekly-report.entity';

@Entity('detected_anomalies')
@Index('idx_anomalies_customer', ['customerId', 'detectedAt'])
export class DetectedAnomaly {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'transaction_id', type: 'uuid', nullable: false })
  transactionId!: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: false })
  customerId!: string;

  @Column({ name: 'weekly_report_id', type: 'uuid', nullable: false })
  weeklyReportId!: string;

  @Column({
    name: 'sub_category',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  subCategory!: string;

  @Column({ type: 'bigint', nullable: false })
  amount!: number;

  @Column({ type: 'double precision', nullable: false })
  mae!: number;

  @Column({ name: 'threshold_val', type: 'double precision', nullable: false })
  thresholdVal!: number;

  @Column({ type: 'double precision', nullable: false })
  ratio!: number;

  @Column({ name: 'anomaly_context', type: 'text', nullable: true })
  anomalyContext?: string;

  @CreateDateColumn({ name: 'detected_at' })
  detectedAt!: Date;

  @OneToOne(() => Transaction, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'transaction_id' })
  transaction!: Transaction;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @ManyToOne(() => WeeklyReport, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'weekly_report_id' })
  weeklyReport!: WeeklyReport;
}
