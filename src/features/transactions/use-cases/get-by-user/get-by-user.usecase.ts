import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../../domain/entity/transaction.entity';

@Injectable()
export class GetTransactionsByUserUseCase {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(customerId: string, limit = 50): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { customerId },
      order: { transactionTimestamp: 'DESC' },
      take: limit,
    });
  }
}
