import { useTranslations } from 'next-intl';
import ChatComponent from '@/components/ChatComponent';

export default function HomePage() {
  const t = useTranslations('app');

  return (
    <main className="min-h-screen bg-gray-50">
      <ChatComponent />
    </main>
  );
}

export async function generateMetadata() {
  return {
    title: 'Chat IA',
    description: 'Aplicación de Chat IA',
  };
}