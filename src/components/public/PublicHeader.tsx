import LanguageSwitcher from '@/components/public/LanguageSwitcher';
import Link from 'next/link';

export default function PublicHeader() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link href="/">TBI Admin Dashboard</Link>
        </h1>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
