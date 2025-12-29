import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // CORS 설정 - 여러 origin 허용
    const corsOrigin = configService.get<string>('CORS_ORIGIN');
    let allowedOrigins: string[] | string | boolean;

    if (corsOrigin) {
      // 쉼표로 구분된 여러 origin 지원
      allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());
    } else {
      // 개발 환경 기본값
      allowedOrigins = process.env.NODE_ENV === 'production' ? true : 'http://localhost:3000';
    }

    app.enableCors({
      origin: allowedOrigins,
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

    // 서버 시작 로그 (프로덕션에서도 출력)
    console.log(`\n✅ 서버가 성공적으로 시작되었습니다!`);
    console.log(`📡 포트: ${port}`);
    console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
    if (corsOrigin) {
      console.log(`🔒 CORS 허용 Origin: ${Array.isArray(allowedOrigins) ? allowedOrigins.join(', ') : allowedOrigins}`);
    } else {
      console.log(`🔒 CORS: 모든 Origin 허용 (프로덕션)`);
    }
    console.log(`📋 헬스 체크: GET /\n`);
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
