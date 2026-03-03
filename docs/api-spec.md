# 모란도란 백엔드 API 명세서

Base URL: `{VITE_API_URL}` (예: `http://localhost:8080`)

## 공통 규격

### 인증

모든 인증 필요 요청에 아래 헤더를 포함합니다:

```
Authorization: Bearer {token}
```

### 권한 레벨

| 레벨 | 설명 |
|------|------|
| 공개 | 인증 불필요 |
| user | 로그인한 사용자 |
| admin | 관리자만 접근 가능 |

### 에러 응답 형식

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "리소스를 찾을 수 없습니다."
  }
}
```

| HTTP 코드 | code | 설명 |
|-----------|------|------|
| 400 | BAD_REQUEST | 잘못된 요청 파라미터 |
| 401 | UNAUTHORIZED | 인증 토큰 없음 또는 만료 |
| 403 | FORBIDDEN | 권한 부족 (admin 필요) |
| 404 | NOT_FOUND | 리소스 없음 |
| 409 | CONFLICT | 중복 데이터 |
| 500 | INTERNAL_ERROR | 서버 내부 오류 |

### 페이지네이션

목록 API는 공통 쿼리 파라미터를 지원합니다:

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 항목 수 |

응답 형식:

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

### CORS

프론트엔드 도메인에 대해 아래 설정이 필요합니다:

- `Access-Control-Allow-Origin`: 프론트엔드 도메인
- `Access-Control-Allow-Headers`: `Content-Type, Authorization`
- `Access-Control-Allow-Methods`: `GET, POST, PUT, DELETE, OPTIONS`

---

## 1. 인증 API

### POST /api/auth/login

로그인하여 JWT 토큰을 발급받습니다.

**권한**: 공개

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** `200`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-001",
    "nickname": "모란이",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

`role` 값: `"admin"` 또는 `"user"`

---

### POST /api/auth/logout

토큰을 무효화합니다.

**권한**: user

**Request Header**: `Authorization: Bearer {token}`

**Response** `200`:

```json
{
  "message": "로그아웃 되었습니다."
}
```

---

### GET /api/auth/me

현재 로그인한 사용자 정보를 조회합니다.

**권한**: user

**Request Header**: `Authorization: Bearer {token}`

**Response** `200`:

```json
{
  "id": "user-001",
  "nickname": "모란이",
  "email": "user@example.com",
  "role": "admin",
  "createdAt": "2026-01-15T09:00:00Z"
}
```

---

## 2. 소식 API

### GET /api/news

소식 목록을 조회합니다.

**권한**: 공개

**Query Parameters**:

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| page | number | 페이지 번호 |
| limit | number | 페이지당 항목 수 |
| category | string | 카테고리 필터 (업데이트/이벤트/소식/굿즈) |

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
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

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

**Response** `201`:

```json
{
  "id": "news-006",
  "title": "새로운 소식 제목",
  "summary": "소식 요약",
  "content": "소식 본문 내용",
  "thumbnail": "https://cdn.example.com/news/thumb.jpg",
  "category": "업데이트",
  "date": "2026-03-03",
  "createdAt": "2026-03-03T12:00:00Z",
  "updatedAt": "2026-03-03T12:00:00Z"
}
```

---

### PUT /api/news/:id

소식을 수정합니다.

**권한**: admin

**Request Body** (변경할 필드만):

```json
{
  "title": "수정된 제목",
  "content": "수정된 본문"
}
```

**Response** `200`: 수정된 소식 전체 객체 (POST 응답과 동일 형식)

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

## 3. 굿즈 API

### GET /api/products

굿즈 목록을 조회합니다.

**권한**: 공개

**Query Parameters**:

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| page | number | 페이지 번호 |
| limit | number | 페이지당 항목 수 |
| category | string | 카테고리 필터 (인형/악세서리/생활용품/문구/의류) |
| inStock | boolean | 재고 있는 상품만 |

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
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 6,
    "totalPages": 1
  }
}
```

---

### GET /api/products/:id

굿즈 상세를 조회합니다.

**권한**: 공개

**Response** `200`:

```json
{
  "id": "product-001",
  "name": "모란이 봉제인형 (30cm)",
  "price": 32000,
  "originalPrice": 38000,
  "description": "모란도란의 주인공 모란이를 그대로 재현한 고급 봉제인형입니다. 부드러운 극세사 원단으로 제작되어 포근한 촉감을 자랑합니다.",
  "image": "https://cdn.example.com/products/plush1.jpg",
  "category": "인형",
  "badge": "BEST",
  "inStock": true,
  "createdAt": "2026-02-01T09:00:00Z",
  "updatedAt": "2026-02-01T09:00:00Z"
}
```

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

필드 유효성:

| 필드 | 필수 | 조건 |
|------|------|------|
| name | Y | 1~100자 |
| price | Y | 0 이상 정수 |
| originalPrice | N | price 이상 정수 |
| description | Y | 1~2000자 |
| image | Y | URL 문자열 |
| category | Y | 인형/악세서리/생활용품/문구/의류 중 하나 |
| badge | N | BEST/NEW/SALE/한정판 중 하나 또는 null |
| inStock | Y | boolean |

**Response** `201`: 생성된 상품 전체 객체

---

### PUT /api/products/:id

굿즈를 수정합니다.

**권한**: admin

**Request Body** (변경할 필드만):

```json
{
  "price": 28000,
  "badge": "SALE",
  "inStock": false
}
```

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

## 4. 랭킹 API

### gameType 값

| gameType | 게임 | 랭킹 기준 | 정렬 |
|----------|------|-----------|------|
| parrot-seed | 해씨먹는 앵무새 | clearTimeMs (클리어 시간) | 오름차순 (빠를수록 높은 순위) |
| memory-card | 카드 뒤집기 | clearTimeMs (클리어 시간) | 오름차순 (빠를수록 높은 순위) |
| hidden-parrot | 숨은 앵무새 찾기 | clearTimeMs (클리어 시간) | 오름차순 (빠를수록 높은 순위) |

---

### GET /api/rankings/:gameType

상위 랭킹을 조회합니다.

**권한**: 공개

**Query Parameters**:

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| limit | number | 5 | 조회할 순위 수 |

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

기존 기록보다 좋은 경우에만 갱신됩니다 (개인 최고 기록 유지).

**Response** `200`:

```json
{
  "rank": 5,
  "isNewRecord": true
}
```

---

### DELETE /api/rankings/:gameType/:id

특정 랭킹 기록을 삭제합니다.

**권한**: admin

**Response** `200`:

```json
{
  "message": "삭제되었습니다."
}
```

---

## 5. 이미지 업로드 API

### POST /api/upload

이미지를 업로드합니다. 소식 썸네일이나 굿즈 이미지 등록 시 사용합니다.

**권한**: admin

**Request**: `multipart/form-data`

| 필드 | 타입 | 설명 |
|------|------|------|
| file | File | 이미지 파일 (jpg, png, webp) |
| type | string | 용도 구분: `news` 또는 `product` |

파일 제한:
- 최대 크기: 5MB
- 허용 형식: jpg, jpeg, png, webp

**Response** `200`:

```json
{
  "url": "https://cdn.example.com/uploads/20260303_abc123.jpg"
}
```

반환된 `url`을 소식/굿즈/갤러리 등록 시 `thumbnail`, `image`, `mediaUrl` 필드에 사용합니다.

---

## 6. 갤러리 API

인스타그램 스타일 갤러리입니다. 로그인한 사용자는 이미지/동영상을 업로드하고, 좋아요와 댓글을 남길 수 있습니다.

### GET /api/gallery

갤러리 게시물 목록을 조회합니다.

**권한**: 공개

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
      "mediaType": "image",
      "thumbnailUrl": "https://cdn.example.com/gallery/thumb_001.jpg",
      "likeCount": 12,
      "commentCount": 3,
      "createdAt": "2026-03-03T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 85,
    "totalPages": 3
  }
}
```

`mediaType` 값: `"image"` 또는 `"video"`

---

### GET /api/gallery/:id

갤러리 게시물 상세를 조회합니다.

**권한**: 공개

**Request Header** (선택): `Authorization: Bearer {token}` — 로그인 시 본인 좋아요 여부 포함

**Response** `200`:

```json
{
  "id": "gallery-001",
  "author": {
    "id": "user-001",
    "nickname": "모란이"
  },
  "mediaType": "image",
  "mediaUrl": "https://cdn.example.com/gallery/full_001.jpg",
  "thumbnailUrl": "https://cdn.example.com/gallery/thumb_001.jpg",
  "caption": "오늘의 모란도란 팬아트!",
  "likeCount": 12,
  "commentCount": 3,
  "isLiked": true,
  "createdAt": "2026-03-03T10:00:00Z"
}
```

`isLiked`: 로그인한 사용자가 좋아요를 눌렀는지 여부. 비로그인 시 항상 `false`.

---

### POST /api/gallery

갤러리 게시물을 등록합니다.

**권한**: user

**Request Body**:

```json
{
  "mediaUrl": "https://cdn.example.com/uploads/20260303_photo.jpg",
  "thumbnailUrl": "https://cdn.example.com/uploads/20260303_photo_thumb.jpg",
  "mediaType": "image",
  "caption": "오늘의 모란도란 팬아트!"
}
```

| 필드 | 필수 | 조건 |
|------|------|------|
| mediaUrl | Y | 업로드 API로 받은 URL |
| thumbnailUrl | Y | 썸네일 URL (이미지: 자동 생성, 동영상: 첫 프레임) |
| mediaType | Y | `image` 또는 `video` |
| caption | N | 0~500자 |

**Response** `201`:

```json
{
  "id": "gallery-086",
  "author": {
    "id": "user-001",
    "nickname": "모란이"
  },
  "mediaType": "image",
  "mediaUrl": "https://cdn.example.com/uploads/20260303_photo.jpg",
  "thumbnailUrl": "https://cdn.example.com/uploads/20260303_photo_thumb.jpg",
  "caption": "오늘의 모란도란 팬아트!",
  "likeCount": 0,
  "commentCount": 0,
  "createdAt": "2026-03-03T12:00:00Z"
}
```

---

### DELETE /api/gallery/:id

갤러리 게시물을 삭제합니다.

**권한**: 본인 또는 admin

**Response** `200`:

```json
{
  "message": "삭제되었습니다."
}
```

본인이 아닌 경우 admin 권한 필요. 권한 없으면 `403`.

---

### POST /api/gallery/:id/like

좋아요를 토글합니다. 이미 좋아요한 상태면 취소, 아니면 추가합니다.

**권한**: user

**Response** `200`:

```json
{
  "isLiked": true,
  "likeCount": 13
}
```

---

### GET /api/gallery/:id/comments

게시물의 댓글 목록을 조회합니다.

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
      "content": "너무 귀엽다!",
      "createdAt": "2026-03-03T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
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
  "id": "comment-004",
  "author": {
    "id": "user-002",
    "nickname": "도란이"
  },
  "content": "너무 귀엽다!",
  "createdAt": "2026-03-03T14:00:00Z"
}
```

---

### DELETE /api/gallery/:id/comments/:commentId

댓글을 삭제합니다.

**권한**: 본인 또는 admin

**Response** `200`:

```json
{
  "message": "삭제되었습니다."
}
```

본인이 아닌 경우 admin 권한 필요. 권한 없으면 `403`.
