import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import AboutMeSection from "@/components/AboutMeSection";
import ServicesSection from "@/components/ServicesSection";
import DestinationsSection from "@/components/DestinationsSection";
import WhyUsSection from "@/components/WhyUsSection";
import NewsletterSection from "@/components/NewsletterSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <AboutMeSection />
      <ServicesSection />
      <DestinationsSection />
      <WhyUsSection />
      <NewsletterSection />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Index;
