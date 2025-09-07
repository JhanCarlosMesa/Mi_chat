import {routing} from '@/i18n/routing';
import {redirect} from 'next/navigation';

// This page only renders when the app is built statically (output: 'export')
export default function RootPage() {
  // Redirect to default locale
  redirect(`/${routing.defaultLocale}`);
}