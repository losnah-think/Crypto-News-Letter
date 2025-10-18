# ✅ Vercel 배포 체크리스트

## 🚨 배포 전 필수 확인 사항

### 1. Supabase 테이블 생성 ✅
- [ ] Supabase 대시보드 접속
- [ ] SQL Editor에서 `supabase-cache-setup.sql` 실행
- [ ] `cache` 테이블 생성 확인
- [ ] 권한 부여 완료

### 2. Vercel 환경 변수 설정 ✅

Vercel 대시보드 → Settings → Environment Variables

```bash
✅ OPENAI_API_KEY=sk-proj-xxxxx
✅ NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
✅ SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
✅ CRON_SECRET=your-secret-key
```

**⚠️ 중요**: 모든 환경 변수에서 **Production, Preview, Development** 모두 체크!

### 3. 재배포 ✅
- [ ] Deployments → 최근 배포 → ⋯ → Redeploy
- [ ] **"Use existing Build Cache" 체크 해제**
- [ ] Redeploy 클릭
- [ ] 빌드 로그에서 에러 확인

---

## 🔍 배포 성공 확인

### 1. 빌드 로그 확인
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### 2. 사이트 접속
- 배포된 URL 접속 (예: https://crypto-news-letter.vercel.app)
- 비트코인 검색 테스트
- 가격 예측 버튼 클릭 테스트

### 3. 기능 테스트
- [ ] 코인 검색 정상 작동
- [ ] AI 분석 결과 표시
- [ ] 장기 전망 표시
- [ ] 가격 예측 작동
- [ ] 거래소 바로가기 링크 작동

---

## ❌ 빌드 에러 해결

### "supabaseUrl is required"
→ Vercel에 `NEXT_PUBLIC_SUPABASE_URL` 환경 변수 추가

### "OPENAI_API_KEY is not set"
→ Vercel에 `OPENAI_API_KEY` 환경 변수 추가

### "table cache does not exist"
→ Supabase에서 `supabase-cache-setup.sql` 실행

### "permission denied for table cache"
→ Supabase SQL Editor에서 권한 부여:
```sql
GRANT ALL ON cache TO service_role;
GRANT ALL ON cache TO postgres;
```

---

## 📝 환경 변수 찾는 방법

### OpenAI API Key
1. https://platform.openai.com 접속
2. API keys 메뉴
3. Create new secret key
4. 복사 (다시 볼 수 없으니 안전한 곳에 저장!)

### Supabase Keys
1. https://supabase.com 접속
2. 프로젝트 선택
3. Settings → API
4. Project URL, anon key, service_role key 복사

---

## 🎯 빠른 문제 해결

### 문제: 배포는 성공했는데 사이트가 안 열려요
→ 몇 분 기다렸다가 다시 시도 (DNS 전파 시간)

### 문제: 코인 검색이 안 돼요
→ Vercel Function Logs 확인 (Deployments → 배포 클릭 → Functions 탭)

### 문제: 캐시가 작동 안 해요
→ Supabase 테이블과 권한 확인 (DB-CHECK-GUIDE.md 참고)

---

## 🔄 환경 변수 변경 후

1. **로컬에서 테스트**
   ```bash
   npm run dev
   # 코인 검색 테스트
   ```

2. **변경사항 커밋 & 푸시**
   ```bash
   git add .
   git commit -m "환경 변수 업데이트"
   git push
   ```

3. **Vercel 재배포**
   - 자동 배포 or 수동 Redeploy

---

## 📱 최종 확인

- [ ] 데스크톱 브라우저에서 정상 작동
- [ ] 모바일 브라우저에서 정상 작동
- [ ] 인기 코인 버튼 클릭 테스트
- [ ] 한글 검색 테스트 ("비트코인")
- [ ] 영문 검색 테스트 ("BTC")

---

## 🎉 성공!

모든 체크리스트를 완료하셨다면 축하합니다! 🎊

이제 아버지께서 편하게 사용하실 수 있습니다!
