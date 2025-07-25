import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard/restaurant');
  return null;
}
