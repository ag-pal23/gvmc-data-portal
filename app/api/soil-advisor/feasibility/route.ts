import { handleGetSoilFeasibility } from '@/backend/controllers/soilAdvisorController';

export async function POST(request: Request) {
  return handleGetSoilFeasibility(request);
}
