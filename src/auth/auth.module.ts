import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCredentials } from '../domain/entity/user-credentials.entity';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserCredentials]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('app.jwt.secret'),
        signOptions: {
          expiresIn: config.get<string>('app.jwt.expiresIn') as StringValue,
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    AuthGuard,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
