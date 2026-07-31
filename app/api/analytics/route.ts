import { NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/data-service';

export async function GET(request: Request) {
  try {
    const result = await getAnalyticsData();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
