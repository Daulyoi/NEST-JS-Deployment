import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Account } from './account.entity';
import { Transaction } from './transaction.entity';
import { UserCredentials } from './user-credentials.entity';
import { MonthlyReport } from './monthly-report.entity';
import { WeeklyReport } from './weekly-report.entity';
import { DetectedAnomaly } from './detected-anomaly.entity';

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ name: 'mothers_maiden_name', type: 'varchar', nullable: true })
  mothersMaidenName?: string;

  @Column({ name: 'demographic_segment', type: 'varchar', nullable: true })
  demographicSegment?: string;

  @Column({
    name: 'monthly_income',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    nullable: true,
  })
  monthlyIncome: number = 0;

  @Column({
    name: 'savings_goal',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    nullable: true,
  })
  savingsGoal: number = 0;

  @Column({ name: 'base_persona', type: 'varchar', nullable: true })
  basePersona?: string;

  @Column({ name: 'is_dynamic', type: 'boolean', default: false })
  isDynamic: boolean = false;

  @Column({
    name: 'current_wants_ratio',
    type: 'numeric',
    precision: 5,
    scale: 4,
    default: 0,
    nullable: true,
  })
  currentWantsRatio: number = 0;

  @Column({
    name: 'current_needs_ratio',
    type: 'numeric',
    precision: 5,
    scale: 4,
    default: 0,
    nullable: true,
  })
  currentNeedsRatio: number = 0;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Account, (account) => account.customer)
  accounts!: Account[];

  @OneToMany(() => Transaction, (transaction) => transaction.customer)
  transactions!: Transaction[];

  @OneToMany(() => MonthlyReport, (monthlyReport) => monthlyReport.customer)
  monthlyReports!: MonthlyReport[];

  @OneToMany(() => WeeklyReport, (weeklyReport) => weeklyReport.customer)
  weeklyReports!: WeeklyReport[];

  @OneToMany(() => DetectedAnomaly, (anomaly) => anomaly.customer)
  detectedAnomalies!: DetectedAnomaly[];

  @OneToOne(() => UserCredentials, (credentials) => credentials.customer, {
    cascade: true,
  })
  userCredentials!: UserCredentials;
}
