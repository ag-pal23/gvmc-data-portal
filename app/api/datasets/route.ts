import { handleGetDatasets, handleCreateDataset } from '@/backend/controllers/datasetsController';

export async function GET(request: Request) {
  return handleGetDatasets(request);
}

export async function POST(request: Request) {
  return handleCreateDataset(request);
}
