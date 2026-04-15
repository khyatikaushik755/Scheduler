import { redirect } from 'next/navigation';

interface ConfirmedPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ConfirmedPage({ params, searchParams }: ConfirmedPageProps) {
  const { slug } = params;
  const name = searchParams.name as string;
  const email = searchParams.email as string;
  const date = searchParams.date as string;
  const time = searchParams.time as string;

  if (!name || !email || !date || !time) {
    redirect(`/booking/${slug}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-card text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-600 mb-6">Your meeting has been scheduled successfully.</p>
          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-slate-500">Meeting Details</p>
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-slate-600">{email}</p>
            <p className="text-sm text-slate-600">{date} at {time}</p>
          </div>
          <p className="text-sm text-slate-500">A calendar invite will be sent to your email shortly.</p>
        </div>
      </div>
    </div>
  );
}