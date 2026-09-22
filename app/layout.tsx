import type {Metadata} from 'next';
import { geistSans } from '@/lib/fonts';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Nexus 360 Management System',
  description: 'Professional modern enterprise management system with Customer 360 and Individual records management.',
  openGraph: {
    title: 'Nexus 360 Management System',
    description: 'Professional modern enterprise management system with Customer 360 and Individual records management.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexus 360 Management System',
    description: 'Professional modern enterprise management system with Customer 360 and Individual records management.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  // Browser extensions (LanguageTool, Grammarly, dark-mode add-ons) write attributes
  // onto <html> and <body> before React hydrates. suppressHydrationWarning only covers
  // the element it sits on, so both roots need it.
  return (
    <html lang="en" className={geistSans.variable} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
