import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const eventTypeId = Number(params.id);
  try {
    const questions = await prisma.customQuestion.findMany({
      where: { eventTypeId },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const eventTypeId = Number(params.id);
  const { question, type, required, options, order } = await request.json();

  try {
    const newQuestion = await prisma.customQuestion.create({
      data: {
        eventTypeId,
        question,
        type: type || 'text',
        required: required || false,
        options: options ? JSON.stringify(options) : null,
        order: order || 0,
      },
    });
    return NextResponse.json(newQuestion);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}