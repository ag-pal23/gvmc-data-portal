import { NextResponse } from 'next/server';
import { getAnalyticsData } from '../services/dataService';

export async function handleGetAnalytics(request: Request) {
  try {
    const result = await getAnalyticsData();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
