import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.meeting.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.user.deleteMany();

  // Create default user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
    },
  });

  console.log('Created default user:', user.email);
  await prisma.meeting.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.eventType.deleteMany();

  const intro = await prisma.eventType.create({
    data: {
      name: 'Introductory call',
      slug: 'intro-call',
      duration: 30,
      timezone: 'UTC',
      description: 'A quick introduction to discuss your goals and next steps.',
      availabilities: {
        create: [
          { weekday: 1, startTime: '09:00', endTime: '12:00' },
          { weekday: 2, startTime: '13:00', endTime: '17:00' },
          { weekday: 4, startTime: '09:00', endTime: '16:00' },
        ],
      },
    },
  });

  const designReview = await prisma.eventType.create({
    data: {
      name: 'Design review',
      slug: 'design-review',
      duration: 45,
      timezone: 'UTC',
      description: 'Review design ideas and align on action items.',
      availabilities: {
        create: [
          { weekday: 2, startTime: '10:00', endTime: '15:00' },
          { weekday: 3, startTime: '11:00', endTime: '16:00' },
        ],
      },
    },
  });

  await prisma.meeting.createMany({
    data: [
      {
        eventTypeId: intro.id,
        inviteeName: 'Elena Park',
        inviteeEmail: 'elena@example.com',
        startDateTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        endDateTime: new Date(new Date().setDate(new Date().getDate() + 2) + 30 * 60 * 1000).toISOString(),
      },
      {
        eventTypeId: designReview.id,
        inviteeName: 'Marcus Li',
        inviteeEmail: 'marcus@example.com',
        startDateTime: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString(),
        endDateTime: new Date(new Date().setDate(new Date().getDate() + 4) + 45 * 60 * 1000).toISOString(),
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
