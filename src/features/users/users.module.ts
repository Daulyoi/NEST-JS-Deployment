import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../../domain/entity/customer.entity';
import { UsersController } from './users.controller';
import {
  GetAllUsersUseCase,
  GetOneUserUseCase,
  UpdateUserUseCase,
} from './use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [UsersController],
  providers: [GetAllUsersUseCase, GetOneUserUseCase, UpdateUserUseCase],
})
export class UsersModule {}
