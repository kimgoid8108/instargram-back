# Render 배포 가이드

## 📋 배포 전 체크리스트

### 1. package.json 스크립트 확인

✅ **필수 스크립트가 올바르게 설정되어 있는지 확인:**

```json
{
  "scripts": {
    "build": "npx nest build",
    "start": "node dist/src/main.js"
  }
}
```

**중요 사항:**
- `build`: NestJS 프로젝트를 빌드하여 `dist` 폴더에 컴파일된 JavaScript 파일 생성
- `start`: 빌드된 파일을 실행 (경로는 실제 빌드 출력에 맞춰야 함)
- Render는 자동으로 `npm install` → `npm run build` → `npm start` 순서로 실행

### 2. 빌드 출력 경로 확인

NestJS 빌드 후 다음 경로에 `main.js`가 생성되는지 확인:

```
dist/src/main.js  ✅ (현재 설정)
```

**확인 방법:**
```bash
# 로컬에서 빌드 테스트
npm run build
ls -la dist/src/main.js
```

### 3. Render 서비스 설정

#### 3.1 서비스 생성
1. Render Dashboard → New → Web Service
2. GitHub 저장소 연결
3. 서비스 설정 입력

#### 3.2 필수 설정 값

**Name**: 원하는 서비스 이름 (예: `instagram-backend`)

**Environment**: `Node`

**Build Command**:
```
npm install && npm run build
```

**Start Command**:
```
npm start
```

**Root Directory**:
```
loginback
```
⚠️ **중요**: 프로젝트 루트가 `loginback` 폴더인 경우 반드시 설정해야 함

#### 3.3 Node.js 버전

**Node Version**: `20.x` 또는 `22.x` (권장)

Render 대시보드에서 설정하거나, 프로젝트 루트에 `.nvmrc` 파일 생성:

```bash
# .nvmrc 파일
20
```

### 4. 환경 변수 설정

Render Dashboard → Your Service → Environment → Add Environment Variable

#### 필수 환경 변수

```env
# 데이터베이스 (DATABASE_URL 또는 개별 필드)
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# 또는 개별 필드 사용
DB_HOST=your-db-host.onrender.com
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database_name
DB_SSL=true

# JWT 인증 (필수)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# 서버 설정
PORT=10000
NODE_ENV=production

# CORS 설정 (프론트엔드 도메인)
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

**JWT_SECRET 생성 방법:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. 데이터베이스 설정

#### Render PostgreSQL 사용 시

1. Render Dashboard → New → PostgreSQL
2. 데이터베이스 생성
3. **External Connection String** 복사 (Internal URL은 사용하지 않음)
4. `DATABASE_URL` 환경 변수에 설정

#### 외부 PostgreSQL 사용 시

- `DATABASE_URL` 또는 개별 필드(`DB_HOST`, `DB_PORT` 등) 설정
- SSL 연결이 필요한 경우 `DB_SSL=true` 설정

### 6. 빌드 및 배포 확인

#### 배포 로그 확인 사항

Render Dashboard → Your Service → Logs에서 다음을 확인:

✅ **빌드 단계:**
```
Running 'npm install && npm run build'
...
> nest build
...
✅ Build successful
```

✅ **시작 단계:**
```
Running 'npm start'
> node dist/src/main.js
✅ 서버가 성공적으로 시작되었습니다!
📡 포트: http://localhost:10000
```

❌ **오류 발생 시:**
- `npm error could not determine executable to run`
  → `package.json`의 `start` 스크립트 경로 확인
  → `dist/src/main.js` 파일이 존재하는지 확인

- `Cannot find module`
  → `npm install`이 제대로 실행되었는지 확인
  → `node_modules`가 `.gitignore`에 포함되어 있는지 확인

- `Database connection failed`
  → 환경 변수 설정 확인
  → 데이터베이스 External URL 사용 확인

### 7. 헬스 체크

배포 후 서버가 정상 작동하는지 확인:

```bash
# API 엔드포인트 확인
curl https://your-service.onrender.com

# 또는 브라우저에서 접속
https://your-service.onrender.com
```

### 8. 자동 배포 설정

#### GitHub 연동 시
- `main` 브랜치에 푸시하면 자동 배포
- Pull Request 생성 시 Preview 배포 (선택사항)

#### 수동 배포
- Render Dashboard → Manual Deploy → Deploy latest commit

---

## 🔧 문제 해결

### 문제 1: `npm error could not determine executable to run`

**원인**: `package.json`의 `start` 스크립트가 잘못된 경로를 참조

**해결**:
1. 로컬에서 빌드 실행: `npm run build`
2. 빌드 출력 경로 확인: `ls dist/src/main.js`
3. `package.json`의 `start` 스크립트를 실제 경로에 맞게 수정

```json
{
  "scripts": {
    "start": "node dist/src/main.js"  // 실제 빌드 출력 경로
  }
}
```

### 문제 2: 빌드는 성공하지만 서버가 시작되지 않음

**확인 사항**:
1. 환경 변수 설정 확인 (특히 `DATABASE_URL`, `JWT_SECRET`)
2. 포트 설정 확인 (`PORT` 환경 변수 또는 기본값 3001)
3. 데이터베이스 연결 확인

**로그 확인**:
```bash
# Render Dashboard → Logs에서 에러 메시지 확인
```

### 문제 3: Root Directory 오류

**증상**:
- 빌드 시 파일을 찾을 수 없음
- `package.json`을 찾을 수 없음

**해결**:
1. Render Dashboard → Settings → Build & Deploy
2. **Root Directory**를 `loginback`으로 설정
3. 저장 후 재배포

### 문제 4: 의존성 설치 실패

**확인 사항**:
1. `package-lock.json`이 Git에 커밋되어 있는지 확인
2. Node.js 버전 호환성 확인
3. `package.json`의 의존성 버전 확인

---

## 📝 최종 확인 사항

배포 전 다음을 확인하세요:

- [ ] `package.json`에 `build`와 `start` 스크립트가 올바르게 설정됨
- [ ] 로컬에서 `npm run build` 성공
- [ ] 로컬에서 `npm start`로 서버 시작 성공
- [ ] `dist/src/main.js` 파일이 생성됨
- [ ] Render에서 Root Directory가 올바르게 설정됨
- [ ] 모든 필수 환경 변수가 설정됨
- [ ] 데이터베이스 연결 정보가 올바름
- [ ] CORS 설정이 프론트엔드 도메인과 일치함

---

## 🚀 배포 후 확인

1. **서버 로그 확인**
   - Render Dashboard → Logs
   - "서버가 성공적으로 시작되었습니다!" 메시지 확인

2. **API 엔드포인트 테스트**
   ```bash
   curl https://your-service.onrender.com
   ```

3. **프론트엔드 연결 확인**
   - 프론트엔드의 API URL을 Render 서비스 URL로 변경
   - 로그인/회원가입 기능 테스트

---

## 📚 참고 자료

- [Render 공식 문서](https://render.com/docs)
- [NestJS 배포 가이드](https://docs.nestjs.com/recipes/deployment)
- [RENDER_ENV_VARIABLES.md](./RENDER_ENV_VARIABLES.md) - 환경 변수 상세 가이드
