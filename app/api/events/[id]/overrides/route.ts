import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const eventTypeId = Number(params.id);
  const { date, startTime, endTime, isAvailable } = await request.json();

  try {
    const override = await prisma.dateOverride.create({
      data: {
        eventTypeId,
        date: new Date(date),
        startTime: isAvailable ? startTime : null,
        endTime: isAvailable ? endTime : null,
        isAvailable,
      },
    });
    return NextResponse.json(override, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const eventTypeId = Number(params.id);
  try {
    const overrides = await prisma.dateOverride.findMany({
      where: { eventTypeId },
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(overrides);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}