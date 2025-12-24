/**
 * .env 파일 확인 스크립트
 * 실행: node check-env.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('\n🔍 .env 파일 확인\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// .env 파일 존재 확인
if (!fs.existsSync(envPath)) {
  console.error('❌ .env 파일이 없습니다!');
  console.error(`   예상 위치: ${envPath}`);
  console.error('\n해결 방법:');
  console.error('1. 프로젝트 루트에 .env 파일 생성');
  console.error('2. 다음 내용을 추가:');
  console.error('   DB_HOST=your-host.onrender.com');
  console.error('   DB_PORT=5432');
  console.error('   DB_USERNAME=your_username');
  console.error('   DB_PASSWORD=your_password');
  console.error('   DB_DATABASE=your_database_name');
  console.error('   DB_SSL=true');
  console.error('   JWT_SECRET=your-super-secret-jwt-key');
  process.exit(1);
}

console.log('✅ .env 파일 존재 확인\n');

// .env 파일 내용 읽기
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'));

  console.log('📋 환경 변수 확인:\n');

  const requiredVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
    'JWT_SECRET',
  ];
  const foundVars = {};

  lines.forEach((line) => {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) {
      const key = match[1];
      const value = match[2].trim();
      foundVars[key] = value;

      // 비밀번호와 JWT_SECRET은 마스킹
      const displayValue =
        key === 'DB_PASSWORD' || key === 'JWT_SECRET'
          ? '***설정됨***'
          : value;
      console.log(`  ${key}: ${displayValue || '(빈 값)'}`);
    }
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 필수 변수 확인
  let hasError = false;
  requiredVars.forEach((varName) => {
    if (!foundVars[varName]) {
      console.error(`❌ ${varName}이(가) 없습니다!`);
      hasError = true;
    } else {
      console.log(`✅ ${varName}: 설정됨`);
    }
  });

  // Render/Supabase 사용 시 SSL 확인
  if (foundVars.DB_HOST && foundVars.DB_HOST.includes('render.com')) {
    console.log('\n⚠️  Render 데이터베이스 감지');
    if (foundVars.DB_SSL !== 'true') {
      console.error('❌ Render는 SSL이 필수입니다! DB_SSL=true 추가 필요');
      hasError = true;
    } else {
      console.log('✅ DB_SSL=true 설정됨');
    }

    // External URL 확인
    if (foundVars.DB_HOST.includes('internal')) {
      console.error('❌ Internal Database URL을 사용하고 있습니다!');
      console.error(
        '   Render 대시보드에서 External Database URL을 사용하세요',
      );
      hasError = true;
    }
  }

  if (foundVars.DB_HOST && foundVars.DB_HOST.includes('supabase.co')) {
    console.log('\n⚠️  Supabase 데이터베이스 감지');
    if (foundVars.DB_SSL !== 'true') {
      console.error('❌ Supabase는 SSL이 필수입니다! DB_SSL=true 추가 필요');
      hasError = true;
    } else {
      console.log('✅ DB_SSL=true 설정됨');
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (hasError) {
    console.error('❌ .env 파일에 문제가 있습니다. 위의 항목을 수정하세요.\n');
    process.exit(1);
  } else {
    console.log('✅ .env 파일이 올바르게 설정되었습니다!\n');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ .env 파일 읽기 실패:', error.message);
  process.exit(1);
}
