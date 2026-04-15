import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.eventType.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await request.json();
  const { name, duration, timezone, description, bufferTime, availabilities } = body;
  try {
    await prisma.availability.deleteMany({ where: { eventTypeId: id } });
    const eventType = await prisma.eventType.update({
      where: { id },
      data: {
        name,
        duration,
        timezone,
        description,
        bufferTime: bufferTime || 0,
        availabilities: {
          create: availabilities.map((item: any) => ({
            weekday: item.weekday,
            startTime: item.startTime,
            endTime: item.endTime,
          })),
        },
      },
      include: { availabilities: true },
    });
    return NextResponse.json(eventType);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
