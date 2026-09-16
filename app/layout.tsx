import type {Metadata} from 'next';
import { geistSans } from '@/lib/fonts';
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
  // Browser extensions (LanguageTool, Grammarly, dark-mode add-ons) write attributes
  // onto <html> and <body> before React hydrates. suppressHydrationWarning only covers
  // the element it sits on, so both roots need it.
  return (
    <html lang="en" className={geistSans.variable} suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
