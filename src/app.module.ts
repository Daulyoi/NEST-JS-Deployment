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
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const dbSslVal = config.get<string>('DB_SSL');
        let dbSsl = false;

        if (dbSslVal !== undefined) {
          dbSsl = dbSslVal === 'true';
        } else {
          const isProduction = config.get<string>('NODE_ENV') === 'production';
          const isLocalhost =
            (databaseUrl && (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1'))) ||
            (!databaseUrl &&
              (config.get<string>('DB_HOST', 'localhost') === 'localhost' ||
                config.get<string>('DB_HOST') === '127.0.0.1'));
          dbSsl = isProduction && !isLocalhost;
        }

        const sslConfig = dbSsl ? { rejectUnauthorized: false } : undefined;

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: false,
            ssl: sslConfig,
          };
        }

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: Number(config.get<string>('DB_PORT', '5432')),
          username: config.get<string>('DB_USERNAME', 'postgres'),
          password: config.get<string>('DB_PASSWORD', 'postgres'),
          database: config.get<string>('DB_DATABASE', 'finsight_db'),
          autoLoadEntities: true,
          synchronize: false,
          ssl: sslConfig,
        };
      },
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
