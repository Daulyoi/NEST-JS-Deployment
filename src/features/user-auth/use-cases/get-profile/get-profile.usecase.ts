import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../../../domain/entity/customer.entity';
import {
  ProfileResponse,
  UserMapper,
} from '../../../../libs/mapper/user-mapper';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async execute(customerId: string): Promise<ProfileResponse> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (!customer) throw new NotFoundException('Customer tidak ditemukan');
    return UserMapper.toProfileResponse(customer);
  }
}
