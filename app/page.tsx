import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import ComparisonPreview from '@/components/landing/ComparisonPreview';
import Testimonials from '@/components/landing/Testimonials';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

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
