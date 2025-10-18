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

    // 유효한 캐시 (만료되지 않은 것)
    const { data: validCache, count: validCount } = await supabaseAdmin
      .from('cache')
      .select('key, expires_at, created_at', { count: 'exact' })
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    // 만료된 캐시
    const { count: expiredCount } = await supabaseAdmin
      .from('cache')
      .select('*', { count: 'exact', head: true })
      .lt('expires_at', new Date().toISOString());

    // 암호화폐 캐시만
    const { data: cryptoCache, count: cryptoCount } = await supabaseAdmin
      .from('cache')
      .select('key, expires_at, created_at, updated_at', { count: 'exact' })
      .like('key', 'crypto:%')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

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
        expiresAt: item.expires_at,
        createdAt: item.created_at,
        remainingTime: `${Math.floor((new Date(item.expires_at).getTime() - Date.now()) / 1000 / 60)}분`,
      })) || [],
      cryptoCache: cryptoCache?.map(item => ({
        key: item.key,
        symbol: item.key.split(':')[1],
        expiresAt: item.expires_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        remainingTime: `${Math.floor((new Date(item.expires_at).getTime() - Date.now()) / 1000 / 60)}분`,
      })) || [],
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
