/**
 * 캐시 상태 확인 API
 * GET /api/admin/cache-status
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // 전체 캐시 개수
    const { count: totalCount } = await supabaseAdmin
      .from('cache')
      .select('*', { count: 'exact', head: true });

    // 유효한 캐시 (만료되지 않은 것) - 전체 데이터 포함
    const { data: validCache, count: validCount } = await supabaseAdmin
      .from('cache')
      .select('*', { count: 'exact' })
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    // 만료된 캐시 - 전체 데이터 포함
    const { data: expiredCache, count: expiredCount } = await supabaseAdmin
      .from('cache')
      .select('*', { count: 'exact' })
      .lt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    // 전체 캐시 이력 (최근 100개)
    const { data: allCache } = await supabaseAdmin
      .from('cache')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100);

    // 암호화폐 캐시만 - 전체 데이터 포함
    const { data: cryptoCache, count: cryptoCount } = await supabaseAdmin
      .from('cache')
      .select('*', { count: 'exact' })
      .like('key', 'crypto:%')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    // 캐시 통계 (코인별 히트/미스 분석용)
    const cacheStats = allCache?.reduce((acc: any, item: any) => {
      const symbol = item.key.split(':')[1];
      if (!acc[symbol]) {
        acc[symbol] = {
          symbol,
          count: 0,
          lastAccess: item.updated_at,
          isExpired: new Date(item.expires_at) < new Date(),
        };
      }
      acc[symbol].count++;
      if (new Date(item.updated_at) > new Date(acc[symbol].lastAccess)) {
        acc[symbol].lastAccess = item.updated_at;
      }
      return acc;
    }, {});

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      summary: {
        total: totalCount || 0,
        valid: validCount || 0,
        expired: expiredCount || 0,
        crypto: cryptoCount || 0,
      },
      validCache: validCache?.map(item => ({
        key: item.key,
        symbol: item.key.split(':')[1],
        type: item.key.split(':')[2] || 'full',
        value: item.value,
        expiresAt: item.expires_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        remainingTime: `${Math.floor((new Date(item.expires_at).getTime() - Date.now()) / 1000 / 60)}분`,
        remainingSeconds: Math.floor((new Date(item.expires_at).getTime() - Date.now()) / 1000),
        dataSize: JSON.stringify(item.value).length,
      })) || [],
      expiredCache: expiredCache?.map(item => ({
        key: item.key,
        symbol: item.key.split(':')[1],
        type: item.key.split(':')[2] || 'full',
        expiresAt: item.expires_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        expiredSince: `${Math.floor((Date.now() - new Date(item.expires_at).getTime()) / 1000 / 60)}분 전`,
        dataSize: JSON.stringify(item.value).length,
      })) || [],
      cryptoCache: cryptoCache?.map(item => ({
        key: item.key,
        symbol: item.key.split(':')[1],
        type: item.key.split(':')[2] || 'full',
        value: item.value,
        expiresAt: item.expires_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        remainingTime: `${Math.floor((new Date(item.expires_at).getTime() - Date.now()) / 1000 / 60)}분`,
        dataSize: JSON.stringify(item.value).length,
      })) || [],
      cacheHistory: allCache?.map(item => ({
        key: item.key,
        symbol: item.key.split(':')[1],
        type: item.key.split(':')[2] || 'full',
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        expiresAt: item.expires_at,
        isExpired: new Date(item.expires_at) < new Date(),
        dataSize: JSON.stringify(item.value).length,
      })) || [],
      statistics: Object.values(cacheStats || {}),
    });
  } catch (error: any) {
    console.error('캐시 상태 조회 실패:', error);
    return NextResponse.json(
      { 
        error: '캐시 상태 조회 실패',
        message: error.message,
        detail: error.details || error.hint || '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

/**
 * 만료된 캐시 정리
 * DELETE /api/admin/cache-status
 */
export async function DELETE(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('cache')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: 'ok',
      message: '만료된 캐시 삭제 완료',
      deletedCount: data?.length || 0,
    });
  } catch (error: any) {
    console.error('캐시 삭제 실패:', error);
    return NextResponse.json(
      { 
        error: '캐시 삭제 실패',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
