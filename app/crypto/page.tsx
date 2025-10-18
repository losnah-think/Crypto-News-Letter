'use client';

import { useState } from 'react';

interface CryptoAnalysis {
  symbol: string;
  name: string;
  price: number;
  priceKRW: number;
  marketCap: string;
  marketCapKRW: string;
  rank: number;
  volume24h: string;
  volume24hKRW: string;
  high24h: number;
  low24h: number;
  change24h: number;
  change7d: number;
  change30d: number;
  circulatingSupply: string;
  totalSupply: string;
  maxSupply: string | null;
  ath: number;
  athChange: number;
  athDate: string;
  dominance: number | null;
  fearGreedIndex: number | null;
  technicalIndicators: {
    rsi: number | null;
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    support: number | null;
    resistance: number | null;
  };
  recommendation: {
    decision: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
    confidence: number;
    reasoning: string;
    keyPoints: string[];
    risks: string[];
    targetPrice: number | null;
    timeHorizon: string;
    investmentLevels: {
      entryPrice: number;
      targetPrice1: number;
      targetPrice2: number;
      targetPrice3: number;
      stopLoss: number;
      reasoning: string;
    };
    longTermOutlook?: {
      potential: string;
      useCases: string[];
      partnerships: string[];
      futureProspects: string[];
      risks: string[];
      summary: string;
    };
  };
  generatedAt: string;
  fromCache: boolean;
  cachedAt?: string;
}

interface Prediction {
  day1: { price: number; change: number; confidence: string };
  day7: { price: number; change: number; confidence: string };
  day30: { price: number; change: number; confidence: string };
  reasoning: string;
  disclaimer: string;
}

export default function CryptoPage() {
  const [analysis, setAnalysis] = useState<CryptoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);

  // 인기 코인
  const popularCoins = [
    { symbol: 'BTC', name: '비트코인', emoji: '₿' },
    { symbol: 'ETH', name: '이더리움', emoji: 'Ξ' },
    { symbol: 'DOGE', name: '도지코인', emoji: '🐕' },
    { symbol: 'XRP', name: '리플', emoji: '💧' },
    { symbol: 'ADA', name: '카르다노', emoji: '🔷' },
    { symbol: 'SOL', name: '솔라나', emoji: '◎' },
    { symbol: 'MATIC', name: '폴리곤', emoji: '⬡' },
    { symbol: 'DOT', name: '폴카닷', emoji: '●' },
  ];

  // 한글 -> 심볼 변환
  const koreanToSymbol: { [key: string]: string } = {
    '비트코인': 'BTC',
    '비트': 'BTC',
    'btc': 'BTC',
    '이더리움': 'ETH',
    '이더': 'ETH',
    '이더리엄': 'ETH',
    'eth': 'ETH',
    '도지코인': 'DOGE',
    '도지': 'DOGE',
    'doge': 'DOGE',
    '리플': 'XRP',
    'xrp': 'XRP',
    '카르다노': 'ADA',
    '에이다': 'ADA',
    'ada': 'ADA',
    '솔라나': 'SOL',
    'sol': 'SOL',
    '폴리곤': 'MATIC',
    '매틱': 'MATIC',
    'matic': 'MATIC',
    '폴카닷': 'DOT',
    'dot': 'DOT',
    '라이트코인': 'LTC',
    '라이트': 'LTC',
    'ltc': 'LTC',
    '체인링크': 'LINK',
    '링크': 'LINK',
    'link': 'LINK',
    '에이브': 'AAVE',
    'aave': 'AAVE',
    '유니스왑': 'UNI',
    '유니': 'UNI',
    'uni': 'UNI',
  };

  // 검색어를 심볼로 변환
  const convertToSymbol = (input: string): string => {
    const normalized = input.toLowerCase().trim();
    return koreanToSymbol[normalized] || input.toUpperCase();
  };

  const handleSearch = async (symbol: string) => {
    // 한글이면 심볼로 변환
    const searchSymbolValue = convertToSymbol(symbol);
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setPrediction(null);
    setShowPrediction(false);

    try {
      const response = await fetch(`/api/crypto/${searchSymbolValue}`);
      
      if (!response.ok) {
        throw new Error('코인 데이터를 가져올 수 없습니다.');
      }

      const data = await response.json();
      setAnalysis(data);
      
      // 결과가 로드되면 자동으로 스크롤
      setTimeout(() => {
        const resultElement = document.getElementById('analysis-result');
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      setError(err.message);
      
      // 에러 발생 시에도 스크롤
      setTimeout(() => {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async (symbol: string) => {
    setShowPrediction(true);
    
    try {
      const response = await fetch(`/api/crypto/predict/${symbol}`);
      if (response.ok) {
        const data = await response.json();
        setPrediction(data.prediction);
        
        // 예측 결과로 스크롤 이동
        setTimeout(() => {
          const predictionElement = document.getElementById('prediction-section');
          if (predictionElement) {
            predictionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } catch (err) {
      console.error('예측 로드 실패:', err);
    }
  };

  const getDecisionText = (decision: string) => {
    switch (decision) {
      case 'STRONG_BUY': return '적극 매수 추천';
      case 'BUY': return '매수 추천';
      case 'HOLD': return '보유 권장';
      case 'SELL': return '매도 고려';
      case 'STRONG_SELL': return '즉시 매도';
      default: return '보유 권장';
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'STRONG_BUY': return 'text-green-600 bg-green-50';
      case 'BUY': return 'text-green-600 bg-green-50';
      case 'HOLD': return 'text-yellow-600 bg-yellow-50';
      case 'SELL': return 'text-red-600 bg-red-50';
      case 'STRONG_SELL': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendEmoji = (trend: string) => {
    switch (trend) {
      case 'BULLISH': return '📈';
      case 'BEARISH': return '📉';
      default: return '➡️';
    }
  };

  const getFearGreedText = (index: number | null) => {
    if (!index) return null;
    if (index <= 25) return { text: '극단적 공포', color: 'text-red-600', emoji: '😱' };
    if (index <= 45) return { text: '공포', color: 'text-orange-600', emoji: '😰' };
    if (index <= 55) return { text: '중립', color: 'text-gray-600', emoji: '😐' };
    if (index <= 75) return { text: '탐욕', color: 'text-green-600', emoji: '😃' };
    return { text: '극단적 탐욕', color: 'text-green-700', emoji: '🤑' };
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold">🪙 CNL</h1>
              <p className="text-purple-100 mt-2 text-base sm:text-lg">암호화폐 분석</p>
            </div>
            <a
              href="/"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-lg transition-all"
            >
              🏠 홈
            </a>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* 검색 섹션 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">💎 코인 검색</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input
              type="text"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchSymbol && handleSearch(searchSymbol)}
              placeholder="비트코인, BTC, 이더리움, ETH..."
              className="flex-1 px-6 py-5 border-3 border-purple-300 rounded-2xl focus:outline-none focus:border-purple-600 text-2xl font-semibold text-center sm:text-left text-gray-800 placeholder-gray-400"
            />
            <button
              onClick={() => searchSymbol && handleSearch(searchSymbol)}
              disabled={!searchSymbol || loading}
              className="px-10 py-5 bg-purple-600 text-white rounded-2xl font-bold text-2xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-105"
            >
              {loading ? '분석 중...' : '🔍 분석'}
            </button>
          </div>

          {/* 인기 코인 버튼 */}
          <div className="space-y-4">
            <p className="text-xl font-bold text-gray-700">🔥 인기 코인</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {popularCoins.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => handleSearch(coin.symbol)}
                  disabled={loading}
                  className="px-6 py-4 bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 rounded-xl text-lg font-bold text-gray-800 transition-all disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <div className="text-2xl mb-1">{coin.emoji}</div>
                  <div>{coin.name}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* 로딩 */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-purple-600"></div>
            <p className="mt-6 text-2xl font-bold text-gray-700">암호화폐 분석 중...</p>
            <p className="text-lg text-gray-600 mt-3">잠시만 기다려주세요 🤖</p>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div id="error-message" className="bg-red-50 border-4 border-red-300 rounded-2xl p-10 text-center">
            <p className="text-4xl mb-4">❌</p>
            <p className="text-2xl font-bold text-red-600 mb-3">{error}</p>
            <p className="text-lg text-red-500">코인 이름을 확인하고 다시 시도해주세요</p>
          </div>
        )}

        {/* 분석 결과 */}
        {analysis && (
          <div id="analysis-result" className="space-y-6">
            {/* 기본 정보 카드 */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-4xl sm:text-5xl font-bold">{analysis.name}</h2>
                  <p className="text-purple-100 text-2xl mt-2 font-semibold">{analysis.symbol}</p>
                  <p className="text-purple-200 text-lg mt-2">🏆 시장 순위 #{analysis.rank}</p>
                </div>
                {analysis.fromCache && (
                  <span className="px-4 py-2 bg-white/20 rounded-xl text-base font-medium">
                    ⚡ 캐시
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white/10 rounded-2xl p-5">
                  <p className="text-purple-200 text-lg mb-2">💵 현재가 (USD)</p>
                  <p className="text-4xl sm:text-5xl font-bold">${analysis.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-5">
                  <p className="text-purple-200 text-lg mb-2">💰 현재가 (원화)</p>
                  <p className="text-4xl sm:text-5xl font-bold">₩{analysis.priceKRW.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-purple-200 text-base mb-2">📅 24시간</p>
                  <p className={`text-2xl font-bold ${analysis.change24h >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {analysis.change24h >= 0 ? '▲' : '▼'} {Math.abs(analysis.change24h).toFixed(2)}%
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-purple-200 text-base mb-2">📅 7일</p>
                  <p className={`text-2xl font-bold ${analysis.change7d >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {analysis.change7d >= 0 ? '▲' : '▼'} {Math.abs(analysis.change7d).toFixed(2)}%
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-purple-200 text-base mb-2">📅 30일</p>
                  <p className={`text-2xl font-bold ${analysis.change30d >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {analysis.change30d >= 0 ? '▲' : '▼'} {Math.abs(analysis.change30d).toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* 데이터 시간 */}
              {analysis.generatedAt && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-purple-200 text-sm">
                    🕐 분석 기준 시간: {new Date(analysis.generatedAt).toLocaleString('ko-KR', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* 투자 가격대 (진입가, 목표가, 손절가) */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-xl p-8 sm:p-10 border-3 border-green-400">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">💰 투자 가격대 가이드</h3>
              <p className="text-lg font-semibold text-gray-700 mb-8">
                현재 시장을 분석한 추천 가격입니다
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                {/* 진입가 */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border-3 border-blue-400">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">🎯</span>
                    <p className="text-xl font-bold text-blue-600">진입가</p>
                  </div>
                  <p className="text-base text-gray-600 mb-2">이 가격에 사세요</p>
                  <p className="text-4xl sm:text-5xl font-bold text-blue-600 mb-3">
                    ${analysis.recommendation.investmentLevels.entryPrice.toFixed(6)}
                  </p>
                  <p className="text-xl font-semibold text-gray-700">
                    ≈ ₩{(analysis.recommendation.investmentLevels.entryPrice * 1350).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
                  </p>
                </div>

                {/* 손절가 */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border-3 border-red-400">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">🛑</span>
                    <p className="text-xl font-bold text-red-600">손절가</p>
                  </div>
                  <p className="text-base text-gray-600 mb-2">여기까지 떨어지면 파세요</p>
                  <p className="text-4xl sm:text-5xl font-bold text-red-600 mb-3">
                    ${analysis.recommendation.investmentLevels.stopLoss.toFixed(6)}
                  </p>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    ≈ ₩{(analysis.recommendation.investmentLevels.stopLoss * 1350).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-base text-red-700 font-bold">
                    {((analysis.recommendation.investmentLevels.stopLoss / analysis.recommendation.investmentLevels.entryPrice - 1) * 100).toFixed(1)}% 손실 시
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {/* 1차 목표가 */}
                <div className="bg-white rounded-xl p-5 shadow-xl border-3 border-green-300">
                  <div className="text-center mb-3">
                    <span className="text-3xl">🎯</span>
                    <p className="text-base font-bold text-green-600 mt-1">1차 목표가</p>
                  </div>
                  <p className="text-3xl font-bold text-green-600 text-center mb-2">
                    ${analysis.recommendation.investmentLevels.targetPrice1.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600 text-center mb-2">
                    ≈ ₩{(analysis.recommendation.investmentLevels.targetPrice1 * 1350).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-base text-green-700 font-bold text-center bg-green-50 py-2 rounded-lg">
                    +{((analysis.recommendation.investmentLevels.targetPrice1 / analysis.recommendation.investmentLevels.entryPrice - 1) * 100).toFixed(1)}% 수익
                  </p>
                </div>

                {/* 2차 목표가 */}
                <div className="bg-white rounded-xl p-5 shadow-xl border-3 border-green-400">
                  <div className="text-center mb-3">
                    <span className="text-3xl">🎯🎯</span>
                    <p className="text-base font-bold text-green-600 mt-1">2차 목표가</p>
                  </div>
                  <p className="text-3xl font-bold text-green-600 text-center mb-2">
                    ${analysis.recommendation.investmentLevels.targetPrice2.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600 text-center mb-2">
                    ≈ ₩{(analysis.recommendation.investmentLevels.targetPrice2 * 1350).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-base text-green-700 font-bold text-center bg-green-50 py-2 rounded-lg">
                    +{((analysis.recommendation.investmentLevels.targetPrice2 / analysis.recommendation.investmentLevels.entryPrice - 1) * 100).toFixed(1)}% 수익
                  </p>
                </div>

                {/* 3차 목표가 */}
                <div className="bg-white rounded-xl p-5 shadow-xl border-3 border-green-500">
                  <div className="text-center mb-3">
                    <span className="text-3xl">🎯🎯🎯</span>
                    <p className="text-base font-bold text-green-700 mt-1">3차 목표가</p>
                  </div>
                  <p className="text-3xl font-bold text-green-700 text-center mb-2">
                    ${analysis.recommendation.investmentLevels.targetPrice3.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600 text-center mb-2">
                    ≈ ₩{(analysis.recommendation.investmentLevels.targetPrice3 * 1350).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-base text-green-800 font-bold text-center bg-green-50 py-2 rounded-lg">
                    +{((analysis.recommendation.investmentLevels.targetPrice3 / analysis.recommendation.investmentLevels.entryPrice - 1) * 100).toFixed(1)}% 수익
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6">
                <p className="text-lg font-bold text-gray-800 mb-3">📝 설명</p>
                <p className="text-base text-gray-700 leading-relaxed mb-4">{analysis.recommendation.investmentLevels.reasoning}</p>
                <p className="text-base text-orange-600 font-semibold bg-orange-50 p-4 rounded-lg">
                  ⚠️ 이 가격대는 참고용이에요. 본인 판단이 가장 중요합니다.
                </p>
              </div>
            </div>

            {/* AI 투자 의견 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-800">🤖 AI 투자 분석</h3>
                {!showPrediction && (
                  <button
                    onClick={() => fetchPrediction(analysis.symbol)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl text-lg font-bold shadow-xl transform hover:scale-105 transition-all"
                  >
                    🔮 가격 예측 보기
                  </button>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <div className={`px-8 py-4 rounded-2xl font-bold text-2xl ${getDecisionColor(analysis.recommendation.decision)}`}>
                  {getDecisionText(analysis.recommendation.decision)}
                </div>
                <div className="px-6 py-3 bg-blue-50 text-blue-700 rounded-xl text-lg font-bold">
                  🎯 신뢰도 {analysis.recommendation.confidence}%
                </div>
                <div className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-lg font-semibold">
                  📅 {analysis.recommendation.timeHorizon}
                </div>
              </div>

              {analysis.recommendation.targetPrice && (
                <div className="mb-6 p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-purple-700 font-medium mb-1">목표가</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${analysis.recommendation.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}

              <div className="prose max-w-none">
                <p className="text-gray-800 leading-relaxed mb-8 text-xl font-medium">
                  {analysis.recommendation.reasoning}
                </p>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="bg-green-50 rounded-xl p-6">
                    <h4 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                      <span className="text-3xl">✅</span> 핵심 포인트
                    </h4>
                    <ul className="space-y-3">
                      {analysis.recommendation.keyPoints.map((point, idx) => (
                        <li key={idx} className="text-gray-800 text-base flex items-start gap-3">
                          <span className="text-green-600 text-xl mt-1 font-bold">•</span>
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-xl p-6">
                    <h4 className="text-2xl font-bold text-red-700 mb-4 flex items-center gap-2">
                      <span className="text-3xl">⚠️</span> 리스크
                    </h4>
                    <ul className="space-y-3">
                      {analysis.recommendation.risks.map((risk, idx) => (
                        <li key={idx} className="text-gray-800 text-base flex items-start gap-3">
                          <span className="text-red-600 text-xl mt-1 font-bold">•</span>
                          <span className="leading-relaxed">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 시장 지표 */}
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">📊 시장 정보</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <p className="text-lg text-gray-600 mb-2">🏦 시가총액</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">${analysis.marketCap}</p>
                  <p className="text-base text-gray-500 mt-2">₩{analysis.marketCapKRW}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <p className="text-lg text-gray-600 mb-2">💸 24시간 거래량</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">${analysis.volume24h}</p>
                  <p className="text-base text-gray-500 mt-2">₩{analysis.volume24hKRW}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <p className="text-lg text-gray-600 mb-2">📈 24시간 최고/최저</p>
                  <p className="text-xl font-bold text-green-600">🔺 ${analysis.high24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xl font-bold text-red-600">🔻 ${analysis.low24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <p className="text-lg text-gray-600 mb-2">🪙 유통 공급량</p>
                  <p className="text-2xl font-bold text-gray-800">{analysis.circulatingSupply}</p>
                  <p className="text-base text-gray-500 mt-2">{analysis.symbol}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <p className="text-lg text-gray-600 mb-2">♾️ 최대 공급량</p>
                  <p className="text-2xl font-bold text-gray-800">{analysis.maxSupply || '무제한 ♾️'}</p>
                  <p className="text-base text-gray-500 mt-2">{analysis.symbol}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <p className="text-lg text-gray-600 mb-2">🏆 역대 최고가</p>
                  <p className="text-2xl font-bold text-gray-800">${analysis.ath.toLocaleString('en-US')}</p>
                  <p className={`text-lg font-bold mt-2 ${analysis.athChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ATH 대비 {analysis.athChange.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{analysis.athDate}</p>
                </div>
              </div>
            </div>

            {/* 가격 예측 (재미용!) */}
            {showPrediction && prediction && (
              <div id="prediction-section" className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl shadow-xl p-8 sm:p-10 border-3 border-purple-400">
                <div className="text-center mb-8">
                  <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">🔮 AI 가격 예측</h3>
                  <p className="text-lg text-purple-700 font-bold bg-purple-100 inline-block px-6 py-3 rounded-xl">
                    ⚠️ 재미로만 보세요! 정확하지 않을 수 있어요!
                  </p>
                  <p className="text-lg text-gray-700 mt-4 font-semibold">
                    현재가: ${analysis.price.toFixed(6)}
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-5 mb-8">
                  {/* 1일 후 */}
                  <div className="bg-white rounded-xl p-6 shadow-xl">
                    <p className="text-lg font-bold text-gray-700 mb-3">📅 1일 후</p>
                    <p className="text-4xl font-bold text-purple-600 mb-3">
                      ${prediction.day1.price.toFixed(6)}
                    </p>
                    <p className={`text-2xl font-bold ${prediction.day1.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {prediction.day1.change >= 0 ? '▲ +' : '▼ '}{Math.abs(prediction.day1.change).toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                      신뢰도: {prediction.day1.confidence}
                    </p>
                  </div>

                  {/* 7일 후 */}
                  <div className="bg-white rounded-xl p-6 shadow-xl">
                    <p className="text-lg font-bold text-gray-700 mb-3">📅 7일 후</p>
                    <p className="text-4xl font-bold text-blue-600 mb-3">
                      ${prediction.day7.price.toFixed(6)}
                    </p>
                    <p className={`text-2xl font-bold ${prediction.day7.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {prediction.day7.change >= 0 ? '▲ +' : '▼ '}{Math.abs(prediction.day7.change).toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                      신뢰도: {prediction.day7.confidence}
                    </p>
                  </div>

                  {/* 30일 후 */}
                  <div className="bg-white rounded-xl p-6 shadow-xl">
                    <p className="text-lg font-bold text-gray-700 mb-3">📅 30일 후</p>
                    <p className="text-4xl font-bold text-pink-600 mb-3">
                      ${prediction.day30.price.toFixed(6)}
                    </p>
                    <p className={`text-2xl font-bold ${prediction.day30.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {prediction.day30.change >= 0 ? '▲ +' : '▼ '}{Math.abs(prediction.day30.change).toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                      신뢰도: {prediction.day30.confidence}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <p className="text-lg font-bold text-gray-800 mb-3">📝 예측 근거</p>
                  <p className="text-base text-gray-700 leading-relaxed mb-4">{prediction.reasoning}</p>
                  <p className="text-base text-orange-600 font-semibold bg-orange-50 p-4 rounded-lg mb-3">{prediction.disclaimer}</p>
                  <p className="text-base text-gray-600 bg-gray-50 p-4 rounded-lg">
                    이 예측은 AI가 분석한 것으로, 실제 가격과 크게 다를 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            {/* 기술적 지표 & 시장 심리 */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* 기술적 지표 */}
              <div className="bg-white rounded-xl shadow-xl p-8">
                <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">📊 기술적 지표</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-lg font-semibold text-gray-700">RSI (상대강도지수)</span>
                      <span className="text-2xl font-bold text-gray-800">
                        {analysis.technicalIndicators.rsi?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    {analysis.technicalIndicators.rsi && (
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full ${
                            analysis.technicalIndicators.rsi > 70 ? 'bg-red-500' : 
                            analysis.technicalIndicators.rsi < 30 ? 'bg-green-500' : 
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${analysis.technicalIndicators.rsi}%` }}
                        />
                      </div>
                    )}
                    <p className="text-base font-semibold text-gray-700 mt-2">
                      {analysis.technicalIndicators.rsi && analysis.technicalIndicators.rsi > 70 ? '🔴 과매수 (너무 비쌌 수 있음)' : 
                       analysis.technicalIndicators.rsi && analysis.technicalIndicators.rsi < 30 ? '🟢 과매도 (너무 싼 수 있음)' : '🟡 중립'}
                    </p>
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-gray-700 mb-3">추세</p>
                    <p className="text-3xl font-bold">
                      {getTrendEmoji(analysis.technicalIndicators.trend)} {analysis.technicalIndicators.trend}
                    </p>
                  </div>

                  {analysis.technicalIndicators.support && (
                    <div>
                      <p className="text-lg font-semibold text-gray-700 mb-2">🛡️ 지지선 (버티는 가격)</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${analysis.technicalIndicators.support.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {analysis.technicalIndicators.resistance && (
                    <div>
                      <p className="text-lg font-semibold text-gray-700 mb-2">🚧 저항선 (넘기 힘든 가격)</p>
                      <p className="text-2xl font-bold text-red-600">
                        ${analysis.technicalIndicators.resistance.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 시장 심리 */}
              <div className="bg-white rounded-xl shadow-xl p-8">
                <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">🎭 시장 심리</h3>
                
                {analysis.fearGreedIndex !== null && (
                  <div className="mb-8">
                    <p className="text-lg font-semibold text-gray-700 mb-3">공포-탐욕 지수</p>
                    <div className="flex items-center gap-4 mb-4">
                      <p className="text-5xl font-bold text-gray-800">{analysis.fearGreedIndex}</p>
                      <div>
                        <p className={`text-2xl font-bold ${getFearGreedText(analysis.fearGreedIndex)?.color}`}>
                          {getFearGreedText(analysis.fearGreedIndex)?.emoji} {getFearGreedText(analysis.fearGreedIndex)?.text}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-5">
                      <div 
                        className={`h-5 rounded-full ${
                          analysis.fearGreedIndex <= 25 ? 'bg-red-500' :
                          analysis.fearGreedIndex <= 45 ? 'bg-orange-500' :
                          analysis.fearGreedIndex <= 55 ? 'bg-gray-500' :
                          analysis.fearGreedIndex <= 75 ? 'bg-green-500' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${analysis.fearGreedIndex}%` }}
                      />
                    </div>
                    <p className="text-base text-gray-600 mt-3 font-medium">
                      0 = 극단적 공포, 100 = 극단적 탐욕
                    </p>
                  </div>
                )}

                {analysis.dominance !== null && (
                  <div className="mb-6">
                    <p className="text-lg font-semibold text-gray-700 mb-3">비트코인 도미넌스</p>
                    <p className="text-4xl font-bold text-orange-600">{analysis.dominance.toFixed(2)}%</p>
                    <p className="text-base text-gray-600 mt-2">전체 시장에서 BTC 비중</p>
                  </div>
                )}

                <div className="mt-6 p-5 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <p className="text-lg text-yellow-800 font-bold leading-relaxed">
                    ⚠️ 암호화폐는 가격 변동이 매우 큽니다. 투자하기 전에 충분히 조사하고 신중하게 결정하세요.
                  </p>
                </div>
              </div>
            </div>

            {/* 장기 투자 전망 */}
            {analysis.recommendation.longTermOutlook && (
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl p-8 sm:p-10 border-3 border-indigo-300">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">🔮 장기 투자 전망</h3>
                <p className="text-xl text-indigo-700 font-semibold mb-8">
                  {analysis.recommendation.longTermOutlook.summary}
                </p>

                {/* 투자 가치 */}
                <div className="bg-white rounded-xl p-6 mb-6">
                  <h4 className="text-2xl font-bold text-gray-800 mb-3">💎 장기적인 가치</h4>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {analysis.recommendation.longTermOutlook.potential}
                  </p>
                </div>

                {/* 실제 활용 사례 */}
                <div className="bg-white rounded-xl p-6 mb-6">
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">🏢 어디에 쓰이나요?</h4>
                  <ul className="space-y-3">
                    {analysis.recommendation.longTermOutlook.useCases.map((useCase, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-2xl mt-1">✅</span>
                        <span className="text-lg text-gray-700 leading-relaxed">{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 주요 파트너십 */}
                <div className="bg-white rounded-xl p-6 mb-6">
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">🤝 어떤 회사와 협력하나요?</h4>
                  <ul className="space-y-3">
                    {analysis.recommendation.longTermOutlook.partnerships.map((partnership, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-2xl mt-1">🔗</span>
                        <span className="text-lg text-gray-700 leading-relaxed">{partnership}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 미래 전망 */}
                <div className="bg-white rounded-xl p-6 mb-6">
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">🚀 앞으로 어떻게 될까요?</h4>
                  <ul className="space-y-3">
                    {analysis.recommendation.longTermOutlook.futureProspects.map((prospect, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-2xl mt-1">📈</span>
                        <span className="text-lg text-gray-700 leading-relaxed">{prospect}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 장기 리스크 */}
                <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-300">
                  <h4 className="text-2xl font-bold text-orange-800 mb-4">⚠️ 조심해야 할 점</h4>
                  <ul className="space-y-3">
                    {analysis.recommendation.longTermOutlook.risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-2xl mt-1">⚡</span>
                        <span className="text-lg text-gray-700 leading-relaxed">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 거래소 바로가기 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-xl p-8 sm:p-10 border-3 border-blue-300">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">🏦 거래소에서 사고 팔기</h3>
              <p className="text-xl text-center text-gray-700 mb-8">
                아래 거래소에서 <span className="font-bold text-blue-600">{analysis.name}</span>을(를) 거래할 수 있어요
              </p>
              
              <div className="grid sm:grid-cols-3 gap-4">
                {/* 업비트 */}
                <a
                  href="https://upbit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-blue-200 hover:border-blue-400"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-4">🔵</div>
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">업비트</h4>
                    <p className="text-base text-gray-600 mb-4">국내 1위 거래소</p>
                    <div className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-lg">
                      바로가기 →
                    </div>
                  </div>
                </a>

                {/* 빗썸 */}
                <a
                  href="https://www.bithumb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-orange-200 hover:border-orange-400"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-4">🟠</div>
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">빗썸</h4>
                    <p className="text-base text-gray-600 mb-4">다양한 코인 취급</p>
                    <div className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-lg">
                      바로가기 →
                    </div>
                  </div>
                </a>

                {/* 코인원 */}
                <a
                  href="https://coinone.co.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-green-200 hover:border-green-400"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-4">🟢</div>
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">코인원</h4>
                    <p className="text-base text-gray-600 mb-4">안정적인 거래</p>
                    <div className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg">
                      바로가기 →
                    </div>
                  </div>
                </a>
              </div>

              <div className="mt-8 p-5 bg-yellow-50 rounded-xl border-2 border-yellow-300">
                <p className="text-lg text-center text-yellow-800 font-bold leading-relaxed">
                  💡 거래소 가입 후 본인인증을 하셔야 거래할 수 있어요
                </p>
              </div>
            </div>

            {/* 데이터 출처 */}
            <div className="text-center text-lg text-gray-600 py-6">
              <p className="font-semibold">📊 데이터 출처: CoinGecko API, Alternative.me</p>
              <p className="mt-2">본 분석은 투자 권유가 아닌 참고 자료입니다.</p>
              <p className="mt-1 text-base">투자 결정은 본인의 판단과 책임 하에 신중하게 하세요.</p>
            </div>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-2xl font-bold mb-3">🪙 CNL</p>
          <p className="text-gray-300 text-lg">AI 기반 암호화폐 분석 서비스</p>
          <p className="text-gray-400 text-base mt-4">
            © 2025 CNL. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
