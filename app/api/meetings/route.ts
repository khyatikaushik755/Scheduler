import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmation } from '@/lib/email';
import { format } from 'date-fns';

export async function GET() {
  const meetings = await prisma.meeting.findMany({
    include: { eventType: true, questionAnswers: true },
    orderBy: { startDateTime: 'desc' },
  });
  return NextResponse.json(meetings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { eventTypeId, inviteeName, inviteeEmail, startDateTime, endDateTime, questionAnswers } = body;
  if (!eventTypeId || !inviteeName || !inviteeEmail || !startDateTime || !endDateTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const conflict = await prisma.meeting.findFirst({
    where: {
      eventTypeId,
      startDateTime: new Date(startDateTime),
    },
  });

  if (conflict) {
    return NextResponse.json({ error: 'This time slot is already booked.' }, { status: 409 });
  }

  const meeting = await prisma.meeting.create({
    data: {
      eventTypeId,
      inviteeName,
      inviteeEmail,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      questionAnswers: {
        create: questionAnswers?.map((qa: { question: string; answer: string }) => ({
          question: qa.question,
          answer: qa.answer,
        })) || [],
      },
    },
    include: { eventType: true, questionAnswers: true },
  });

  // Send confirmation email
  try {
    await sendBookingConfirmation(
      inviteeEmail,
      inviteeName,
      meeting.eventType.name,
      format(new Date(startDateTime), 'EEEE, MMMM d, yyyy'),
      format(new Date(startDateTime), 'h:mm a'),
      meeting.eventType.duration,
      new Date(startDateTime),
      new Date(endDateTime)
    );
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't fail the booking if email fails
  }

  return NextResponse.json(meeting, { status: 201 });
}
