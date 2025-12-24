import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { RefreshToken } from './auth/entities/auth.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

const isDevelopment = process.env.NODE_ENV !== 'production';

function shouldUseSsl(hostOrUrl: string, dbSsl: boolean): boolean {
  const isRenderHost = hostOrUrl.includes('render.com');
  const isSupabaseHost = hostOrUrl.includes('supabase.co');
  return isRenderHost || isSupabaseHost || dbSsl || process.env.NODE_ENV === 'production';
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const dbHost = configService.get<string>('DB_HOST');
        const dbPort = configService.get<number>('DB_PORT') || 5432;
        const dbUsername = configService.get<string>('DB_USERNAME');
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const dbDatabase = configService.get<string>('DB_DATABASE');
        const dbSsl = configService.get<string>('DB_SSL') === 'true';

        // DATABASE_URL 방식 사용
        if (databaseUrl) {
          if (databaseUrl.includes('.internal.')) {
            throw new Error(
              'Internal Database URL cannot be used from local environment. Use External URL instead.',
            );
          }

          const requiresSsl = shouldUseSsl(databaseUrl, dbSsl);

          if (isDevelopment && requiresSsl) {
            console.log('✅ SSL 연결 활성화');
          }

          return {
            type: 'postgres',
            url: databaseUrl,
            schema: 'instagram',
            entities: [User, RefreshToken],
            synchronize: false,
            logging: isDevelopment ? ['error', 'warn'] : ['error'],
            ssl: requiresSsl ? { rejectUnauthorized: false } : false,
            retryAttempts: 1,
            retryDelay: 2000,
            extra: {
              max: 10,
              connectionTimeoutMillis: 10000,
              idleTimeoutMillis: 30000,
            },
            connectTimeoutMS: 10000,
          };
        }

        // 개별 필드 방식 사용
        if (!dbHost || !dbUsername || !dbPassword || !dbDatabase) {
          throw new Error(
            'Database configuration is missing required environment variables. Use DATABASE_URL or provide DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE',
          );
        }

        if (dbHost.includes('.internal.')) {
          throw new Error(
            'Internal Database URL cannot be used from local environment. Use External URL instead.',
          );
        }

        const requiresSsl = shouldUseSsl(dbHost, dbSsl);

        if (isDevelopment) {
          console.log(`📊 데이터베이스 연결: ${dbHost}:${dbPort}`);
        }

        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbDatabase,
          schema: 'instagram',
          entities: [User, RefreshToken],
          synchronize: false,
          logging: isDevelopment ? ['error', 'warn'] : ['error'],
          ssl: requiresSsl ? { rejectUnauthorized: false } : false,
          retryAttempts: 1,
          retryDelay: 2000,
          extra: {
            max: 10,
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 30000,
          },
          connectTimeoutMS: 10000,
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // JwtAuthGuard를 global provider로 등록 (순환 의존성 방지)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
