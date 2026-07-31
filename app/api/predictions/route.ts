import { NextResponse } from 'next/server';
import { getPredictionsData } from '@/lib/data-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ward = searchParams.get('ward') || 'all';
  const horizon = searchParams.get('horizon') || '24h';

  try {
    const result = await getPredictionsData(ward, horizon);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
