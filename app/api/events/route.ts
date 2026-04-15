import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const events = await prisma.eventType.findMany({
    include: { 
      availabilities: true, 
      dateOverrides: true, 
      customQuestions: {
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, slug, duration, timezone, description, bufferTime, availabilities } = body;
  if (!name || !slug || !duration || !timezone || !availabilities) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const eventType = await prisma.eventType.create({
      data: {
        name,
        slug,
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
    });
    return NextResponse.json(eventType, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  if (!id) {
    return NextResponse.json({ error: 'Event type ID required' }, { status: 400 });
  }

  const body = await request.json();
  const { name, slug, duration, timezone, description, bufferTime, availabilities } = body;

  try {
    // First delete existing availabilities
    await prisma.availability.deleteMany({
      where: { eventTypeId: Number(id) },
    });

    // Then update the event type with new data
    const eventType = await prisma.eventType.update({
      where: { id: Number(id) },
      data: {
        name,
        slug,
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
    });
    return NextResponse.json(eventType);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  if (!id) {
    return NextResponse.json({ error: 'Event type ID required' }, { status: 400 });
  }

  try {
    await prisma.eventType.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
