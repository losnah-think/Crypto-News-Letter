/**
 * DB 연결 테스트 API
 * GET /api/admin/db-test
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    success: true,
  };

  // 1. 기본 연결 테스트
  try {
    const { data, error } = await supabaseAdmin
      .from('cache')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    results.tests.push({
      name: '1. DB 연결 테스트',
      status: 'PASS',
      message: '✅ Supabase 연결 성공',
    });
  } catch (error: any) {
    results.success = false;
    results.tests.push({
      name: '1. DB 연결 테스트',
      status: 'FAIL',
      message: `❌ ${error.message}`,
      hint: 'SUPABASE_SERVICE_ROLE_KEY 환경 변수를 확인하세요',
    });
    return NextResponse.json(results, { status: 500 });
  }

  // 2. 테이블 존재 확인
  try {
    const { error } = await supabaseAdmin
      .from('cache')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    results.tests.push({
      name: '2. cache 테이블 존재 확인',
      status: 'PASS',
      message: '✅ cache 테이블 존재',
    });
  } catch (error: any) {
    results.success = false;
    results.tests.push({
      name: '2. cache 테이블 존재 확인',
      status: 'FAIL',
      message: `❌ ${error.message}`,
      hint: 'supabase-cache-setup.sql 파일을 실행하세요',
    });
    return NextResponse.json(results, { status: 500 });
  }

  // 3. 쓰기 테스트
  try {
    const testKey = `test:${Date.now()}`;
    const testValue = { test: true, timestamp: new Date().toISOString() };
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const { error: insertError } = await supabaseAdmin
      .from('cache')
      .insert({
        key: testKey,
        value: testValue,
        expires_at: expiresAt.toISOString(),
      });
    
    if (insertError) throw insertError;
    
    results.tests.push({
      name: '3. 쓰기 권한 테스트',
      status: 'PASS',
      message: '✅ 캐시 저장 가능',
      data: { key: testKey },
    });

    // 4. 읽기 테스트
    const { data: readData, error: readError } = await supabaseAdmin
      .from('cache')
      .select('*')
      .eq('key', testKey)
      .single();
    
    if (readError) throw readError;
    
    results.tests.push({
      name: '4. 읽기 권한 테스트',
      status: 'PASS',
      message: '✅ 캐시 조회 가능',
    });

    // 5. 삭제 테스트
    const { error: deleteError } = await supabaseAdmin
      .from('cache')
      .delete()
      .eq('key', testKey);
    
    if (deleteError) throw deleteError;
    
    results.tests.push({
      name: '5. 삭제 권한 테스트',
      status: 'PASS',
      message: '✅ 캐시 삭제 가능',
    });

  } catch (error: any) {
    results.success = false;
    results.tests.push({
      name: '쓰기/읽기/삭제 테스트',
      status: 'FAIL',
      message: `❌ ${error.message}`,
      hint: 'service_role 키에 적절한 권한이 있는지 확인하세요',
    });
    return NextResponse.json(results, { status: 500 });
  }

  // 6. 전체 캐시 통계
  try {
    const { count: totalCount } = await supabaseAdmin
      .from('cache')
      .select('*', { count: 'exact', head: true });

    const { count: validCount } = await supabaseAdmin
      .from('cache')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', new Date().toISOString());

    const { count: cryptoCount } = await supabaseAdmin
      .from('cache')
      .select('*', { count: 'exact', head: true })
      .like('key', 'crypto:%');

    results.tests.push({
      name: '6. 캐시 통계',
      status: 'PASS',
      message: `✅ 전체: ${totalCount}, 유효: ${validCount}, 암호화폐: ${cryptoCount}`,
    });
  } catch (error: any) {
    results.tests.push({
      name: '6. 캐시 통계',
      status: 'FAIL',
      message: `❌ ${error.message}`,
    });
  }

  return NextResponse.json(results);
}
