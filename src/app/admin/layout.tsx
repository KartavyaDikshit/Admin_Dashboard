import Providers from '@/components/Providers';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
