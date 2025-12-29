# Render 백엔드 CORS 및 연결 문제 해결 가이드

## 🔍 문제 분석

### 발생한 오류
```
Failed to load resource: net::ERR_FAILED
Error: 서버에 연결할 수 없습니다.
```

### 가능한 원인
1. **CORS 설정 문제**: Vercel 프론트엔드 URL이 CORS 허용 목록에 없음
2. **Render Free 플랜 Sleep**: 15분간 요청이 없으면 서버가 sleep 상태로 전환
3. **서버 미실행**: Render에서 서버가 정상적으로 시작되지 않음
4. **라우트 문제**: `/auth/login` 엔드포인트가 존재하지 않음

---

## ✅ 해결 방법

### 1. CORS 설정 개선

**수정된 `main.ts`:**
- 여러 origin을 쉼표로 구분하여 허용 가능
- 프로덕션 환경에서는 모든 origin 허용 옵션 추가

**Render 환경 변수 설정:**
```
CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:3000
```

**주의**: 여러 origin을 허용하려면 쉼표로 구분하여 설정

### 2. 서버 시작 로그 개선

서버 시작 시 다음 정보가 출력됩니다:
- ✅ 서버 시작 성공 메시지
- 📡 포트 번호
- 🌍 환경 (development/production)
- 🔒 CORS 허용 Origin 목록
- 📋 헬스 체크 엔드포인트

### 3. 헬스 체크 엔드포인트 추가

**엔드포인트**: `GET /health`

**응답 예시:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

**사용 방법:**
```bash
# 서버 상태 확인
curl https://instargram-back.onrender.com/health
```

### 4. Render 서버 상태 확인

#### 4.1 Render Dashboard에서 확인
1. Render Dashboard → Your Service → Logs
2. 다음 메시지 확인:
   ```
   ✅ 서버가 성공적으로 시작되었습니다!
   📡 포트: 10000
   🌍 환경: production
   🔒 CORS 허용 Origin: https://your-frontend.vercel.app
   📋 헬스 체크: GET /
   ```

#### 4.2 브라우저에서 확인
1. `https://instargram-back.onrender.com` 접속
   - "Hello World!" 메시지가 표시되어야 함
2. `https://instargram-back.onrender.com/health` 접속
   - JSON 응답이 표시되어야 함

#### 4.3 API 엔드포인트 확인
```bash
# 로그인 엔드포인트 확인
curl -X POST https://instargram-back.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🔧 Render 환경 변수 설정

### 필수 환경 변수

Render Dashboard → Your Service → Environment → Add Environment Variable

```env
# CORS 설정 (Vercel 프론트엔드 URL 포함)
CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:3000

# 데이터베이스
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key

# 서버 설정
PORT=10000
NODE_ENV=production
```

**중요**:
- Vercel 프론트엔드 URL을 `CORS_ORIGIN`에 반드시 포함
- 여러 origin은 쉼표로 구분
- `https://` 프로토콜 포함

---

## 🚨 Render Free 플랜 Sleep 문제

### 문제
Render Free 플랜은 15분간 요청이 없으면 서버가 sleep 상태로 전환됩니다.
첫 요청 시 서버가 깨어나는 데 약 30초~1분이 소요될 수 있습니다.

### 해결 방법

#### 방법 1: Render Paid 플랜 사용
- 서버가 항상 실행 상태 유지

#### 방법 2: Keep-Alive 스크립트 사용
- 외부 서비스(예: UptimeRobot, cron-job.org)에서 주기적으로 헬스 체크 요청
- 5분마다 `GET /health` 요청

#### 방법 3: 프론트엔드에서 재시도 로직 구현
```typescript
// 첫 요청 실패 시 재시도
async function apiRequestWithRetry(endpoint: string, options: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiRequest(endpoint, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}
```

---

## 📋 문제 해결 체크리스트

### Render 서버 확인
- [ ] Render Dashboard → Logs에서 서버 시작 메시지 확인
- [ ] `https://instargram-back.onrender.com` 접속 시 "Hello World!" 표시
- [ ] `https://instargram-back.onrender.com/health` 접속 시 JSON 응답 확인

### CORS 설정 확인
- [ ] `CORS_ORIGIN` 환경 변수에 Vercel 프론트엔드 URL 포함
- [ ] 여러 origin은 쉼표로 구분
- [ ] `https://` 프로토콜 포함

### API 엔드포인트 확인
- [ ] `POST /auth/login` 엔드포인트 존재 확인
- [ ] `@Public()` 데코레이터로 인증 불필요 설정 확인

### 프론트엔드 설정 확인
- [ ] `NEXT_PUBLIC_API_URL` 환경 변수가 Render 백엔드 URL로 설정됨
- [ ] Vercel 환경 변수에 `NEXT_PUBLIC_API_URL=https://instargram-back.onrender.com` 설정

---

## 🧪 테스트 방법

### 1. 로컬에서 테스트
```bash
# 서버 시작
cd loginback
npm run start:dev

# 다른 터미널에서 테스트
curl http://localhost:3001/health
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 2. Render에서 테스트
```bash
# 헬스 체크
curl https://instargram-back.onrender.com/health

# 로그인 API 테스트
curl -X POST https://instargram-back.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 3. 브라우저에서 테스트
1. `https://instargram-back.onrender.com` 접속
2. `https://instargram-back.onrender.com/health` 접속
3. 브라우저 개발자 도구 → Network 탭에서 요청 확인

---

## 📝 추가 참고사항

### CORS 설정 상세
- `origin`: 허용할 origin 목록 (배열 또는 문자열)
- `credentials: true`: 쿠키/인증 정보 포함 요청 허용
- `methods`: 허용할 HTTP 메서드
- `allowedHeaders`: 허용할 헤더

### Render 로그 확인
- Render Dashboard → Your Service → Logs
- 실시간 로그 확인 가능
- 에러 메시지 확인

### 네트워크 오류 해결
1. Render 서버가 실행 중인지 확인
2. CORS 설정 확인
3. 프론트엔드 API URL 확인
4. 브라우저 개발자 도구 → Network 탭에서 실제 요청 URL 확인

---

## 🎯 최종 확인

모든 설정이 완료되면:
1. ✅ Render 서버가 정상적으로 시작됨
2. ✅ CORS 설정이 올바름
3. ✅ `/auth/login` 엔드포인트가 정상 작동
4. ✅ 프론트엔드에서 API 호출 성공

문제가 지속되면 Render Dashboard의 Logs를 확인하여 구체적인 에러 메시지를 확인하세요.
