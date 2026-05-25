import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../../../domain/entity/customer.entity';
import { ProfileResponse, UserMapper } from '../../../../libs/mapper/user-mapper';
import { UpdateUserDto } from './update.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<ProfileResponse> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer tidak ditemukan');
    Object.assign(customer, {
      ...dto,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : customer.dateOfBirth,
    });
    const updated = await this.customerRepository.save(customer);
    return UserMapper.toProfileResponse(updated);
  }
}
