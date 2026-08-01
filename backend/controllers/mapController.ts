import { NextResponse } from 'next/server';
import { getMapFeatures } from '../services/dataService';

export async function handleGetMapFeatures(request: Request) {
  try {
    const features = getMapFeatures();
    return NextResponse.json({ data: features, source: 'geojson' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
