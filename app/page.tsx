'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface AvailabilityForm {
  selectedDays: number[];
  startTime: string;
  endTime: string;
}

interface DateOverride {
  id: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  isAvailable: boolean;
}

interface CustomQuestion {
  id: number;
  question: string;
  type: string;
  required: boolean;
  options?: string[];
  order: number;
}

interface EventType {
  id: number;
  name: string;
  slug: string;
  duration: number;
  timezone: string;
  description: string | null;
  bufferTime: number;
  availabilities: { weekday: number; startTime: string; endTime: string }[];
  dateOverrides: DateOverride[];
  customQuestions: CustomQuestion[];
}

interface Meeting {
  id: number;
  inviteeName: string;
  inviteeEmail: string;
  startDateTime: string;
  endDateTime: string;
  status: string;
  eventType: { name: string };
  questionAnswers: { question: string; answer: string }[];
}

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const [newEvent, setNewEvent] = useState({
    name: '',
    slug: '',
    duration: 30,
    timezone: 'UTC',
    description: '',
    bufferTime: 0,
  });

  const [availability, setAvailability] = useState<AvailabilityForm>({
    selectedDays: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '17:00',
  });

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateEventId, setUpdateEventId] = useState<number | null>(null);
  const [dateOverride, setDateOverride] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
  });
  const [customQuestion, setCustomQuestion] = useState({
    question: '',
    type: 'text',
    required: false,
    options: [] as string[],
    order: 0,
  });
  const [reschedulingMeeting, setReschedulingMeeting] = useState<Meeting | null>(null);
  const [newMeetingTime, setNewMeetingTime] = useState('');

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) {
      router.push('/login');
      return;
    }

    // Verify token with API
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ name: data.name || 'User', email: data.email || '' });
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  };

  const logout = () => {
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, meetingsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/meetings'),
      ]);
      const [events, meetingsData] = await Promise.all([eventsRes.json(), meetingsRes.json()]);
      setEventTypes(events);
      setMeetings(meetingsData);
      setError(null);
    } catch (err) {
      setError('Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewEventChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setNewEvent((current) => ({ ...current, [name]: value }));
  };

  const handleAvailabilityDayToggle = (day: number) => {
    setAvailability((current) => {
      const active = current.selectedDays.includes(day);
      return {
        ...current,
        selectedDays: active
          ? current.selectedDays.filter((value) => value !== day)
          : [...current.selectedDays, day],
      };
    });
  };

  const resetForm = () => {
    setUpdateEventId(null);
    setNewEvent({ name: '', slug: '', duration: 30, timezone: 'UTC', description: '', bufferTime: 0 });
    setAvailability({ selectedDays: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' });
  };

  const addDateOverride = async (eventTypeId: number) => {
    if (!dateOverride.date) return;
    try {
      const res = await fetch(`/api/events/${eventTypeId}/overrides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dateOverride),
      });
      if (res.ok) {
        await loadData();
        setDateOverride({ date: '', startTime: '09:00', endTime: '17:00', isAvailable: true });
      }
    } catch (error) {
      console.error('Error adding date override:', error);
    }
  };

  const removeDateOverride = async (eventTypeId: number, overrideId: number) => {
    try {
      const res = await fetch(`/api/events/${eventTypeId}/overrides/${overrideId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error removing date override:', error);
    }
  };

  const addCustomQuestion = async (eventTypeId: number) => {
    if (!customQuestion.question.trim()) return;
    try {
      const res = await fetch(`/api/events/${eventTypeId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customQuestion),
      });
      if (res.ok) {
        await loadData();
        setCustomQuestion({ question: '', type: 'text', required: false, options: [], order: 0 });
      }
    } catch (error) {
      console.error('Error adding custom question:', error);
    }
  };

  const removeCustomQuestion = async (eventTypeId: number, questionId: number) => {
    try {
      const res = await fetch(`/api/events/${eventTypeId}/questions/${questionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error removing custom question:', error);
    }
  };

  const editEventType = (eventType: EventType) => {
    setUpdateEventId(eventType.id);
    setNewEvent({
      name: eventType.name,
      slug: eventType.slug,
      duration: eventType.duration,
      timezone: eventType.timezone,
      description: eventType.description || '',
      bufferTime: eventType.bufferTime || 0,
    });
    setAvailability({
      selectedDays: eventType.availabilities.map((item) => item.weekday),
      startTime: eventType.availabilities[0]?.startTime || '09:00',
      endTime: eventType.availabilities[0]?.endTime || '17:00',
    });
  };

  const createEventType = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const body = {
        ...newEvent,
        duration: Number(newEvent.duration),
        availabilities: availability.selectedDays.map((weekday) => ({
          weekday,
          startTime: availability.startTime,
          endTime: availability.endTime,
        })),
      };

      const url = updateEventId ? `/api/events/${updateEventId}` : '/api/events';
      const method = updateEventId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      await loadData();
      resetForm();
    } catch (err) {
      setError(`Failed to ${updateEventId ? 'update' : 'create'} event type.`);
    }
  };

  const deleteEventType = async (id: number) => {
    if (!confirm('Delete this event type?')) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    await loadData();
  };

  const cancelMeeting = async (id: number) => {
    if (!confirm('Cancel this meeting?')) return;
    await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
    await loadData();
  };

  const startRescheduling = (meeting: Meeting) => {
    setReschedulingMeeting(meeting);
    setNewMeetingTime('');
  };

  const cancelRescheduling = () => {
    setReschedulingMeeting(null);
    setNewMeetingTime('');
  };

  const confirmRescheduling = async () => {
    if (!reschedulingMeeting || !newMeetingTime) return;

    try {
      const start = new Date(newMeetingTime);
      const eventType = eventTypes.find(et => et.name === reschedulingMeeting.eventType.name);
      if (!eventType) return;

      const end = new Date(start.getTime() + eventType.duration * 60_000);

      const res = await fetch(`/api/meetings/${reschedulingMeeting.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDateTime: start.toISOString(),
          endDateTime: end.toISOString(),
        }),
      });

      if (res.ok) {
        await loadData();
        setReschedulingMeeting(null);
        setNewMeetingTime('');
      }
    } catch (error) {
      console.error('Error rescheduling meeting:', error);
    }
  };

  const eventCounts = useMemo(() => {
    return {
      upcoming: meetings.filter((meeting) => new Date(meeting.startDateTime) >= new Date()).length,
      past: meetings.filter((meeting) => new Date(meeting.startDateTime) < new Date()).length,
    };
  }, [meetings]);

  const handleReschedulingMeetingTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMeetingTime(e.target.value);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">✨ Scaler Admin</h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-blue-200 font-medium">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between animate-fadeIn">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300/70 font-semibold">Scheduler Administration</p>
            <h1 className="mt-2 text-5xl font-bold text-white">Event types, availability & meetings</h1>
            <p className="mt-3 max-w-2xl text-blue-100/70">Manage your event templates and review your booking schedule in real-time.</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md px-6 py-5 shadow-xl border border-white/20">
            <p className="text-blue-200/70 text-sm font-semibold">Meeting summary</p>
            <div className="mt-4 flex gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-4 text-white shadow-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Upcoming</p>
                <p className="mt-2 text-3xl font-bold">{eventCounts.upcoming}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 px-5 py-4 text-white shadow-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-purple-100">Past</p>
                <p className="mt-2 text-3xl font-bold">{eventCounts.past}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.7fr_0.3fr]">
          <section className="space-y-8">
            {/* Create Event Type Form */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-8 shadow-xl border border-white/20 animate-slideIn">
              <h2 className="text-3xl font-bold text-white mb-2">Create event type</h2>
              <p className="text-blue-100/70 mb-6">Configure a new event type with availability and custom settings</p>
              <form className="mt-6 space-y-6" onSubmit={createEventType}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-white">Name</span>
                    <input
                      required
                      name="name"
                      value={newEvent.name}
                      onChange={handleNewEventChange}
                      className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-white">Public slug</span>
                    <input
                      required
                      name="slug"
                      value={newEvent.slug}
                      onChange={handleNewEventChange}
                      placeholder="e.g. 30-min-intro"
                      className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-white">Duration (min)</span>
                    <input
                      type="number"
                      required
                      min={10}
                      name="duration"
                      value={newEvent.duration}
                      onChange={handleNewEventChange}
                      className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-white">Buffer time (min)</span>
                    <input
                      type="number"
                      min={0}
                      name="bufferTime"
                      value={newEvent.bufferTime}
                      onChange={handleNewEventChange}
                      placeholder="0"
                      className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-white">Timezone</span>
                    <input
                      name="timezone"
                      value={newEvent.timezone}
                      onChange={handleNewEventChange}
                      className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-white">Description</span>
                    <input
                      name="description"
                      value={newEvent.description}
                      onChange={handleNewEventChange}
                      className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </label>
                </div>
                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm p-6">
                  <p className="text-sm font-bold text-white">📅 Weekly availability</p>
                  <p className="mt-2 text-sm text-blue-100/70">Select days and set the available time range for this event type.</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {weekdayLabels.map((day, index) => (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleAvailabilityDayToggle(index)}
                        className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${availability.selectedDays.includes(index) ? 'border-blue-400 bg-blue-500/20 text-blue-200 shadow-lg' : 'border-white/20 bg-white/5 text-blue-100/70 hover:border-blue-400'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-white">Start time</span>
                      <input type="time" value={availability.startTime} onChange={(e) => setAvailability((current) => ({ ...current, startTime: e.target.value }))} className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-white">End time</span>
                      <input type="time" value={availability.endTime} onChange={(e) => setAvailability((current) => ({ ...current, endTime: e.target.value }))} className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" />
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 pt-4">
                  <p className="text-sm text-blue-200/70">Your booking page: <span className="font-mono text-blue-300">/booking/{newEvent.slug || 'your-slug'}</span></p>
                  <button type="submit" className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 text-sm font-bold text-white transition-all duration-200 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95">{updateEventId ? '✏️ Update Event Type' : '➕ Create Event Type'}</button>
                </div>
              </form>
            </div>

            {/* Event Types List */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Event types</h2>
                  <p className="mt-1 text-sm text-blue-100/70">Each type has a public booking link and its own weekly availability.</p>
                </div>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-blue-200">Loading event types...</p>
                ) : eventTypes.length === 0 ? (
                  <p className="text-blue-200">No event types yet.</p>
                ) : (
                  eventTypes.map((eventType) => (
                    <div key={eventType.id} className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 shadow-xl hover:shadow-2xl transition-all duration-200">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{eventType.name}</h3>
                          <p className="text-sm text-blue-100/70">/{eventType.slug} • {eventType.duration} min • {eventType.timezone}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => window.open(`/booking/${eventType.slug}`, '_blank')} className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg">👁️ View</button>
                          <button onClick={() => editEventType(eventType)} className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-blue-200 hover:bg-white/20 transition-all duration-200">✏️ Edit</button>
                          <button onClick={() => deleteEventType(eventType.id)} className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition-all duration-200">🗑️ Delete</button>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-semibold text-blue-300">Description</p>
                          <p className="mt-1 text-sm text-blue-100/70">{eventType.description || 'No description yet.'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-300">Availability</p>
                          <p className="mt-1 text-sm text-blue-100/70">{eventType.availabilities.map((item) => `${weekdayLabels[item.weekday]} ${item.startTime}-${item.endTime}`).join(', ')}</p>
                        </div>
                      </div>

                      {/* Date Overrides */}
                      {eventType.dateOverrides.length > 0 && (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <p className="text-sm font-semibold text-blue-300 mb-3">📅 Date Overrides</p>
                          <div className="space-y-2">
                            {eventType.dateOverrides.map((override) => (
                              <div key={override.id} className="flex items-center justify-between bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                                <div className="text-sm">
                                  <span className="font-medium text-blue-200">{new Date(override.date).toLocaleDateString()}</span>
                                  {override.isAvailable ? (
                                    <span className="text-green-400 ml-2">✓ Available: {override.startTime}-{override.endTime}</span>
                                  ) : (
                                    <span className="text-red-400 ml-2">✗ Unavailable</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => removeDateOverride(eventType.id, override.id)}
                                  className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Custom Questions */}
                      {eventType.customQuestions.length > 0 && (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <p className="text-sm font-semibold text-blue-300 mb-3">❓ Custom Questions</p>
                          <div className="space-y-2">
                            {eventType.customQuestions.map((question) => (
                              <div key={question.id} className="flex items-center justify-between bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                                <div className="text-sm">
                                  <span className="font-medium text-blue-200">{question.question}</span>
                                  <span className="text-blue-100/70 ml-2">({question.type}{question.required ? ', required' : ''})</span>
                                </div>
                                <button
                                  onClick={() => removeCustomQuestion(eventType.id, question.id)}
                                  className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            {/* Meetings Panel */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-6 shadow-xl border border-white/20">
              <h2 className="text-2xl font-semibold text-white">Meetings</h2>
              <p className="mt-2 text-sm text-blue-100/70">Upcoming and past bookings from the public booking page.</p>
              <div className="mt-6 space-y-4">
                {meetings.length === 0 ? (
                  <p className="text-blue-200">No meetings yet.</p>
                ) : (
                  meetings.slice(0, 5).map((meeting) => (
                    <div key={meeting.id} className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 hover:border-white/20 transition-all duration-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-200">{meeting.inviteeName}</p>
                          <p className="text-xs text-blue-100/70">{meeting.eventType.name}</p>
                          <p className="mt-1 text-xs text-blue-100/70">{new Date(meeting.startDateTime).toLocaleString()}</p>
                          <p className="mt-2 text-xs text-blue-100/70">✉️ {meeting.inviteeEmail}</p>
                          {meeting.questionAnswers && meeting.questionAnswers.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {meeting.questionAnswers.map((qa, index) => (
                                <p key={index} className="text-xs text-blue-100/70">
                                  <span className="font-medium text-blue-300">{qa.question}:</span> {qa.answer}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 flex-col">
                          <button onClick={() => startRescheduling(meeting)} className="rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-2 py-1 text-xs font-semibold text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 whitespace-nowrap">🔄 Reschedule</button>
                          <button onClick={() => cancelMeeting(meeting.id)} className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-2 py-1 text-xs font-semibold text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 whitespace-nowrap">✕ Cancel</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Admin Quick Start */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-6 shadow-xl border border-white/20">
              <h2 className="text-2xl font-semibold text-white">Admin quick start</h2>
              <ul className="mt-4 space-y-3 text-sm text-blue-100/70">
                <li className="flex gap-2">
                  <span className="text-blue-300 font-semibold">1.</span>
                  <span>Create an event type and define your weekly availability.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-300 font-semibold">2.</span>
                  <span>Copy the public link and share it with invitees.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-300 font-semibold">3.</span>
                  <span>View upcoming and past meetings here.</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Rescheduling Modal */}
        {reschedulingMeeting && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl bg-slate-900 border border-white/20 shadow-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-4">Reschedule Meeting</h3>
              <p className="text-blue-100/70 mb-4">{reschedulingMeeting.inviteeName} - {reschedulingMeeting.eventType.name}</p>
              <label className="block space-y-2 mb-6">
                <span className="text-sm font-semibold text-white">New date and time</span>
                <input
                  type="datetime-local"
                  value={newMeetingTime}
                  onChange={handleReschedulingMeetingTimeChange}
                  className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </label>
              <div className="flex gap-3">
                <button
                  onClick={confirmRescheduling}
                  className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-bold text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
                >
                  Confirm
                </button>
                <button
                  onClick={cancelRescheduling}
                  className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-bold text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    

      {error && <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}

      {/* Rescheduling Modal */}
      {reschedulingMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Reschedule Meeting</h3>
            <p className="text-sm text-slate-600 mb-4">
              Rescheduling meeting with {reschedulingMeeting.inviteeName} for {reschedulingMeeting.eventType.name}
            </p>
            <div className="space-y-4">
              <label className="block space-y-2 text-sm text-slate-700">
                <span>New Date & Time</span>
                <input
                  type="datetime-local"
                  value={newMeetingTime}
                  onChange={(e) => setNewMeetingTime(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelRescheduling}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmRescheduling}
                disabled={!newMeetingTime}
                className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
