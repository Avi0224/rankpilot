import Navbar from '@/components/features/landing/Navbar';
import Hero from '@/components/features/landing/Hero';
import HowItWorks from '@/components/features/landing/HowItWorks';
import FeaturesGrid from '@/components/features/landing/FeaturesGrid';
import ComparisonPreview from '@/components/features/landing/ComparisonPreview';
import Testimonials from '@/components/features/landing/Testimonials';
import FinalCTA from '@/components/features/landing/FinalCTA';
import Footer from '@/components/features/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050816]">
      <Navbar />
      <Hero />
      <HowItWorks />
      <FeaturesGrid />
      <ComparisonPreview />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
