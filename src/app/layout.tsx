import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: 'MVP Builder - Sketch Interface',
  description: 'Build your MVP with a conversational interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}