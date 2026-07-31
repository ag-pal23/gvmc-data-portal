import { NextResponse } from 'next/server';
import { getDatasets } from '@/lib/data-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;

  try {
    const result = await getDatasets(q, category);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Stub for creating datasets
  return NextResponse.json({ message: 'Dataset insertion stub' }, { status: 201 });
}
