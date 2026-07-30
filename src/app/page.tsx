"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const marqueeItems = [
    "Cinematography",
    "Production Design",
    "Creative Direction",
    "Post-Production",
    "VFX",
    "Cinematography",
    "Production Design",
    "Creative Direction",
    "Post-Production",
    "VFX",
  ];

  const services = [
    {
      num: "01",
      name: "Cinematic Commercials",
      desc: "High-impact visual campaigns that captivate audiences and elevate brands. Crafted for modern formats and global appeal.",
      image: "/images/hero_bg.png",
    },
    {
      num: "02",
      name: "Documentary & Narrative",
      desc: "Raw, authentic stories that move hearts. We manage everything from field producing to cinematic capture and direction.",
      image: "/images/about_crew.png",
    },
    {
      num: "03",
      name: "Post-Production & VFX",
      desc: "Premium color grading, editing, and sound design. Our suite is optimized to refine raw captures into visual legacies.",
      image: "/images/grading_console.png",
    },
  ];

  return (
    <div style={{ overflow: "hidden" }}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`${styles.heroContainer} container`}>
          <div className={styles.heroLeft}>
            <span className={styles.heroTag}>Connect with us</span>
            <h1 className={styles.heroTitle}>
              Crafting
              <br />
              <span className={styles.outlineText}>Visual</span>
              <br />
              <span className={styles.goldText}>Legacies.</span>
            </h1>
          </div>
          <div className={styles.heroRight}>
            <p className={styles.heroDesc}>
              From the heart of Kigali, we craft premium commercial films,
              documentaries, and post-production experiences. We translate bold
              concepts into memorable cinematic assets.
            </p>
            <div className={styles.playBtn}>
              <div className={styles.playCircle}>
                <div className={styles.playArrow}></div>
              </div>
              <span className={styles.playText}>Watch Showreel</span>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Scrolling Marquee */}
      <div className="marquee-container">
        <div className="marquee-content">
          {marqueeItems.map((item, idx) => (
            <span key={idx} className="marquee-item">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Philosophy Section */}
      <section className={styles.philosophy}>
        <div className={`${styles.philosophyGrid} container`}>
          <div className={styles.philosophyImageWrapper}>
            <Image
              src="/images/about_crew.png"
              alt="Filmmakers on set"
              className={styles.philosophyImg}
              width={600}
              height={480}
              priority
            />
          </div>
          <div className={styles.philosophyContent}>
            <div className={styles.philosophyHeader}>
              <span className="section-tag">Our Philosophy</span>
              <h2 className="section-title">
                The Narrative is the <span>Soul of Vision.</span>
              </h2>
            </div>
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statNum}>50+</span>
                <span className={styles.statLabel}>Projects Delivered</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum}>10+</span>
                <span className={styles.statLabel}>International Awards</span>
              </div>
            </div>
            <p className={styles.philosophyText}>
              At our core, the narrative transcends frames. We capture stories
              with cultural depth, technical precision, and world-class scale.
              Every camera move, lighting setup, and sound edit is crafted to
              serve the emotional truth of your vision.
            </p>
            <div className={styles.lensCard}>
              <Image
                src="/images/lens_close_up.png"
                alt="Cinema lens details"
                className={styles.lensImg}
                width={600}
                height={180}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Production Services Preview */}
      <section className={styles.servicesSection}>
        <div className="container">
          <span className="section-tag">Expertise</span>
          <h2 className="section-title">Production Services</h2>
          <div className={styles.servicesList}>
            {services.map((service, index) => (
              <div key={index} className={styles.serviceItem}>
                <span className={styles.serviceNum}>{service.num}</span>
                <span className={styles.serviceName}>{service.name}</span>
                <span className={styles.serviceDesc}>{service.desc}</span>
                <div className={styles.serviceImageCol}>
                  <Image
                    src={service.image}
                    alt={service.name}
                    className={styles.serviceThumbnail}
                    width={160}
                    height={100}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Works Grid */}
      <section className={styles.works}>
        <div className="container">
          <div className={styles.worksHeader}>
            <div>
              <span className="section-tag">Portfolio</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Selected Works</h2>
            </div>
            <Link href="/services" className="btn-outline">
              View All Services
            </Link>
          </div>

          <div className={styles.worksGrid}>
            {/* Column Left (Vertical) */}
            <div className={`${styles.workCard} ${styles.verticalCard}`}>
              <Image
                src="/images/echo_of_hills.png"
                alt="The Echo of Hills"
                className={styles.workImg}
                fill
                sizes="(max-width: 992px) 100vw, 40vw"
              />
              <div className={styles.workOverlay}>
                <span className={styles.workCategory}>Narrative Film</span>
                <h3 className={styles.workTitle}>The Echo of Hills</h3>
              </div>
            </div>

            {/* Column Right Top (Horizontal) */}
            <div className={`${styles.workCard} ${styles.horizontalCard}`}>
              <Image
                src="/images/grading_console.png"
                alt="Impano Entertainment Studio"
                className={styles.workImg}
                fill
                sizes="(max-width: 992px) 100vw, 60vw"
              />
              <div className={styles.workOverlay}>
                <span className={styles.workCategory}>Studio Showcase</span>
                <h3 className={styles.workTitle}>Impano Entertainment</h3>
              </div>
            </div>

            {/* Column Right Bottom Left (Square) */}
            <div className={`${styles.workCard} ${styles.squareCard1}`}>
              <Image
                src="/images/about_story.png"
                alt="Crafted details"
                className={styles.workImg}
                fill
                sizes="(max-width: 992px) 100vw, 30vw"
              />
              <div className={styles.workOverlay}>
                <span className={styles.workCategory}>Crafted</span>
                <h3 className={styles.workTitle}>Commercials</h3>
              </div>
            </div>

            {/* Column Right Bottom Right (Square) */}
            <div className={`${styles.workCard} ${styles.squareCard2}`}>
              <Image
                src="/images/hero_bg.png"
                alt="VFX animation work"
                className={styles.workImg}
                fill
                sizes="(max-width: 992px) 100vw, 30vw"
              />
              <div className={styles.workOverlay}>
                <span className={styles.workCategory}>Animation</span>
                <h3 className={styles.workTitle}>VFX Composites</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className={styles.cta}>
        <div className={`${styles.ctaContainer} container`}>
          <h2 className={styles.ctaTitle}>
            Ready to Capture
            <br />
            the Extraordinary?
          </h2>
          <div className={styles.ctaButtons}>
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
