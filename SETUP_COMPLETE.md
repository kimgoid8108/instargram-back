# NestJS 백엔드 설정 완료 가이드

## 문제 원인 요약

1. **빌드 경로 문제**: `package.json`의 `start` 스크립트가 `node dist/main`으로 설정되어 있었으나, 실제 빌드 결과물은 `dist/src/main.js`로 생성됨
2. **복잡한 인증 구조**: RefreshToken, Guard 등 불필요한 복잡성이 있었음
3. **CORS 설정 미흡**: 프론트엔드 요청을 위한 CORS 설정이 부족했음

## 수정 완료 사항

### 1. package.json 수정
- `start` 스크립트: `node dist/main` → `node dist/src/main`
- `start:prod` 스크립트: `node dist/main` → `node dist/src/main`

### 2. main.ts 수정
- CORS 설정 개선 (프론트엔드 URL, 메서드, 헤더 명시)

### 3. AuthModule 단순화
- RefreshToken 제거
- 단순한 JWT 인증만 사용

### 4. AuthService 단순화
- RefreshToken 관련 코드 제거
- `signup` 메서드 추가
- `login` 메서드 단순화 (accessToken만 반환)

### 5. AuthController 수정
- `POST /auth/signup` 엔드포인트 추가
- `POST /auth/login` 엔드포인트 유지
- `@Public()` 데코레이터로 인증 불필요 표시

## API 엔드포인트

### POST /auth/signup
**요청:**
```json
{
  "email": "user@example.com",
  "hashed_password": "password123",
  "nickname": "username"
}
```

**응답:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "nickname": "username"
  }
}
```

### POST /auth/login
**요청:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "nickname": "username"
  }
}
```

## 실행 방법

### 1. 환경 변수 설정 (.env 파일)
```env
# 데이터베이스 설정
DB_HOST=your-host
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database_name
DB_SSL=false

# JWT 설정 (필수)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# 서버 설정
PORT=3001
NODE_ENV=development

# CORS 설정
CORS_ORIGIN=http://localhost:3000
```

### 2. 빌드 및 실행
```bash
# 빌드
npm run build

# 개발 모드 실행 (watch 모드)
npm run start:dev

# 프로덕션 모드 실행
npm run start:prod
```

### 3. 서버 확인
서버가 정상적으로 시작되면:
```
✅ 서버가 성공적으로 시작되었습니다!
📡 포트: http://localhost:3001
```

## 프론트엔드 연동

프론트엔드에서 다음과 같이 사용:

```typescript
// 회원가입
const response = await fetch('http://localhost:3001/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    hashed_password: 'password123',
    nickname: 'username'
  })
});

// 로그인
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

## 주의사항

1. **JWT_SECRET**: 반드시 설정해야 합니다. 없으면 서버가 시작되지 않습니다.
2. **데이터베이스 연결**: PostgreSQL 연결 정보가 올바른지 확인하세요.
3. **CORS**: 프론트엔드 URL이 `CORS_ORIGIN`에 포함되어 있어야 합니다.
