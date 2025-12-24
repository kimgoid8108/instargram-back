/**
 * 데이터베이스 연결 테스트 스크립트
 *
 * 사용법:
 * 1. .env 파일이 프로젝트 루트에 있는지 확인
 * 2. 터미널에서 실행: npx ts-node test-db-connection.ts
 *
 * 이 스크립트는 NestJS 앱을 실행하지 않고 직접 DB 연결을 테스트합니다.
 */

import { config } from 'dotenv';
import { Client } from 'pg';

// .env 파일 로드
config();

async function testConnection() {
  const dbHost = process.env.DB_HOST;
  const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
  const dbUsername = process.env.DB_USERNAME;
  const dbPassword = process.env.DB_PASSWORD;
  const dbDatabase = process.env.DB_DATABASE;
  const dbSsl = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';

  console.log('\n🔍 환경 변수 확인:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`DB_HOST: ${dbHost ? '✓ ' + dbHost : '✗ 없음'}`);
  console.log(`DB_PORT: ${dbPort || '✗ 없음'}`);
  console.log(`DB_USERNAME: ${dbUsername ? '✓ ' + dbUsername : '✗ 없음'}`);
  console.log(`DB_PASSWORD: ${dbPassword ? '✓ 설정됨' : '✗ 없음'}`);
  console.log(`DB_DATABASE: ${dbDatabase ? '✓ ' + dbDatabase : '✗ 없음'}`);
  console.log(`DB_SSL: ${dbSsl ? '✓ true' : '✗ false'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 필수 환경 변수 확인
  if (!dbHost || !dbUsername || !dbPassword || !dbDatabase) {
    console.error('❌ 필수 환경 변수가 누락되었습니다!');
    console.error('필수: DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE');
    process.exit(1);
  }

  // PostgreSQL 클라이언트 생성
  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUsername,
    password: dbPassword,
    database: dbDatabase,
    ssl: dbSsl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000, // 10초 타임아웃
  });

  try {
    console.log('🔄 데이터베이스 연결 시도 중...');
    console.log(`   호스트: ${dbHost}:${dbPort}`);
    console.log(`   데이터베이스: ${dbDatabase}`);
    console.log(`   SSL: ${dbSsl ? '활성화' : '비활성화'}\n`);

    await client.connect();
    console.log('✅ 데이터베이스 연결 성공!\n');

    // 스키마 확인
    const schemaResult = await client.query(
      "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'instagram'",
    );

    if (schemaResult.rows.length > 0) {
      console.log('✅ instagram 스키마 존재 확인\n');
    } else {
      console.log('⚠️  instagram 스키마가 없습니다\n');
    }

    // 테이블 확인
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'instagram'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log('✅ 테이블 목록:');
      tablesResult.rows.forEach((row) => {
        console.log(`   - ${row.table_name}`);
      });
      console.log('');
    } else {
      console.log('⚠️  instagram 스키마에 테이블이 없습니다\n');
    }

    // 간단한 쿼리 테스트
    await client.query('SELECT 1 as test');
    console.log('✅ 쿼리 실행 성공\n');

    await client.end();
    console.log('✅ 연결 테스트 완료!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ 데이터베이스 연결 실패!\n');
    console.error('에러 타입:', error.constructor.name);
    console.error('에러 메시지:', error.message);
    console.error('\n가능한 원인:');

    if (error.code === 'ECONNREFUSED') {
      console.error('  - 호스트나 포트가 잘못되었습니다');
      console.error('  - PostgreSQL 서버가 실행되지 않았습니다');
      console.error('  - 방화벽이 연결을 차단하고 있습니다');
      console.error('  - Render/Supabase의 경우 External URL을 사용해야 합니다');
    } else if (error.code === 'ENOTFOUND') {
      console.error('  - 호스트 이름을 찾을 수 없습니다');
      console.error('  - DB_HOST 값이 올바른지 확인하세요');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('  - 연결 타임아웃');
      console.error('  - 네트워크 연결을 확인하세요');
    } else if (error.code === '28P01') {
      console.error('  - 인증 실패');
      console.error('  - DB_USERNAME 또는 DB_PASSWORD가 잘못되었습니다');
    } else if (error.code === '3D000') {
      console.error('  - 데이터베이스를 찾을 수 없습니다');
      console.error('  - DB_DATABASE 값이 올바른지 확인하세요');
    }

    console.error('\n상세 에러:', error);
    process.exit(1);
  }
}

testConnection();
