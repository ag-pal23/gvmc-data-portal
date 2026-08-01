import { handleGetMapFeatures } from '@/backend/controllers/mapController';

export async function GET(request: Request) {
  return handleGetMapFeatures(request);
}
