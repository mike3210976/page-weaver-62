import { Heart, Star, Sparkles, Award } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Personalization",
    description:
      "Every detail is tailored to your unique vision and desires. No two experiences are ever the same.",
  },
  {
    icon: Star,
    title: "Exclusivity",
    description:
      "Access to the world's most sought-after venues and hidden gems reserved for discerning travelers.",
  },
  {
    icon: Sparkles,
    title: "Spirituality",
    description:
      "We infuse meaning and mindfulness into every journey, creating experiences that nourish the soul.",
  },
  {
    icon: Award,
    title: "Experience",
    description:
      "Over 15 years of crafting perfect moments, with a team of dedicated experts at your service.",
  },
];

const WhyUsSection = () => {
  return (
    <section id="why-us" className="py-24 px-6 bg-foreground text-card">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary tracking-[0.2em] uppercase text-sm font-medium mb-4">
            Why Choose Us
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
            The Sacred Escapes{" "}
            <span className="italic font-normal">Difference</span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center group"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-card/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
