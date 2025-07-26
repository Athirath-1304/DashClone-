import Hero from "./components/Hero";
import Features from "./components/Features";
import VisualSection from "./components/VisualSection";
import Testimonial from "./components/Testimonial";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#0f172a]">
      <Hero />
      <Features />
      <VisualSection />
      <Testimonial />
      <Footer />
    </main>
  );
} 