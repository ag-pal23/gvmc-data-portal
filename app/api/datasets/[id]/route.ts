import { handleGetDatasetById } from '@/backend/controllers/datasetsController';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetDatasetById(request, id);
}
