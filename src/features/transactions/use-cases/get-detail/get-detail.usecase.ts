import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../../domain/entity/transaction.entity';

@Injectable()
export class GetTransactionDetailUseCase {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });
    
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    
    return transaction;
  }
}
