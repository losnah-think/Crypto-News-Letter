'use client';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            🪙 CNL - Crypto News Letter
          </h1>
          <p className="text-xl text-gray-600">
            AI 기반 암호화폐 분석 서비스
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-lg text-gray-700 mb-6">
              암호화폐 분석을 시작하세요!
            </p>
            <a
              href="/crypto"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all"
            >
              코인 분석 시작하기 →
            </a>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-bold text-gray-800 mb-2">실시간 데이터</h3>
              <p className="text-sm text-gray-600">CoinGecko API 기반</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-bold text-gray-800 mb-2">AI 분석</h3>
              <p className="text-sm text-gray-600">GPT-4 기반 투자 분석</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold text-gray-800 mb-2">투자 가격대</h3>
              <p className="text-sm text-gray-600">목표가/손절가 가이드</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
