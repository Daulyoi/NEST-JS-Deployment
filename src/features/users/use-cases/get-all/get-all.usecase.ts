import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../../../domain/entity/customer.entity';
import {
  ProfileResponse,
  UserMapper,
} from '../../../../libs/mapper/user-mapper';

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async execute(): Promise<ProfileResponse[]> {
    const customers = await this.customerRepository.find();
    return customers.map(UserMapper.toProfileResponse);
  }
}
