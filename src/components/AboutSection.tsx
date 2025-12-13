import { Palette, Code, Lightbulb, Coffee } from "lucide-react";

const skills = [
  { icon: Palette, label: "Design", description: "UI/UX, Branding, Illustration" },
  { icon: Code, label: "Development", description: "React, TypeScript, CSS" },
  { icon: Lightbulb, label: "Strategy", description: "Problem solving, Research" },
  { icon: Coffee, label: "Collaboration", description: "Remote-friendly, Async" },
];

const AboutSection = () => {
  return (
    <section className="py-24 px-4 bg-card relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
      
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - About text */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold font-display">
              About <span className="text-primary">Me</span>
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                I believe good design should make you smile. With 5+ years of experience 
                crafting digital products, I bring creativity and technical skills together 
                to build things people actually enjoy using.
              </p>
              <p>
                When I'm not pushing pixels or writing code, you'll find me sketching new 
                ideas, exploring art museums, or trying to perfect my latte art (still working on that one).
              </p>
            </div>
          </div>
          
          {/* Right side - Skills grid */}
          <div className="grid grid-cols-2 gap-4">
            {skills.map((skill, index) => (
              <div 
                key={skill.label}
                className="group bg-background p-6 rounded-2xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <skill.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-display font-bold text-lg mb-1">{skill.label}</h3>
                <p className="text-sm text-muted-foreground">{skill.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
