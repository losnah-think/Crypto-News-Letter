import { createClient } from '@supabase/supabase-js';

// 환경 변수 체크 (빌드 타임에는 더미 값 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

// 런타임 환경 변수 체크
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // 서버 사이드 프로덕션 환경에서만 검증
  if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
    console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다. Vercel에서 환경 변수를 설정하세요.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// 서버 사이드용 (Service Role Key)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey
);
