import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'THE SARAH BRAND BIBLE™',
  description: 'A 172-day study of one woman, several assumptions, and very little retained information.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
