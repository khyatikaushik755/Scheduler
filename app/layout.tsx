import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scheduler Admin',
  description: 'Calendly-style scheduling platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          {children}
        </div>
      </body>
    </html>
  );
}
