import Link from "next/link";
import Image from "next/image";
import styles from "./about.module.css";
import GeometricPattern from "../../components/GeometricPattern";

export const metadata = {
  title: "About Us | Impano Studio",
  description: "Learn about the team behind Impano Studio, our filmmaking principles, and our commitment to bringing Rwandan creative expression to the global stage.",
};

export default function AboutPage() {
  const principles = [
    {
      num: "01",
      title: "Cultural Pride",
      desc: "Authentic narratives that honor traditions while framing them for modern audiences. We believe in the power of local stories to reach global heights, serving as a cultural bridge.",
    },
    {
      num: "02",
      title: "Innovation",
      desc: "Harnessing the latest tools in production, color science, and camera systems to deliver world-class content without compromising on organic creative vision.",
    },
    {
      num: "03",
      title: "Expressive Rigor",
      desc: "Every frame, edit point, and sound wave is crafted with meticulous intent. We maintain high standards, ensuring that each project is a masterpiece in its own right.",
    },
  ];

  return (
    <div>
      {/* About Hero Section */}
      <section className={styles.hero}>
        <GeometricPattern />
        <div className={`${styles.heroContent} container`}>
          <h1 className={styles.heroTitle}>
            Redefining
            <br />
            <span className={styles.goldText}>Cinematic</span>
            <br />
            <span className={styles.outlineText}>Excellence</span>
          </h1>
          <p className={styles.heroDesc}>
            We are a collective of visual storytellers blending Rwandan vibrancy
            with high production value. From concept design to the final render, we
            work with integrity and precision.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className={styles.storySection}>
        <div className={`${styles.storyGrid} container`}>
          <div className={styles.storyContent}>
            <span className="section-tag">Our Story</span>
            <h2 className="section-title">Who We Are</h2>
            <p className={styles.storyText}>
              <span className={styles.dropCap}>B</span>orn out of a desire to see
              African narratives captured with world-class production values,
              Impano Studio emerged as a sanctuary for professional storytellers. Our
              journey began in the hills of Kigali, driven by a raw passion for
              cultural depth and global standards.
            </p>
            <p className={styles.storyText}>
              We hold ourselves to strict standards, ensuring that each frame
              captures the raw textures of life, the subtle warmth of lights, and
              the precise rhythm of the edit. Every choice serves the story.
            </p>
            <div className={styles.yearsBadge}>
              <span className={styles.yearsNum}>10+</span>
              <span className={styles.yearsText}>
                Years of
                <br />
                Film Making
              </span>
            </div>
          </div>

          <div className={styles.imageContainer}>
            <div className={styles.mainImageWrapper}>
              <Image
                src="/images/about_crew.png"
                alt="Filmmaker editing a sequence"
                className={styles.mainImage}
                width={500}
                height={400}
              />
            </div>
            <div className={styles.overlapImageWrapper}>
              <Image
                src="/images/about_story.png"
                alt="Cinematography rig close up"
                className={styles.overlapImage}
                width={300}
                height={250}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles Section */}
      <section className={styles.principlesSection}>
        <div className={styles.principlesWatermark}>No Stories</div>

        <div className={`${styles.principlesContainer} container`}>
          <div className={styles.principlesHeader}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Crafted with
              <br />
              Precision
            </h2>
            <span className={styles.principlesSub}>Core Principles</span>
          </div>

          <div className={styles.principlesGrid}>
            {principles.map((principle, index) => (
              <div key={index} className={styles.principleCard}>
                <span className={styles.principleNum}>{principle.num}</span>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.principleDesc}>{principle.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.hero} style={{ backgroundImage: "none", backgroundColor: "var(--bg-black)", padding: "10rem 0" }}>
        <GeometricPattern />
        <div className={`${styles.heroContent} container`}>
          <h2 className={styles.heroTitle} style={{ fontSize: "4rem" }}>
            Ready to Capture
            <br />
            the Extraordinary?
          </h2>
          <div className={styles.heroButtons}>
            <Link href="/contact" className="btn-primary">
              Start A Project
            </Link>
            <Link href="/services" className="btn-outline">
              View Portfolio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
