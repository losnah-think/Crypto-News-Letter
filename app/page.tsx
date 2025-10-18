'use client';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-6xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
            🪙 CNL
          </h1>
          <p className="text-2xl sm:text-3xl font-semibold text-gray-700 mb-2">
            암호화폐 분석 서비스
          </p>
          <p className="text-lg text-gray-600">
            AI가 실시간으로 코인을 분석해드립니다
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-10 sm:p-12 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
              어떤 코인을 분석할까요?
            </p>
            <a
              href="/crypto"
              className="inline-block px-12 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-bold text-2xl shadow-2xl transition-all transform hover:scale-105"
            >
              코인 분석 시작 →
            </a>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">실시간 데이터</h3>
              <p className="text-base text-gray-600">정확한 코인 정보</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">AI 분석</h3>
              <p className="text-base text-gray-600">똑똑한 투자 조언</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">투자 가격대</h3>
              <p className="text-base text-gray-600">사고 팔 가격 추천</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
