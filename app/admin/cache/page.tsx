'use client';

import { useState, useEffect } from 'react';

interface CacheStatus {
  status: string;
  timestamp: string;
  summary: {
    total: number;
    valid: number;
    expired: number;
    crypto: number;
  };
  cryptoCache: Array<{
    key: string;
    symbol: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    remainingTime: string;
  }>;
}

export default function CacheAdminPage() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);

  const fetchCacheStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/cache-status');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || '캐시 상태 조회 실패');
      }
      const data = await response.json();
      setCacheStatus(data);
    } catch (err: any) {
      setError(err.message);
      console.error('캐시 상태 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const cleanupExpiredCache = async () => {
    setCleaning(true);
    try {
      const response = await fetch('/api/admin/cache-status', {
        method: 'DELETE',
      });
      const data = await response.json();
      alert(`✅ ${data.deletedCount}개의 만료된 캐시를 삭제했습니다.`);
      fetchCacheStatus();
    } catch (err: any) {
      alert(`❌ 캐시 삭제 실패: ${err.message}`);
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => {
    fetchCacheStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🗄️ 캐시 DB 관리</h1>
              <p className="text-gray-600">Supabase 캐시 테이블 상태 확인</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchCacheStatus}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:bg-gray-300 transition-colors"
              >
                {loading ? '조회 중...' : '🔄 새로고침'}
              </button>
              <button
                onClick={cleanupExpiredCache}
                disabled={cleaning || loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:bg-gray-300 transition-colors"
              >
                {cleaning ? '삭제 중...' : '🗑️ 만료 삭제'}
              </button>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl">❌</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-800 mb-2">DB 연결 실패</h3>
                <p className="text-red-700 mb-3">{error}</p>
                <div className="bg-white rounded-lg p-4 text-sm">
                  <p className="font-semibold text-gray-800 mb-2">해결 방법:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700">
                    <li>Supabase에 <code className="bg-gray-100 px-2 py-1 rounded">cache</code> 테이블이 있는지 확인</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">supabase-cache-setup.sql</code> 파일을 SQL Editor에서 실행</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>에 <code className="bg-gray-100 px-2 py-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> 설정 확인</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 요약 카드 */}
        {cacheStatus && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-3xl mb-2">📦</div>
                <div className="text-3xl font-bold text-gray-800">{cacheStatus.summary.total}</div>
                <div className="text-sm text-gray-600 mt-1">전체 캐시</div>
              </div>
              <div className="bg-green-50 rounded-xl shadow p-6">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-3xl font-bold text-green-600">{cacheStatus.summary.valid}</div>
                <div className="text-sm text-gray-600 mt-1">유효한 캐시</div>
              </div>
              <div className="bg-red-50 rounded-xl shadow p-6">
                <div className="text-3xl mb-2">⏰</div>
                <div className="text-3xl font-bold text-red-600">{cacheStatus.summary.expired}</div>
                <div className="text-sm text-gray-600 mt-1">만료된 캐시</div>
              </div>
              <div className="bg-blue-50 rounded-xl shadow p-6">
                <div className="text-3xl mb-2">🪙</div>
                <div className="text-3xl font-bold text-blue-600">{cacheStatus.summary.crypto}</div>
                <div className="text-sm text-gray-600 mt-1">암호화폐 캐시</div>
              </div>
            </div>

            {/* 암호화폐 캐시 목록 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🪙 암호화폐 캐시 목록</h2>
              
              {cacheStatus.cryptoCache.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-xl text-gray-600">캐시된 암호화폐 데이터가 없습니다</p>
                  <p className="text-sm text-gray-500 mt-2">코인을 검색하면 여기에 표시됩니다</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-bold text-gray-700">심볼</th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">캐시 키</th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">생성 시간</th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">수정 시간</th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">남은 시간</th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cacheStatus.cryptoCache.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                              {item.symbol}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-sm text-gray-600">{item.key}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(item.createdAt).toLocaleString('ko-KR')}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(item.updatedAt).toLocaleString('ko-KR')}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                              {item.remainingTime}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                              ✓ 유효
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 정보 카드 */}
            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-800 mb-3">💡 캐시 정보</h3>
              <ul className="space-y-2 text-blue-700">
                <li>• 캐시 유지 시간: <strong>6시간</strong></li>
                <li>• 캐시 키 형식: <code className="bg-white px-2 py-1 rounded">crypto:SYMBOL:full</code></li>
                <li>• 마지막 업데이트: {new Date(cacheStatus.timestamp).toLocaleString('ko-KR')}</li>
                <li>• DB 상태: <strong className="text-green-600">✓ 정상 연결</strong></li>
              </ul>
            </div>
          </>
        )}

        {/* 로딩 */}
        {loading && !cacheStatus && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-semibold">캐시 상태 조회 중...</p>
          </div>
        )}
      </div>
    </div>
  );
}
