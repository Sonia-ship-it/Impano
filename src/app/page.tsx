"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import Logo from "../components/Logo";

export default function Home() {
  const [showreelOpen, setShowreelOpen] = useState(false);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // 3D Rotating Cards Carousel State (Automated)
  const [workRotationIndex, setWorkRotationIndex] = useState(0);
  const [isRotatingHovered, setIsRotatingHovered] = useState(false);

  useEffect(() => {
    if (showreelOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showreelOpen]);

  const marqueeItems = [
    "Cinematography",
    "Production Design",
    "Creative Direction",
    "Post-Production",
    "VFX",
    "Drone Visuals",
    "Color Grading",
    "Sound Design",
    "Commercials",
    "Documentaries",
    "Narrative Films",
    "4K / 8K Cinema",
  ];

  const defaultHeroImages = [
    "/images/hero_bg.png",
    "/images/echo_of_hills.png",
    "/images/grading_console.png",
    "/images/lens_close_up.png"
  ];

  const defaultWorkImages = [
    "/images/echo_of_hills.png",
    "/images/grading_console.png",
    "/images/about_story.png",
    "/images/hero_bg.png"
  ];

  const defaultServiceImages = [
    "/images/lens_close_up.png",
    "/images/grading_console.png",
    "/images/about_story.png"
  ];

  const defaultClientLogos = [
    "/images/logo_kfc.png",
    "/images/logo_rba.png",
    "/images/logo_asw.png",
    "/images/logo_lmg.png",
    "/images/logo_vv.png",
    "/images/logo_vch.png"
  ];

  const initialServices = [
    {
      num: "01",
      name: "Production Services",
      desc: "Producing and Directing, Camera Crews, Drone Visuals, Multi Cameras, Live Stream, Professional Interviews, Motion Graphics, 3D animation, Script Writing, StoryBoard.",
      image: defaultServiceImages[0],
    },
    {
      num: "02",
      name: "Post-Production Services",
      desc: "Offline / Online Edit, Color Correction, and Sound Design services optimizing raw captures into visual legacies.",
      image: defaultServiceImages[1],
    },
    {
      num: "03",
      name: "Creative Development & Strategy",
      desc: "Our reputable approach to design thinking combines creative, critical thinking, and experience to transform information and ideas into authentic work.",
      image: defaultServiceImages[2],
    },
  ];

  const initialClients = [
    { name: "Kigali Film Commission", logo: defaultClientLogos[0] },
    { name: "Rwanda Broadcasting Agency", logo: defaultClientLogos[1] },
    { name: "Africa Screen Works", logo: defaultClientLogos[2] },
    { name: "Legacy Media Group", logo: defaultClientLogos[3] },
    { name: "Vivid Ventures", logo: defaultClientLogos[4] },
    { name: "Volcano Creative Hub", logo: defaultClientLogos[5] },
  ];

  const initialWorks = [
    {
      title: "The Echo of Hills",
      category: "Narrative Film",
      image: defaultWorkImages[0],
    },
    {
      title: "Impano Entertainment",
      category: "Studio Showcase",
      image: defaultWorkImages[1],
    },
    {
      title: "Commercials",
      category: "Crafted Brands",
      image: defaultWorkImages[2],
    },
    {
      title: "VFX Composites",
      category: "Animation & 3D",
      image: defaultWorkImages[3],
    }
  ];

  const [services, setServices] = useState(initialServices);
  const [clients, setClients] = useState(initialClients);
  const [works, setWorks] = useState(initialWorks);
  const [hero, setHero] = useState<any>({
    tagline: "Connect with us",
    titlePart1: "Crafting",
    titleOutline: "Visual",
    titleGold: "Legacies.",
    description: "From the heart of Kigali, we craft premium commercial films, documentaries, and post-production experiences. We translate bold concepts into memorable cinematic assets.",
    playText: "Watch Showreel",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-cinematic-shot-of-a-misty-forest-42475-large.mp4",
    images: defaultHeroImages
  });

  useEffect(() => {
    const resolveImage = (url: string, fallback: string) => (url && url.trim() ? url : fallback);

    const applyData = (data: any, sourceName: string) => {
      if (data.hero) setHero(data.hero);
      if (Array.isArray(data.services)) {
        setServices(data.services.map((s: any, idx: number) => ({
          ...s,
          image: resolveImage(s.image, defaultServiceImages[idx] || "")
        })));
      }
      if (Array.isArray(data.clients)) {
        setClients(data.clients.map((c: any, idx: number) => ({
          ...c,
          logo: resolveImage(c.logo, defaultClientLogos[idx] || "")
        })));
      }
      if (Array.isArray(data.works)) {
        setWorks(data.works.map((w: any, idx: number) => ({
          title: w.title || `Project ${idx + 1}`,
          category: w.category || "Film",
          image: resolveImage(w.image, defaultWorkImages[idx % defaultWorkImages.length] || "")
        })));
      }
      console.log(`%c[Impano CMS Home] Content successfully loaded from ${sourceName}.`, "color: #10b981; font-weight: bold;");
    };

    try {
      const cached = localStorage.getItem("impano_cms_content_cache");
      if (cached) {
        applyData(JSON.parse(cached), "Browser LocalCache");
      }
    } catch { }

    fetch("/api/content")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const storageLabel = data._meta?.kvConnected ? "Upstash KV Database" : `Fallback (${data._meta?.storageType || "local"})`;
        applyData(data, storageLabel);
      })
      .catch((err) => console.warn("[Impano CMS Home] Failed to fetch dynamic content from API, using local fallbacks.", err));
  }, []);

  // Hero Background Slides configured from CMS
  const heroSlideImages = (hero.images && Array.isArray(hero.images) && hero.images.length > 0)
    ? hero.images
    : defaultHeroImages;

  // Automated Hero Background Slides Transitions (smooth 7.0 seconds)
  useEffect(() => {
    if (showreelOpen || heroSlideImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlideImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [showreelOpen, heroSlideImages.length]);

  // Selected Works for 3D Carousel (First 4 Projects)
  const selected4Works = works.slice(0, 4);

  // Automated 3D Rotating Showcase (responsive 4.8 seconds switching)
  useEffect(() => {
    if (isRotatingHovered || selected4Works.length <= 1) return;
    const interval = setInterval(() => {
      setWorkRotationIndex((prev) => (prev + 1) % selected4Works.length);
    }, 4800);
    return () => clearInterval(interval);
  }, [isRotatingHovered, selected4Works.length]);

  // Card Mouse 3D Tilt handler
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        {/* Automated Background Slideshow */}
        <div className={styles.heroBgWrapper}>
          {heroSlideImages.map((slideImg: string, idx: number) => {
            const isActive = idx === currentHeroSlide;
            return (
              <div
                key={idx}
                className={`${styles.heroSlideLayer} ${isActive ? styles.heroSlideLayerActive : ""}`}
              >
                <img
                  src={slideImg}
                  alt={`Hero Scene ${idx + 1}`}
                  className={styles.heroSlideImg}
                />
              </div>
            );
          })}
        </div>

        {/* Ambient Clean Subtle Gradient Overlay */}
        <div className={styles.heroOverlay} />

        {/* Original 2-Column Hero Content Layout */}
        <div className={`${styles.heroContainer} container`}>
          {/* Left Column: Tagline & Stacked Headline */}
          <div className={styles.heroLeft}>
            <span className={styles.heroTag}>{hero.tagline || "Connect with us"}</span>
            <h1 className={styles.heroTitle}>
              {hero.titlePart1}
              <br />
              <span className={styles.outlineText}>{hero.titleOutline}</span>
              <br />
              <span className={styles.goldText}>{hero.titleGold}</span>
            </h1>
          </div>

          {/* Right Column: Description & Action Buttons */}
          <div className={styles.heroRight}>
            <p className={styles.heroDesc}>{hero.description}</p>
            <div className={styles.heroActionsRow}>
              <div
                className={styles.playBtn}
                onClick={() => setShowreelOpen(true)}
                data-cursor="play"
              >
                <div className={styles.playCircle}>
                  <div className={styles.playArrow} />
                </div>
                <span className={styles.playText}>{hero.playText || "Watch Showreel"}</span>
              </div>

              <Link href="/contact" className="btn-primary" data-cursor="pointer">
                <span>Initiate Project</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Showreel Modal */}
      {showreelOpen && (
        <div
          className={styles.showreelOverlay}
          onClick={() => setShowreelOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.showreelContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.showreelClose}
              onClick={() => setShowreelOpen(false)}
              aria-label="Close Showreel"
            >
              ✕
            </button>
            <div className={styles.showreelPlayerWrapper}>
              <video
                src={hero.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-cinematic-shot-of-a-misty-forest-42475-large.mp4"}
                autoPlay
                controls
                playsInline
                className={styles.showreelVideo}
              />
              <div className={styles.showreelHud}>
                <div className={styles.hudHeader}>
                  <span className={styles.hudLive}>● RAW PREVIEW MONITOR</span>
                  <span className={styles.hudResolution}>RED RAPTOR 8K</span>
                </div>
                <div className={styles.hudFooter}>
                  <span className={styles.hudTime}>TC 01:24:09:12</span>
                  <div className={styles.hudWaveform}>
                    <div className={styles.waveBar} style={{ height: "40%" }} />
                    <div className={styles.waveBar} style={{ height: "70%" }} />
                    <div className={styles.waveBar} style={{ height: "90%" }} />
                    <div className={styles.waveBar} style={{ height: "50%" }} />
                    <div className={styles.waveBar} style={{ height: "30%" }} />
                    <div className={styles.waveBar} style={{ height: "80%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Infinite Marquee Strip */}
      <div className={styles.marquee}>
        <div className={styles.marqueeInner}>
          {marqueeItems.concat(marqueeItems).map((item, idx) => (
            <span key={idx} className={styles.marqueeItem}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Clients Section */}
      <section className={styles.clients}>
        <div className="container">
          <div className={styles.clientsSectionHeader}>
            <span className="section-tag">Our Clients</span>
            <h2 className="section-title">Trusted By Industry Leaders</h2>
          </div>

          <div className={styles.orbitContainer}>
            <div className={styles.orbitBackground}>
              <div className={styles.orbitCircleLine} style={{ width: "360px", height: "360px" }} />
              <div className={styles.orbitCircleLine} style={{ width: "520px", height: "520px" }} />
            </div>

            {clients.map((client, index) => {
              const startAngle = `${(360 / clients.length) * index}deg`;
              return (
                <div
                  key={index}
                  className={styles.orbitCard}
                  style={{
                    ["--start-angle" as any]: startAngle,
                  }}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  data-cursor="view"
                >
                  <div className={styles.clientCardInner}>
                    <div className={styles.clientLogoContainer}>
                      {client.logo ? (
                        <Image
                          src={client.logo}
                          alt={`${client.name} Logo`}
                          width={140}
                          height={70}
                          className={styles.clientLogoImg}
                        />
                      ) : (
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#d4af37", textAlign: "center" }}>
                          {client.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Production Services Preview */}
      <section className={styles.servicesSection}>
        <div className="container">
          <div className={styles.servicesHeader}>
            <div>
              <span className="section-tag">Expertise</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Production Services</h2>
            </div>
            <Link href="/services" className="btn-outline">
              All Capabilities
            </Link>
          </div>

          <div className={styles.servicesList}>
            {services.map((service, index) => (
              <div
                key={index}
                className={styles.serviceItem}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                data-cursor="view"
              >
                <span className={styles.serviceNum}>{service.num}</span>
                <span className={styles.serviceName}>{service.name}</span>
                <span className={styles.serviceDesc}>{service.desc}</span>
                <div className={styles.serviceImageCol}>
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt={service.name}
                      className={styles.serviceThumbnail}
                      width={180}
                      height={110}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Works: Fully Automated 3D Rotating Showcase */}
      <section className={styles.works}>
        <div className="container">
          {/* Header */}
          <div className={styles.worksHeader}>
            <div className={styles.worksHeaderContent}>
              <span className="section-tag">Curated Portfolio</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Selected Works</h2>
              <p className={styles.worksSubtext}>
                A 3D perspective into our featured masterworks. Discover how we turn bold visions into iconic cinematic assets.
              </p>
            </div>
            <Link href="/works" className={styles.viewAllHeaderBtn}>
              Explore Our Works
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>

          {/* Automated 3D Rotating Stage */}
          <div
            className={styles.rotatingStage3D}
            onMouseEnter={() => setIsRotatingHovered(true)}
            onMouseLeave={() => setIsRotatingHovered(false)}
          >
            <div
              className={styles.rotatingCarousel}
              style={{
                transform: `rotateY(${workRotationIndex * -90}deg)`,
              }}
            >
              {selected4Works.map((work, index) => {
                const angle = index * 90;
                const isCurrentActive = index === workRotationIndex;
                return (
                  <div
                    key={index}
                    className={styles.rotatingCardItem}
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(360px)`,
                      opacity: isCurrentActive ? 1 : 0.65,
                    }}
                    onClick={() => setWorkRotationIndex(index)}
                  >
                    <Link href="/works" style={{ display: "block", width: "100%", height: "100%" }}>
                      <div className={styles.rotatingCardImgWrapper}>
                        {work.image ? (
                          <img
                            src={work.image}
                            alt={work.title}
                            className={styles.rotatingCardImg}
                          />
                        ) : (
                          <div style={{ position: "absolute", inset: 0, backgroundColor: "#181717" }} />
                        )}
                      </div>

                      {/* Category Pill on Card Top */}
                      <div className={styles.rotatingCardTop}>
                        <span className={styles.rotatingCategoryPill}>{work.category}</span>
                      </div>

                      {/* Bottom Title & Action */}
                      <div className={styles.rotatingCardBottom}>
                        <h3 className={styles.rotatingCardTitle}>{work.title}</h3>
                        <span className={styles.rotatingCardAction}>
                          View in Portfolio ➔
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <span className="section-tag">Let&apos;s Create Together</span>
              <h2 className={styles.ctaTitle}>
                Have a Vision That Demands <span className="gold-text">Cinematic Scale</span>?
              </h2>
              <p className={styles.ctaDesc}>
                Whether it is a feature narrative, corporate brand piece, or high-end commercial, our team is ready to execute with world-class standard.
              </p>
              <div className={styles.ctaBtnRow}>
                <Link href="/contact" className="btn-primary" data-cursor="pointer">
                  <span>Start a Conversation</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/about" className="btn-outline" data-cursor="pointer">
                  <span>Explore Capabilities</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
