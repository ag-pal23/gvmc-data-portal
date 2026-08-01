import { NextResponse } from 'next/server';
import { getPredictionsData } from '../services/dataService';

export async function handleGetPredictions(request: Request) {
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
