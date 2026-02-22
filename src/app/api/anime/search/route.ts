// src/app/api/anime/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { consumetFetch } from '@/lib/api/smartClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const page = searchParams.get('page') || '1';

  if (!query) {
    return NextResponse.json({ error: 'query required' }, { status: 400 });
  }

  try {
    const data = await consumetFetch<any>(
      `/anime/zoro/${encodeURIComponent(query)}?page=${page}`
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}