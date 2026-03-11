import { redirect } from 'next/navigation';

// La raíz redirige siempre al dashboard
export default function Home() {
  redirect('/login');
}
