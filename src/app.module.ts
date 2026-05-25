import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './infrastructure/config/app/app.config';
import { AuthModule } from './auth/auth.module';
import { UserAuthModule } from './features/user-auth/user-auth.module';
import { UsersModule } from './features/users/users.module';
import { TransactionsModule } from './features/transactions/transactions.module';
import { ReportsModule } from './features/reports/reports.module';
import { SchedulerModule } from './features/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'finsight_db'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    AuthModule,
    UserAuthModule,
    UsersModule,
    TransactionsModule,
    ReportsModule,
    SchedulerModule,
  ],
})
export class AppModule {}
