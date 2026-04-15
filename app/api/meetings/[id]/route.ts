import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { startDateTime, endDateTime } = await request.json();

  try {
    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
      },
      include: { eventType: true },
    });
    return NextResponse.json(meeting);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.meeting.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
