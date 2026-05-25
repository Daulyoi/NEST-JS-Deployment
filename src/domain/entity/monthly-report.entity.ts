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
import { PersonaEnum } from '../enums/persona.enum';
import { Customer } from './customer.entity';

@Entity('monthly_reports')
@Unique('uq_monthly_customer_month', ['customerId', 'targetMonth'])
@Index('idx_monthly_reports_customer_month', ['customerId', 'targetMonth'])
export class MonthlyReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: false })
  customerId!: string;

  @Column({ name: 'target_month', type: 'char', length: 7, nullable: false })
  targetMonth!: string;

  @Column({ name: 'persona', type: 'enum', enum: PersonaEnum, nullable: false })
  persona!: PersonaEnum;

  @Column({ name: 'prev_persona', type: 'enum', enum: PersonaEnum, nullable: true })
  prevPersona?: PersonaEnum;

  @Column({ name: 'savings_rate', type: 'numeric', precision: 6, scale: 4, nullable: false })
  savingsRate!: number;

  @Column({ name: 'wants_ratio', type: 'numeric', precision: 5, scale: 4, nullable: false })
  wantsRatio!: number;

  @Column({ name: 'needs_ratio', type: 'numeric', precision: 5, scale: 4, nullable: false })
  needsRatio!: number;

  @Column({ name: 'wants_amount', type: 'bigint', nullable: false })
  wantsAmount!: number;

  @Column({ name: 'needs_amount', type: 'bigint', nullable: false })
  needsAmount!: number;

  @Column({ name: 'savings_amount', type: 'bigint', nullable: false })
  savingsAmount!: number;

  @Column({ name: 'behavioral_features', type: 'jsonb', nullable: true })
  behavioralFeatures!: Record<string, unknown>;

  @Column({ name: 'report_text', type: 'text', nullable: false })
  reportText!: string;

  @CreateDateColumn({ name: 'generated_at' })
  generatedAt!: Date;

  @ManyToOne(() => Customer, (customer) => customer.monthlyReports, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;
}
