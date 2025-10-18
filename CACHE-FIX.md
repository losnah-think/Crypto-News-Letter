# 🔧 캐시 저장 문제 해결 가이드

## 🐛 문제점
1. 캐시가 제대로 저장되지 않음 (계속 캐시 미스 발생)
2. 가격 예측 버튼 클릭 시 스크롤 이동 안됨

## ✅ 해결 방법

### 1. 캐시 서비스 수정
- `getCryptoAnalysis()`, `setCryptoAnalysis()` 메서드 추가
- 캐시 키를 `crypto:{symbol}:full` 형식으로 통일
- 로그 개선으로 캐시 상태 명확히 표시

### 2. API 라우트 수정
- `getFullAnalysis()` → `getCryptoAnalysis()` 사용
- `setFullAnalysis()` → `setCryptoAnalysis()` 사용
- 캐시 저장 성공/실패 로그 추가

### 3. UX 개선
- 가격 예측 버튼 클릭 시 예측 섹션으로 자동 스크롤
- `#prediction-section` ID 추가
- smooth scroll 애니메이션 적용

## 📋 Supabase 설정 필수

**중요**: Supabase에 `cache` 테이블이 없으면 캐시가 작동하지 않습니다!

### 설정 방법:

1. Supabase 대시보드 접속
2. SQL Editor 열기
3. `supabase-cache-setup.sql` 파일 내용 복사
4. 실행 (Run)

### 테이블 구조:
```sql
CREATE TABLE cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🧪 테스트 방법

### 1. 캐시 저장 확인
```bash
# 첫 번째 요청 (캐시 미스)
비트코인 검색 → 터미널에서 "캐시 미스" 확인

# 두 번째 요청 (캐시 히트)
비트코인 다시 검색 → 터미널에서 "캐시 히트" 확인
```

### 2. 예측 스크롤 확인
```bash
1. 비트코인 검색
2. "🔮 가격 예측 보기" 버튼 클릭
3. 자동으로 예측 섹션으로 스크롤 이동
```

## 📊 로그 예시

### 정상 작동 시:
```
🔍 캐시 조회 시도: crypto:BTC:full
❌ 캐시 미스: crypto:BTC:full
🪙 암호화폐 분석 요청: BTC
📊 BTC 데이터 조회 완료
🤖 AI 분석 완료: HOLD (70%)
💾 캐시 저장 시도: crypto:BTC:full
✅ 캐시 저장 성공 (crypto:BTC:full), 만료: 2025-10-18 오후 8:00:00
```

### 캐시 히트 시:
```
🔍 캐시 조회 시도: crypto:BTC:full
✅ 캐시 히트: crypto:BTC:full
```

### 캐시 저장 실패 시:
```
💾 캐시 저장 시도: crypto:BTC:full
❌ 캐시 저장 실패 (crypto:BTC:full): [에러 메시지]
⚠️ 캐시 저장 실패했지만 결과는 반환: crypto:BTC
```

## 🔍 문제 해결

### 캐시가 계속 미스되는 경우:

1. **Supabase 테이블 확인**
   ```sql
   SELECT * FROM cache ORDER BY created_at DESC LIMIT 5;
   ```

2. **환경 변수 확인**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=xxx  # 반드시 service_role 키 사용
   ```

3. **권한 확인**
   - Supabase에서 `cache` 테이블에 service_role 권한 부여

4. **네트워크 확인**
   - Vercel 배포 시 Supabase URL이 올바른지 확인

### 스크롤이 작동하지 않는 경우:

1. 브라우저 콘솔에서 에러 확인
2. `#prediction-section` 요소가 DOM에 있는지 확인
3. `showPrediction` 상태가 true인지 확인

## 🎯 캐시 정책

- **캐시 키 형식**: `crypto:{SYMBOL}:full`
- **캐시 유지 시간**: 6시간 (21600초)
- **자동 만료**: 만료된 캐시는 자동으로 제거됨
- **업데이트**: 동일 키로 저장 시 자동 업데이트

## 📝 수정된 파일

1. `lib/cache-service.ts` - 캐시 메서드 추가 및 로그 개선
2. `app/api/crypto/[symbol]/route.ts` - 캐시 메서드 변경
3. `app/crypto/page.tsx` - 스크롤 이동 기능 추가
4. `README.md` - 캐시 설정 방법 추가
5. `supabase-cache-setup.sql` - 테이블 생성 스크립트 (신규)

## 🚀 배포 시 주의사항

Vercel 배포 전 반드시 확인:
- [ ] Supabase에 `cache` 테이블 생성
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 환경 변수 설정
- [ ] 테이블 권한 설정 (service_role에 CRUD 권한)
- [ ] 캐시 테이블 인덱스 생성 (`expires_at`)
