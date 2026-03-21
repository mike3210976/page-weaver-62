import SectionVideoUpload from "./SectionVideoUpload";

const AboutMeSection = () => {
  return (
    // Zamenjali smo fiksni py-24 z mobilnim py-16 in večjim py-32 za namizje
    <section id="about-me" className="py-16 md:py-32 px-5 sm:px-10 bg-background transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        
        {/* Header - prilagojena velikost pisave */}
        <div className="text-center mb-12 md:mb-20">
          <p className="text-primary tracking-[0.2em] uppercase text-xs md:text-sm font-semibold mb-3 md:mb-5">
            About Me
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-semibold text-foreground leading-tight px-2">
            Hi, I'm <span className="italic font-normal text-primary">Dulce</span>
          </h2>
        </div>

        {/* Glavni vsebinski kontejner z večjimi razmiki med sekcijami na desktopu */}
        <div className="space-y-12 md:space-y-24 text-muted-foreground leading-relaxed">
          
          {/* INTRO - uporaba fluidne velikosti teksta */}
          <p className="text-base md:text-xl text-center max-w-2xl mx-auto font-light leading-relaxed">
            Though in my hometown I'm known as Slađana, or simply Slađi, I chose the name Dulce because it feels warm, simple, and sweet...
          </p>

          <div className="grid grid-cols-1 gap-12 md:gap-20">
            
            {/* WHO I AM - Seznam se na mobilniku poravna bolj kompaktno */}
            <div className="space-y-5 md:space-y-8">
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground border-l-4 border-primary/20 pl-4">
                Who I Am
              </h3>
              <div className="space-y-4 text-sm md:text-base">
                <p>If there's one thing that defines me, it's my love for traveling with my family...</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4 list-none italic">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Soft white sand
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Vibrant energy
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Welcoming people
                  </li>
                </ul>
                <p className="italic text-primary font-medium">It felt like home.</p>
              </div>
            </div>

            {/* Wedding Video Section - Poskrbi, da video zavzame polno širino na mobilniku */}
            <div className="w-full overflow-hidden rounded-2xl shadow-sm">
               <SectionVideoUpload sectionKey="dream-wedding" />
            </div>

            {/* MEXICO - Uporaba različnih velikosti pisave za poudarek */}
            <div className="space-y-5 md:space-y-8">
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground border-l-4 border-primary/20 pl-4">
                Our Latest Adventure: Mexico
              </h3>
              <div className="space-y-4 text-sm md:text-base">
                <p>Recently, we visited Mexico, starting with Bacalar, the lake of seven shades of green...</p>
                <p className="bg-primary/5 p-4 rounded-lg border-l-2 border-primary italic">
                  In Bacalar, it felt as if nature had remained untouched for millions of years.
                </p>
              </div>
            </div>

          </div>

          {/* ZAKLJUČEK - Center poravnava za vse naprave */}
          <div className="space-y-6 text-center pt-12 md:pt-20 border-t border-border/50">
            <h3 className="font-display text-2xl md:text-4xl font-semibold text-foreground">Why I Travel</h3>
            <p className="text-base md:text-lg max-w-xl mx-auto">
              For me, travel isn't just about places. It's about stories, people, and unforgettable moments.
            </p>
            <p className="text-lg md:text-2xl italic text-primary font-serif">
              And I can't wait to see where the next adventure takes us.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutMeSection;
