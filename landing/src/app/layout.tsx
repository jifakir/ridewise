import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'RideWise — Spend smart. Ride more.',
  description: 'An offline-first personal wallet for riders. Track daily spending, fuel, and mileage.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas antialiased">{children}</body>
    </html>
  );
}
