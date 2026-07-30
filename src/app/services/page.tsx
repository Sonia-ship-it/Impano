import Link from "next/link";
import Image from "next/image";
import styles from "./services.module.css";
import GeometricPattern from "../../components/GeometricPattern";

export const metadata = {
  title: "Services | Impano Studio",
  description: "Explore our production and post-production solutions, from 8K RAW acquisition to high-end color grading and immersive spatial sound design.",
};

export default function ServicesPage() {
  const stats = [
    { num: "500+", label: "Global Projects" },
    { num: "12K", label: "Max Resolution" },
    { num: "24/7", label: "Creative Ops" },
    { num: "10+", label: "Industry Awards" },
  ];

  return (
    <div>
      {/* Services Hero Section */}
      <section className={styles.hero}>
        <GeometricPattern />
        <div className={`${styles.heroContent} container`}>
          <h1 className={styles.heroTitle}>
            Transforming
            <br />
            <span className={styles.goldText}>Vision Into</span>
            <br />
            <span className={styles.outlineText}>Cinematic Reality</span>
          </h1>
          <p className={styles.heroDesc}>
            Impano Entertainment blends Rwandan creative soul with world-class
            technical precision. We don't just record; we curate visual legacies.
          </p>
          <div className={styles.heroButtons}>
            <Link href="#production" className="btn-primary">
              Explore Our Work
            </Link>
            <a href="/brochure-placeholder.pdf" className="btn-outline" download>
              Download Brochure
            </a>
          </div>
        </div>
      </section>

      {/* 01 EXECUTION: Production Section */}
      <section id="production" className={styles.section} style={{ backgroundColor: "var(--bg-dark)" }}>
        <div className={`${styles.sectionGrid} container`}>
          <div className={styles.contentCol}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>01 —— Execution</span>
              <h2 className={styles.sectionTitle}>Master-Class Production</h2>
            </div>
            <p className={styles.description}>
              From script to screen, we manage the intricate dance of light,
              sound, and performance. Our production suites leverage the latest
              in optical technology to capture every nuance.
            </p>

            <div className={styles.specsGrid}>
              <div className={styles.specCard}>
                <span className={styles.specTag}>Format</span>
                <span className={styles.specValue}>8K HDR</span>
                <span className={styles.specDetail}>Native RAW Acquisition</span>
              </div>
              <div className={styles.specCard}>
                <span className={styles.specTag}>Optics</span>
                <span className={styles.specValue}>Anamorphic</span>
                <span className={styles.specDetail}>Wide Cinematic Scope</span>
              </div>
            </div>

            <Link href="/contact" className={styles.arrowLink}>
              Start a Project <span>→</span>
            </Link>
          </div>

          <div className={styles.imageCol}>
            <Image
              src="/images/lens_close_up.png"
              alt="Cinema Camera Lens"
              className={styles.sectionImg}
              fill
              sizes="(max-width: 992px) 100vw, 50vw"
            />
            <div className={styles.badgesOverlay}>
              <span className={styles.badge}>RED V-RAPTOR</span>
              <span className={styles.badge}>ARRI MASTER PRIMES</span>
              <span className={styles.badge}>WIRELESS MONITORING</span>
            </div>
          </div>
        </div>
      </section>

      {/* 02 REFINEMENT: Post-Production Section */}
      <section className={styles.section} style={{ backgroundColor: "var(--bg-black)" }}>
        <div className={`${styles.sectionGridReverse} container`}>
          {/* In mobile, image comes first, so we use flex-direction order or standard flow. With CSS Grid, grid-template-areas or standard columns is clean. */}
          <div className={styles.imageCol}>
            <Image
              src="/images/grading_console.png"
              alt="Color grading console"
              className={styles.sectionImg}
              fill
              sizes="(max-width: 992px) 100vw, 50vw"
            />
          </div>

          <div className={styles.contentCol}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>02 —— Refinement</span>
              <h2 className={styles.sectionTitle}>Advanced Post-Production</h2>
            </div>
            <p className={styles.description}>
              Great stories are found in the edit. Our post-production ecosystem
              is built for speed and artistic perfection, offering high-end
              color grading, sound design, and visual effects that push
              boundaries.
            </p>

            <div className={styles.featuresBlock}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#FCD385" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="6" fill="#FCD385" fillOpacity="0.3" />
                    <circle cx="12" cy="12" r="2" fill="#FCD385" />
                  </svg>
                </div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>LUT Dev & Color</h3>
                  <p className={styles.featureDesc}>
                    Custom color science tailored to your brand's unique
                    narrative palette.
                  </p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#FCD385" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4" stroke="#FCD385" strokeWidth="1.5" />
                    <line x1="8" y1="12" x2="6" y2="12" stroke="#FCD385" strokeWidth="1.5" />
                    <line x1="18" y1="12" x2="16" y2="12" stroke="#FCD385" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>Spatial Sound Design</h3>
                  <p className={styles.featureDesc}>
                    Immersive audio engineering that breathes life into every
                    frame.
                  </p>
                </div>
              </div>
            </div>

            <button className="btn-outline" style={{ alignSelf: "flex-start" }}>
              View Editorial Case Studies
            </button>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className={styles.statsRibbon}>
        <div className={`${styles.statsContainer} container`}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.ribbonStat}>
              <span className={styles.ribbonNum}>{stat.num}</span>
              <span className={styles.ribbonLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
