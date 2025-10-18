# 🗄️ DB 캐시 확인 가이드 (초보자용)

> 데이터베이스를 잘 모르시는 분도 쉽게 따라할 수 있는 가이드입니다!

## 📋 목차
1. [Vercel 배포 에러 해결](#vercel-배포-에러-해결) ⚠️ **먼저 해결하세요!**
2. [Supabase 설정](#supabase-설정)
3. [캐시 확인 방법](#캐시-확인-방법)
4. [문제 해결](#문제-해결)

---

## ⚠️ Vercel 배포 에러 해결

### 에러 메시지:
```
Error: supabaseUrl is required.
```

### 원인:
Vercel에 Supabase 환경 변수가 설정되지 않았습니다.

### 해결 방법:

#### 1단계: Supabase 키 복사하기
1. https://supabase.com 접속 → 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴 **⚙️ Settings** → **API** 클릭
4. 다음 3개를 복사해두세요:
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** key (eyJhbG...)
   - **service_role** key (eyJhbG...) ⚠️ **비밀번호처럼 관리!**

#### 2단계: Vercel에 환경 변수 추가
1. https://vercel.com 접속 → 로그인
2. 프로젝트 선택 (Crypto-News-Letter)
3. 상단 **Settings** 클릭
4. 왼쪽 **Environment Variables** 클릭
5. **하나씩** 추가:

```bash
# ① OpenAI API Key
Key: OPENAI_API_KEY
Value: sk-proj-xxxxx (본인 키)
Environment: Production, Preview, Development (모두 체크)

# ② Supabase URL
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co
Environment: Production, Preview, Development (모두 체크)

# ③ Supabase Public Key
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOi...
Environment: Production, Preview, Development (모두 체크)

# ④ Supabase Service Key (⭐ 제일 중요!)
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOi...
Environment: Production, Preview, Development (모두 체크)

# ⑤ Cron 비밀키
Key: CRON_SECRET
Value: cnl_secret_2024_abc (아무 문자열)
Environment: Production, Preview, Development (모두 체크)
```

#### 3단계: 재배포
1. 상단 **Deployments** 클릭
2. 최근 배포 오른쪽 **⋯** (점 3개) 클릭
3. **Redeploy** 클릭
4. ⚠️ **"Use existing Build Cache" 체크 해제** (중요!)
5. **Redeploy** 버튼 클릭
6. 배포 로그 확인 → ✅ 성공!

---

## �️ Supabase 설정

### 1단계: 테이블 만들기

1. Supabase 대시보드 → 왼쪽 **🔧 SQL Editor** 클릭
2. **+ New query** 클릭
3. 아래 SQL을 **복사해서 붙여넣기**:

```sql
-- 캐시 테이블 생성
CREATE TABLE IF NOT EXISTS cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 (빠른 검색용)
CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);

-- 권한 부여
GRANT ALL ON cache TO service_role;
GRANT ALL ON cache TO postgres;

-- 완료 메시지
SELECT '✅ 캐시 테이블 생성 완료!' as message;
```

4. **Run** 버튼 클릭
5. 아래에 `✅ 캐시 테이블 생성 완료!` 나오면 성공!

### 2단계: 테이블 확인

왼쪽 메뉴 **📊 Table Editor** 클릭 → `cache` 테이블이 보이면 성공!

---

## 🔍 캐시 확인 방법

### 방법 1: 웹 브라우저로 확인 (가장 쉬움!)

브라우저에서 다음 URL을 열면 됩니다:

```
http://localhost:3001/admin/cache
```

또는 배포 후:
```
https://your-domain.vercel.app/admin/cache
```

**화면에서 볼 수 있는 것:**
- 📦 전체 캐시 개수
- ✅ 유효한 캐시 개수
- ⏰ 만료된 캐시 개수
- 🪙 암호화폐 캐시 개수
- 📋 각 코인별 캐시 상태 (심볼, 생성시간, 남은시간)

**버튼:**
- 🔄 새로고침: 최신 상태 다시 조회
- 🗑️ 만료 삭제: 만료된 캐시 한번에 삭제

---

### 2. API로 직접 확인

#### DB 연결 테스트 (전체 체크)
```bash
curl http://localhost:3001/api/admin/db-test
```

**확인 항목:**
- ✅ Supabase 연결
- ✅ cache 테이블 존재
- ✅ 쓰기 권한
- ✅ 읽기 권한
- ✅ 삭제 권한
- ✅ 캐시 통계

#### 캐시 상태만 확인
```bash
curl http://localhost:3001/api/admin/cache-status
```

---

## 🔧 문제 해결

### ❌ "DB 연결 실패" 에러가 나오면?

**1단계: Supabase 테이블이 있는지 확인**

Supabase 대시보드 → SQL Editor → 다음 실행:
```sql
SELECT * FROM cache LIMIT 5;
```

테이블이 없다고 나오면 → `supabase-cache-setup.sql` 파일 실행

**2단계: 환경 변수 확인**

`.env.local` 파일에 다음이 있는지 확인:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**3단계: 권한 확인**

Supabase 대시보드 → Settings → API → service_role 키 복사

---

### ✅ 정상 작동 확인 방법

1. **코인 검색**
   - 비트코인 검색
   - 터미널에서 "캐시 미스" → "캐시 저장 성공" 로그 확인

2. **캐시 확인**
   - `http://localhost:3001/admin/cache` 접속
   - "암호화폐 캐시 목록"에 BTC 표시되는지 확인

3. **캐시 히트 확인**
   - 비트코인 다시 검색 (6시간 이내)
   - 터미널에서 "캐시 히트" 로그 확인
   - 응답이 훨씬 빠름 (1-2초)

---

## 📊 로그 읽는 법

### 캐시 미스 (첫 검색)
```
🔍 캐시 조회 시도: crypto:BTC:full
❌ 캐시 미스: crypto:BTC:full
🪙 암호화폐 분석 요청: BTC
📊 BTC 데이터 조회 완료
🤖 AI 분석 완료: HOLD (70%)
💾 캐시 저장 시도: crypto:BTC:full
✅ 캐시 저장 성공, 만료: 2025-10-18 오후 8:00:00
```
**의미**: DB에 새로 저장됨 ✅

### 캐시 히트 (재검색)
```
🔍 캐시 조회 시도: crypto:BTC:full
✅ 캐시 히트: crypto:BTC:full
```
**의미**: DB에서 빠르게 가져옴 ✅

### 캐시 저장 실패 ❌
```
💾 캐시 저장 시도: crypto:BTC:full
❌ 캐시 저장 실패: [에러 메시지]
```
**해결**: 위의 문제 해결 가이드 참고

---

## 🎯 캐시 동작 방식

```
사용자가 비트코인 검색
    ↓
DB에서 crypto:BTC:full 찾기
    ↓
있음? ──YES──> 바로 반환 (1초) ✨
    ↓
   NO
    ↓
API 호출 + AI 분석 (10-15초) 🤖
    ↓
DB에 저장 (6시간 유지)
    ↓
사용자에게 반환
```

---

## 🛠️ 유용한 명령어

### 특정 코인 캐시 확인
```sql
SELECT * FROM cache 
WHERE key LIKE 'crypto:BTC:%'
AND expires_at > NOW();
```

### 오래된 캐시 삭제
```sql
DELETE FROM cache 
WHERE expires_at < NOW();
```

### 전체 캐시 초기화 (조심!)
```sql
DELETE FROM cache;
```

### 캐시 통계
```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as valid,
  COUNT(CASE WHEN key LIKE 'crypto:%' THEN 1 END) as crypto
FROM cache;
```

---

## 📱 모바일에서 확인

스마트폰 브라우저에서도 `/admin/cache` 페이지 접속 가능!
- 실시간 캐시 상태 확인
- 버튼으로 간편 관리

---

## ⚡ 성능 비교

| 상태 | 응답 시간 | 비용 |
|------|----------|------|
| 캐시 미스 | 10-15초 | OpenAI API 호출 |
| 캐시 히트 | 1-2초 | 무료 (DB만) |

**결론**: 캐시가 잘 작동하면 **10배 빠르고** API **비용 절감**! 🎉
