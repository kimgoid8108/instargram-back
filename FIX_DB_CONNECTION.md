# 🔧 데이터베이스 연결 문제 해결 가이드

## 현재 문제
**Internal Database URL을 사용하고 있습니다!**

Internal URL (`*.internal.render.com`)은 Render 네트워크 내부에서만 접근 가능하므로 로컬 개발 환경에서는 연결할 수 없습니다.

## ✅ 해결 방법 (단계별)

### 1단계: Render 대시보드에서 External URL 확인

1. **Render 대시보드 접속**
   - https://dashboard.render.com 접속
   - 로그인

2. **PostgreSQL 데이터베이스 선택**
   - 왼쪽 메뉴에서 PostgreSQL 데이터베이스 클릭

3. **Connections 탭 클릭**
   - 데이터베이스 페이지에서 "Connections" 탭 선택

4. **External Database URL 복사**
   - "External Database URL" 섹션 찾기
   - URL 전체 복사
   - ⚠️ **Internal Database URL이 아닌 External URL 사용!**

### 2단계: External URL 파싱

External Database URL 형식:
```
postgresql://username:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/database_name
```

각 부분을 추출:
- **호스트**: `dpg-xxxxx-a.oregon-postgres.render.com` (`.internal.`이 없어야 함!)
- **포트**: `5432`
- **사용자**: `username`
- **비밀번호**: `password`
- **데이터베이스**: `database_name`

### 3단계: .env 파일 수정

프로젝트 루트의 `.env` 파일을 다음과 같이 수정:

```env
# ❌ 잘못된 예 (Internal URL - 사용 불가)
# DB_HOST=dpg-xxxxx-a.internal.render.com

# ✅ 올바른 예 (External URL - 사용 가능)
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_USERNAME=your_username_from_url
DB_PASSWORD=your_password_from_url
DB_DATABASE=your_database_name_from_url
DB_SSL=true
```

### 4단계: 확인 사항

- [ ] `DB_HOST`에 `.internal.`이 포함되어 있지 않은가?
- [ ] `DB_HOST`가 `dpg-xxxxx-a.oregon-postgres.render.com` 형식인가?
- [ ] `DB_SSL=true`로 설정되어 있는가?
- [ ] 모든 필수 변수가 설정되어 있는가?

### 5단계: 연결 테스트

`.env` 파일 수정 후:

```bash
# .env 파일 확인
node check-env.js

# 애플리케이션 재시작
npm run start:dev
```

## 📝 예시

### Before (잘못된 설정)
```env
DB_HOST=dpg-d4n54063jp1c73adf4f0-a.internal.render.com
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=pass
DB_DATABASE=dbname
DB_SSL=true
```

### After (올바른 설정)
```env
DB_HOST=dpg-d4n54063jp1c73adf4f0-a.oregon-postgres.render.com
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=pass
DB_DATABASE=dbname
DB_SSL=true
```

**차이점**: `internal.render.com` → `oregon-postgres.render.com` (또는 다른 리전)

## ⚠️ 주의사항

1. **Internal vs External**
   - Internal: Render 서비스 간 통신용 (로컬에서 사용 불가)
   - External: 외부에서 접근 가능 (로컬 개발용)

2. **SSL 필수**
   - Render PostgreSQL은 SSL 연결이 필수입니다
   - `DB_SSL=true` 반드시 설정

3. **보안**
   - `.env` 파일은 절대 Git에 커밋하지 마세요
   - `.gitignore`에 이미 포함되어 있는지 확인

## 🆘 여전히 문제가 있다면?

1. Render 대시보드에서 External URL이 표시되는지 확인
2. External URL의 호스트 부분이 정확한지 확인
3. 방화벽이나 네트워크 설정 확인
4. `node check-env.js` 실행하여 .env 파일 검증
