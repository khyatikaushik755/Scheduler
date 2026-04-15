
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addDays,
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  startOfWeek,
  endOfWeek
} from 'date-fns';

interface AvailabilityItem {
  weekday: number;
  startTime: string;
  endTime: string;
}

interface CustomQuestion {
  id: number;
  question: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface EventTypeDetails {
  id: number;
  name: string;
  slug: string;
  duration: number;
  timezone: string;
  description: string | null;
  bufferTime: number;
  availabilities: AvailabilityItem[];
  dateOverrides: any[];
  meetings: any[];
  customQuestions: CustomQuestion[];
}

export default function BookingShell({ slug }: { slug: string }) {
  const [eventType, setEventType] = useState<EventTypeDetails | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [inviteeName, setInviteeName] = useState('');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [bookingState, setBookingState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/events/slug/${slug}`);
      const data = await res.json();
      setEventType(data);
      setSelectedDate(addDays(new Date(), 1));
      setLoading(false);
    };
    load();
  }, [slug]);

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentMonth)),
      end: endOfWeek(endOfMonth(currentMonth))
    });
  }, [currentMonth]);

  const slots = useMemo(() => {
    if (!eventType || !selectedDate) return [];
    return eventType.availabilities
      .filter(a => a.weekday === selectedDate.getDay())
      .map(a => ({
        label: a.startTime,
        value: a.startTime
      }));
  }, [eventType, selectedDate]);

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingState('submitting');

    setTimeout(() => {
      setBookingState('success');
      setMessage('Your meeting is confirmed.');
    }, 1000);
  };

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (!eventType) return <div className="text-red-500 p-10">Event not found</div>;

  const selectedSlotLabel = slots.find(s => s.value === selectedTime)?.label;

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10">

        {/* LEFT SIDE */}
        <div>
          <h1 className="text-3xl font-bold">{eventType.name}</h1>

          {/* Calendar */}
          <div className="grid grid-cols-7 gap-2 mt-6">
            {calendarDays.map(date => (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`p-2 rounded ${
                  selectedDate && isSameDay(date, selectedDate)
                    ? 'bg-blue-500'
                    : 'bg-slate-700'
                }`}
              >
                {format(date, 'd')}
              </button>
            ))}
          </div>

          {/* Slots */}
          <div className="mt-6 space-y-2">
            {slots.map(slot => (
              <button
                key={slot.value}
                onClick={() => setSelectedTime(slot.value)}
                className={`block w-full p-2 rounded ${
                  selectedTime === slot.value ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <form onSubmit={submitBooking} className="space-y-4">

          <input
  placeholder="Your Name"
  value={inviteeName}
  onChange={e => setInviteeName(e.target.value)}
  className="w-full p-3 rounded bg-slate-800"
  required
/>

          <input
            placeholder="Email"
            type="email"
            value={inviteeEmail}
            onChange={e => setInviteeEmail(e.target.value)}
            className="w-full p-3 rounded bg-slate-800"
            required
          />

          {/* ✅ Custom Questions (FIXED POSITION) */}
          {eventType.customQuestions?.map(q => (
            <div key={q.id}>
              <label className="block mb-1">{q.question}</label>

              {q.type === 'textarea' ? (
                <textarea
                  className="w-full p-2 rounded bg-slate-800"
                  onChange={e =>
                    setQuestionAnswers(prev => ({
                      ...prev,
                      [q.question]: e.target.value
                    }))
                  }
                />
              ) : (
                <input
                  className="w-full p-2 rounded bg-slate-800"
                  onChange={e =>
                    setQuestionAnswers(prev => ({
                      ...prev,
                      [q.question]: e.target.value
                    }))
                  }
                />
              )}
            </div>
          ))}

          {/* Selected Slot */}
          <div className="p-3 bg-slate-800 rounded">
            {selectedSlotLabel || 'Select a time'}
          </div>

          <button className="w-full bg-blue-600 p-3 rounded">
            {bookingState === 'submitting' ? 'Booking...' : 'Confirm'}
          </button>

          {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  );
}