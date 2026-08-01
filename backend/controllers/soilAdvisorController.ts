import { NextResponse } from 'next/server';
import { getSoilFeasibilityReport } from '../services/dataService';

export async function handleGetSoilFeasibility(request: Request) {
  try {
    const params = await request.json();
    if (!params || typeof params !== 'object') {
      return NextResponse.json({ error: 'Parameters object is required' }, { status: 400 });
    }
    const report = getSoilFeasibilityReport(params);
    return NextResponse.json({ data: report, source: 'model' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
