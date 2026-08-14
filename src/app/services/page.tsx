"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./services.module.css";
import GeometricPattern from "../../components/GeometricPattern";

const defaultServices = [
  {
    num: "01",
    name: "Production Services",
    desc: "From concept to capture, we manage the intricate choreography of cameras, lighting, and sound. Our creative crews combine cutting-edge technology and professionalism to deliver high-quality, world-class content tailored to your goals.",
    image: "/images/lens_close_up.png",
  },
  {
    num: "02",
    name: "Post-Production Services",
    desc: "We shape raw footage into cinematic masterworks. Our refined post-production suite is optimized to deliver exceptional results that serve the emotional depth of the narrative.",
    image: "/images/grading_console.png",
  },
  {
    num: "03",
    name: "Creative Development & Strategy",
    desc: "Our reputable approach to design thinking combines creative, critical thinking, and experience. This allows us to transform raw information and abstract ideas into authentic, high-impact creative work.",
    image: "/images/about_story.png",
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState(defaultServices);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("impano_cms_content_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.services && Array.isArray(parsed.services) && parsed.services.length > 0) {
          setServices(parsed.services);
        }
      }
    } catch {}

    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data.services && Array.isArray(data.services) && data.services.length > 0) {
          setServices(data.services);
        }
      })
      .catch((err) => console.error("Failed to load dynamic content for Services page", err));
  }, []);

  const service1 = services[0] || defaultServices[0];
  const service2 = services[1] || defaultServices[1];
  const service3 = services[2] || defaultServices[2];

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
            technical precision. We don&apos;t just record; we curate visual legacies.
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
              <h2 className={styles.sectionTitle}>{service1.name}</h2>
            </div>
            <p className={styles.description}>
              {service1.desc || defaultServices[0].desc}
            </p>

            <div className={styles.tagsGrid}>
              <span className={styles.tagItem}>Producing & Directing</span>
              <span className={styles.tagItem}>Camera Crews</span>
              <span className={styles.tagItem}>Drone Visuals</span>
              <span className={styles.tagItem}>Multi Cameras</span>
              <span className={styles.tagItem}>Live Stream</span>
              <span className={styles.tagItem}>Professional Interviews</span>
              <span className={styles.tagItem}>Motion Graphics</span>
              <span className={styles.tagItem}>3D Animation</span>
              <span className={styles.tagItem}>Script Writing</span>
              <span className={styles.tagItem}>StoryBoard</span>
            </div>

            <Link href="/contact" className={styles.arrowLink} style={{ marginTop: "2rem" }}>
              Book Production Crew <span>→</span>
            </Link>
          </div>

          <div className={styles.imageCol}>
            <Image
              src={service1.image || defaultServices[0].image}
              alt={service1.name}
              className={styles.sectionImg}
              fill
              sizes="(max-width: 992px) 100vw, 50vw"
              priority
            />
            <div className={styles.badgesOverlay}>
              <span className={styles.badge}>RED V-RAPTOR</span>
              <span className={styles.badge}>ANAMORPHIC GLASS</span>
              <span className={styles.badge}>DRONE SQUAD</span>
            </div>
          </div>
        </div>
      </section>

      {/* 02 REFINEMENT: Post-Production Section */}
      <section className={styles.section} style={{ backgroundColor: "var(--bg-black)" }}>
        <div className={`${styles.sectionGridReverse} container`}>
          <div className={styles.imageCol}>
            <Image
              src={service2.image || defaultServices[1].image}
              alt={service2.name}
              className={styles.sectionImg}
              fill
              sizes="(max-width: 992px) 100vw, 50vw"
            />
          </div>

          <div className={styles.contentCol}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>02 —— Refinement</span>
              <h2 className={styles.sectionTitle}>{service2.name}</h2>
            </div>
            <p className={styles.description}>
              {service2.desc || defaultServices[1].desc}
            </p>

            <div className={styles.featuresBlock}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#ffad11" strokeWidth="1.5" />
                    <line x1="8" y1="9" x2="16" y2="9" stroke="#ffad11" strokeWidth="1.5" />
                    <line x1="8" y1="13" x2="16" y2="13" stroke="#ffad11" strokeWidth="1.5" />
                    <line x1="8" y1="17" x2="12" y2="17" stroke="#ffad11" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>Offline / Online Edit</h3>
                  <p className={styles.featureDesc}>
                    Precise cutting, narrative pacing, and seamless scene transitions.
                  </p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#ffad11" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="6" fill="#ffad11" fillOpacity="0.3" />
                    <circle cx="12" cy="12" r="2" fill="#ffad11" />
                  </svg>
                </div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>Color Correction</h3>
                  <p className={styles.featureDesc}>
                    Advanced color science and grading to refine visual tone, exposure, and color styling.
                  </p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18V5l12-2v13" stroke="#ffad11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="6" cy="18" r="3" stroke="#ffad11" strokeWidth="1.5"/>
                    <circle cx="18" cy="16" r="3" stroke="#ffad11" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>Sound Design</h3>
                  <p className={styles.featureDesc}>
                    Immersive spatial audio engineering, foley, and score mixing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 CONCEPTION: Creative Development */}
      <section className={styles.section} style={{ backgroundColor: "var(--bg-dark)" }}>
        <div className={`${styles.sectionGrid} container`}>
          <div className={styles.contentCol}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>03 —— Conception</span>
              <h2 className={styles.sectionTitle}>{service3.name}</h2>
            </div>
            <p className={styles.description}>
              {service3.desc || defaultServices[2].desc}
            </p>

            <Link href="/contact" className="btn-primary" style={{ alignSelf: "flex-start", marginTop: "1rem" }}>
              Start Strategy Session
            </Link>
          </div>

          <div className={styles.imageCol}>
            <Image
              src={service3.image || defaultServices[2].image}
              alt={service3.name}
              className={styles.sectionImg}
              fill
              sizes="(max-width: 992px) 100vw, 50vw"
            />
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
