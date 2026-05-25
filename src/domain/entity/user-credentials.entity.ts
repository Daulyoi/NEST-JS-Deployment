import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { CredentialStatusEnum } from '../enums/credential-status.enum';
import { Customer } from './customer.entity';

@Entity('user_credentials')
export class UserCredentials {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @Column({ name: 'username', type: 'varchar', length: 20, unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'varchar', select: false })
  password!: string;

  @Column({ type: 'char', length: 6, nullable: true, select: false })
  mpin?: string;

  @Column({ name: 'active_token', type: 'text', nullable: true, select: false })
  activeToken?: string;

  @Column({
    type: 'enum',
    enum: CredentialStatusEnum,
    default: CredentialStatusEnum.ACTIVE,
  })
  status!: CredentialStatusEnum;

  @OneToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;
}
