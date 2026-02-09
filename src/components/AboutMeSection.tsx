import SectionVideoUpload from "./SectionVideoUpload";

const AboutMeSection = () => {
  return (
    <section id="about-me" className="py-24 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary tracking-[0.2em] uppercase text-sm font-medium mb-4">
            About Me
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight">
            Hi, I'm <span className="italic font-normal text-primary">Dulce</span>
          </h2>
        </div>

        <div className="space-y-12 text-muted-foreground leading-relaxed">
          {/* INTRO */}
          <p className="text-lg text-center max-w-2xl mx-auto">
            Though in my hometown I'm known as Slađana, or simply Slađa, I chose the
            name Dulce because it feels warm, simple, and sweet — like a little piece
            of joy I carry with me wherever life takes me.
          </p>

          {/* WHO I AM */}
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-semibold text-foreground">
              Who I Am
            </h3>
            <p>
              If there’s one thing that defines me, it’s my love for traveling with my
              family. Ever since I was a child, I dreamed of the Caribbean — the
              turquoise waters, the warm breeze, the rhythm of music, and the feeling
              of freedom. I promised myself that one day I would see it for real.
            </p>
            <p>
              Years later, that dream finally came true when I set foot in the Dominican
              Republic — and it was everything I imagined and more:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Soft white sand</li>
              <li>Vibrant energy</li>
              <li>Smiling and welcoming people</li>
            </ul>
            <p className="italic text-primary">It felt like home.</p>
          </div>

          {/* PASSION FOR DANCE */}
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-semibold text-foreground">
              My Passion for Dance
            </h3>

            <p>
              I’ve always loved to dance, but in the Dominican Republic I discovered
              something magical: dance and music aren’t just hobbies — they’re a way of
              life. The rhythm, the joy, the connection — all of it became a part of me
              and shaped who I am today.
            </p>

            <p>
              A few years later, my family joined me on this journey, and together we
              explored every corner of this beautiful country. We laughed, danced,
              tasted new flavors, and created memories that we still talk about today.
            </p>
          </div>

          {/* FAMILY TRAVEL */}
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-semibold text-foreground">
              Traveling Is Our Family’s Heartbeat
            </h3>

            <p>
              We’ve wandered through countless countries, embraced different cultures,
              and met incredible people along the way.
            </p>

            <p>
              My son, now 12 years old, has already taken more than 100 flights! He has
              learned confidence, curiosity, kindness, and the understanding that the
              world is full of beautiful differences and endless possibilities.
            </p>
          </div>

          {/* WEDDING */}
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-semibold text-foreground">
              A Dream Wedding
            </h3>

            <p>
              One of the most unforgettable chapters of my life happened in the Dominican
              Republic — I got married there.
            </p>

            <p>
              It was a dream come true, a celebration more beautiful than anything I
              could have imagined — surrounded by palm trees, ocean breeze, and the
              people I love most.
            </p>

            <p>
              For that special moment, I brought my mother along for her first long-distance
              journey. Watching her experience the magic with us was priceless. Since
              then she has joined us on many more adventures, each one bringing us closer.
            </p>
          </div>

          {/* Wedding Video Section */}
          <SectionVideoUpload sectionKey="dream-wedding" />

          {/* MEXICO */}
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-semibold text-foreground">
              Our Latest Adventure: Mexico
            </h3>

            <p>
              Recently, we visited Mexico — first Bacalar, the lake of seven shades of
              green, and then Tulum. The Yucatán landscape completely captivated us.
            </p>

            <p>
              In Bacalar, it felt as if nature had remained untouched for millions of
              years. The ancient energy was undeniable. I also experienced Yanzu water
              therapy — an unforgettable and deeply healing moment that stayed with me.
            </p>

            <p>
              In Tulum, we were enchanted by the cenote caves, each one revealing the
              breathtaking beauty of nature in its purest form.
            </p>
          </div>

          {/* WHY I TRAVEL */}
          <div className="space-y-6 text-center pt-8 border-t border-border">
            <h3 className="font-display text-2xl font-semibold text-foreground">
              Why I Travel
            </h3>
            <p className="text-lg">
              For me, travel isn’t just about places — it’s about stories, people, and
              unforgettable moments. Every journey becomes a new chapter in the story of
              our lives.
            </p>
            <p className="text-xl italic text-primary">
              And I can’t wait to see where the next adventure takes us.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMeSection;
