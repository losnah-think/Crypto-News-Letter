/**
 * 암호화폐 분석 API
 * GET /api/crypto/[symbol]
 */

import { NextRequest, NextResponse } from 'next/server';
import { CryptoDataService } from '@/lib/crypto-service';
import { CryptoAIService } from '@/lib/crypto-ai-service';
import { CacheService } from '@/lib/cache-service';

export const maxDuration = 30;

/**
 * 인피닛(IN) 코인 모의 데이터 생성
 * API에서 데이터를 받지 못하므로 프롬프트 엔지니어링 모드로 작동
 */
function createInfinitMockData(): any {
  const basePrice = 0.8; // 예상 가격
  return {
    id: 'infinit',
    symbol: 'IN',
    name: '인피닛',
    price: basePrice,
    priceKRW: basePrice * 1350,
    marketCap: '$150,000,000',
    marketCapKRW: '₩202,500,000,000',
    rank: 250,
    volume24h: '$5,000,000',
    volume24hKRW: '₩6,750,000,000',
    high24h: basePrice * 1.05,
    low24h: basePrice * 0.95,
    change24h: (Math.random() * 8 - 4),
    change7d: (Math.random() * 20 - 10),
    change30d: (Math.random() * 40 - 20),
    circulatingSupply: '100,000,000 IN',
    totalSupply: '150,000,000 IN',
    maxSupply: null,
    ath: 2.5,
    athChange: -68,
    athDate: '2021-11-15',
    dominance: null,
    technicalIndicators: {
      rsi: 45,
      trend: 'NEUTRAL',
      support: basePrice * 0.92,
      resistance: basePrice * 1.08,
    },
    isPromptEngineeringMode: true,
    note: '인피닛은 API 데이터가 제한적이므로 프롬프트 엔지니어링 기반 분석만 제공됩니다.',
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol.toUpperCase();

  console.log(`\n🪙 암호화폐 분석 요청: ${symbol}`);

  try {
    // 캐시 확인
    const cacheService = new CacheService();
    const cachedData = await cacheService.getCryptoAnalysis(symbol);

    if (cachedData) {
      console.log(`✅ 캐시 히트: crypto:${symbol}`);
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cachedAt: new Date().toISOString()
      });
    }

    console.log(`❌ 캐시 미스: crypto:${symbol} - 새로운 분석 시작`);

    // 1. 암호화폐 데이터 가져오기
    let cryptoData;
    
    if (symbol === 'IN') {
      console.log(`📍 인피닛(IN) - 프롬프트 엔지니어링 모드 활성화`);
      cryptoData = createInfinitMockData();
      cryptoData.isPromptEngineeringMode = true;
    } else {
      const cryptoService = new CryptoDataService();
      try {
        cryptoData = await cryptoService.getCryptoData(symbol);
        if (cryptoData.isApiFailure) {
          console.log(`⚠️ API 실패 Fallback 모드: ${symbol}`);
        } else {
          console.log(`📊 ${symbol} 데이터 조회 완료`);
        }
      } catch (error: any) {
        console.error(`❌ 데이터 조회 완전 실패: ${error.message}`);
        throw error;
      }
    }

    // 2. 공포-탐욕 지수 가져오기 (IN과 API 실패 모드는 제외)
    if (symbol !== 'IN' && !cryptoData.isApiFailure) {
      const cryptoService = new CryptoDataService();
      const fearGreedIndex = await cryptoService.getFearGreedIndex();
      cryptoData.fearGreedIndex = fearGreedIndex;
    } else {
      cryptoData.fearGreedIndex = null;
    }

    // 3. AI 분석
    const aiService = new CryptoAIService();
    const recommendation = await aiService.analyzeCrypto(cryptoData);

    console.log(`🤖 AI 분석 완료: ${recommendation.decision} (${recommendation.confidence}%)`);

    // 4. 장기 전망 분석 (선택적)
    let longTermOutlook = null;
    try {
      longTermOutlook = await aiService.analyzeLongTermOutlook(cryptoData);
      console.log(`📈 장기 전망 분석 완료`);
    } catch (error: any) {
      console.error('장기 전망 분석 실패:', error.message);
    }

    // 결과 조합
    const result = {
      ...cryptoData,
      recommendation: {
        ...recommendation,
        longTermOutlook
      },
      generatedAt: new Date().toISOString(),
      fromCache: false
    };

    // 캐시 저장 (6시간)
    const cacheSaved = await cacheService.setCryptoAnalysis(symbol, result);
    if (cacheSaved) {
      console.log(`💾 캐시 저장 완료: crypto:${symbol}`);
    } else {
      console.error(`⚠️ 캐시 저장 실패했지만 결과는 반환: crypto:${symbol}`);
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error(`❌ 암호화폐 분석 실패 (${symbol}):`, error.message);
    
    // 마지막 시도: 모의 데이터로라도 분석 제공
    try {
      console.log(`🆘 마지막 시도: ${symbol} 모의 데이터로 프롬프트 엔지니어링 분석 수행`);
      
      const fallbackData = createInfinitMockData();
      fallbackData.symbol = symbol;
      fallbackData.isApiFailure = true;
      fallbackData.apiFailureNote = `API 오류로 인해 프롬프트 엔지니어링 기반 분석만 제공됩니다.`;
      
      const aiService = new CryptoAIService();
      const recommendation = await aiService.analyzeCrypto(fallbackData);
      
      const longTermOutlook = await aiService.analyzeLongTermOutlook(fallbackData);
      
      const emergencyResult = {
        ...fallbackData,
        recommendation: {
          ...recommendation,
          longTermOutlook
        },
        generatedAt: new Date().toISOString(),
        fromCache: false,
        isEmergencyMode: true,
        emergencyNote: '⚠️ API 오류: 프롬프트 엔지니어링 기반 분석만 제공됩니다. 정확도가 낮을 수 있습니다.'
      };
      
      return NextResponse.json(emergencyResult);
    } catch (emergencyError: any) {
      console.error(`🆘 긴급 모드도 실패:`, emergencyError.message);
      
      return NextResponse.json(
        { 
          error: '암호화폐 분석 불가',
          message: `죄송합니다. 지금은 분석을 제공할 수 없습니다. 잠시 후 다시 시도해주세요.`,
          symbol,
          details: error.message
        },
        { status: 503 }
      );
    }
  }
}
