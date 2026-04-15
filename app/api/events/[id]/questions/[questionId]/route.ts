import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: { id: string; questionId: string } }) {
  const questionId = Number(params.questionId);
  const { question, type, required, options, order } = await request.json();

  try {
    const updatedQuestion = await prisma.customQuestion.update({
      where: { id: questionId },
      data: {
        question,
        type,
        required,
        options: options ? JSON.stringify(options) : null,
        order,
      },
    });
    return NextResponse.json(updatedQuestion);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; questionId: string } }) {
  const questionId = Number(params.questionId);

  try {
    await prisma.customQuestion.delete({
      where: { id: questionId },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}