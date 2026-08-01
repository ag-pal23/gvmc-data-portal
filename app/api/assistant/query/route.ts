import { handleAskAssistant } from '@/backend/controllers/assistantController';

export async function POST(request: Request) {
  return handleAskAssistant(request);
}
