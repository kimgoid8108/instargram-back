import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RefreshToken } from './entities/auth.entity';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // 환경 변수 로드 확인 (디버깅용)
        const jwtSecret = configService.get<string>('JWT_SECRET');
        const nodeEnv = configService.get<string>('NODE_ENV');

        if (process.env.NODE_ENV !== 'production') {
          console.log('\n🔍 JWT 환경 변수 확인:');
          console.log(`  NODE_ENV: ${nodeEnv || 'undefined'}`);
          console.log(`  JWT_SECRET: ${jwtSecret ? '***설정됨***' : '❌ 없음'}`);
          console.log(`  process.env.JWT_SECRET: ${process.env.JWT_SECRET ? '***설정됨***' : '❌ 없음'}`);
        }

        if (!jwtSecret) {
          console.error('\n❌ JWT_SECRET 환경 변수 로드 실패');
          console.error('확인 사항:');
          console.error('1. .env 파일이 프로젝트 루트에 있는지 확인');
          console.error('2. .env 파일에 JWT_SECRET=값 형식으로 작성되어 있는지 확인');
          console.error('3. .env 파일에 공백이나 따옴표가 없는지 확인');
          throw new Error('JWT_SECRET 환경 변수가 설정되지 않았습니다.');
        }

        return {
          secret: jwtSecret,
          signOptions: { expiresIn: '15m' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
