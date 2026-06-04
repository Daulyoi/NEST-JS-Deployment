import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../domain/entity/account.entity';
import { Transaction } from '../../domain/entity/transaction.entity';
import { TransactionsController } from './transactions.controller';
import {
  CreateTransactionUseCase,
  GetTransactionsByUserUseCase,
  GetTransactionDetailUseCase,
} from './use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Account])],
  controllers: [TransactionsController],
  providers: [CreateTransactionUseCase, GetTransactionsByUserUseCase, GetTransactionDetailUseCase],
})
export class TransactionsModule {}
