import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { Customer } from '../../domain/entity/customer.entity';
import { UserCredentials } from '../../domain/entity/user-credentials.entity';
import { UserAuthController } from './user-auth.controller';
import {
  GetProfileUseCase,
  LoginUseCase,
  LogoutUseCase,
  RegisterUseCase,
} from './use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, UserCredentials]), AuthModule],
  controllers: [UserAuthController],
  providers: [RegisterUseCase, LoginUseCase, GetProfileUseCase, LogoutUseCase],
})
export class UserAuthModule {}
