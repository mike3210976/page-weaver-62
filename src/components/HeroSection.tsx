import { Button } from "@/components/ui/button";
import FloatingShapes from "./FloatingShapes";
import { ArrowDown, Sparkles } from "lucide-react";

const HeroSection = () => {
  const scrollToWork = () => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      <FloatingShapes />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full mb-8 animate-fade-in-up border border-border">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Available for new projects</span>
        </div>
        
        <h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold font-display mb-6 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <span className="block">Hi, I'm</span>
          <span className="text-gradient">Alex Creative</span>
        </h1>
        
        <p 
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          A designer & developer who loves turning wild ideas into 
          <span className="text-primary font-semibold"> playful digital experiences</span>
        </p>
        
        <div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <Button variant="hero" size="xl" onClick={scrollToWork}>
            See My Work
          </Button>
          <Button variant="outline" size="xl">
            Let's Talk
          </Button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <button 
        onClick={scrollToWork}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-soft cursor-pointer hover:text-primary transition-colors"
        aria-label="Scroll to work section"
      >
        <ArrowDown className="w-8 h-8 text-muted-foreground" />
      </button>
    </section>
  );
};

export default HeroSection;
