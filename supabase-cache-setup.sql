-- Supabase 캐시 테이블 생성 SQL
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 기존 테이블이 있으면 삭제 (선택사항)
-- DROP TABLE IF EXISTS cache;

-- 캐시 테이블 생성
CREATE TABLE IF NOT EXISTS cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 만료 시간 인덱스 (빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);

-- 자동 업데이트 타임스탬프
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cache_updated_at BEFORE UPDATE ON cache
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 만료된 캐시 자동 삭제 함수
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 주석 추가
COMMENT ON TABLE cache IS '암호화폐 및 AI 분석 결과 캐시';
COMMENT ON COLUMN cache.key IS '캐시 키 (예: crypto:BTC:full)';
COMMENT ON COLUMN cache.value IS '캐시된 데이터 (JSON)';
COMMENT ON COLUMN cache.expires_at IS '만료 시간';

-- 샘플 데이터 조회
SELECT 
  key,
  expires_at,
  CASE 
    WHEN expires_at > NOW() THEN '유효'
    ELSE '만료'
  END as status,
  created_at
FROM cache
ORDER BY created_at DESC
LIMIT 10;
