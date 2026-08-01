import { NextResponse } from 'next/server';
import { getDatasets, getDatasetById } from '../services/dataService';

export async function handleGetDatasets(request: Request) {
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

export async function handleCreateDataset(request: Request) {
  return NextResponse.json({ message: 'Dataset insertion stub' }, { status: 201 });
}

export async function handleGetDatasetById(request: Request, id: string) {
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
