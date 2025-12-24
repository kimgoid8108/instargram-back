# PostgreSQL 연결 문제 해결 체크리스트

## 🔴 ECONNREFUSED 에러 원인 분석

### 1단계: .env 파일 확인
- [ ] `.env` 파일이 프로젝트 루트(`package.json`과 같은 위치)에 있는가?
- [ ] `.env` 파일에 공백이나 따옴표가 잘못 들어가지 않았는가?
- [ ] 환경 변수 이름이 정확한가? (대소문자 구분)

### 2단계: 로컬 PostgreSQL vs 관리형 PostgreSQL 구분

#### 로컬 PostgreSQL 사용 시
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=your_database_name
DB_SSL=false
```
- [ ] PostgreSQL 서비스가 실행 중인가? (`pg_isready` 또는 서비스 확인)
- [ ] 포트 5432가 열려있는가?
- [ ] 방화벽이 포트를 차단하지 않는가?

#### Render PostgreSQL 사용 시
```env
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com  # External Database URL의 호스트
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database_name
DB_SSL=true  # ⚠️ 필수!
```
- [ ] Render 대시보드 → PostgreSQL → "Connections" 탭 확인
- [ ] **External Database URL** 사용 (Internal이 아님!)
- [ ] External Database URL 형식: `postgresql://user:pass@host:port/dbname`
- [ ] SSL 연결 활성화 (`DB_SSL=true`)

#### Supabase PostgreSQL 사용 시
```env
DB_HOST=db.xxxxx.supabase.co  # Connection Pooling 사용 시 다른 호스트
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=postgres
DB_SSL=true  # ⚠️ 필수!
```
- [ ] Supabase Dashboard → Settings → Database 확인
- [ ] Connection String (URI) 또는 개별 정보 사용
- [ ] SSL 연결 활성화 (`DB_SSL=true`)

### 3단계: Render/Supabase 필수 확인 항목

#### Render
1. **External Database URL 확인**
   - Render 대시보드 → PostgreSQL → "Connections"
   - "External Database URL" 복사
   - 형식: `postgresql://username:password@host:port/database`
   - ⚠️ Internal URL이 아닌 External URL 사용!

2. **연결 정보 파싱**
   ```
   postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com:5432/dbname
   ↓
   DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
   DB_PORT=5432
   DB_USERNAME=user
   DB_PASSWORD=pass
   DB_DATABASE=dbname
   DB_SSL=true
   ```

3. **SSL 필수**
   - Render는 반드시 SSL 연결 필요
   - `DB_SSL=true` 또는 `ssl: { rejectUnauthorized: false }`

#### Supabase
1. **Connection String 확인**
   - Supabase Dashboard → Settings → Database
   - "Connection string" → "URI" 선택
   - 또는 "Connection pooling" 사용 시 다른 호스트

2. **SSL 필수**
   - Supabase도 SSL 연결 필요
   - `DB_SSL=true`

### 4단계: .env 로드 확인
- [ ] NestJS 시작 시 콘솔에 "📊 Database connection info:" 로그가 출력되는가?
- [ ] 로그에 host, port, username, database가 올바르게 표시되는가?
- [ ] 환경 변수가 `undefined`로 표시되지 않는가?

### 5단계: 네트워크 확인
- [ ] 인터넷 연결이 정상인가?
- [ ] 회사/학교 네트워크에서 외부 DB 접속이 차단되지 않는가?
- [ ] VPN 사용 시 VPN이 정상 작동하는가?

## 🛠️ 즉시 확인할 수 있는 명령어

### .env 파일 내용 확인 (비밀번호 제외)
```bash
# Windows PowerShell
Get-Content .env | Select-String "DB_"

# Windows CMD
type .env | findstr "DB_"

# Linux/Mac
cat .env | grep "DB_"
```

### PostgreSQL 연결 테스트 (psql 설치 필요)
```bash
psql -h YOUR_HOST -p 5432 -U YOUR_USERNAME -d YOUR_DATABASE
```

### 포트 연결 테스트
```bash
# Windows
Test-NetConnection -ComputerName YOUR_HOST -Port 5432

# Linux/Mac
nc -zv YOUR_HOST 5432
```
