import { NextResponse } from 'next/server';
import { handleGetPredictions } from '@/backend/controllers/predictionsController';

export async function GET(request: Request) {
  return handleGetPredictions(request);
}
