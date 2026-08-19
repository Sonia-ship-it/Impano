"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import Logo from "../components/Logo";

export default function Home() {
  const [showreelOpen, setShowreelOpen] = useState(false);

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

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);

    // Calculate 3D tilt angles based on cursor offset from card center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg tilt
    const rotateY = ((x - centerX) / centerX) * 10;  // Max 10 deg tilt

    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  const marqueeItems = [
    "Cinematography",
    "Production Design",
    "Creative Direction",
    "Post-Production",
    "VFX",
    "Drone",
    "Cinematography",
    "Production Design",
    "Creative Direction",
    "Post-Production",
    "VFX",
    "Drone",
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
      image: defaultWorkImages[0]
    },
    {
      title: "Impano Entertainment",
      category: "Studio Showcase",
      image: defaultWorkImages[1]
    },
    {
      title: "Commercials",
      category: "Crafted",
      image: defaultWorkImages[2]
    },
    {
      title: "VFX Composites",
      category: "Animation",
      image: defaultWorkImages[3]
    }
  ];

  const [services, setServices] = useState(initialServices);
  const [clients, setClients] = useState(initialClients);
  const [works, setWorks] = useState(initialWorks);
  const [hero, setHero] = useState({
    tagline: "Connect with us",
    titlePart1: "Crafting",
    titleOutline: "Visual",
    titleGold: "Legacies.",
    description: "From the heart of Kigali, we craft premium commercial films, documentaries, and post-production experiences. We translate bold concepts into memorable cinematic assets.",
    playText: "Watch Showreel",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-cinematic-shot-of-a-misty-forest-42475-large.mp4"
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
          ...w,
          image: resolveImage(w.image, defaultWorkImages[idx] || "")
        })));
      }
      console.log(`%c[Impano CMS Home] Content successfully loaded from ${sourceName}.`, "color: #10b981; font-weight: bold;", {
        storageType: data._meta?.storageType || "cache/local",
        kvConnected: data._meta?.kvConnected || false,
      });
    };

    try {
      const cached = localStorage.getItem("impano_cms_content_cache");
      if (cached) {
        applyData(JSON.parse(cached), "Browser LocalCache");
      }
    } catch {}

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

  return (
    <div style={{ overflow: "hidden" }}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`${styles.heroContainer} container`}>
          <div className={styles.heroLeft}>
            <span className={styles.heroTag}>{hero.tagline}</span>
            <h1 className={styles.heroTitle}>
              {hero.titlePart1}
              <br />
              <span className={styles.outlineText}>{hero.titleOutline}</span>
              <br />
              <span className={styles.goldText}>{hero.titleGold}</span>
            </h1>
          </div>
          <div className={styles.heroRight}>
            <p className={styles.heroDesc}>
              {hero.description}
            </p>
            <div
              className={styles.playBtn}
              onClick={() => setShowreelOpen(true)}
              data-cursor="play"
            >
              <div className={styles.playCircle}>
                <div className={styles.playArrow}></div>
              </div>
              <span className={styles.playText}>{hero.playText}</span>
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

      {/* Clients Section */}
      <section className={styles.clients}>
        <div className="container">
          <div className={styles.clientsSectionHeader}>
            <span className="section-tag">Our Clients</span>
          </div>

          <div className={styles.orbitContainer}>
            {/* Ambient Background Circles */}
            <div className={styles.orbitBackground}>
              <div className={styles.orbitCircleLine} style={{ width: "360px", height: "360px" }} />
              <div className={styles.orbitCircleLine} style={{ width: "520px", height: "520px" }} />
            </div>

            {/* Rotating Cards */}
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
          <span className="section-tag">Expertise</span>
          <h2 className="section-title">Production Services</h2>
          <div className={styles.servicesList}>
            {services.map((service, index) => (
              <div
                key={index}
                className={styles.serviceItem}
                onMouseMove={handleCardMouseMove}
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
                      width={160}
                      height={100}
                    />
                  ) : null}
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
            {works[0] && (
              <div
                className={`${styles.workCard} ${styles.verticalCard}`}
                onMouseMove={handleCardMouseMove}
                data-cursor="view"
              >
                {works[0].image ? (
                  <Image
                    src={works[0].image}
                    alt={works[0].title}
                    className={styles.workImg}
                    fill
                    sizes="(max-width: 992px) 100vw, 40vw"
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, backgroundColor: "#181717" }} />
                )}
                <div className={styles.workOverlay}>
                  <span className={styles.workCategory}>{works[0].category}</span>
                  <h3 className={styles.workTitle}>{works[0].title}</h3>
                </div>
              </div>
            )}

            {/* Column Right Top (Horizontal) */}
            {works[1] && (
              <div
                className={`${styles.workCard} ${styles.horizontalCard}`}
                onMouseMove={handleCardMouseMove}
                data-cursor="view"
              >
                {works[1].image ? (
                  <Image
                    src={works[1].image}
                    alt={works[1].title}
                    className={styles.workImg}
                    fill
                    sizes="(max-width: 992px) 100vw, 60vw"
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, backgroundColor: "#181717" }} />
                )}
                <div className={styles.workOverlay}>
                  <span className={styles.workCategory}>{works[1].category}</span>
                  <h3 className={styles.workTitle}>{works[1].title}</h3>
                </div>
              </div>
            )}

            {/* Column Right Bottom Left (Square) */}
            {works[2] && (
              <div
                className={`${styles.workCard} ${styles.squareCard1}`}
                onMouseMove={handleCardMouseMove}
                data-cursor="view"
              >
                {works[2].image ? (
                  <Image
                    src={works[2].image}
                    alt={works[2].title}
                    className={styles.workImg}
                    fill
                    sizes="(max-width: 992px) 100vw, 30vw"
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, backgroundColor: "#181717" }} />
                )}
                <div className={styles.workOverlay}>
                  <span className={styles.workCategory}>{works[2].category}</span>
                  <h3 className={styles.workTitle}>{works[2].title}</h3>
                </div>
              </div>
            )}

            {/* Column Right Bottom Right (Square) */}
            {works[3] && (
              <div
                className={`${styles.workCard} ${styles.squareCard2}`}
                onMouseMove={handleCardMouseMove}
                data-cursor="view"
              >
                {works[3].image ? (
                  <Image
                    src={works[3].image}
                    alt={works[3].title}
                    className={styles.workImg}
                    fill
                    sizes="(max-width: 992px) 100vw, 30vw"
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, backgroundColor: "#181717" }} />
                )}
                <div className={styles.workOverlay}>
                  <span className={styles.workCategory}>{works[3].category}</span>
                  <h3 className={styles.workTitle}>{works[3].title}</h3>
                </div>
              </div>
            )}
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

      {/* Showreel Cinematic Modal */}
      {showreelOpen && (
        <div className={styles.showreelOverlay} onClick={() => setShowreelOpen(false)}>
          <div className={styles.showreelContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.showreelClose}
              onClick={() => setShowreelOpen(false)}
              aria-label="Close Showreel"
            >
              &times;
            </button>

            <div className={styles.showreelPlayerWrapper}>
              <video
                src={hero.videoUrl}
                autoPlay
                loop
                muted
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
    </div>
  );
}
