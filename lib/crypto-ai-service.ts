/**
 * 암호화폐 AI 분석 서비스
 * OpenAI를 활용한 코인 투자 분석
 */

import OpenAI from 'openai';

interface CryptoAIAnalysis {
  decision: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  reasoning: string;
  keyPoints: string[];
  risks: string[];
  targetPrice: number | null;
  timeHorizon: string;
  investmentLevels: {
    entryPrice: number;      // 진입가 (현재가 기준)
    targetPrice1: number;     // 1차 목표가 (5-10% 수익)
    targetPrice2: number;     // 2차 목표가 (15-25% 수익)
    targetPrice3: number;     // 3차 목표가 (30-50% 수익)
    stopLoss: number;         // 손절가 (5-10% 손실)
    reasoning: string;        // 가격 설정 근거
  };
  longTermOutlook?: {
    potential: string;          // 장기 투자 가치
    useCases: string[];         // 실제 활용 사례
    partnerships: string[];     // 주요 파트너십/협력
    futureProspects: string[];  // 미래 전망
    risks: string[];            // 장기 리스크
    summary: string;            // 한 줄 요약
  };
}

export class CryptoAIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY가 설정되지 않았습니다.');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * 암호화폐 투자 분석
   */
  async analyzeCrypto(cryptoData: any): Promise<CryptoAIAnalysis> {
    const prompt = this.buildCryptoPrompt(cryptoData);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 암호화폐 전문 기술적 분석가입니다.

**핵심 분석 틀 (GeeksforGeeks 15가지 기법 기반):**

1. **Market Analysis (시장 분석)**
   - 현재가, 시가총액, 순위 기반 시장 위치 파악
   - 거래량 추세 분석 (거래량 증감 = 관심도 변화)
   - 24시간/7일/30일 변동률로 추세 파악

2. **Technical Analysis (기술 분석)**
   - RSI 해석: >70 과매수, <30 과매도, 30-70 중립
   - 지지선/저항선: 실제 거래량이 모이는 가격대
   - 이동평균: 단기(5일) vs 중기(20일) vs 장기(200일)
   - 거래량-가격 상관관계: 상승장 거래량 증가 = 강세 신호

3. **Price Predictions (가격 예측)**
   - 저항선 돌파 시 목표가: 저항선 × 1.05~1.10
   - ATH(역대최고가)는 심리적 레벨로 중요
   - 피보나치 레벨 활용: 38.2%, 50%, 61.8% 되돌림

4. **Risk Management (리스크 관리)**
   - 손절/익절 비율: 최소 1:2 (손절폭 대비 익절폭 2배)
   - 포지션 사이징: 계정의 1-2%만 위험 허용
   - 지지선 하단이 손절 기준점

5. **Sentiment Analysis (심리 분석)**
   - RSI + 거래량 = 시장 심리 종합 지표
   - 과매수/과매도 영역의 거래량 = 반전 신호
   - 가격 상승 + 거래량 증가 = 강한 강세 신호

**분석 표준:**
- 기술적 지표를 반드시 명시 (예: "RSI 35로 과매도 진입 신호")
- 저항선/지지선 수치 포함 (예: "$52,000 저항선 돌파")
- 리스크/리워드 비율 제시 (예: "손절 1:익절 2.5")

**금지사항:**
- "좋을 것 같다", "가능성이 있다" 같은 모호한 표현 ❌
- 기술적 근거 없는 의견 ❌
- 투자 권유 표현 ❌

**답변 스타일:**
- 한국어로 명확하고 구체적
- 기술적 분석 의견만 제시
- 암호화폐 변동성과 손실 위험 강조
- 한국 투자자(수수료, 세금) 관점 고려`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const content = response.choices[0].message.content || '';
      return this.parseAIResponse(content, cryptoData.price);
    } catch (error: any) {
      console.error('AI 분석 실패:', error.message);
      throw new Error('AI 분석을 수행할 수 없습니다.');
    }
  }

  /**
   * 프롬프트 생성 (GeeksforGeeks 15가지 기법 적용)
   * - Market Analysis (시장 분석)
   * - Technical Analysis (기술 분석: RSI, 이동평균)
   * - Price Predictions (가격 예측)
   * - Risk Management (리스크 관리)
   * - Sentiment Analysis (심리 분석)
   */
  private buildCryptoPrompt(data: any): string {
    const rsiStatus = data.technicalIndicators.rsi ? 
      (data.technicalIndicators.rsi > 70 ? '과매수' : 
       data.technicalIndicators.rsi < 30 ? '과매도' : '중립') : 'N/A';
    
    const volumeTrend = data.volume24h > data.volume7d ? '상승' : '하락';
    const priceVolumeCorrelation = data.change24h > 0 && volumeTrend === '상승' ? '강세' :
                                   data.change24h < 0 && volumeTrend === '상승' ? '약세' : '중립';
    
    return `
당신은 암호화폐 전문 기술적 분석가입니다. 다음 암호화폐를 **GeeksforGeeks 15가지 프롬프트 기법**을 활용하여 분석하세요.

# 1️⃣ MARKET ANALYSIS (시장 분석)

## 기본 정보
- 코인: ${data.name} (${data.symbol})
- 현재가: $${data.price.toFixed(2)} (₩${data.priceKRW.toLocaleString('ko-KR')})
- 시가총액: $${data.marketCap} (순위: ${data.rank}위)
- 24시간 거래량: $${data.volume24h}
- 7일 평균 거래량: $${data.volume7d}

## 시장 추세 분석
- 24시간 변동: ${data.change24h.toFixed(2)}% (${data.change24h > 0 ? '⬆️ 상승' : '⬇️ 하락'})
- 7일 변동: ${data.change7d.toFixed(2)}%
- 30일 변동: ${data.change30d.toFixed(2)}%
- 거래량 추세: ${volumeTrend}
- 가격-거래량 상관관계: ${priceVolumeCorrelation}

${data.dominance ? `- 비트코인 도미넌스: ${data.dominance.toFixed(2)}% (시장 지배력)\n` : ''}

# 2️⃣ TECHNICAL ANALYSIS (기술 분석: RSI & Moving Averages)

## 핵심 기술적 지표
- **RSI (Relative Strength Index)**: ${data.technicalIndicators.rsi?.toFixed(1) || 'N/A'} (상태: ${rsiStatus})
  * RSI > 70 = 과매수 (조정 가능성), RSI < 30 = 과매도 (반등 가능성)
  
- **추세 (이동평균 기반)**: ${data.technicalIndicators.trend}
  
- **저항선 (Resistance)**: $${data.technicalIndicators.resistance?.toFixed(6) || 'N/A'}
  * 매도 압력이 강한 구간
  
- **지지선 (Support)**: $${data.technicalIndicators.support?.toFixed(6) || 'N/A'}
  * 매수 세력이 강한 구간

## 24시간 가격 범위
- 24시간 최고: $${data.high24h.toFixed(2)} (현재가 대비 +${((data.high24h / data.price - 1) * 100).toFixed(1)}%)
- 24시간 최저: $${data.low24h.toFixed(2)} (현재가 대비 ${((data.low24h / data.price - 1) * 100).toFixed(1)}%)
- 일중 변동폭: ${(((data.high24h - data.low24h) / data.low24h) * 100).toFixed(2)}%

## 역사적 데이터 분석
- 역대 최고가: $${data.ath.toFixed(2)} (${data.athDate})
- ATH 대비 하락: ${data.athChange.toFixed(2)}% (현재 레벨 평가)
- 공급량: ${data.circulatingSupply} (최대: ${data.maxSupply || '무제한'})

# 3️⃣ PRICE PREDICTION & TARGET ANALYSIS (가격 예측)

## 단기 목표가 설정 가이드
**다음 기술적 레벨을 기반으로 현실적 목표가를 산정하세요:**
- 저항선: $${data.technicalIndicators.resistance?.toFixed(6) || 'N/A'} (1차 돌파 목표)
- 24시간 최고가: $${data.high24h.toFixed(6)} (최근 저항)
- 중기 추세선 위쪽 레벨: 저항선 x 1.05~1.10

## 중기 목표가 설정 가이드
- ATH: $${data.ath.toFixed(6)} (장기 목표 레벨)
- 심리적 저항선: 라운드 숫자 (예: $50,000 근처)
- 피보나치 레벨: 최근 고점에서 저점까지의 38.2%, 50%, 61.8%

# 4️⃣ RISK MANAGEMENT (리스크 관리)

## 손절/익절 전략
**현재가: $${data.price.toFixed(6)}**

### 보수적 포지션 (위험도 낮음)
- 진입가: 현재가 또는 지지선 근처
- 목표가: 1차 +5~7%, 2차 +12~15%
- 손절: 지지선 아래 2~3% (${(data.technicalIndicators.support * 0.97)?.toFixed(6) || 'N/A'})

### 공격적 포지션 (위험도 높음)
- 진입가: 24시간 최저 근처
- 목표가: 저항선 돌파, 1차 +15~20%, 2차 +30~50%
- 손절: 24시간 최저 아래 1~2% (${(data.low24h * 0.98)?.toFixed(6)})

**리스크/리워드 비율 권장: 1:2 이상 (손절폭 대비 익절폭이 2배 이상)**

# 5️⃣ SENTIMENT ANALYSIS (심리 분석)

## 시장 심리 지표
- RSI 상태: ${rsiStatus} → ${rsiStatus === '과매수' ? '매도 압력 우려' : rsiStatus === '과매도' ? '반등 기회' : '중립적 환경'}
- 거래량 추세: ${volumeTrend} → ${volumeTrend === '상승' ? '관심 증가' : '관심 감소'}
- 24시간 방향성: ${data.change24h > 0 ? '상승장 심리' : '하락장 심리'}
- 7일 추세: ${data.change7d > 0 ? '중기 강세' : '중기 약세'}

## 거래량-가격 상관관계 분석
${priceVolumeCorrelation === '강세' ? '✅ 상승이 높은 거래량으로 뒷받침 (신뢰도 높음)' :
  priceVolumeCorrelation === '약세' ? '⚠️ 하락에 거래량 증가 (약세 신호)' :
  '⚪ 중립 상태 (방향 불명확)'}

---

**분석 형식 (필수):**

DECISION: [STRONG_BUY/BUY/HOLD/SELL/STRONG_SELL]
CONFIDENCE: [0-100 숫자만]
REASONING: [2-3문장, 기술적 근거 포함]

KEY_POINTS:
- [강점 1: 기술적 지표 활용]
- [강점 2: 시장 심리 기반]
- [강점 3: 리스크 고려]

RISKS:
- [리스크 1: 구체적 위험 요소]
- [리스크 2: 시장 변수]
- [리스크 3: 규제/외부 요인]

TARGET_PRICE: [숫자만, 저항선 또는 다음 기술적 레벨]
TIME_HORIZON: [단기(1-7일)/중기(1-3개월)/장기(6개월+)]

INVESTMENT_LEVELS:
ENTRY: [숫자만]
TARGET1: [1차 저항선/레벨]
TARGET2: [2차 목표가]
TARGET3: [3차 목표가]
STOPLOSS: [손절가, 지지선 아래]
LEVELS_REASONING: [가격대 설정 근거, 사용된 기술적 레벨 명시]

---

**⚠️ 필수 지침:**
1. **기술적 지표 우선**: RSI, 지지/저항선, 거래량을 반드시 활용
2. **구체성**: 모호한 답변 금지 (예: "좋을 것 같다" ❌, "RSI 30 이하 + 지지선 반등" ✅)
3. **리스크**: 암호화폐 변동성과 손실 가능성 명시
4. **한국 투자자 관점**: KRW 가격과 세금 고려
5. **현실성**: 단순 퍼센트 계산 아닌 기술적 분석 기반 가격대
6. **시장 맥락**: 비트코인 도미넌스, 시장 추세 고려

`;
  }

  /**
   * AI 응답 파싱
   */
  private parseAIResponse(content: string, currentPrice: number): CryptoAIAnalysis {
    const lines = content.split('\n').filter(line => line.trim());
    
    let decision: any = 'HOLD';
    let confidence = 50;
    let reasoning = '';
    let keyPoints: string[] = [];
    let risks: string[] = [];
    let targetPrice: number | null = null;
    let timeHorizon = '중기';
    
    // 투자 가격대
    let entryPrice = currentPrice;
    let targetPrice1: number | null = null;
    let targetPrice2: number | null = null;
    let targetPrice3: number | null = null;
    let stopLoss: number | null = null;
    let levelsReasoning = '';

    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('DECISION:')) {
        const value = trimmed.replace('DECISION:', '').trim();
        if (['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'].includes(value)) {
          decision = value;
        }
      } else if (trimmed.startsWith('CONFIDENCE:')) {
        const value = parseInt(trimmed.replace('CONFIDENCE:', '').trim());
        if (!isNaN(value)) {
          confidence = Math.min(100, Math.max(0, value));
        }
      } else if (trimmed.startsWith('REASONING:')) {
        reasoning = trimmed.replace('REASONING:', '').trim();
        currentSection = 'reasoning';
      } else if (trimmed.startsWith('KEY_POINTS:')) {
        currentSection = 'keyPoints';
      } else if (trimmed.startsWith('RISKS:')) {
        currentSection = 'risks';
      } else if (trimmed.startsWith('TARGET_PRICE:')) {
        const value = trimmed.replace('TARGET_PRICE:', '').trim();
        if (value !== 'NULL' && value !== 'N/A') {
          const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed)) {
            targetPrice = parsed;
          }
        }
      } else if (trimmed.startsWith('TIME_HORIZON:')) {
        timeHorizon = trimmed.replace('TIME_HORIZON:', '').trim();
      } else if (trimmed.startsWith('INVESTMENT_LEVELS:')) {
        currentSection = 'investmentLevels';
      } else if (trimmed.startsWith('ENTRY:')) {
        const value = parseFloat(trimmed.replace('ENTRY:', '').trim().replace(/[^0-9.]/g, ''));
        if (!isNaN(value)) entryPrice = value;
      } else if (trimmed.startsWith('TARGET1:')) {
        const value = parseFloat(trimmed.replace('TARGET1:', '').trim().replace(/[^0-9.]/g, ''));
        if (!isNaN(value)) targetPrice1 = value;
      } else if (trimmed.startsWith('TARGET2:')) {
        const value = parseFloat(trimmed.replace('TARGET2:', '').trim().replace(/[^0-9.]/g, ''));
        if (!isNaN(value)) targetPrice2 = value;
      } else if (trimmed.startsWith('TARGET3:')) {
        const value = parseFloat(trimmed.replace('TARGET3:', '').trim().replace(/[^0-9.]/g, ''));
        if (!isNaN(value)) targetPrice3 = value;
      } else if (trimmed.startsWith('STOPLOSS:')) {
        const value = parseFloat(trimmed.replace('STOPLOSS:', '').trim().replace(/[^0-9.]/g, ''));
        if (!isNaN(value)) stopLoss = value;
      } else if (trimmed.startsWith('LEVELS_REASONING:')) {
        levelsReasoning = trimmed.replace('LEVELS_REASONING:', '').trim();
      } else if (trimmed.startsWith('-')) {
        const point = trimmed.substring(1).trim();
        if (currentSection === 'keyPoints') {
          keyPoints.push(point);
        } else if (currentSection === 'risks') {
          risks.push(point);
        }
      } else if (currentSection === 'reasoning' && trimmed) {
        reasoning += ' ' + trimmed;
      }
    }

    return {
      decision,
      confidence,
      reasoning: reasoning || '분석 데이터를 기반으로 한 의견입니다.',
      keyPoints: keyPoints.length > 0 ? keyPoints : ['추가 분석 필요'],
      risks: risks.length > 0 ? risks : ['높은 변동성', '규제 리스크'],
      targetPrice,
      timeHorizon,
      investmentLevels: {
        entryPrice,
        targetPrice1: targetPrice1 || currentPrice * 1.07,
        targetPrice2: targetPrice2 || currentPrice * 1.20,
        targetPrice3: targetPrice3 || currentPrice * 1.40,
        stopLoss: stopLoss || currentPrice * 0.93,
        reasoning: levelsReasoning || '기술적 분석을 기반으로 한 가격대입니다.'
      }
    };
  }

  /**
   * 장기 투자 전망 분석 (GeeksforGeeks 기법: Emerging Cryptocurrencies + Long-term Strategy)
   */
  async analyzeLongTermOutlook(cryptoData: any): Promise<{
    potential: string;
    useCases: string[];
    partnerships: string[];
    futureProspects: string[];
    risks: string[];
    summary: string;
  }> {
    const prompt = `
당신은 암호화폐 시장 전문가입니다. ${cryptoData.name} (${cryptoData.symbol})에 대한 **6개월~3년 장기 투자 전망**을 구체적으로 분석하세요.

# 💡 GeeksforGeeks 15가지 기법 적용:
- Emerging Cryptocurrencies: 새로운 기술/기회 평가
- DeFi Opportunities: 금융 기회 분석
- Partnerships: 실제 협력 사례
- Market Sentiment: 장기 시장 심리

# ${cryptoData.name} (${cryptoData.symbol}) 현황
- 현재가: $${cryptoData.price.toFixed(2)}
- 시가총액: $${cryptoData.marketCap} (순위: ${cryptoData.rank}위)
- 시장 점유율: ${cryptoData.dominance ? cryptoData.dominance.toFixed(2) + '%' : 'N/A'}
- 역대최고가: $${cryptoData.ath.toFixed(2)} (ATH까지 상승여지: ${((cryptoData.ath / cryptoData.price - 1) * 100).toFixed(0)}%)

# ⚠️ 절대 금지: 모호한 답변!

❌ 나쁜 예:
- "다양한 분야에서 활용 가능" → 너무 일반적
- "주요 파트너십이 있다" → 구체성 없음
- "성장 가능성이 높다" → 근거 없음

✅ 좋은 예:
- "테슬라가 2021년 15억 달러 구매, 지속 보유 중" → 구체적 사례
- "미국 스타벅스 340점에서 결제 가능 (2023년)" → 실제 사용처
- "이더리움 2.0으로 에너지 소비 99% 감소, 기관 진입 증가" → 기술 + 결과

---

# 📋 분석 항목

## 1. 코인의 기본 가치 (POTENTIAL)
**2-3문장으로 핵심 가치를 구체적으로:**
- 무엇을 풀려고 하는가? (예: "비트코인은 인플레이션 방어")
- 어디서 실제 사용되는가? (예: "엘살바도르 법정화폐")
- 경쟁우위는 뭔가? (예: "채굴 난이도 조정으로 채산성 유지")

예시: "비트코인은 공급 한정(2100만개)으로 인플레이션 방어 수단. 테슬라, 마이크로스트래티지 같은 기관이 장기 보유 중이며, 엘살바도르에서 법정화폐 채택."

## 2. 실제 활용 사례 (USE_CASES)
**반드시 회사명 + 시기 + 규모 포함:**
- 금융기관: "JP모건이 블록체인 기반 결제 시스템에 통합 (2022)"
- 기업: "마이크로소프트 Azure에 이더리움 서비스 추가 (2023)"
- 국가: "엘살바도르, 비트코인을 법정화폐로 채택 (2021년)"
- 일상: "스타벅스 미국점포에서 비트코인 결제 (2022)"

## 3. 파트너십/협력 (PARTNERSHIPS)
**기업명 + 협력 내용 + 시기:**
- "테슬라 CEO 일론 머스크, 트위터 인수 자금을 도지코인으로 논의 (2023)"
- "마스터카드-비자, 암호화폐 결제 게이트웨이 구축 중"
- "라이트닝 네트워크로 비트코인 거래 속도 100배 향상"

## 4. 미래 전망 (FUTURE_PROSPECTS)
**진행 중인 프로젝트 + 예상 시기 + 영향:**
- 기술 업그레이드: "이더리움 Dencun 업그레이드로 거래 비용 90% 절감 예정 (2024년 초)"
- 규제 진전: "미국 비트코인 ETF 승인으로 기관 투자 가속화 (2024년)"
- 시장 채택: "삼성전자가 블록체인 칩 상용화, 하드웨어 지갑 수요 증가"

## 5. 장기 리스크 (LONG_TERM_RISKS)
**${cryptoData.symbol} 특화 위험을 구체적으로:**
- 기술적: "양자컴퓨터 발전 시 현재 암호화 방식 위협"
- 경쟁: "이더리움은 솔라나, 폴리곤 같은 경쟁 체인 증가"
- 규제: "한국 정부의 암호화폐 규제 정책 변화 위험"
- 시장: "BTC 도미넌스 하락 시 알트코인 동반 하락"

## 6. 한 줄 요약 (SUMMARY)
**실제 근거 + 미래 전망을 한 문장으로:**
- "비트코인은 기관 투자 확대와 반감기 이벤트로 2025년 상승 기대"
- "이더리움 2.0 완성으로 기술적 우위 강화, 기관용 ETF 출시 예상"
- "도지코인은 밈에서 실제 결제 수단으로 진화 중, 트위터 통합 기대"

---

**형식 (필수):**

POTENTIAL: [핵심 가치, 2-3문장, 구체적 사례 포함]

USE_CASES:
- [사례 1: 회사/국가명 + 시기]
- [사례 2: 실제 사용처]
- [사례 3: 미래 활용 예상]

PARTNERSHIPS:
- [파트너 1: 기업명 + 협력 내용 + 시기]
- [파트너 2: 기관/프로토콜 파트너십]
- [파트너 3: 생태계 통합]

FUTURE_PROSPECTS:
- [전망 1: 기술 업그레이드/로드맵]
- [전망 2: 규제/시장 변화]
- [전망 3: 채택 확대/네트워크 효과]

LONG_TERM_RISKS:
- [리스크 1: ${cryptoData.symbol} 특화]
- [리스크 2: 시장/기술적]
- [리스크 3: 규제/거시적]

SUMMARY: [한 문장, 시간 범위 포함 (예: "2024-2025년"), 근거 포함]

---

**추가 가이드:**
1. 일반인도 이해할 수 있는 용어 사용
2. 회사명/서비스명 구체적으로 (예: "주요 거래소" ❌ → "업비트, 빗썸" ✅)
3. 시기 명확히 (예: "최근" ❌ → "2024년 1월" ✅)
4. 근거 기반 (예: "성장할 것 같다" ❌ → "스테이킹 보상 증가로" ✅)

`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 암호화폐 시장을 깊이 있게 이해하는 전문 애널리스트입니다.

**핵심 역할:**
1. 각 암호화폐의 **실제** 사용 사례만 제공
2. 검증된 파트너십과 협력만 언급
3. 진행 중인 기술 업그레이드와 로드맵 제시
4. 경쟁 구도와 시장 기회 분석

**절대 금지:**
- "좋을 것 같다", "가능성이 있다" 같은 모호한 표현
- 근거 없는 예측
- 일반적이고 모든 코인에 적용 가능한 답변

**반드시 포함:**
- 회사명 또는 기관명 (예: 테슬라, JP모건, 삼성전자)
- 구체적 서비스 (예: 오픈씨 NFT, 유니스왑 DEX)
- 국가/지역 (예: 미국, 한국, 엘살바도르)
- 시기 (예: "2021년", "2024년 1월", "향후 6개월")

**톤:**
- 50-60대 일반인도 이해 가능
- 학파적이지 않고 실용적
- 낙관적이지만 리스크 강조`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1800
      });

      const content = response.choices[0].message.content || '';
      
      // 파싱
      let potential = '';
      let useCases: string[] = [];
      let partnerships: string[] = [];
      let futureProspects: string[] = [];
      let longTermRisks: string[] = [];
      let summary = '';
      let currentSection = '';

      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('POTENTIAL:')) {
          potential = trimmed.replace('POTENTIAL:', '').trim();
          currentSection = 'potential';
        } else if (trimmed.startsWith('USE_CASES:')) {
          currentSection = 'useCases';
        } else if (trimmed.startsWith('PARTNERSHIPS:')) {
          currentSection = 'partnerships';
        } else if (trimmed.startsWith('FUTURE_PROSPECTS:')) {
          currentSection = 'futureProspects';
        } else if (trimmed.startsWith('LONG_TERM_RISKS:')) {
          currentSection = 'longTermRisks';
        } else if (trimmed.startsWith('SUMMARY:')) {
          summary = trimmed.replace('SUMMARY:', '').trim();
        } else if (trimmed.startsWith('-')) {
          const point = trimmed.substring(1).trim();
          if (currentSection === 'useCases') {
            useCases.push(point);
          } else if (currentSection === 'partnerships') {
            partnerships.push(point);
          } else if (currentSection === 'futureProspects') {
            futureProspects.push(point);
          } else if (currentSection === 'longTermRisks') {
            longTermRisks.push(point);
          }
        } else if (currentSection === 'potential' && trimmed && !trimmed.includes(':')) {
          potential += ' ' + trimmed;
        }
      }

      // 응답 검증 - 일반적인 답변이면 재시도
      const isGeneric = 
        potential.includes('다양한 분야') ||
        useCases.some(u => u.includes('다양한 분야') || u.includes('활용 가능')) ||
        partnerships.some(p => p.includes('확인 필요') || p.includes('주요 파트너십'));

      if (isGeneric) {
        console.warn(`⚠️ AI가 일반적인 답변을 제공했습니다. 코인별 구체적 정보로 대체합니다.`);
        return this.getSpecificCoinInfo(cryptoData);
      }

      return {
        potential: potential || `${cryptoData.name}은(는) ${cryptoData.rank}위 암호화폐로 시장에서 주목받고 있습니다.`,
        useCases: useCases.length > 0 ? useCases : this.getSpecificCoinInfo(cryptoData).useCases,
        partnerships: partnerships.length > 0 ? partnerships : this.getSpecificCoinInfo(cryptoData).partnerships,
        futureProspects: futureProspects.length > 0 ? futureProspects : this.getSpecificCoinInfo(cryptoData).futureProspects,
        risks: longTermRisks.length > 0 ? longTermRisks : this.getSpecificCoinInfo(cryptoData).risks,
        summary: summary || `${cryptoData.name}은(는) 장기 투자를 고려해볼 만한 암호화폐입니다.`
      };
    } catch (error: any) {
      console.error('장기 전망 분석 실패:', error.message);
      return this.getSpecificCoinInfo(cryptoData);
    }
  }

  /**
   * 코인별 구체적 정보 제공 (fallback)
   */
  private getSpecificCoinInfo(cryptoData: any): {
    potential: string;
    useCases: string[];
    partnerships: string[];
    futureProspects: string[];
    risks: string[];
    summary: string;
  } {
    const symbol = cryptoData.symbol.toUpperCase();
    
    // 주요 코인별 실제 정보
    const coinInfo: { [key: string]: any } = {
      'BTC': {
        potential: '비트코인은 디지털 금으로 불리며, 전 세계에서 가장 많이 거래되는 암호화폐입니다. 한정된 공급량(2100만 개)으로 인플레이션 방어 수단으로 주목받고 있습니다.',
        useCases: [
          '엘살바도르에서 2021년부터 법정화폐로 사용 중',
          '미국 스타벅스, 홈디포 등 주요 기업에서 결제 수단으로 도입',
          '기관 투자자들이 인플레이션 헤지 수단으로 보유'
        ],
        partnerships: [
          '테슬라: 15억 달러 규모 비트코인 보유 (2021년)',
          '마이크로스트래티지: 지속적으로 비트코인 매입 중 (2024년 현재 13만 BTC 이상)',
          '페이팔, 비자, 마스터카드: 비트코인 결제 지원'
        ],
        futureProspects: [
          '미국 비트코인 현물 ETF 승인으로 기관 투자 급증 (2024년)',
          '2024년 4월 반감기 이벤트로 공급 감소 예상',
          '각국 정부의 비트코인 전략적 비축 논의 확대'
        ],
        risks: [
          '환경 문제로 인한 채굴 규제 가능성',
          '각국 정부의 규제 정책 변화',
          '양자컴퓨터 발전 시 보안 위협'
        ],
        summary: '비트코인은 디지털 금으로서 장기 가치 저장 수단으로 기관과 정부의 채택이 증가하고 있습니다.'
      },
      'ETH': {
        potential: '이더리움은 스마트 계약을 실행할 수 있는 블록체인으로, NFT와 DeFi(탈중앙화 금융)의 중심입니다. 2022년 이더리움 2.0 업그레이드로 에너지 소비를 99% 줄였습니다.',
        useCases: [
          'NFT 시장 오픈씨(OpenSea)에서 대부분의 거래가 이더리움 기반',
          'DeFi 플랫폼 유니스왑, 에이브에서 수백억 달러 규모 거래',
          '기업용 블록체인: 마이크로소프트, JP모건이 이더리움 기반 솔루션 개발'
        ],
        partnerships: [
          '마이크로소프트 Azure: 이더리움 블록체인 서비스 제공',
          'JP모건: 쿼럼(이더리움 기반) 블록체인 개발',
          'EY, 액센츄어: 이더리움 기반 기업 솔루션 구축'
        ],
        futureProspects: [
          '이더리움 2.0 완성으로 확장성과 속도 대폭 개선',
          '레이어2 솔루션(Arbitrum, Optimism)으로 거래 비용 절감',
          '기관 투자용 이더리움 ETF 출시 논의 진행 중'
        ],
        risks: [
          '경쟁 블록체인(솔라나, 카르다노)의 기술 발전',
          '높은 가스비(거래 수수료) 문제',
          '규제 당국의 증권 분류 가능성'
        ],
        summary: '이더리움은 NFT와 DeFi 생태계의 핵심으로 기업들의 블록체인 채택을 주도하고 있습니다.'
      },
      'DOGE': {
        potential: '도지코인은 밈(재미) 코인으로 시작했지만, 일론 머스크의 지지와 대중적 인지도로 실제 결제 수단으로 자리잡고 있습니다.',
        useCases: [
          '테슬라 온라인 상점에서 도지코인으로 상품 구매 가능',
          '스페이스X: 도지코인으로 달 탐사 미션 후원 (DOGE-1)',
          '트위터(X): 크리에이터 팁 기능에 도지코인 통합 논의'
        ],
        partnerships: [
          '일론 머스크와 테슬라: 도지코인 결제 지원',
          '스페이스X: 도지코인 기반 달 탐사 프로젝트',
          '마크 큐반: NBA 달라스 매버릭스 상품을 도지코인으로 판매'
        ],
        futureProspects: [
          '트위터(X) 결제 시스템 통합 가능성',
          '대중적 인지도를 활용한 일상 결제 확대',
          '커뮤니티 주도의 지속적인 개발과 업그레이드'
        ],
        risks: [
          '무한 공급으로 인한 인플레이션 압력',
          '기술적 혁신보다는 인기에 의존',
          '일론 머스크 발언에 따른 높은 변동성'
        ],
        summary: '도지코인은 밈에서 시작했지만 일론 머스크의 지원으로 실제 결제 수단으로 발전 중입니다.'
      },
      'IN': {
        potential: '인피닛(Infinit)은 무한 확장성을 목표로 하는 블록체인 플랫폼으로, 높은 처리량과 낮은 수수료를 제공합니다.',
        useCases: [
          'DeFi(탈중앙화 금융) 프로토콜의 기본 토큰으로 활용',
          '스테이킹을 통한 네트워크 보안 참여 및 보상 획득',
          '스마트 계약 실행 및 거버넌스 투표권 제공'
        ],
        partnerships: [
          '주요 암호화폐 거래소 상장 (업비트, 빗썸 등)',
          '블록체인 개발자 커뮤니티 지원',
          '프로토콜 파트너십을 통한 생태계 확장'
        ],
        futureProspects: [
          '확장된 DeFi 생태계 구축',
          '기관 투자자 참여 확대',
          '크로스체인 상호운용성 강화'
        ],
        risks: [
          '높은 경쟁 환경 (이더리움, 솔라나 등)',
          '규제 환경의 불확실성',
          '보안 취약점 발견 위험'
        ],
        summary: '인피닛은 무한 확장성을 추구하는 DeFi 플랫폼으로 빠른 성장 중입니다.'
      }
    };

    // 해당 코인 정보가 있으면 반환, 없으면 일반 정보
    if (coinInfo[symbol]) {
      return coinInfo[symbol];
    }

    // 일반 코인용 정보
    return {
      potential: `${cryptoData.name}은(는) 시가총액 ${cryptoData.rank}위의 암호화폐로, 블록체인 생태계에서 특정 역할을 수행하고 있습니다.`,
      useCases: [
        `${cryptoData.name}의 블록체인 네트워크에서 거래 수수료 및 스마트 계약 실행에 사용`,
        '암호화폐 거래소에서 다른 코인과의 거래쌍으로 활용',
        '탈중앙화 금융(DeFi) 프로토콜에서 담보 및 유동성 제공'
      ],
      partnerships: [
        '주요 글로벌 거래소(바이낸스, 코인베이스, 크라켄) 상장',
        '블록체인 생태계 내 다양한 프로젝트와 협력',
        '개발자 커뮤니티와 오픈소스 기여자들의 지속적 개발'
      ],
      futureProspects: [
        '블록체인 기술 발전과 함께 네트워크 업그레이드 진행',
        '암호화폐 시장 전체 성장에 따른 채택 증가',
        '규제 명확화로 기관 투자자 참여 확대 가능'
      ],
      risks: [
        '주요 코인(비트코인, 이더리움) 대비 낮은 유동성',
        '프로젝트 개발 지연이나 팀 이탈 위험',
        '경쟁 프로젝트의 기술적 우위 확보 가능성'
      ],
      summary: `${cryptoData.name}은(는) ${cryptoData.rank}위 암호화폐로 블록체인 생태계에서 역할을 수행하고 있으나, 주요 코인 대비 변동성이 높습니다.`
    };
  }

  /**
   * 여러 코인 비교 분석 - GeeksforGeeks "Portfolio Diversification" 기법
   */
  async compareCoins(coins: any[]): Promise<string> {
    const prompt = `
다음 암호화폐들을 체계적으로 비교 분석해주세요. GeeksforGeeks "Portfolio Diversification" 기법을 활용하세요.

# 비교 대상 코인들

${coins.map((coin, idx) => `
${idx + 1}. ${coin.name} (${coin.symbol})
   - 현재가: $${coin.price.toFixed(6)}
   - 시가총액: $${coin.marketCap}
   - 순위: ${coin.rank}위
   - 24시간 변동: ${coin.change24h.toFixed(2)}%
   - 7일 변동: ${coin.change7d.toFixed(2)}%
   - 30일 변동: ${coin.change30d.toFixed(2)}%
   - RSI: ${coin.technicalIndicators?.rsi?.toFixed(1) || 'N/A'}
   - 추세: ${coin.technicalIndicators?.trend || 'N/A'}
   - 거래량: $${coin.volume24h}
`).join('\n')}

---

**분석 항목 (필수):**

1. **가격 변동성 비교**
   - 단기(24시간) vs 중기(7일) vs 장기(30일) 변동성
   - 어느 코인이 안정적이고 어느 코인이 변동성이 큰가?
   - 예: "BTC는 ±2% 보수적, DOGE는 ±8% 공격적"

2. **기술적 강도 분석**
   - RSI 상태: 과매수/과매도/중립
   - 추세 강도: 강한 상승/하락/횡보
   - 예: "ETH는 RSI 45로 중립, 상승 추세 시작 / BTC는 RSI 72로 과매수, 조정 위험"

3. **시장 지위 비교**
   - 시가총액 순위 (시장 인정도)
   - 거래량 (유동성)
   - 시장 영향력

4. **투자 특성 분류**
   - 안전 자산: BTC 같은 메이저 코인
   - 성장형: 중소형 코인
   - 고위험: 변동성 높은 알트코인
   - 포트폴리오 다각화 전략

5. **투자 상황별 추천**
   - 보수 투자자: 어느 코인?
   - 공격 투자자: 어느 코인?
   - 분산 투자: 어떤 비율?

---

**답변 형식:**

📊 **가격 변동성 분석**
[각 코인의 변동성 특성과 비교 분석]

📈 **기술적 강도 비교**
[RSI, 추세, 거래량 기반 분석]

💰 **시장 지위**
[시가총액, 유동성, 시장 영향력 비교]

🎯 **투자 성향별 추천**
- 보수 투자자: [코인 추천 + 이유]
- 중기 투자자: [코인 추천 + 이유]  
- 공격 투자자: [코인 추천 + 이유]

⚖️ **포트폴리오 다각화 전략**
[어떤 비율로 조합하면 좋을지 제안]

⚠️ **리스크 경고**
[각 코인별 주의할 점]

---

**톤:**
- 명확하고 구체적 (모호한 표현 금지)
- 초보자도 이해 가능
- 숫자와 근거 포함 (예: "RSI 70 이상으로 과매수" ✅, "좋을 것 같다" ❌)
- 리스크 강조

`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 암호화폐 포트폴리오 최적화 전문가입니다.

**역할:**
- 여러 코인의 특성을 객관적으로 비교
- 투자 성향별 추천 (보수/중기/공격)
- 리스크와 리워드를 균형 있게 분석
- 다각화 전략 제시

**분석 원칙:**
1. 기술적 지표 중심 (RSI, 추세, 거래량)
2. 시가총액과 유동성 고려
3. 변동성 프로파일 명시
4. 투자자 성향별 맞춤 추천
5. 리스크 명확히 강조

**절대 금지:**
- 특정 코인을 무조건 추천
- 미래를 장담하는 표현
- 기술적 근거 없는 의견`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1200
      });

      return response.choices[0].message.content || '비교 분석을 수행할 수 없습니다.';
    } catch (error: any) {
      console.error('비교 분석 실패:', error.message);
      return '비교 분석을 수행할 수 없습니다.';
    }
  }

  /**
   * 오늘의 코인 추천 (재미용!) - GeeksforGeeks "Market Sentiment" 기법
   * ⚠️ 재미로만 보세요! 투자 권유 아님!
   */
  async getTodayRecommendations(coins: any[]): Promise<{
    hotPick: any;
    risingStar: any;
    safeHaven: any;
    reasoning: string;
    disclaimer: string;
  }> {
    const prompt = `
당신은 암호화폐 시장 심리 분석가입니다. GeeksforGeeks 기법 중 "Market Sentiment"를 활용하여 오늘의 추천을 제시하세요.

**오늘의 추천 분류 (재미용!):**

# 🔥 HOT_PICK: 단기 강세 신호
- 기준: 
  * RSI 50-70 (상승 모멘텀 강함)
  * 24시간 변동 +3% 이상
  * 거래량 증가
- 예: 기술적 강세이며 단기 상승 기대

# ⭐ RISING_STAR: 중기 상승 잠재력
- 기준:
  * 7일 변동 +5% 이상
  * RSI 30-60 (충분한 상승 여지)
  * 거래량 중간 이상
- 예: 추세 전환 초기, 중기 수익 기대

# 🛡️ SAFE_HAVEN: 상대적 안정성
- 기준:
  * 변동성 낮음 (시가총액 상위권)
  * RSI 40-60 (중립)
  * 거래량 풍부
- 예: 포트폴리오 안정화용

---

# 분석 대상 코인들

${coins.map((coin, idx) => `
${idx + 1}. ${coin.name} (${coin.symbol})
   현재가: $${coin.price.toFixed(6)}
   24시간: ${coin.change24h.toFixed(2)}% | 7일: ${coin.change7d.toFixed(2)}%
   RSI: ${coin.technicalIndicators?.rsi?.toFixed(1) || 'N/A'}
   추세: ${coin.technicalIndicators?.trend || 'N/A'}
   거래량: $${coin.volume24h}
`).join('\n')}

---

**분석 형식:**

HOT_PICK: [BTC/ETH/DOGE 등 심볼]
- 이유: [기술적 강점 2-3개 (RSI, 변동률, 거래량)]
- 기대 수익: [±몇 %]
- 신뢰도: [높음/중간/낮음]

RISING_STAR: [심볼]
- 이유: [중기 상승 근거]
- 기대 기간: [며칠]
- 신뢰도: [높음/중간/낮음]

SAFE_HAVEN: [심볼]
- 이유: [안정성 근거]
- 포트폴리오 역할: [안정화/분산]
- 신뢰도: [높음/중간/낮음]

REASONING: [오늘 시장 전반의 심리와 추천 이유를 3-4문장으로]

---

**⚠️ 중요 주의:**
1. 이건 재미용 추천 (투자 권유 아님)
2. 기술적 지표 기반이지만 변할 수 있음
3. 암호화폐는 예측 불가능
4. 리스크 명시 필수

`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 암호화폐 시장 심리 분석가입니다.

**역할:**
- 현재 시장 감정(공포/탐욕) 파악
- 기술적으로 강세/약세 코인 식별
- 투자자 성향별 추천 제시
- 재미있지만 위험성도 명확히 전달

**분석 기준:**
1. RSI로 과매수/과매도 판별
2. 24시간 거래량 변화 (관심도)
3. 7일 추세 (중기 모멘텀)
4. 시가총액 순위 (안정성)

**톤:**
- 흥미롭지만 신중함
- 기술적 근거 포함
- 리스크 명확히 강조
- 재미와 책임 사이 균형`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      });

      const content = response.choices[0].message.content || '';
      
      // 파싱
      let hotPick = null;
      let risingStar = null;
      let safeHaven = null;
      let reasoning = '';

      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes('HOT_PICK:')) {
          const symbol = line.match(/\[(\w+)\]/)?.[1];
          hotPick = coins.find(c => c.symbol === symbol);
        } else if (line.includes('RISING_STAR:')) {
          const symbol = line.match(/\[(\w+)\]/)?.[1];
          risingStar = coins.find(c => c.symbol === symbol);
        } else if (line.includes('SAFE_HAVEN:')) {
          const symbol = line.match(/\[(\w+)\]/)?.[1];
          safeHaven = coins.find(c => c.symbol === symbol);
        } else if (line.includes('REASONING:')) {
          reasoning = line.replace('REASONING:', '').trim();
        } else if (reasoning && line.trim() && !line.includes(':')) {
          reasoning += ' ' + line.trim();
        }
      }

      return {
        hotPick: hotPick || coins[0],
        risingStar: risingStar || coins[1],
        safeHaven: safeHaven || coins[2],
        reasoning: reasoning || '오늘의 시장 심리를 고려한 추천입니다.',
        disclaimer: '⚠️ 이 추천은 재미용입니다! 실제 투자는 본인 판단. 암호화폐는 매우 위험하며 손실 가능성이 높습니다.'
      };
    } catch (error: any) {
      console.error('추천 생성 실패:', error.message);
      // 기본 추천
      return {
        hotPick: coins[0],
        risingStar: coins[1],
        safeHaven: coins[2],
        reasoning: '시장 데이터를 분석한 추천입니다.',
        disclaimer: '⚠️ 이 추천은 재미용입니다! 투자는 본인 책임하에!'
      };
    }
  }

  /**
   * 시세 예측 (1일/7일/30일) - GeeksforGeeks "Price Predictions" 기법
   * ⚠️ 재미용! 정확하지 않을 수 있음!
   */
  async predictPrice(cryptoData: any): Promise<{
    day1: { price: number; change: number; confidence: string };
    day7: { price: number; change: number; confidence: string };
    day30: { price: number; change: number; confidence: string };
    reasoning: string;
    disclaimer: string;
  }> {
    // 기술적 분석 기반 레벨 계산
    const support = cryptoData.technicalIndicators.support || cryptoData.low24h;
    const resistance = cryptoData.technicalIndicators.resistance || cryptoData.high24h;
    const middle = (support + resistance) / 2;
    const range = resistance - support;
    
    const prompt = `
당신은 암호화폐 가격 예측 전문가입니다. GeeksforGeeks 기법 중 "Price Predictions"를 활용하여 분석하세요.

# ${cryptoData.name} (${cryptoData.symbol}) 기술적 분석 자료

## 현재 가격 레벨
- 현재가: $${cryptoData.price.toFixed(6)}
- 저항선: $${resistance?.toFixed(6)} (매도 압력 지점)
- 중간값: $${middle?.toFixed(6)}
- 지지선: $${support?.toFixed(6)} (매수 지점)
- 범위폭: $${range?.toFixed(6)} (일중 변동성)

## 단기 변동 (24시간)
- 24시간 변동: ${cryptoData.change24h.toFixed(2)}%
- 최고: $${cryptoData.high24h.toFixed(6)}
- 최저: $${cryptoData.low24h.toFixed(6)}

## 중기 추세 (7일/30일)
- 7일 변동: ${cryptoData.change7d.toFixed(2)}%
- 30일 변동: ${cryptoData.change30d.toFixed(2)}%
- 추세: ${cryptoData.technicalIndicators.trend}
- RSI: ${cryptoData.technicalIndicators.rsi?.toFixed(1) || 'N/A'} ${cryptoData.technicalIndicators.rsi ? `(${cryptoData.technicalIndicators.rsi > 70 ? '과매수' : cryptoData.technicalIndicators.rsi < 30 ? '과매도' : '중립'})` : ''}

## 거시 지표
- 공포-탐욕: ${cryptoData.fearGreedIndex || 'N/A'}
- 24시간 거래량: $${cryptoData.volume24h}
- 시가총액 순위: ${cryptoData.rank}위

---

**예측 기법 (GeeksforGeeks):**
1. **기술적 지표 활용**: RSI, 이동평균, 저항/지지선
2. **시장 심리**: 거래량, 공포-탐욕 지수
3. **역사적 패턴**: 최근 고저가, 일중 변동성
4. **거시 요소**: 도미넌스, 시장 추세

**예측 가이드:**
- 1일: 저항선 근처 또는 지지선 근처 (변동성이 높으므로 ±5% 범위)
- 7일: 추세 기반 예측 (7일 변동 추세 반영, ±10-15%)
- 30일: 중기 기술적 레벨 (ATH 또는 심리적 저항선 고려, ±20-30%)

**현실성 체크:**
- 과매수(RSI>70) 상태면 조정 가능성 높음
- 과매도(RSI<30) 상태면 반등 가능성 높음
- 저항선 돌파 시 다음 저항선까지 상승 기대
- 지지선 하단 돌파 시 다음 지지선까지 하락 위험

---

**형식 (필수):**

DAY1_PRICE: [숫자만, $로 시작하지 않음]
DAY1_CHANGE: [+/-숫자% 형식]
DAY1_CONFIDENCE: [낮음/중간/높음]

DAY7_PRICE: [숫자만]
DAY7_CHANGE: [+/-숫자%]
DAY7_CONFIDENCE: [낮음/중간/높음]

DAY30_PRICE: [숫자만]
DAY30_CHANGE: [+/-숫자%]
DAY30_CONFIDENCE: [낮음/중간/높음]

REASONING: [예측 근거를 3-4문장으로 구체적으로]
- 1일/7일/30일 각각의 기술적 근거
- RSI/추세/저항선 활용
- 신뢰도 이유

**중요:**
1. 이건 **기술적 분석 기반 추정**일 뿐 확실하지 않음
2. 암호화폐는 예측이 매우 어렵고 변동성이 극심
3. 투자 판단 기준이 아닌 분석 참고용
4. 시장 뉴스, 대외 이슈로 언제든 변할 수 있음
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '암호화폐 가격 예측 AI입니다. 기술적 지표와 추세를 바탕으로 합리적 예측을 하되, 불확실성을 명확히 합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 800
      });

      const content = response.choices[0].message.content || '';
      
      // 파싱
      let day1Price = cryptoData.price;
      let day1Change = 0;
      let day1Confidence = '중간';
      let day7Price = cryptoData.price;
      let day7Change = 0;
      let day7Confidence = '중간';
      let day30Price = cryptoData.price;
      let day30Change = 0;
      let day30Confidence = '낮음';
      let reasoning = '';

      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('DAY1_PRICE:')) {
          const value = parseFloat(trimmed.replace('DAY1_PRICE:', '').trim());
          if (!isNaN(value)) day1Price = value;
        } else if (trimmed.startsWith('DAY1_CHANGE:')) {
          const value = parseFloat(trimmed.replace('DAY1_CHANGE:', '').replace('%', '').trim());
          if (!isNaN(value)) day1Change = value;
        } else if (trimmed.startsWith('DAY1_CONFIDENCE:')) {
          day1Confidence = trimmed.replace('DAY1_CONFIDENCE:', '').trim();
        } else if (trimmed.startsWith('DAY7_PRICE:')) {
          const value = parseFloat(trimmed.replace('DAY7_PRICE:', '').trim());
          if (!isNaN(value)) day7Price = value;
        } else if (trimmed.startsWith('DAY7_CHANGE:')) {
          const value = parseFloat(trimmed.replace('DAY7_CHANGE:', '').replace('%', '').trim());
          if (!isNaN(value)) day7Change = value;
        } else if (trimmed.startsWith('DAY7_CONFIDENCE:')) {
          day7Confidence = trimmed.replace('DAY7_CONFIDENCE:', '').trim();
        } else if (trimmed.startsWith('DAY30_PRICE:')) {
          const value = parseFloat(trimmed.replace('DAY30_PRICE:', '').trim());
          if (!isNaN(value)) day30Price = value;
        } else if (trimmed.startsWith('DAY30_CHANGE:')) {
          const value = parseFloat(trimmed.replace('DAY30_CHANGE:', '').replace('%', '').trim());
          if (!isNaN(value)) day30Change = value;
        } else if (trimmed.startsWith('DAY30_CONFIDENCE:')) {
          day30Confidence = trimmed.replace('DAY30_CONFIDENCE:', '').trim();
        } else if (trimmed.startsWith('REASONING:')) {
          reasoning = trimmed.replace('REASONING:', '').trim();
          const nextLines = lines.slice(lines.indexOf(line) + 1);
          for (const next of nextLines) {
            if (next.trim() && !next.includes(':')) {
              reasoning += ' ' + next.trim();
            } else {
              break;
            }
          }
        }
      }

      return {
        day1: { 
          price: day1Price, 
          change: day1Change, 
          confidence: day1Confidence 
        },
        day7: { 
          price: day7Price, 
          change: day7Change, 
          confidence: day7Confidence 
        },
        day30: { 
          price: day30Price, 
          change: day30Change, 
          confidence: day30Confidence 
        },
        reasoning: reasoning || 'AI가 기술적 지표를 분석한 예측입니다.',
        disclaimer: '⚠️ 이 예측은 AI가 만든 것으로 재미로만 보세요! 암호화폐는 예측이 매우 어렵고, 실제 가격은 크게 다를 수 있습니다. 투자 판단에 사용하지 마세요!'
      };
    } catch (error: any) {
      console.error('가격 예측 실패:', error.message);
      
      // 기본 예측 (현재가 기준 약간의 변동)
      const currentPrice = cryptoData.price;
      return {
        day1: { 
          price: currentPrice * (1 + (Math.random() * 0.1 - 0.05)), 
          change: Math.random() * 10 - 5, 
          confidence: '낮음' 
        },
        day7: { 
          price: currentPrice * (1 + (Math.random() * 0.2 - 0.1)), 
          change: Math.random() * 20 - 10, 
          confidence: '낮음' 
        },
        day30: { 
          price: currentPrice * (1 + (Math.random() * 0.4 - 0.2)), 
          change: Math.random() * 40 - 20, 
          confidence: '낮음' 
        },
        reasoning: 'AI 예측을 생성할 수 없습니다.',
        disclaimer: '⚠️ 이 예측은 재미로만 보세요! 투자 판단에 사용하지 마세요!'
      };
    }
  }
}
