import BookingShell from '@/components/BookingShell';

interface BookingPageProps {
  params: { slug: string };
}

export default function BookingPage({ params }: BookingPageProps) {
  return <BookingShell slug={params.slug} />;
}
