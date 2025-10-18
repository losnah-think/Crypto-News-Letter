import { supabaseAdmin } from './supabase';

interface CachedData {
  key: string;
  value: any;
  expires_at: string;
}

export class CacheService {
  /**
   * 캐시에서 데이터 가져오기
   */
  async get(key: string): Promise<any | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('cache')
        .select('value, expires_at')
        .eq('key', key)
        .single();

      if (error || !data) {
        return null;
      }

      // 만료 확인
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        // 만료된 캐시 삭제
        await this.delete(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * 캐시에 데이터 저장
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    try {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + ttlSeconds);

      const { error, data } = await supabaseAdmin
        .from('cache')
        .upsert({
          key,
          value,
          expires_at: expiresAt.toISOString(),
        }, {
          onConflict: 'key'
        })
        .select();

      if (error) {
        console.error(`❌ 캐시 저장 실패 (${key}):`, error.message, error.details);
        return false;
      }
      
      console.log(`✅ 캐시 저장 성공 (${key}), 만료: ${expiresAt.toLocaleString('ko-KR')}`);
      return true;
    } catch (error: any) {
      console.error(`❌ 캐시 저장 예외 (${key}):`, error.message);
      return false;
    }
  }

  /**
   * 캐시 삭제
   */
  async delete(key: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('cache')
        .delete()
        .eq('key', key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * 패턴으로 캐시 삭제 (예: "stock:NVDA:*")
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const { data } = await supabaseAdmin
        .from('cache')
        .select('key')
        .like('key', pattern.replace('*', '%'));

      if (data) {
        const keys = data.map(item => item.key);
        await supabaseAdmin
          .from('cache')
          .delete()
          .in('key', keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  /**
   * 만료된 캐시 정리
   */
  async cleanup(): Promise<void> {
    try {
      await supabaseAdmin
        .from('cache')
        .delete()
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  // 편의 메서드들

  /**
   * 재무 데이터 캐시 (1시간)
   */
  async getFinancialData(ticker: string) {
    return this.get(`stock:${ticker}:financial`);
  }

  async setFinancialData(ticker: string, data: any) {
    return this.set(`stock:${ticker}:financial`, data, 3600); // 1 hour
  }

  /**
   * AI 분석 캐시 (30분)
   */
  async getAnalysis(ticker: string) {
    return this.get(`stock:${ticker}:analysis`);
  }

  async setAnalysis(ticker: string, data: any) {
    return this.set(`stock:${ticker}:analysis`, data, 1800); // 30 minutes
  }

  /**
   * 뉴스 캐시 (15분)
   */
  async getNews(ticker: string) {
    return this.get(`stock:${ticker}:news`);
  }

  async setNews(ticker: string, data: any) {
    return this.set(`stock:${ticker}:news`, data, 900); // 15 minutes
  }

  /**
   * 전체 분석 결과 캐시 (6시간)
   */
  async getFullAnalysis(ticker: string) {
    return this.get(`stock:${ticker}:full`);
  }

  async setFullAnalysis(ticker: string, data: any) {
    return this.set(`stock:${ticker}:full`, data, 21600); // 6 hours
  }

  /**
   * 특정 종목의 모든 캐시 삭제
   */
  async invalidateStock(ticker: string) {
    await this.deletePattern(`stock:${ticker}:*`);
  }

  /**
   * 암호화폐 전체 분석 캐시 (6시간)
   */
  async getCryptoAnalysis(symbol: string) {
    const key = `crypto:${symbol}:full`;
    console.log(`🔍 캐시 조회 시도: ${key}`);
    const result = await this.get(key);
    if (result) {
      console.log(`✅ 캐시 히트: ${key}`);
    } else {
      console.log(`❌ 캐시 미스: ${key}`);
    }
    return result;
  }

  async setCryptoAnalysis(symbol: string, data: any) {
    const key = `crypto:${symbol}:full`;
    console.log(`💾 캐시 저장 시도: ${key}`);
    return this.set(key, data, 21600); // 6 hours
  }

  /**
   * 암호화폐 캐시 무효화
   */
  async invalidateCrypto(symbol: string) {
    await this.deletePattern(`crypto:${symbol}:*`);
  }
}
