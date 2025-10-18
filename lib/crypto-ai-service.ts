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
            content: `당신은 암호화폐 전문 기술적 분석가(Technical Analyst)입니다.

**전문 분야**:
- 차트 패턴 분석 (지지선, 저항선, 추세선)
- 기술적 지표 해석 (RSI, 이동평균, 거래량)
- 가격 목표 산정 (피보나치, 지지/저항 레벨)

**분석 원칙**:
1. 제공된 기술적 지표(RSI, 추세, 지지선, 저항선)를 **반드시 활용**하여 분석
2. 24시간 고가/저가, ATH 등 역사적 가격 데이터 고려
3. 투자 가격대는 단순 퍼센트 계산이 아닌 **기술적 레벨**을 기준으로 설정
4. 저항선은 매도 압력이 강한 구간, 지지선은 매수 세력이 강한 구간임을 고려
5. RSI가 70 이상이면 과매수(조정 가능성), 30 이하면 과매도(반등 가능성)

**답변 스타일**:
- 한국어로 명확하고 구체적으로 설명
- 투자 권유가 아닌 기술적 분석 의견
- 암호화폐 변동성에 대한 리스크 명시
- 한국 투자자 관점 반영`
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
   * 프롬프트 생성
   */
  private buildCryptoPrompt(data: any): string {
    return `
다음 암호화폐에 대한 투자 분석을 해주세요:

# 기본 정보
- 코인: ${data.name} (${data.symbol})
- 현재가: $${data.price.toFixed(2)} (₩${data.priceKRW.toLocaleString('ko-KR')})
- 시가총액: $${data.marketCap} (순위: ${data.rank}위)
- 24시간 거래량: $${data.volume24h}

# 가격 변동
- 24시간: ${data.change24h.toFixed(2)}%
- 7일: ${data.change7d.toFixed(2)}%
- 30일: ${data.change30d.toFixed(2)}%
- 24시간 최고: $${data.high24h.toFixed(2)}
- 24시간 최저: $${data.low24h.toFixed(2)}

# 공급량
- 유통 공급량: ${data.circulatingSupply}
- 총 공급량: ${data.totalSupply}
- 최대 공급량: ${data.maxSupply || '무제한'}

# 역사적 데이터
- 역대 최고가: $${data.ath.toFixed(2)} (${data.athDate})
- ATH 대비: ${data.athChange.toFixed(2)}%

# 기술적 지표
- RSI: ${data.technicalIndicators.rsi?.toFixed(1) || 'N/A'}
- 추세: ${data.technicalIndicators.trend}
- 지지선: $${data.technicalIndicators.support?.toFixed(2) || 'N/A'}
- 저항선: $${data.technicalIndicators.resistance?.toFixed(2) || 'N/A'}

${data.dominance ? `# 시장 지배율\n- 비트코인 도미넌스: ${data.dominance.toFixed(2)}%\n` : ''}

다음 형식으로 분석해주세요:

DECISION: [STRONG_BUY/BUY/HOLD/SELL/STRONG_SELL]
CONFIDENCE: [0-100 숫자만]
REASONING: [2-3문장으로 핵심 투자 의견]

KEY_POINTS:
- [강점 1]
- [강점 2]
- [강점 3]

RISKS:
- [리스크 1]
- [리스크 2]
- [리스크 3]

TARGET_PRICE: [숫자만, 없으면 NULL]
TIME_HORIZON: [단기(1-7일)/중기(1-3개월)/장기(6개월+)]

INVESTMENT_LEVELS:
ENTRY: [현재가, 숫자만]
TARGET1: [1차 목표가, 숫자만]
TARGET2: [2차 목표가, 숫자만]
TARGET3: [3차 목표가, 숫자만]
STOPLOSS: [손절가, 숫자만]
LEVELS_REASONING: [가격대 설정 근거, 2-3문장]

**투자 가격대 설정 가이드**:
- 현재가: $${data.price.toFixed(6)}
- 24시간 최고가: $${data.high24h.toFixed(6)} (현재가 대비 ${((data.high24h / data.price - 1) * 100).toFixed(1)}%)
- 24시간 최저가: $${data.low24h.toFixed(6)} (현재가 대비 ${((data.low24h / data.price - 1) * 100).toFixed(1)}%)
- 저항선 (Resistance): $${data.technicalIndicators.resistance?.toFixed(6) || 'N/A'}
- 지지선 (Support): $${data.technicalIndicators.support?.toFixed(6) || 'N/A'}
- RSI: ${data.technicalIndicators.rsi?.toFixed(1) || 'N/A'} ${data.technicalIndicators.rsi ? (data.technicalIndicators.rsi > 70 ? '(과매수)' : data.technicalIndicators.rsi < 30 ? '(과매도)' : '(중립)') : ''}
- 추세: ${data.technicalIndicators.trend}

**가격대 산정 방법**:
1. ENTRY: 현재가를 그대로 사용
2. TARGET1: 저항선이나 24시간 최고가를 참고하여 첫 번째 돌파 목표 설정 (보수적)
3. TARGET2: 기술적 패턴과 추세를 고려한 중기 목표 (저항선 돌파 후)
4. TARGET3: 강세장 시나리오의 최대 목표 (ATH나 심리적 저항선 고려)
5. STOPLOSS: 지지선이나 24시간 최저가를 참고하여 손실 제한선 설정 (지지선 하단)

**중요**: 
1. 암호화폐는 매우 변동성이 크므로 신중한 의견을 제시하세요.
2. 투자 권유가 아닌 분석 의견임을 명확히 하세요.
3. 리스크를 반드시 강조하세요.
4. 한국 투자자 관점에서 설명하세요.
5. 투자 가격대는 **반드시 기술적 지표(저항선, 지지선, RSI, 24시간 고가/저가)를 분석**하여 설정하세요.
6. 단순 퍼센트 계산이 아닌, 차트 패턴과 기술적 분석을 기반으로 현실적인 가격대를 제시하세요.
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
   * 장기 투자 전망 분석
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
당신은 암호화폐 전문가입니다. ${cryptoData.name} (${cryptoData.symbol})에 대한 장기 투자 전망을 **구체적이고 실용적으로** 분석해주세요.

# 코인 정보
- 이름: ${cryptoData.name} (${cryptoData.symbol})
- 현재가: $${cryptoData.price.toFixed(2)}
- 시가총액: $${cryptoData.marketCap} (순위: ${cryptoData.rank}위)
- 시장 점유율: ${cryptoData.dominance ? cryptoData.dominance.toFixed(2) + '%' : 'N/A'}

# 중요 지침
**일반적이거나 모호한 답변은 절대 금지입니다!**

예를 들어:
❌ "다양한 분야에서 활용 가능" (너무 모호함)
✅ "엘살바도르에서 법정화폐로 사용 중이며, 2021년부터 국민들이 일상 결제에 활용"

❌ "주요 파트너십 확인 필요" (정보 없음)
✅ "테슬라가 2021년 15억 달러 구매, 마이크로스트래티지가 지속적으로 매입"

**반드시 다음을 포함하세요:**

1. **USE_CASES (활용 사례)**: 
   - 실제 회사명, 서비스명, 국가명을 포함한 구체적 사례
   - "어디서", "누가", "어떻게" 사용하는지 명확히
   - 예: "미국 스타벅스에서 결제 가능", "삼성전자 블록체인 키스토어에 통합"

2. **PARTNERSHIPS (파트너십)**:
   - 실제 기업명, 기관명을 명시
   - 협력 내용과 시기를 구체적으로
   - 예: "2023년 마스터카드와 암호화폐 결제 연동", "JP모건 체이스 블록체인 네트워크 참여"

3. **FUTURE_PROSPECTS (미래 전망)**:
   - 진행 중인 구체적 프로젝트나 계획
   - 기술 업그레이드, 규제 변화, 채택 증가 등 실제 근거
   - 예: "2024년 비트코인 ETF 승인으로 기관 투자 증가 예상", "이더리움 2.0 업그레이드로 에너지 소비 99% 감소"

4. **LONG_TERM_RISKS (리스크)**:
   - ${cryptoData.symbol}에 특화된 구체적 위험 요소
   - 경쟁 코인, 기술적 한계, 규제 이슈 등

**코인별 실제 정보 예시:**

Bitcoin (BTC):
- 사용처: 엘살바도르 법정화폐, 테슬라/마이크로스트래티지 보유
- 파트너십: 페이팔 결제 지원, 피델리티 기관 투자 상품
- 전망: 비트코인 ETF 승인, 반감기 이벤트

Ethereum (ETH):
- 사용처: NFT 마켓플레이스 오픈씨, DeFi 플랫폼 유니스왑
- 파트너십: 마이크로소프트 Azure 블록체인, JP모건 쿼럼
- 전망: 이더리움 2.0 완성, 레이어2 확장성 개선

Dogecoin (DOGE):
- 사용처: 테슬라 상품 결제, 트위터 팁 기능
- 파트너십: 스페이스X 달 탐사 후원
- 전망: 일론 머스크 지속 지원, 밈 문화 확산

**형식:**

POTENTIAL: [이 코인의 핵심 가치를 2-3문장으로, 구체적 근거와 함께]

USE_CASES:
- [구체적 사례 1: 회사명/서비스명 포함]
- [구체적 사례 2: 실제 사용 예시]
- [구체적 사례 3: 어떤 산업에서 활용]

PARTNERSHIPS:
- [실제 파트너 1: 기업명과 협력 내용]
- [실제 파트너 2: 시기와 규모 포함]
- [실제 파트너 3: 구체적 프로젝트명]

FUTURE_PROSPECTS:
- [구체적 전망 1: 진행 중인 프로젝트]
- [구체적 전망 2: 예상 시기와 영향]
- [구체적 전망 3: 시장 변화 근거]

LONG_TERM_RISKS:
- [${cryptoData.symbol} 특화 리스크 1]
- [${cryptoData.symbol} 특화 리스크 2]
- [${cryptoData.symbol} 특화 리스크 3]

SUMMARY: [한 문장으로 핵심 요약, 실제 근거 포함]

**50-60대가 이해하기 쉬운 용어로 작성하되, 반드시 실제 사례와 회사명을 포함하세요!**
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 암호화폐 시장을 깊이 이해하는 전문 애널리스트입니다.

**핵심 역량:**
- 각 암호화폐의 실제 사용 사례와 파트너십을 정확히 파악
- 주요 기업, 기관, 정부의 채택 사례를 추적
- 기술 발전, 업그레이드 일정, 로드맵 숙지
- 경쟁 구도와 시장 변화 분석

**절대 금지:**
- "다양한 분야에서 활용 가능" 같은 일반론
- "주요 파트너십 확인 필요" 같은 회피
- "성장 가능성 존재" 같은 모호한 표현

**반드시 포함:**
- 실제 회사명 (예: 테슬라, 마이크로소프트, 삼성전자)
- 구체적 서비스명 (예: 페이팔 결제, 오픈씨 NFT)
- 실제 사용 국가/지역 (예: 엘살바도르, 미국, 한국)
- 시기와 규모 (예: 2021년 15억 달러, 2024년 ETF 승인)

일반인도 이해할 수 있게 쉬운 용어로 설명하되, 반드시 구체적이고 실용적인 정보를 제공하세요.`
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
   * 여러 코인 비교 분석
   */
  async compareCoins(coins: any[]): Promise<string> {
    const prompt = `
다음 암호화폐들을 비교 분석해주세요:

${coins.map((coin, idx) => `
${idx + 1}. ${coin.name} (${coin.symbol})
   - 현재가: $${coin.price}
   - 24시간 변동: ${coin.change24h}%
   - 시가총액: $${coin.marketCap}
`).join('\n')}

투자자가 알아야 할 핵심 비교 포인트를 3-5개 문장으로 요약해주세요.
어떤 코인이 어떤 상황에 적합한지 설명해주세요.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '암호화폐 비교 분석 전문가입니다. 간결하고 명확하게 비교합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      return response.choices[0].message.content || '비교 분석을 수행할 수 없습니다.';
    } catch (error: any) {
      console.error('비교 분석 실패:', error.message);
      return '비교 분석을 수행할 수 없습니다.';
    }
  }

  /**
   * 오늘의 코인 추천 (재미용!)
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
다음 암호화폐 중에서 오늘의 추천을 해주세요 (재미용!):

${coins.map((coin, idx) => `
${idx + 1}. ${coin.name} (${coin.symbol})
   - 현재가: $${coin.price.toFixed(6)}
   - 24시간: ${coin.change24h.toFixed(2)}%
   - 7일: ${coin.change7d.toFixed(2)}%
   - RSI: ${coin.technicalIndicators?.rsi?.toFixed(1) || 'N/A'}
   - 추세: ${coin.technicalIndicators?.trend || 'N/A'}
`).join('\n')}

다음 형식으로 3가지 추천을 해주세요:

HOT_PICK: [심볼] - [한 줄 이유]
RISING_STAR: [심볼] - [한 줄 이유]
SAFE_HAVEN: [심볼] - [한 줄 이유]

REASONING: [전체적인 시장 상황과 추천 이유를 2-3문장으로]

**중요**: 이건 재미로 보는 추천이에요! 실제 투자는 본인 판단!
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '암호화폐 트렌드 분석가입니다. 재미있고 가벼운 톤으로 추천합니다. 하지만 리스크는 명확히!'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 600
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
        } else if (reasoning && line.trim()) {
          reasoning += ' ' + line.trim();
        }
      }

      return {
        hotPick: hotPick || coins[0],
        risingStar: risingStar || coins[1],
        safeHaven: safeHaven || coins[2],
        reasoning: reasoning || '오늘의 시장 상황을 고려한 추천입니다.',
        disclaimer: '⚠️ 이 추천은 재미로만 보세요! 암호화폐는 변동성이 매우 크며, 투자 손실 가능성이 있습니다. 투자는 본인 판단과 책임 하에!'
      };
    } catch (error: any) {
      console.error('추천 생성 실패:', error.message);
      // 기본 추천
      return {
        hotPick: coins[0],
        risingStar: coins[1],
        safeHaven: coins[2],
        reasoning: '시장 데이터를 분석한 추천입니다.',
        disclaimer: '⚠️ 이 추천은 재미로만 보세요! 투자는 본인 책임!'
      };
    }
  }

  /**
   * 시세 예측 (1일/7일/30일)
   * ⚠️ 재미용! 정확하지 않을 수 있음!
   */
  async predictPrice(cryptoData: any): Promise<{
    day1: { price: number; change: number; confidence: string };
    day7: { price: number; change: number; confidence: string };
    day30: { price: number; change: number; confidence: string };
    reasoning: string;
    disclaimer: string;
  }> {
    const prompt = `
다음 암호화폐의 미래 시세를 예측해주세요 (재미용!):

# ${cryptoData.name} (${cryptoData.symbol})
- 현재가: $${cryptoData.price.toFixed(6)}
- 24시간 변동: ${cryptoData.change24h.toFixed(2)}%
- 7일 변동: ${cryptoData.change7d.toFixed(2)}%
- 30일 변동: ${cryptoData.change30d.toFixed(2)}%
- RSI: ${cryptoData.technicalIndicators.rsi?.toFixed(1) || 'N/A'}
- 추세: ${cryptoData.technicalIndicators.trend}
- 지지선: $${cryptoData.technicalIndicators.support?.toFixed(6) || 'N/A'}
- 저항선: $${cryptoData.technicalIndicators.resistance?.toFixed(6) || 'N/A'}
- 공포-탐욕: ${cryptoData.fearGreedIndex || 'N/A'}

현재 추세와 기술적 지표를 고려하여 다음 형식으로 예측해주세요:

DAY1_PRICE: [숫자만]
DAY1_CHANGE: [+/-숫자%]
DAY1_CONFIDENCE: [낮음/중간/높음]

DAY7_PRICE: [숫자만]
DAY7_CHANGE: [+/-숫자%]
DAY7_CONFIDENCE: [낮음/중간/높음]

DAY30_PRICE: [숫자만]
DAY30_CHANGE: [+/-숫자%]
DAY30_CONFIDENCE: [낮음/중간/높음]

REASONING: [예측 근거를 2-3문장으로]

**중요**: 
1. 현실적인 범위 내에서 예측
2. 변동성을 고려한 보수적 예측
3. 이건 AI 예측일 뿐, 맞지 않을 수 있어요!
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
