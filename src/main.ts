import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // CORS 설정
    app.enableCors({
      origin: configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // 글로벌 검증 파이프
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    const port = configService.get<number>('PORT') || 3001;
    await app.listen(port);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n✅ 서버가 성공적으로 시작되었습니다!`);
      console.log(`📡 포트: http://localhost:${port}\n`);
    }
  } catch (error) {
    console.error('\n❌ 서버 시작 실패:', error.message);
    if (process.env.NODE_ENV !== 'production') {
      console.error('\n가능한 원인:');
      console.error('1. 데이터베이스 연결 실패');
      console.error('2. 포트가 이미 사용 중');
      console.error('3. 환경 변수 설정 오류\n');
    }
    process.exit(1);
  }
}
bootstrap();
