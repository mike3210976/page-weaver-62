import beachWeddingImage from "@/assets/beach-wedding.jpg";
import spiritualRetreatImage from "@/assets/spiritual-retreat.jpg";
import romanticEscapeImage from "@/assets/romantic-escape-new.jpg";
import bartenderImage from "@/assets/bartender-cocktail.jpg";
import beachSunsetImage from "@/assets/beach-sunset.jpg";
import familyOceanImage from "@/assets/family-ocean.jpg";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div>
              <p className="text-primary tracking-[0.2em] uppercase text-sm font-medium mb-4">
                Our Story
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight">
                Creating Moments That Stay in Your{" "}
                <span className="italic font-normal text-primary">Heart</span>{" "}
                Forever
              </h2>
            </div>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                At Sacred Escapes, we believe that life&apos;s most precious
                moments deserve extraordinary settings. Our passion is weaving
                together dream destinations, spiritual awakening, and romantic
                celebrations into experiences that transcend the ordinary.
              </p>
              <p>
                From the crystal-clear waters of the Maldives, the vibrant
                beaches of the Dominican Republic and Mexico, to the sun-kissed
                coastlines of Spain, Italy, and the enchanting islands of
                Madeira, Canary Islands, and Balearic Islands—every destination
                tells a story. Explore the timeless charm of Portugal, the
                natural wonders of Slovenia, and the cultural richness of Serbia
                and Bosnia.
              </p>
              <p>
                Whether you&apos;re dreaming of an intimate beach wedding, a
                transformative wellness retreat, or a romantic escape, we curate
                journeys that celebrate the beauty and soul of these
                extraordinary places—turning your vision into reality.
              </p>
            </div>
          </div>

          {/* Image Collage - 6 images in creative grid */}
          <div className="relative">
            <div className="grid grid-cols-3 gap-3 h-[550px]">
              {/* Left column - 2 stacked images */}
              <div className="flex flex-col gap-3">
                <div className="relative flex-1 overflow-hidden rounded-sm shadow-xl">
                  <img
                    src={beachWeddingImage}
                    alt="Dream beach wedding ceremony"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="relative flex-1 overflow-hidden rounded-sm shadow-xl">
                  <img
                    src={bartenderImage}
                    alt="Caribbean hospitality"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Middle column - 1 tall image */}
              <div className="relative overflow-hidden rounded-sm shadow-xl">
                <img
                  src={spiritualRetreatImage}
                  alt="Spiritual retreat at cenote"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Right column - 3 stacked images */}
              <div className="flex flex-col gap-3">
                <div className="relative flex-[1.2] overflow-hidden rounded-sm shadow-xl">
                  <img
                    src={familyOceanImage}
                    alt="Family moments in crystal clear waters"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="relative flex-1 overflow-hidden rounded-sm shadow-xl">
                  <img
                    src={beachSunsetImage}
                    alt="Beautiful beach sunset"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="relative flex-[1.2] overflow-hidden rounded-sm shadow-xl">
                  <img
                    src={romanticEscapeImage}
                    alt="Romantic beach escape in Dominican Republic"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-primary -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
