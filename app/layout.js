import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { AuthProvider } from '@/context/AuthContext';
import BottomNavigation from '@/components/BottomNavigation';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata = {
  title: 'Zubika - Multi-Vendor Marketplace',
  description: 'Zubika is a modern multi-vendor e-commerce marketplace. Shop from verified vendors, sell your products, and experience secure payments with Razorpay.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <AuthProvider>
          <div className="pb-20 md:pb-0">
            {children}
          </div>
          <BottomNavigation />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
