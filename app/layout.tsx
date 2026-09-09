import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Nexus 360 Management System',
  description: 'Professional modern enterprise management system with Customer 360, Individual records management, and three distinct design theme templates.',
  openGraph: {
    title: 'Nexus 360 Management System',
    description: 'Professional modern enterprise management system with Customer 360, Individual records management, and three distinct design theme templates.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexus 360 Management System',
    description: 'Professional modern enterprise management system with Customer 360, Individual records management, and three distinct design theme templates.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
