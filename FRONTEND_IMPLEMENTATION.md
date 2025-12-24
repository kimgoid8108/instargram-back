# Next.js 프론트엔드 구현 가이드

## 1. API 클라이언트 설정

### `lib/api.ts` (또는 `utils/api.ts`)

```typescript
// API 클라이언트 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// 토큰을 포함한 요청 헤더 생성
export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken'); // 또는 쿠키 사용
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// 프로필 정보 조회
export const getProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    // 토큰이 없거나 만료됨
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    throw new Error('인증이 필요합니다.');
  }

  if (!response.ok) {
    throw new Error('프로필 정보를 가져오는데 실패했습니다.');
  }

  return response.json();
};
```

## 2. 프로필 페이지 보호 (방법 1: 페이지 레벨)

### `pages/profile.tsx` 또는 `app/profile/page.tsx`

```typescript
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // App Router: useRouter from 'next/navigation'
import { getProfile } from '../lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');

      // 토큰이 없으면 로그인 페이지로 리다이렉트
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // 프로필 정보 조회
        const userData = await getProfile();
        setUser(userData);
      } catch (error) {
        // 인증 실패 시 로그인 페이지로 리다이렉트
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return null; // 리다이렉트 중
  }

  return (
    <div>
      <h1>프로필</h1>
      <p>이메일: {user.email}</p>
      <p>닉네임: {user.nickname}</p>
      {user.profile_image_url && (
        <img src={user.profile_image_url} alt="프로필 이미지" />
      )}
    </div>
  );
}
```

## 3. 프로필 페이지 보호 (방법 2: HOC 사용)

### `components/withAuth.tsx`

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
      }
    }, [router]);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      return null; // 리다이렉트 중
    }

    return <Component {...props} />;
  };
}
```

### 사용 예시

```typescript
// pages/profile.tsx
import { withAuth } from '../components/withAuth';

function ProfilePage() {
  // ... 프로필 페이지 내용
}

export default withAuth(ProfilePage);
```

## 4. 프로필 페이지 보호 (방법 3: Middleware 사용 - App Router)

### `middleware.ts` (프로젝트 루트)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value; // 또는 헤더에서 추출

  // /profile 경로 접근 시 토큰 확인
  if (request.nextUrl.pathname.startsWith('/profile')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*'],
};
```

## 5. 로그인 페이지에서 토큰 저장

### `pages/login.tsx` 또는 `app/login/page.tsx`

```typescript
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('로그인 실패');
      }

      const data = await response.json();

      // 토큰 저장
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // 프로필 페이지로 리다이렉트
      router.push('/profile');
    } catch (error) {
      alert('로그인에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        required
      />
      <button type="submit">로그인</button>
    </form>
  );
}
```

## 6. API 요청 시 자동 토큰 포함 (Axios 사용 예시)

### `lib/axios.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// 요청 인터셉터: 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 에러 시 자동 로그아웃
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 사용 예시

```typescript
import apiClient from '../lib/axios';

// 프로필 조회
const getProfile = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};
```

## 요약

### 백엔드 (NestJS)
- ✅ JWT Guard 구현 완료
- ✅ `/users/me` 엔드포인트 추가 (인증 필수)
- ✅ `@UseGuards(JwtAuthGuard)`로 보호
- ✅ `@CurrentUser()` 데코레이터로 사용자 정보 접근

### 프론트엔드 (Next.js)
- 페이지 진입 시 토큰 확인
- 토큰 없으면 `/login`으로 리다이렉트
- API 요청 시 `Authorization: Bearer {token}` 헤더 포함
- 401 응답 시 자동 로그아웃 및 리다이렉트
