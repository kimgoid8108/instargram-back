# Render Environment Variables 설정 가이드

## 필수 환경 변수

Render 대시보드의 Environment Variables에 다음 변수들을 설정하세요.

### 1. 데이터베이스 설정 (둘 중 하나 선택)

#### 방법 A: DATABASE_URL 사용 (권장)
```
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
```

#### 방법 B: 개별 필드 사용
```
DB_HOST=your-db-host.onrender.com
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database_name
DB_SSL=true
```

**중요**: Render PostgreSQL은 External URL을 사용해야 합니다. Internal URL은 로컬에서 접근할 수 없습니다.

### 2. JWT 인증 설정 (필수)
```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
```

**보안**: 프로덕션에서는 강력한 랜덤 문자열을 사용하세요.
```bash
# Node.js로 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. 서버 설정 (선택사항)
```
PORT=10000
NODE_ENV=production
```

### 4. CORS 설정 (선택사항)
```
CORS_ORIGIN=https://your-frontend-domain.com
```

## Render 설정 방법

1. Render 대시보드 → Your Service → Environment
2. "Add Environment Variable" 클릭
3. 위의 변수들을 하나씩 추가

## 확인 방법

배포 후 서버 로그에서 다음을 확인:
- ✅ SSL 연결 활성화 (Render DB 사용 시)
- ✅ 데이터베이스 연결 성공
- ✅ JWT 환경 변수 확인 (개발 환경에서만 표시)
