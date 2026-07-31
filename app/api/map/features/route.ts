import { NextResponse } from 'next/server';
import { getMapFeatures } from '@/lib/data-service';

export async function GET(request: Request) {
  try {
    const features = getMapFeatures();
    return NextResponse.json({ data: features, source: 'geojson' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
