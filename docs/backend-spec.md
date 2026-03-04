# 모란도란 백엔드 구현 명세서

> **작성일**: 2026-03-04
>
> **API 명세 참조**: [api-spec.md](./api-spec.md)
>
> **프론트엔드 저장소**: https://github.com/JokerTrickster/molandolan

---

## 1. 기술 스택 (권장)

| 구분 | 기술 | 비고 |
|------|------|------|
| 언어 | Go 1.22+ | 또는 Node.js / Python |
| 프레임워크 | Echo / Gin | REST API |
| 데이터베이스 | PostgreSQL 16 | RDS 또는 Docker |
| 캐시 | Redis (선택) | 랭킹 캐시, 세션 |
| 파일 저장소 | AWS S3 | 이미지/동영상 업로드 |
| 인증 | JWT + OAuth2 | Google, Kakao |
| 배포 | AWS EC2 / ECS | Docker 기반 |

---

## 2. 데이터베이스 스키마

### 2.1 ERD

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users     │     │    news      │     │   products   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │     │ id (PK)      │     │ id (PK)      │
│ nickname     │     │ title        │     │ name         │
│ email        │     │ summary      │     │ price        │
│ name         │     │ content      │     │ original_price│
│ phone        │     │ thumbnail    │     │ description  │
│ address      │     │ category     │     │ image        │
│ profile_image│     │ date         │     │ category     │
│ role         │     │ created_at   │     │ badge        │
│ provider     │     │ updated_at   │     │ in_stock     │
│ provider_id  │     └──────────────┘     │ created_at   │
│ created_at   │                          │ updated_at   │
│ updated_at   │                          └──────┬───────┘
└──────┬───────┘                                 │
       │                                         │
       │     ┌──────────────┐     ┌──────────────┤
       │     │   rankings   │     │    orders    │
       │     ├──────────────┤     ├──────────────┤
       ├────>│ id (PK)      │     │ id (PK)      │
       │     │ user_id (FK) │     │ product_id(FK)│
       │     │ game_type    │     │ user_id (FK) │ nullable (비회원)
       │     │ clear_time_ms│     │ buyer_name   │
       │     │ created_at   │     │ buyer_phone  │
       │     │ updated_at   │     │ address      │
       │     └──────────────┘     │ quantity     │
       │                          │ unit_price   │
       │     ┌──────────────┐     │ total_price  │
       │     │   gallery    │     │ is_member    │
       │     ├──────────────┤     │ status       │
       ├────>│ id (PK)      │     │ created_at   │
       │     │ user_id (FK) │     │ updated_at   │
       │     │ media_type   │     └──────────────┘
       │     │ media_url    │
       │     │ thumbnail_url│     ┌──────────────────┐
       │     │ caption      │     │ gallery_likes    │
       │     │ like_count   │     ├──────────────────┤
       │     │ comment_count│     │ id (PK)          │
       │     │ created_at   │     │ gallery_id (FK)  │
       │     └──────┬───────┘     │ user_id (FK)     │
       │            │             │ created_at       │
       │     ┌──────┴───────┐     └──────────────────┘
       │     │gallery_comments│
       │     ├──────────────┤
       └────>│ id (PK)      │
             │ gallery_id(FK)│
             │ user_id (FK) │
             │ content      │
             │ created_at   │
             └──────────────┘
```

### 2.2 테이블 DDL

#### users

```sql
CREATE TABLE users (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nickname    VARCHAR(20) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    name        VARCHAR(50),
    phone       VARCHAR(20),
    address     TEXT,
    profile_image TEXT,
    role        VARCHAR(10) NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
    provider    VARCHAR(10) NOT NULL,                  -- 'google' | 'kakao'
    provider_id VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_id)
);
```

#### news

```sql
CREATE TABLE news (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title       VARCHAR(200) NOT NULL,
    summary     VARCHAR(500) NOT NULL,
    content     TEXT NOT NULL,
    thumbnail   TEXT NOT NULL,
    category    VARCHAR(20) NOT NULL,  -- '업데이트' | '이벤트' | '소식' | '굿즈'
    date        DATE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### products

```sql
CREATE TABLE products (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name            VARCHAR(100) NOT NULL,
    price           INTEGER NOT NULL CHECK (price >= 0),
    original_price  INTEGER CHECK (original_price >= price),
    description     TEXT NOT NULL,
    image           TEXT NOT NULL,
    category        VARCHAR(20) NOT NULL,
    badge           VARCHAR(10),  -- 'BEST' | 'NEW' | 'SALE' | '한정판' | NULL
    in_stock        BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### orders

```sql
CREATE TABLE orders (
    id          VARCHAR(36) PRIMARY KEY,  -- 'ORD-{timestamp}-{random}'
    product_id  VARCHAR(36) NOT NULL REFERENCES products(id),
    user_id     VARCHAR(36) REFERENCES users(id),  -- NULL이면 비회원
    buyer_name  VARCHAR(50) NOT NULL,
    buyer_phone VARCHAR(20) NOT NULL,
    address     TEXT NOT NULL,
    quantity    INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 10),
    unit_price  INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    is_member   BOOLEAN NOT NULL DEFAULT false,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_buyer_phone ON orders(buyer_phone);
CREATE INDEX idx_orders_status ON orders(status);
```

#### rankings

```sql
CREATE TABLE rankings (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id         VARCHAR(36) NOT NULL REFERENCES users(id),
    game_type       VARCHAR(20) NOT NULL,  -- 'parrot-seed' | 'memory-card' | 'hidden-parrot'
    clear_time_ms   INTEGER NOT NULL CHECK (clear_time_ms > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, game_type)
);

CREATE INDEX idx_rankings_game_type_time ON rankings(game_type, clear_time_ms ASC);
```

#### gallery

```sql
CREATE TABLE gallery (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id         VARCHAR(36) NOT NULL REFERENCES users(id),
    media_type      VARCHAR(10) NOT NULL,  -- 'image' | 'video'
    media_url       TEXT NOT NULL,
    thumbnail_url   TEXT NOT NULL,
    caption         VARCHAR(500),
    like_count      INTEGER NOT NULL DEFAULT 0,
    comment_count   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_created_at ON gallery(created_at DESC);
```

#### gallery_likes

```sql
CREATE TABLE gallery_likes (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    gallery_id  VARCHAR(36) NOT NULL REFERENCES gallery(id) ON DELETE CASCADE,
    user_id     VARCHAR(36) NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(gallery_id, user_id)
);
```

#### gallery_comments

```sql
CREATE TABLE gallery_comments (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    gallery_id  VARCHAR(36) NOT NULL REFERENCES gallery(id) ON DELETE CASCADE,
    user_id     VARCHAR(36) NOT NULL REFERENCES users(id),
    content     VARCHAR(300) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_comments_gallery_id ON gallery_comments(gallery_id);
```

---

## 3. 구현 작업 목록

### Phase 1: 기본 인프라 (1~2일)

| # | 작업 | 상세 |
|---|------|------|
| 1-1 | 프로젝트 초기화 | Go 모듈 생성, 디렉토리 구조 설정 |
| 1-2 | DB 마이그레이션 | 위 DDL을 마이그레이션 파일로 생성 |
| 1-3 | 공통 미들웨어 | CORS, 로깅, 에러 핸들링, JWT 인증 |
| 1-4 | 환경변수 관리 | `.env` 파일 로드, 설정 구조체 |
| 1-5 | 헬스체크 | `GET /api/health` → `{"status": "ok"}` |

### Phase 2: 인증 (2~3일)

| # | 작업 | 상세 |
|---|------|------|
| 2-1 | Google OAuth2 | `/api/auth/google`, callback, 토큰 발급 |
| 2-2 | Kakao OAuth2 | `/api/auth/kakao`, callback, 토큰 발급 |
| 2-3 | JWT 발급/검증 | 토큰 생성, 미들웨어에서 검증, 만료 처리 |
| 2-4 | 사용자 CRUD | 자동 생성, 프로필 조회/수정 |
| 2-5 | 로그아웃 | 토큰 블랙리스트 (선택) 또는 클라이언트 삭제 |

### Phase 3: 콘텐츠 CRUD (2~3일)

| # | 작업 | 상세 |
|---|------|------|
| 3-1 | 소식 CRUD | 목록(페이지네이션), 상세, 등록, 수정, 삭제 |
| 3-2 | 굿즈 CRUD | 목록(페이지네이션, 필터), 상세, 등록, 수정, 삭제 |
| 3-3 | 파일 업로드 | S3 업로드, URL 반환, 파일 크기/형식 검증 |

### Phase 4: 주문/배송 (2~3일)

| # | 작업 | 상세 |
|---|------|------|
| 4-1 | 주문 생성 | 회원/비회원, 재고 확인, 가격 검증 |
| 4-2 | 주문 목록 | 회원: user_id 기반, 비회원: phone 기반 |
| 4-3 | 주문 상세 | 주문 정보 + 상품 정보 조인 |
| 4-4 | 주문 상태 변경 | admin 전용, 상태 전이 검증 |
| 4-5 | 관리자 주문 목록 | 전체 목록, 상태별 필터 |

### Phase 5: 랭킹 (1~2일)

| # | 작업 | 상세 |
|---|------|------|
| 5-1 | 랭킹 조회 | game_type별 상위 N명, RANK() 함수 |
| 5-2 | 내 랭킹 | 현재 사용자 순위 계산 |
| 5-3 | 기록 제출 | UPSERT (기존 기록보다 빠를 때만 갱신) |
| 5-4 | 기록 삭제 | admin 전용 |

### Phase 6: 갤러리 (2~3일)

| # | 작업 | 상세 |
|---|------|------|
| 6-1 | 게시물 CRUD | 업로드(multipart), 목록, 상세, 삭제 |
| 6-2 | 썸네일 생성 | 이미지 리사이즈, 동영상 첫 프레임 |
| 6-3 | 좋아요 | 토글, 카운트 동기화 |
| 6-4 | 댓글 | 목록, 작성, 삭제 |

---

## 4. 도메인별 비즈니스 로직

### 4.1 인증

#### OAuth2 로그인 플로우

```
1. GET /api/auth/google
   → state 파라미터 생성 (CSRF 방지)
   → Google 인증 URL로 302 Redirect

2. GET /api/auth/google/callback?code=xxx&state=yyy
   → state 검증
   → code로 Google에 access_token 요청
   → access_token으로 Google 사용자 정보 조회
   → DB에서 (provider='google', provider_id=구글ID) 검색
     → 없으면: INSERT users (role='user')
     → 있으면: 기존 사용자 사용
   → JWT 토큰 발급 (payload: {userId, role, exp})
   → {FRONTEND_URL}/login/callback?token={jwt} 로 302 Redirect
```

#### JWT 구조

```json
{
  "sub": "user-001",
  "role": "admin",
  "exp": 1709654400,
  "iat": 1709050000
}
```

#### 인증 미들웨어

```
1. Authorization 헤더에서 Bearer 토큰 추출
2. JWT 서명 검증 + 만료 확인
3. DB에서 사용자 조회 (존재 확인)
4. 요청 컨텍스트에 사용자 정보 저장
5. 권한 부족 시 403, 토큰 없음/만료 시 401
```

### 4.2 주문

#### 주문 생성 로직

```
1. productId로 상품 조회
2. 재고 확인 (in_stock === true)
3. 가격 계산: unit_price = product.price, total_price = unit_price * quantity
4. 주문 ID 생성: 'ORD-{timestamp}-{random4}'
5. 회원이면 user_id 설정, 비회원이면 NULL
6. status = 'pending'으로 INSERT
7. 계좌이체 정보와 함께 응답
```

#### 주문 상태 전이 규칙

```
pending  → paid      (입금 확인)
paid     → shipping  (배송 시작)
shipping → delivered  (배송 완료)

역방향 전이 불가.
pending에서 바로 shipping/delivered 불가.
```

#### 관리자 주문 목록 필터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| status | string | 상태별 필터 |
| page | number | 페이지 번호 |
| limit | number | 페이지당 항목 수 |
| search | string | 주문자명 또는 전화번호 검색 |

### 4.3 랭킹

#### 기록 제출 로직

```sql
-- UPSERT: 기존 기록보다 빠를 때만 갱신
INSERT INTO rankings (id, user_id, game_type, clear_time_ms)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id, game_type)
DO UPDATE SET
    clear_time_ms = LEAST(rankings.clear_time_ms, EXCLUDED.clear_time_ms),
    updated_at = NOW();
```

#### 순위 계산

```sql
SELECT
    RANK() OVER (ORDER BY clear_time_ms ASC) as rank,
    u.nickname,
    r.clear_time_ms,
    r.created_at
FROM rankings r
JOIN users u ON r.user_id = u.id
WHERE r.game_type = $1
ORDER BY r.clear_time_ms ASC
LIMIT $2;
```

### 4.4 갤러리 좋아요

```
1. gallery_likes에 (gallery_id, user_id) 존재 확인
2. 존재하면: DELETE + gallery.like_count -= 1
3. 없으면: INSERT + gallery.like_count += 1
4. 트랜잭션으로 처리 (카운트 동기화)
```

---

## 5. API 서버 디렉토리 구조 (Go 기준)

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # 엔트리포인트
├── internal/
│   ├── config/
│   │   └── config.go            # 환경변수 로드
│   ├── middleware/
│   │   ├── auth.go              # JWT 인증
│   │   ├── cors.go              # CORS
│   │   └── logger.go            # 요청 로깅
│   ├── handler/
│   │   ├── auth.go              # 인증 핸들러
│   │   ├── news.go              # 소식 핸들러
│   │   ├── product.go           # 굿즈 핸들러
│   │   ├── order.go             # 주문 핸들러
│   │   ├── ranking.go           # 랭킹 핸들러
│   │   ├── gallery.go           # 갤러리 핸들러
│   │   └── upload.go            # 파일 업로드 핸들러
│   ├── repository/
│   │   ├── user.go
│   │   ├── news.go
│   │   ├── product.go
│   │   ├── order.go
│   │   ├── ranking.go
│   │   └── gallery.go
│   ├── service/
│   │   ├── auth.go              # OAuth + JWT 로직
│   │   ├── order.go             # 주문 비즈니스 로직
│   │   └── upload.go            # S3 업로드 로직
│   └── model/
│       ├── user.go
│       ├── news.go
│       ├── product.go
│       ├── order.go
│       ├── ranking.go
│       └── gallery.go
├── migration/
│   ├── 001_create_users.up.sql
│   ├── 001_create_users.down.sql
│   ├── 002_create_news.up.sql
│   ├── ...
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── go.mod
└── go.sum
```

---

## 6. 환경변수

```env
# 서버
PORT=8080
ENV=development

# 데이터베이스
DATABASE_URL=postgres://user:pass@localhost:5432/molandolan?sslmode=disable

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY=7d

# OAuth2 - Google
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback

# OAuth2 - Kakao
KAKAO_CLIENT_ID=xxx
KAKAO_CLIENT_SECRET=xxx
KAKAO_REDIRECT_URI=http://localhost:8080/api/auth/kakao/callback

# 프론트엔드
FRONTEND_URL=http://localhost:3000

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET=molandolan-uploads
S3_REGION=ap-south-1
CDN_URL=https://cdn.molandolan.com

# 계좌이체 정보 (주문 응답에 포함)
BANK_NAME=국민은행
BANK_ACCOUNT=123-456-789012
BANK_HOLDER=모란도란
```

---

## 7. Docker 구성

### docker-compose.yml

```yaml
services:
  api:
    build: .
    ports:
      - "8080:8080"
    env_file: .env
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: molandolan
      POSTGRES_USER: molandolan
      POSTGRES_PASSWORD: molandolan
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U molandolan"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### Dockerfile

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server ./cmd/server

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/server /server
EXPOSE 8080
CMD ["/server"]
```

---

## 8. 구현 우선순위

```
Week 1: Phase 1 (인프라) + Phase 2 (인증)
  → 서버 뜨고 OAuth 로그인 동작 확인

Week 2: Phase 3 (콘텐츠 CRUD) + Phase 4 (주문)
  → 소식/굿즈 관리 + 구매 플로우 연동

Week 3: Phase 5 (랭킹) + Phase 6 (갤러리)
  → 게임 랭킹 연동 + 갤러리 업로드/좋아요/댓글
```

---

## 9. 프론트엔드 연동 체크리스트

프론트엔드가 백엔드 API로 전환할 때 변경이 필요한 파일:

| 파일 | 현재 | 변경 후 |
|------|------|---------|
| `lib/auth-context.tsx` | localStorage mock | OAuth redirect + `/api/auth/me` 호출 |
| `lib/order-store.ts` | localStorage | `POST /api/orders`, `GET /api/orders` |
| `data/news.ts` | 정적 데이터 | `GET /api/news` fetch |
| `data/products.ts` | 정적 데이터 | `GET /api/products` fetch |
| `data/gallery.ts` | 정적 데이터 | `GET /api/gallery` fetch |
| `data/games.ts` | 정적 데이터 | 게임 목록은 정적 유지 가능 |
| `app/login/page.tsx` | ID/PW 폼 | Google/Kakao 소셜 로그인 버튼 |
| `src/core/ApiClient.ts` | mock 호출 | 실제 API 호출 |
| `src/core/AuthService.ts` | localStorage | JWT 토큰 기반 |

---

## 10. 보안 체크리스트

- [ ] JWT secret 최소 32자 이상
- [ ] CORS origin을 프론트엔드 도메인으로 제한
- [ ] 파일 업로드 크기 제한 (이미지 10MB, 동영상 50MB)
- [ ] 파일 업로드 MIME 타입 검증 (확장자만으로 판단 금지)
- [ ] SQL injection 방지 (parameterized query 사용)
- [ ] 주문 가격을 서버에서 재계산 (클라이언트 전송 가격 무시)
- [ ] rate limiting 적용 (특히 주문 생성, 랭킹 제출)
- [ ] admin 엔드포인트 접근 제어 미들웨어
- [ ] OAuth state 파라미터 CSRF 방지
- [ ] 환경변수를 코드에 하드코딩 금지
