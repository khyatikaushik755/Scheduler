import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const eventType = await prisma.eventType.findUnique({
    where: { slug },
    include: {
      availabilities: true,
      meetings: { orderBy: { startDateTime: 'asc' } },
    },
  });
  if (!eventType) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(eventType);
}
