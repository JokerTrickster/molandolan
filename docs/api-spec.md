# 모란도란 백엔드 API 명세서

> **Base URL**: `{NEXT_PUBLIC_API_URL}` (예: `https://api.molandolan.com`)
>
> **버전**: v2 (2026-03-04)
>
> **프론트엔드**: Next.js 15 + Pixi.js

---

## 1. 공통 규격

### 1.1 인증

인증이 필요한 요청에 아래 헤더를 포함합니다:

```
Authorization: Bearer {token}
```

`token`은 소셜 로그인 완료 후 서버가 발급하는 JWT입니다.

### 1.2 권한 레벨

| 레벨 | 설명 |
|------|------|
| 공개 | 인증 불필요 |
| user | 로그인한 사용자 (일반 + 관리자 모두) |
| admin | 관리자만 접근 가능 |
| owner | 본인이 작성한 리소스에 대해서만 (또는 admin) |

### 1.3 에러 응답

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "리소스를 찾을 수 없습니다."
  }
}
```

| HTTP | code | 설명 |
|------|------|------|
| 400 | BAD_REQUEST | 잘못된 요청 파라미터 |
| 401 | UNAUTHORIZED | 인증 토큰 없음 또는 만료 |
| 403 | FORBIDDEN | 권한 부족 |
| 404 | NOT_FOUND | 리소스 없음 |
| 409 | CONFLICT | 중복 데이터 |
| 413 | FILE_TOO_LARGE | 업로드 파일 크기 초과 |
| 500 | INTERNAL_ERROR | 서버 내부 오류 |

### 1.4 페이지네이션

목록 API 공통 쿼리 파라미터:

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | 페이지 번호 (1-based) |
| limit | number | 20 | 페이지당 항목 수 (최대 100) |

공통 응답 형식:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 53,
    "totalPages": 3
  }
}
```

### 1.5 CORS

프론트엔드 도메인에 대해 아래 설정 필요:

```
Access-Control-Allow-Origin: {프론트엔드 도메인}
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Credentials: true
```

### 1.6 날짜 형식

모든 날짜/시간 필드는 ISO 8601 형식: `2026-03-04T09:00:00Z`

`date` 필드(표시용)는 `YYYY-MM-DD` 형식: `2026-03-04`

---

## 2. 인증 API (OAuth2 소셜 로그인)

### 2.1 소셜 로그인 플로우

```
[프론트엔드]                    [백엔드]                    [OAuth Provider]
     |                            |                              |
     |-- GET /api/auth/{provider} -->                             |
     |                            |-- redirect to OAuth login --> |
     |                            |                              |
     |                            |   <-- callback with code --  |
     |                            |                              |
     |   <-- redirect to          |                              |
     |   {FRONTEND_URL}/login     |                              |
     |   /callback?token=xxx      |                              |
     |                            |                              |
     |-- GET /api/auth/me ------->|                              |
     |   <-- user info -----------|                              |
```

---

### GET /api/auth/{provider}

OAuth 로그인 페이지로 리다이렉트합니다.

**권한**: 공개

**Path Parameters**:

| 파라미터 | 값 | 설명 |
|----------|-----|------|
| provider | `google` | Google OAuth2 |
| provider | `kakao` | Kakao OAuth2 |

**Query Parameters**:

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| redirect_uri | string | 로그인 완료 후 돌아올 프론트엔드 URL (optional) |

**동작**: OAuth provider의 로그인 페이지로 302 redirect

---

### GET /api/auth/{provider}/callback

OAuth callback을 처리합니다. OAuth provider가 호출하는 엔드포인트입니다.

**권한**: 공개 (OAuth provider가 호출)

**동작**:
1. OAuth provider에서 받은 code로 사용자 정보 조회
2. DB에 사용자 없으면 자동 생성 (role: `user`)
3. JWT 토큰 발급
4. 프론트엔드로 redirect: `{FRONTEND_URL}/login/callback?token={jwt_token}`

---

### GET /api/auth/me

현재 로그인한 사용자 정보를 조회합니다.

**권한**: user

**Response** `200`:

```json
{
  "id": "user-001",
  "nickname": "모란이",
  "email": "user@gmail.com",
  "profileImage": "https://lh3.googleusercontent.com/...",
  "role": "admin",
  "provider": "google",
  "createdAt": "2026-01-15T09:00:00Z"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 서버 내부 사용자 ID |
| nickname | string | 표시 닉네임 (소셜 프로필 이름 또는 사용자 설정) |
| email | string | 소셜 계정 이메일 |
| profileImage | string \| null | 프로필 이미지 URL |
| role | `"admin"` \| `"user"` | 권한 |
| provider | `"google"` \| `"kakao"` | 로그인 provider |
| createdAt | string | 가입일 (ISO 8601) |

---

### PUT /api/auth/me

닉네임을 변경합니다.

**권한**: user

**Request Body**:

```json
{
  "nickname": "새닉네임"
}
```

| 필드 | 필수 | 조건 |
|------|------|------|
| nickname | Y | 2~20자, 공백 불가 |

**Response** `200`: 수정된 사용자 전체 객체 (GET /api/auth/me 응답과 동일)

---

### POST /api/auth/logout

토큰을 무효화합니다.

**권한**: user

**Response** `200`:

```json
{
  "message": "로그아웃 되었습니다."
}
```

---

## 3. 소식 API

### 데이터 모델

```typescript
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;          // "2026-03-01" (표시용)
  thumbnail: string;     // 이미지 URL 또는 이모지
  category: string;      // "업데이트" | "이벤트" | "소식" | "굿즈"
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601
}
```

---

### GET /api/news

소식 목록을 조회합니다.

**권한**: 공개

**Query Parameters**:

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| page | number | 페이지 번호 |
| limit | number | 페이지당 항목 수 |
| category | string | 카테고리 필터 (선택) |

**Response** `200`:

```json
{
  "items": [
    {
      "id": "news-001",
      "title": "모란도란 시즌2 업데이트 소식",
      "summary": "새로운 캐릭터와 스토리가 추가됩니다!",
      "thumbnail": "https://cdn.example.com/news/thumb1.jpg",
      "category": "업데이트",
      "date": "2026-03-01",
      "createdAt": "2026-03-01T09:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

목록 응답에서는 `content`, `updatedAt` 생략.

---

### GET /api/news/:id

소식 상세를 조회합니다.

**권한**: 공개

**Response** `200`:

```json
{
  "id": "news-001",
  "title": "모란도란 시즌2 업데이트 소식",
  "summary": "새로운 캐릭터와 스토리가 추가됩니다!",
  "content": "안녕하세요, 모란도란 팬 여러분!\n\n이번 시즌2에서는...",
  "thumbnail": "https://cdn.example.com/news/thumb1.jpg",
  "category": "업데이트",
  "date": "2026-03-01",
  "createdAt": "2026-03-01T09:00:00Z",
  "updatedAt": "2026-03-01T09:00:00Z"
}
```

---

### POST /api/news

소식을 등록합니다.

**권한**: admin

**Request Body**:

```json
{
  "title": "새로운 소식 제목",
  "summary": "소식 요약",
  "content": "소식 본문 내용",
  "thumbnail": "https://cdn.example.com/news/thumb.jpg",
  "category": "업데이트",
  "date": "2026-03-03"
}
```

| 필드 | 필수 | 조건 |
|------|------|------|
| title | Y | 1~200자 |
| summary | Y | 1~500자 |
| content | Y | 1~10000자 |
| thumbnail | Y | URL 문자열 (업로드 API로 받은 URL 또는 이모지) |
| category | Y | 업데이트 / 이벤트 / 소식 / 굿즈 중 하나 |
| date | Y | YYYY-MM-DD |

**Response** `201`: 생성된 소식 전체 객체

---

### PUT /api/news/:id

소식을 수정합니다.

**권한**: admin

**Request Body**: 변경할 필드만 전송 (부분 업데이트)

```json
{
  "title": "수정된 제목",
  "content": "수정된 본문"
}
```

**Response** `200`: 수정된 소식 전체 객체

---

### DELETE /api/news/:id

소식을 삭제합니다.

**권한**: admin

**Response** `200`:

```json
{
  "message": "삭제되었습니다."
}
```

---

## 4. 굿즈 API

### 데이터 모델

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;  // 할인 전 가격
  description: string;
  image: string;           // 이미지 URL 또는 이모지
  category: string;        // "인형" | "악세서리" | "생활용품" | "문구" | "의류"
  badge?: string;          // "BEST" | "NEW" | "SALE" | "한정판" | null
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

### GET /api/products

굿즈 목록을 조회합니다.

**권한**: 공개

**Query Parameters**:

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| page | number | 페이지 번호 |
| limit | number | 페이지당 항목 수 |
| category | string | 카테고리 필터 (선택) |
| inStock | boolean | `true`이면 재고 있는 상품만 |

**Response** `200`:

```json
{
  "items": [
    {
      "id": "product-001",
      "name": "모란이 봉제인형 (30cm)",
      "price": 32000,
      "originalPrice": 38000,
      "description": "모란도란의 주인공 모란이를 그대로 재현한 고급 봉제인형입니다.",
      "image": "https://cdn.example.com/products/plush1.jpg",
      "category": "인형",
      "badge": "BEST",
      "inStock": true,
      "createdAt": "2026-02-01T09:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 6, "totalPages": 1 }
}
```

---

### GET /api/products/:id

굿즈 상세를 조회합니다.

**권한**: 공개

**Response** `200`: Product 전체 객체 (updatedAt 포함)

---

### POST /api/products

굿즈를 등록합니다.

**권한**: admin

**Request Body**:

```json
{
  "name": "새 상품",
  "price": 15000,
  "originalPrice": 20000,
  "description": "상품 설명",
  "image": "https://cdn.example.com/products/new.jpg",
  "category": "악세서리",
  "badge": "NEW",
  "inStock": true
}
```

| 필드 | 필수 | 조건 |
|------|------|------|
| name | Y | 1~100자 |
| price | Y | 0 이상 정수 |
| originalPrice | N | price 이상 정수 (null이면 할인 없음) |
| description | Y | 1~2000자 |
| image | Y | URL 문자열 |
| category | Y | 인형 / 악세서리 / 생활용품 / 문구 / 의류 |
| badge | N | BEST / NEW / SALE / 한정판 / null |
| inStock | Y | boolean |

**Response** `201`: 생성된 상품 전체 객체

---

### PUT /api/products/:id

굿즈를 수정합니다.

**권한**: admin

**Request Body**: 변경할 필드만 (부분 업데이트)

**Response** `200`: 수정된 상품 전체 객체

---

### DELETE /api/products/:id

굿즈를 삭제합니다.

**권한**: admin

**Response** `200`:

```json
{
  "message": "삭제되었습니다."
}
```

---

## 5. 랭킹 API

### gameType 값

| gameType | 게임 | 랭킹 기준 | 정렬 |
|----------|------|-----------|------|
| `parrot-seed` | 해씨먹는 앵무새 | `clearTimeMs` (클리어 시간, ms) | 오름차순 (빠를수록 높은 순위) |
| `memory-card` | 카드 뒤집기 | `clearTimeMs` (클리어 시간, ms) | 오름차순 (빠를수록 높은 순위) |
| `hidden-parrot` | 숨은 앵무새 찾기 | `clearTimeMs` (클리어 시간, ms) | 오름차순 (빠를수록 높은 순위) |

### 데이터 모델

```typescript
interface RankEntry {
  rank: number;
  nickname: string;
  clearTimeMs: number;     // 밀리초 단위 클리어 시간
  createdAt: string;       // ISO 8601
}
```

---

### GET /api/rankings/:gameType

상위 랭킹을 조회합니다.

**권한**: 공개

**Query Parameters**:

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| limit | number | 5 | 조회할 순위 수 (최대 100) |

**Response** `200`:

```json
{
  "rankings": [
    {
      "rank": 1,
      "nickname": "모란이",
      "clearTimeMs": 23500,
      "createdAt": "2026-03-01T14:30:00Z"
    },
    {
      "rank": 2,
      "nickname": "도란이",
      "clearTimeMs": 25100,
      "createdAt": "2026-03-02T10:15:00Z"
    }
  ]
}
```

---

### GET /api/rankings/:gameType/me

내 랭킹을 조회합니다.

**권한**: user

**Response** `200`:

```json
{
  "rank": 37,
  "entry": {
    "rank": 37,
    "nickname": "내닉네임",
    "clearTimeMs": 45200,
    "createdAt": "2026-03-03T08:00:00Z"
  }
}
```

기록이 없는 경우 `404` 반환.

---

### POST /api/rankings/:gameType

게임 결과를 제출합니다.

**권한**: user

**Request Body**:

```json
{
  "clearTimeMs": 28300
}
```

| 필드 | 필수 | 조건 |
|------|------|------|
| clearTimeMs | Y | 양수 정수 (밀리초) |

서버 동작:
- 기존 기록이 없으면 새로 생성
- 기존 기록보다 좋은 (더 빠른) 경우에만 갱신 (개인 최고 기록 유지)
- 기존 기록보다 느리면 갱신하지 않고 현재 순위 반환

**Response** `200`:

```json
{
  "rank": 5,
  "isNewRecord": true
}
```

| 필드 | 설명 |
|------|------|
| rank | 현재 순위 |
| isNewRecord | 기록이 갱신되었는지 여부 |

---

### DELETE /api/rankings/:gameType/:rankingId

특정 랭킹 기록을 삭제합니다 (부정 기록 관리용).

**권한**: admin

**Response** `200`:

```json
{
  "message": "삭제되었습니다."
}
```

---

## 6. 갤러리 API

### 데이터 모델

```typescript
interface GalleryPost {
  id: string;
  author: {
    id: string;
    nickname: string;
    profileImage?: string;
  };
  mediaType: "image" | "video";
  mediaUrl: string;          // 원본 이미지/동영상 URL
  thumbnailUrl: string;      // 썸네일 URL
  caption: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;          // 현재 로그인 사용자의 좋아요 여부
  createdAt: string;
}

interface GalleryComment {
  id: string;
  author: {
    id: string;
    nickname: string;
  };
  content: string;
  createdAt: string;
}
```

---

### GET /api/gallery

갤러리 목록을 조회합니다.

**권한**: 공개

**Request Header** (선택): `Authorization: Bearer {token}` -- 로그인 시 `isLiked` 포함

**Query Parameters**:

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 30 | 페이지당 항목 수 |

**Response** `200`:

```json
{
  "items": [
    {
      "id": "gallery-001",
      "author": {
        "id": "user-001",
        "nickname": "모란이"
      },
      "mediaType": "image",
      "thumbnailUrl": "https://cdn.example.com/gallery/thumb_001.jpg",
      "caption": "모란이 팬아트 그렸어요!",
      "likeCount": 42,
      "commentCount": 5,
      "isLiked": false,
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 30, "total": 85, "totalPages": 3 }
}
```

목록에서는 `mediaUrl` 생략 (썸네일만 제공).

---

### GET /api/gallery/:id

갤러리 상세를 조회합니다.

**권한**: 공개

**Request Header** (선택): `Authorization: Bearer {token}`

**Response** `200`:

```json
{
  "id": "gallery-001",
  "author": {
    "id": "user-001",
    "nickname": "모란이",
    "profileImage": "https://lh3.googleusercontent.com/..."
  },
  "mediaType": "image",
  "mediaUrl": "https://cdn.example.com/gallery/full_001.jpg",
  "thumbnailUrl": "https://cdn.example.com/gallery/thumb_001.jpg",
  "caption": "모란이 팬아트 그렸어요! 🌸",
  "likeCount": 42,
  "commentCount": 5,
  "isLiked": true,
  "createdAt": "2026-03-01T10:00:00Z"
}
```

---

### POST /api/gallery

갤러리 게시물을 등록합니다.

**권한**: user

**Request**: `multipart/form-data`

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| file | File | Y | 이미지 또는 동영상 파일 |
| caption | string | N | 설명 (0~500자) |

파일 제한:
- 이미지: jpg, jpeg, png, webp (최대 10MB)
- 동영상: mp4, webm (최대 50MB)

서버 동작:
- 파일 저장 후 `mediaUrl` 생성
- 이미지인 경우 자동으로 `thumbnailUrl` 생성
- 동영상인 경우 첫 프레임으로 `thumbnailUrl` 생성

**Response** `201`:

```json
{
  "id": "gallery-086",
  "author": {
    "id": "user-001",
    "nickname": "모란이"
  },
  "mediaType": "image",
  "mediaUrl": "https://cdn.example.com/gallery/full_086.jpg",
  "thumbnailUrl": "https://cdn.example.com/gallery/thumb_086.jpg",
  "caption": "새로운 팬아트!",
  "likeCount": 0,
  "commentCount": 0,
  "isLiked": false,
  "createdAt": "2026-03-04T12:00:00Z"
}
```

---

### DELETE /api/gallery/:id

갤러리 게시물을 삭제합니다.

**권한**: owner (본인이 작성한 게시물) 또는 admin

**Response** `200`:

```json
{
  "message": "삭제되었습니다."
}
```

본인이 아니고 admin도 아닌 경우 `403`.

---

### POST /api/gallery/:id/like

좋아요를 토글합니다. 좋아요 상태면 취소, 아니면 추가.

**권한**: user

**Request Body**: 없음

**Response** `200`:

```json
{
  "isLiked": true,
  "likeCount": 43
}
```

---

### GET /api/gallery/:id/comments

댓글 목록을 조회합니다.

**권한**: 공개

**Query Parameters**:

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 항목 수 |

**Response** `200`:

```json
{
  "items": [
    {
      "id": "comment-001",
      "author": {
        "id": "user-002",
        "nickname": "도란이"
      },
      "content": "너무 예쁘다!! 🌸",
      "createdAt": "2026-03-01T10:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

### POST /api/gallery/:id/comments

댓글을 작성합니다.

**권한**: user

**Request Body**:

```json
{
  "content": "너무 귀엽다!"
}
```

| 필드 | 필수 | 조건 |
|------|------|------|
| content | Y | 1~300자 |

**Response** `201`:

```json
{
  "id": "comment-006",
  "author": {
    "id": "user-002",
    "nickname": "도란이"
  },
  "content": "너무 귀엽다!",
  "createdAt": "2026-03-04T14:00:00Z"
}
```

---

### DELETE /api/gallery/:id/comments/:commentId

댓글을 삭제합니다.

**권한**: owner (본인 댓글) 또는 admin

**Response** `200`:

```json
{
  "message": "삭제되었습니다."
}
```

---

## 7. 파일 업로드 API

소식 썸네일, 굿즈 이미지 등 관리자 콘텐츠에 사용할 파일을 업로드합니다.

### POST /api/upload

**권한**: admin

**Request**: `multipart/form-data`

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| file | File | Y | 이미지 파일 |
| type | string | Y | 용도: `news` \| `product` |

파일 제한:
- 형식: jpg, jpeg, png, webp
- 최대 크기: 5MB

**Response** `200`:

```json
{
  "url": "https://cdn.example.com/uploads/20260304_abc123.jpg"
}
```

반환된 `url`을 소식의 `thumbnail` 또는 굿즈의 `image` 필드에 사용합니다.

---

## 8. 엔드포인트 요약

| Method | Endpoint | 권한 | 설명 |
|--------|----------|------|------|
| **인증** | | | |
| GET | `/api/auth/{provider}` | 공개 | OAuth 로그인 시작 |
| GET | `/api/auth/{provider}/callback` | 공개 | OAuth callback |
| GET | `/api/auth/me` | user | 내 정보 조회 |
| PUT | `/api/auth/me` | user | 닉네임 변경 |
| POST | `/api/auth/logout` | user | 로그아웃 |
| **소식** | | | |
| GET | `/api/news` | 공개 | 소식 목록 |
| GET | `/api/news/:id` | 공개 | 소식 상세 |
| POST | `/api/news` | admin | 소식 등록 |
| PUT | `/api/news/:id` | admin | 소식 수정 |
| DELETE | `/api/news/:id` | admin | 소식 삭제 |
| **굿즈** | | | |
| GET | `/api/products` | 공개 | 굿즈 목록 |
| GET | `/api/products/:id` | 공개 | 굿즈 상세 |
| POST | `/api/products` | admin | 굿즈 등록 |
| PUT | `/api/products/:id` | admin | 굿즈 수정 |
| DELETE | `/api/products/:id` | admin | 굿즈 삭제 |
| **랭킹** | | | |
| GET | `/api/rankings/:gameType` | 공개 | 상위 랭킹 |
| GET | `/api/rankings/:gameType/me` | user | 내 랭킹 |
| POST | `/api/rankings/:gameType` | user | 기록 제출 |
| DELETE | `/api/rankings/:gameType/:id` | admin | 기록 삭제 |
| **갤러리** | | | |
| GET | `/api/gallery` | 공개 | 갤러리 목록 |
| GET | `/api/gallery/:id` | 공개 | 갤러리 상세 |
| POST | `/api/gallery` | user | 게시물 업로드 (multipart) |
| DELETE | `/api/gallery/:id` | owner/admin | 게시물 삭제 |
| POST | `/api/gallery/:id/like` | user | 좋아요 토글 |
| GET | `/api/gallery/:id/comments` | 공개 | 댓글 목록 |
| POST | `/api/gallery/:id/comments` | user | 댓글 작성 |
| DELETE | `/api/gallery/:id/comments/:commentId` | owner/admin | 댓글 삭제 |
| **파일** | | | |
| POST | `/api/upload` | admin | 이미지 업로드 |

---

## 9. 서버 환경변수

서버에서 필요한 환경변수 목록:

| 변수 | 설명 |
|------|------|
| `PORT` | 서버 포트 (기본: 8080) |
| `DATABASE_URL` | 데이터베이스 연결 문자열 |
| `JWT_SECRET` | JWT 토큰 서명 키 |
| `JWT_EXPIRY` | JWT 토큰 만료 시간 (예: `7d`) |
| `FRONTEND_URL` | 프론트엔드 URL (CORS + OAuth redirect) |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret |
| `KAKAO_CLIENT_ID` | Kakao OAuth2 Client ID |
| `KAKAO_CLIENT_SECRET` | Kakao OAuth2 Client Secret |
| `S3_BUCKET` | 파일 업로드용 S3 버킷 |
| `S3_REGION` | S3 리전 |
| `CDN_URL` | CDN 도메인 (파일 URL prefix) |
