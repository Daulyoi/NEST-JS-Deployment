import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TransactionTypeEnum } from '../enums/transaction-type.enum';
import { MainCategoryEnum } from '../enums/main-category.enum';
import { Customer } from './customer.entity';
import { Account } from './account.entity';

@Entity('transactions')
@Index('idx_transactions_customer_timestamp', [
  'customerId',
  'transactionTimestamp',
])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'account_id', type: 'uuid', nullable: true })
  accountId?: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: false })
  customerId!: string;

  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionTypeEnum,
    nullable: false,
  })
  transactionType!: TransactionTypeEnum;

  @Column({
    name: 'main_category',
    type: 'enum',
    enum: MainCategoryEnum,
    nullable: true,
  })
  mainCategory?: MainCategoryEnum;

  @Column({
    name: 'sub_category',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  subCategory!: string;

  @Column({ type: 'bigint', nullable: false })
  amount!: number;

  @Column({
    name: 'running_balance',
    type: 'bigint',
    default: 0,
    nullable: false,
  })
  runningBalance: number = 0;

  @Column({ type: 'varchar', length: 200, default: '', nullable: false })
  description: string = '';

  @Column({ type: 'varchar', length: 500, default: '', nullable: false })
  notes: string = '';

  @Column({
    name: 'transaction_timestamp',
    type: 'timestamptz',
    nullable: false,
  })
  transactionTimestamp!: Date;

  @Column({ name: 'day_of_week', type: 'integer', default: 0, nullable: false })
  dayOfWeek: number = 0;

  @Column({
    name: 'day_of_month',
    type: 'integer',
    default: 0,
    nullable: false,
  })
  dayOfMonth: number = 0;

  @Column({ type: 'integer', default: 0, nullable: false })
  hour: number = 0;

  @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'account_id' })
  account?: Account;

  @ManyToOne(() => Customer, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;
}
