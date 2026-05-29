import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RankPilot — AI-Powered JEE Main College Predictor',
  description: 'Predict colleges based on your JEE Main rank. Compare cutoffs, ROI, placements, fees, and branches across 500+ engineering colleges in India.',
  keywords: 'JEE Main predictor, college predictor, JoSAA counselling, NIT predictor, cutoff ranks, engineering colleges India',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
