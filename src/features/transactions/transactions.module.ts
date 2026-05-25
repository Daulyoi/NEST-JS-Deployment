import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { Account } from '../../domain/entity/account.entity';
import { Transaction } from '../../domain/entity/transaction.entity';
import { TransactionsController } from './transactions.controller';
import {
  CreateTransactionUseCase,
  GetTransactionsByUserUseCase,
} from './use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Account]), AuthModule],
  controllers: [TransactionsController],
  providers: [CreateTransactionUseCase, GetTransactionsByUserUseCase],
})
export class TransactionsModule {}
