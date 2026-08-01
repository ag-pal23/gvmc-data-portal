import { handleGetAnalytics } from '@/backend/controllers/analyticsController';

export async function GET(request: Request) {
  return handleGetAnalytics(request);
}
