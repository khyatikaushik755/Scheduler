import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: { id: string; overrideId: string } }) {
  const overrideId = Number(params.overrideId);
  try {
    await prisma.dateOverride.delete({
      where: { id: overrideId },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}