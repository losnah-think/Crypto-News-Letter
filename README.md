# 🪙 CNL - Crypto News Letter

AI 기반 암호화폐 분석 서비스

## 🌟 주요 기능

- 📊 **실시간 데이터** - CoinGecko API 기반 실시간 코인 가격 및 시장 정보
- 🤖 **AI 분석** - GPT-4o-mini 기반 투자 의견 및 기술적 분석
- 💰 **투자 가격대** - 진입가, 1~3차 목표가, 손절가 가이드
- 📈 **기술적 지표** - RSI, 추세, 지지선, 저항선 분석
- 😱 **Fear & Greed Index** - 시장 심리 지수
- 🔮 **가격 예측** - 1일/7일/30일 후 가격 예측 (재미용)

## 🚀 지원 코인

BTC, ETH, DOGE, XRP, SOL, ADA, MATIC, DOT 등 20+ 코인

## ��️ 기술 스택

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **AI**: OpenAI GPT-4o-mini
- **Database**: Supabase (PostgreSQL)
- **API**: CoinGecko, Alternative.me
- **Deploy**: Vercel

## 📦 설치 및 실행

```bash
npm install
npm run dev
```

## 🔑 환경 변수

```bash
OPENAI_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
```

## 📝 사용법

1. 코인 심볼 입력 (예: BTC, ETH, DOGE)
2. AI 분석 결과 확인
3. 투자 가격대 가이드 참고
4. 가격 예측 확인 (선택)

## ⚠️ 면책 조항

이 서비스는 투자 권유가 아닌 정보 제공 목적입니다. 
모든 투자 결정은 본인의 책임 하에 이루어져야 합니다.

## 🔗 관련 프로젝트

- [SNL (Stock News Letter)](https://github.com/losnah-think/Stock-News-Letter) - 주식 분석 서비스
