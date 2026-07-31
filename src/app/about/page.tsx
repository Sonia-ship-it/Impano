import Link from "next/link";
import Image from "next/image";
import styles from "./about.module.css";
import GeometricPattern from "../../components/GeometricPattern";

export const metadata = {
  title: "About Us | Impano Entertainment",
  description: "Learn about the team behind Impano Entertainment, our filmmaking principles, and our commitment to bringing Rwandan creative expression to the global stage.",
};

export default function AboutPage() {
  const values = [
    { name: "Professionalism", desc: "Executing every project with absolute dedication and top-tier standards." },
    { name: "Creativity", desc: "Pushing creative boundaries to deliver unique, inspiring outcomes." },
    { name: "Integrity", desc: "Building honest, transparent relations based on trust and quality." },
    { name: "Innovation", desc: "Harnessing modern media technologies to drive the creative industry." },
    { name: "Customer Satisfaction", desc: "Committed to delivering beyond expectations for all clients." },
    { name: "Teamwork", desc: "Combining our diverse skill sets to unlock extraordinary results." }
  ];

  const objectives = [
    "Deliver world-class entertainment and media services.",
    "Promote innovation in Rwanda's creative industry.",
    "Build long-term partnerships with our clients.",
    "Invest in modern technology and skilled professionals.",
    "Expand our services across Rwanda and the East African region."
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
              <span className={styles.dropCap}>I</span>mpano Entertainment Ltd. is a Rwandan
              creative and entertainment company established in 2019. Since our establishment,
              we have been committed to delivering professional entertainment and media services
              that inspire creativity, promote brands, and create unforgettable experiences
              for our clients across Rwanda.
            </p>
            <p className={styles.storyText}>
              Our team combines creativity, technology, and professionalism to provide high-quality
              services tailored to businesses, organizations, institutions, and individuals.
            </p>
            <div className={styles.yearsBadge}>
              <span className={styles.yearsNum}>2019</span>
              <span className={styles.yearsText}>
                Established
                <br />
                in Kigali
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

      {/* Mission & Vision Section */}
      <section className={styles.mvSection}>
        <div className="container">
          <div className={styles.mvGrid}>
            <div className={styles.mvCard}>
              <div className={styles.mvTag}>Our Mission</div>
              <p className={styles.mvText}>
                To deliver innovative, creative, and professional entertainment and media solutions that
                exceed our clients&apos; expectations while contributing to the growth of Rwanda&apos;s
                creative industry.
              </p>
            </div>
            <div className={styles.mvCard}>
              <div className={styles.mvTag}>Our Vision</div>
              <p className={styles.mvText}>
                To become one of Rwanda&apos;s leading entertainment and creative media companies,
                recognized across East Africa for excellence, innovation, and outstanding customer service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitment Section */}
      <section className={styles.commitmentSection}>
        <div className="container">
          <div className={styles.commitmentBanner}>
            <span className="section-tag">Our Commitment</span>
            <h2 className={styles.commitmentTitle}>Exceptional Service</h2>
            <p className={styles.commitmentText}>
              At Impano Entertainment Ltd., every project is treated with professionalism, creativity, and
              dedication. We work closely with our clients to understand their goals and deliver results
              that reflect their vision and create lasting value. Our commitment is to build long-term
              relationships based on trust, quality, and exceptional service.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values & Objectives Section */}
      <section className={styles.valuesSection}>
        <div className={`${styles.valuesContainer} container`}>
          <div className={styles.valuesLeft}>
            <span className="section-tag">Directives</span>
            <h2 className="section-title">Core Values</h2>
            <div className={styles.valuesGrid}>
              {values.map((value, index) => (
                <div key={index} className={styles.valueCard}>
                  <h3 className={styles.valueTitle}>{value.name}</h3>
                  <p className={styles.valueDesc}>{value.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.valuesRight}>
            <h2 className="section-title">Objectives</h2>
            <ul className={styles.objectivesList}>
              {objectives.map((obj, index) => (
                <li key={index} className={styles.objectiveItem}>
                  <span className={styles.objIcon}>✓</span>
                  <span className={styles.objText}>{obj}</span>
                </li>
              ))}
            </ul>
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
