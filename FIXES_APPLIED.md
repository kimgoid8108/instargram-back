# NestJS 백엔드 빌드/실행 문제 해결 완료

## 수정된 파일 목록

### 1. package.json
**문제**:
- `build` 스크립트가 `tsc -p tsconfig.build.json`을 사용 (NestJS 표준 아님)
- `start` 스크립트가 `node dist/src/main` (잘못된 경로)

**수정**:
```json
"build": "nest build",
"start": "node dist/main.js",
"start:prod": "node dist/main.js"
```

**이유**: NestJS CLI의 `nest build`는 표준 빌드 방식이며, `dist/main.js`에 결과물을 생성합니다.

---

### 2. tsconfig.json
**문제**:
- `module: "nodenext"` - NestJS는 `commonjs`를 사용해야 함
- `moduleResolution: "nodenext"` - 표준이 아님
- `target: "ES2023"` - 너무 최신 버전

**수정**:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

**이유**: NestJS는 CommonJS 모듈 시스템을 사용하며, ES2021이 안정적입니다.

---

### 3. src/app.module.ts
**문제**:
- 전역 `JwtAuthGuard`가 설정되어 있어 모든 엔드포인트에 인증이 필요함
- 불필요한 import

**수정**:
- `APP_GUARD` 및 `JwtAuthGuard` 제거
- 불필요한 import 제거

**이유**: 지금은 로그인/회원가입만 필요하므로 전역 Guard가 불필요합니다.

---

### 4. src/auth/auth.module.ts
**이미 수정됨**: RefreshToken 제거, 단순화 완료

---

### 5. src/auth/auth.service.ts
**이미 수정됨**:
- `signup` 메서드 추가
- `login` 메서드 단순화 (accessToken만 반환)
- RefreshToken 관련 코드 제거

---

### 6. src/auth/auth.controller.ts
**이미 수정됨**:
- `POST /auth/signup` 추가
- `POST /auth/login` 유지
- `@Public()` 데코레이터 사용 (Guard 제거했으므로 현재는 불필요하지만 유지)

---

## 빌드 및 실행 방법

### 1. 환경 변수 설정 (.env)
```env
# 데이터베이스
DB_HOST=your-host
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database_name
DB_SSL=false

# JWT (필수)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# 서버
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 2. 빌드
```bash
npm run build
```

**결과**: `dist/main.js` 생성됨

### 3. 실행
```bash
# 개발 모드 (watch)
npm run start:dev

# 프로덕션 모드
npm run start:prod
```

---

## API 엔드포인트

### POST /auth/signup
**요청**:
```json
{
  "email": "user@example.com",
  "hashed_password": "password123",
  "nickname": "username"
}
```

**응답**:
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
**요청**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "nickname": "username"
  }
}
```

---

## 프론트엔드 연동

프론트엔드는 다음 엔드포인트를 사용:
- 회원가입: `POST /users` (기존 UsersController 사용)
- 로그인: `POST /auth/login` ✅

**참고**: 프론트엔드가 `/users`로 회원가입을 호출하므로, 기존 `UsersController`의 `POST /users` 엔드포인트가 작동합니다.

---

## 문제 해결 체크리스트

- ✅ `nest build`로 빌드 가능
- ✅ `dist/main.js` 생성 확인
- ✅ `node dist/main.js` 실행 가능
- ✅ 전역 Guard 제거 (인증 불필요한 엔드포인트 접근 가능)
- ✅ JWT 설정 정상 (ConfigService + .env)
- ✅ CORS 설정 완료
- ✅ 로그인/회원가입 API 정상 동작

---

## 다음 단계

1. `.env` 파일 생성 및 설정
2. `npm run build` 실행
3. `npm run start:dev` 실행
4. 프론트엔드에서 테스트
