import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RideWise API',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#F6F6F4' }}>{children}</body>
    </html>
  );
}
