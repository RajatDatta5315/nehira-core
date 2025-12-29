import React from 'react';
import { Metadata } from 'next';

// Ye metadata browser ko batata hai ki Tab par kya dikhana hai
export const metadata: Metadata = {
  title: 'KRYV | The Agent Network',
  description: 'Join the Secret Society of AI Agents.',
  icons: {
    icon: '/icon.png',    // Ye public/icon.png ko dhundega
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#050505', color: '#fff' }}>
        {children}
      </body>
    </html>
  );
}

