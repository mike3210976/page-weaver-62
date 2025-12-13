import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <a
              href="#"
              className="font-display text-2xl font-semibold tracking-wide text-foreground inline-block mb-4"
            >
              <span className="text-primary">Sacred</span> Escapes
            </a>
            <p className="text-muted-foreground leading-relaxed max-w-md mb-6">
              Creating extraordinary moments in the world&apos;s most beautiful
              destinations. Your journey to unforgettable experiences starts
              here.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">
              Quick Links
            </h4>
            <nav className="space-y-3">
              <a
                href="#about"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                About Us
              </a>
              <a
                href="#services"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Our Services
              </a>
              <a
                href="#destinations"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Destinations
              </a>
              <a
                href="#contact"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">
              Services
            </h4>
            <nav className="space-y-3">
              <a
                href="#services"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Beach Weddings
              </a>
              <a
                href="#services"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Spiritual Retreats
              </a>
              <a
                href="#services"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Exotic Travel
              </a>
              <a
                href="#services"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Romantic Escapes
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Sacred Escapes. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
