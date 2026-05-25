import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../../domain/entity/transaction.entity';
import { CreateTransactionDto } from './create.dto';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    const ts = new Date(dto.transactionTimestamp);
    const transaction = this.transactionRepository.create({
      customerId: dto.customerId,
      accountId: dto.accountId,
      transactionType: dto.transactionType,
      subCategory: dto.subCategory,
      amount: dto.amount,
      runningBalance: dto.runningBalance ?? 0,
      description: dto.description ?? '',
      notes: dto.notes ?? '',
      transactionTimestamp: ts,
      dayOfWeek: ts.getDay(),
      dayOfMonth: ts.getDate(),
      hour: ts.getHours(),
    });
    return this.transactionRepository.save(transaction);
  }
}
