import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../../domain/entity/customer.entity';
import { UsersController } from './users.controller';
import { UpdateUserUseCase } from './use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [UsersController],
  providers: [UpdateUserUseCase],
})
export class UsersModule {}
