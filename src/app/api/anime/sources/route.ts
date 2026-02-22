// src/app/api/anime/sources/route.ts
// Это нужно чтобы скрыть реальные URL от клиента
// и добавить CORS заголовки

import { NextRequest, NextResponse } from 'next/server';
import { consumetFetch } from '@/lib/api/smartClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const episodeId = searchParams.get('episodeId');
  const server = searchParams.get('server') || 'vidcloud';

  if (!episodeId) {
    return NextResponse.json({ error: 'episodeId required' }, { status: 400 });
  }

  try {
    const data = await consumetFetch<any>(
      `/anime/zoro/watch?episodeId=${encodeURIComponent(episodeId)}&server=${server}`
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}