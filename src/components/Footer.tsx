import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 px-4 bg-card border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-muted-foreground flex items-center gap-1">
          Made with <Heart className="w-4 h-4 text-primary fill-primary" /> by Alex Creative
        </p>
        
        <nav className="flex gap-6">
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Twitter
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Dribbble
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            LinkedIn
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
