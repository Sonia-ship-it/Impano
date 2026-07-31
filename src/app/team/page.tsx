import Link from "next/link";
import Image from "next/image";
import styles from "./team.module.css";
import GeometricPattern from "../../components/GeometricPattern";

export const metadata = {
  title: "Our Team | Impano Entertainment",
  description: "Meet the visionary directors, cinematographers, colorists, and VFX artists behind Impano Entertainment.",
};

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Sonia Impano",
      role: "Founder & Executive Producer",
      bio: "Guiding the creative heartbeat of Rwandan cinema, translating local stories into global masterworks with production excellence.",
      image: "/images/about_crew.png",
    },
    {
      name: "Christian Gakombe",
      role: "Creative Director & Lead Filmmaker",
      bio: "Sculpting visual narratives with a precise eye for framing, pacing, and emotional depth. Over a decade of directorial experience.",
      image: "/images/lens_close_up.png",
    },
    {
      name: "Moses Kamasa",
      role: "Director of Photography",
      bio: "Harnessing light and advanced RED & ARRI optical systems to compose unforgettable frames that define our signature aesthetic.",
      image: "/images/about_story.png",
    },
    {
      name: "Divine Ineza",
      role: "Lead Colorist & Post Supervisor",
      bio: "Manipulating color science, shadows, and HDR specifications to establish the precise mood and visual legacy of each film.",
      image: "/images/grading_console.png",
    },
    {
      name: "Jean Luc Nsengimana",
      role: "VFX Supervisor & Animator",
      bio: "Integrating high-end digital artistry, advanced 3D compositing, and visual effects to build expansive cinematic worlds.",
      image: "/images/hero_bg.png",
    },
  ];

  return (
    <div>
      {/* Team Hero Section */}
      <section className={styles.hero}>
        <GeometricPattern />
        <div className={`${styles.heroContent} container`}>
          <span className="section-tag">The Collective</span>
          <h1 className={styles.heroTitle}>
            The Minds
            <br />
            Behind the
            <br />
            <span className={styles.goldText}>Cinematic</span>{" "}
            <span className={styles.outlineText}>Vibe</span>
          </h1>
          <p className={styles.heroDesc}>
            A synergy of directors, cinematographers, and post-production specialists
            dedicated to executing world-class narratives. We combine Rwandan creative heritage
            with advanced technical rigor.
          </p>
        </div>
      </section>

      {/* Team Grid Section */}
      <section className={styles.teamSection}>
        <div className="container">
          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={styles.teamCard}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={member.image}
                    alt={`${member.name} - ${member.role}`}
                    className={member.name === "Sonia Impano" ? styles.teamImgTopAlign : styles.teamImg}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 2}
                  />
                  <div className={styles.cardGradientOverlay} />
                </div>
                <div className={styles.info}>
                  <span className={styles.role}>{member.role}</span>
                  <h3 className={styles.name}>{member.name}</h3>
                  <p className={styles.bio}>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Legacy CTA Section */}
      <section className={styles.ctaHero}>
        <GeometricPattern />
        <div className={`${styles.ctaContent} container`}>
          <h2 className={styles.ctaTitle}>
            Let&apos;s Shape
            <br />
            Your Legacy
          </h2>
          <p className={styles.ctaDesc}>
            Partner with a production collective that prioritizes storytelling, artistic
            precision, and premium output.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/contact" className="btn-primary">
              Work With Us
            </Link>
            <Link href="/services" className="btn-outline">
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
