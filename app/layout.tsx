import React from 'react';

export const metadata = {
  title: 'Nehira Core',
  description: 'The Sentient Architect of KRYV',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#050505' }}>
        {children}
      </body>
    </html>
  );
}
