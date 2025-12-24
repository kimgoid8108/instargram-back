# 빌드 에러 해결 가이드

## 문제
```
Error: Cannot find module 'C:\Users\PC\Desktop\CICD 풀스택 이영철\instargram\loginback\dist\main'
```

## 해결 방법

### 방법 1: 빌드 후 실행 (권장)

1. **백엔드 폴더로 이동**:
   ```bash
   cd loginback
   ```

2. **빌드 실행**:
   ```bash
   npm run build
   ```

3. **서버 실행**:
   ```bash
   npm run start:dev
   ```

### 방법 2: watch 모드로 실행

`nest start --watch`는 자동으로 빌드하지만, 처음 실행 시 dist 폴더가 없으면 문제가 발생할 수 있습니다.

1. **먼저 빌드 실행**:
   ```bash
   cd loginback
   npm run build
   ```

2. **그 다음 watch 모드 실행**:
   ```bash
   npm run start:dev
   ```

### 방법 3: 수동으로 dist 폴더 확인

1. `loginback` 폴더에 `dist` 폴더가 있는지 확인
2. 없으면 `npm run build` 실행
3. `dist/main.js` 파일이 생성되었는지 확인

## 추가 확인 사항

- TypeScript 컴파일 에러가 없는지 확인
- `tsconfig.build.json` 파일이 올바른지 확인
- `nest-cli.json` 파일이 올바른지 확인

## 빠른 해결

터미널에서 다음 명령어를 순서대로 실행:

```bash
cd loginback
npm run build
npm run start:dev
```
