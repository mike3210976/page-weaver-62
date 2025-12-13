import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    title: "Bloom App",
    category: "Mobile Design",
    color: "from-primary/20 to-primary/5",
    accent: "bg-primary",
  },
  {
    title: "Waves Brand",
    category: "Branding",
    color: "from-secondary/20 to-secondary/5",
    accent: "bg-secondary",
  },
  {
    title: "Spark Dashboard",
    category: "Web Development",
    color: "from-accent/30 to-accent/10",
    accent: "bg-accent",
  },
  {
    title: "Neon Store",
    category: "E-commerce",
    color: "from-lavender/40 to-lavender/10",
    accent: "bg-lavender",
  },
];

const WorkSection = () => {
  return (
    <section id="work" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Selected <span className="text-gradient">Work</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A collection of projects I've had the joy of working on
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <article 
              key={project.title}
              className={`group relative bg-gradient-to-br ${project.color} rounded-3xl p-8 min-h-[300px] md:min-h-[350px] flex flex-col justify-end overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}
            >
              {/* Decorative shapes */}
              <div className={`absolute top-6 right-6 w-16 h-16 rounded-2xl ${project.accent} opacity-60 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`} />
              <div className={`absolute top-20 right-20 w-8 h-8 rounded-full ${project.accent} opacity-40 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all duration-500`} />
              
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-card/80 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                  {project.category}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-3 group-hover:gap-5 transition-all">
                  {project.title}
                  <ArrowUpRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all" />
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkSection;
