import {redirect} from 'next/navigation';

// Redirect to login page
export default function RootPage() {
  redirect('/login');
}