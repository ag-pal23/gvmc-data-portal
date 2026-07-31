import { NextResponse } from 'next/server';
import { getDatasetById } from '@/lib/data-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await getDatasetById(id);
    if (!result.data) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
