import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/use-auth';
import { ComparisonProvider } from '@/hooks/use-compare';
import { RecentlyViewedProvider } from '@/hooks/use-recently-viewed';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RankPilot — JEE Main College Predictor',
  description: 'Predict colleges based on your JEE Main rank. Compare cutoffs, ROI, placements, fees, and branches across 500+ engineering colleges in India.',
  keywords: 'JEE Main predictor, college predictor, JoSAA counselling, NIT predictor, cutoff ranks, engineering colleges India',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#050816] text-slate-200 antialiased`}>
        <AuthProvider>
          <ComparisonProvider>
            <RecentlyViewedProvider>
              {children}
              <Toaster position="top-right" richColors theme="dark" />
            </RecentlyViewedProvider>
          </ComparisonProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
