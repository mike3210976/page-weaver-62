import maldivesImage from "@/assets/maldives.jpg";
import retreatImage from "@/assets/retreat.jpg";
import romanticImage from "@/assets/romantic-escape.jpg";

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
                From the crystal-clear waters of the Maldives to the romantic
                coastlines of Italy, we curate journeys that speak to the soul.
                Whether you&apos;re dreaming of an intimate beach wedding, a
                transformative wellness retreat, or an exotic adventure with
                your beloved, we transform your vision into reality.
              </p>
            </div>

            <div className="flex gap-12 pt-4">
              <div>
                <p className="font-display text-4xl font-semibold text-primary">
                  500+
                </p>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  Dream Weddings
                </p>
              </div>
              <div>
                <p className="font-display text-4xl font-semibold text-primary">
                  50+
                </p>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  Destinations
                </p>
              </div>
              <div>
                <p className="font-display text-4xl font-semibold text-primary">
                  15+
                </p>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  Years Experience
                </p>
              </div>
            </div>
          </div>

          {/* Image Collage */}
          <div className="relative grid grid-cols-2 gap-4 h-[500px]">
            <div className="relative row-span-2">
              <img
                src={maldivesImage}
                alt="Luxury overwater bungalow in Maldives"
                className="w-full h-full object-cover rounded-sm shadow-xl"
              />
            </div>
            <div className="relative">
              <img
                src={retreatImage}
                alt="Peaceful meditation retreat at sunrise"
                className="w-full h-full object-cover rounded-sm shadow-xl"
              />
            </div>
            <div className="relative">
              <img
                src={romanticImage}
                alt="Romantic couple on beach at sunset"
                className="w-full h-full object-cover rounded-sm shadow-xl"
              />
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
