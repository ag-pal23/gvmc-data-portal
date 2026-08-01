import { NextResponse } from 'next/server';
import { askAssistant } from '../services/dataService';

export async function handleAskAssistant(request: Request) {
  try {
    const { question } = await request.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required and must be a string' }, { status: 400 });
    }
    
    const result = await askAssistant(question);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
