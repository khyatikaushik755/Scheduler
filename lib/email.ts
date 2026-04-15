import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateICS(eventName: string, start: Date, end: Date, description: string) {
  const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Scaler//Meeting//EN
BEGIN:VEVENT
UID:${Date.now()}@scaler
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${eventName}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;
}

export async function sendBookingConfirmation(
  to: string,
  name: string,
  eventName: string,
  date: string,
  time: string,
  duration: number,
  startDateTime: Date,
  endDateTime: Date
) {
  const icsContent = generateICS(eventName, startDateTime, endDateTime, `Meeting with ${name}`);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Booking Confirmed: ${eventName}`,
    html: `
      <h1>Booking Confirmed</h1>
      <p>Hi ${name},</p>
      <p>Your meeting for <strong>${eventName}</strong> has been confirmed.</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Duration:</strong> ${duration} minutes</p>
      <p>A calendar invite is attached.</p>
      <p>Best regards,<br>Scaler Team</p>
    `,
    attachments: [
      {
        filename: 'meeting.ics',
        content: icsContent,
        contentType: 'text/calendar',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}