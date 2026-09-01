"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./team.module.css";
import GeometricPattern from "../../components/GeometricPattern";

const defaultTeam = [
  {
    name: "ISHIMWE CHRISPIN",
    role: "Founder & Drone Pilot",
    bio: "Visionary leader and executive producer managing Impano's strategic growth, pioneering international partnerships, and scaling Rwanda's cinematic footprint globally.",
    image: "/images/chrispin.jpeg",
  },
  {
    name: "UWASE SONIA",
    role: "Co-Founder, Project Manager",
    bio: "Technical anchor managing studio systems, high-speed storage pipelines, render farms, and secure media servers to ensure seamless production workflow.",
    image: "/images/sonia.png",
  },
  {
    name: "ISHIMWE FISTON",
    role: "Editor",
    bio: "Master of rhythm and pacing, weaving raw cinematic footage into cohesive, powerful stories with precision editing and dynamic audio integration.",
    image: "/images/Fiston.jpeg",
  },
  {
    name: "MUGISHA ALLY",
    role: "Assistant Production",
    bio: "Key coordinator handling logistics, scheduling, and on-set operations, ensuring our complex film productions run smoothly and on schedule.",
    image: "/images/Ally.png",
  },
  {
    name: "NTWALI ANDERSEN Moise",
    role: "Camera Operator",
    bio: "Expert visual technician dedicated to precise framing, fluid camera movements, and capturing stunning cinematography on set.",
    image: "/images/ntwali.jpg",
  },
];

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState(defaultTeam);

  useEffect(() => {
    const resolveImage = (url: string, fallback: string) => (url && url.trim() ? url : fallback);

    const applyTeam = (list: any[], sourceName: string) => {
      setTeamMembers(list.map((m: any, idx: number) => ({
        ...m,
        image: resolveImage(m.image, defaultTeam[idx]?.image || "")
      })));
      console.log(`%c[Impano CMS Team] Content successfully loaded from ${sourceName}.`, "color: #10b981; font-weight: bold;");
    };

    try {
      const cached = localStorage.getItem("impano_cms_content_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.team && Array.isArray(parsed.team) && parsed.team.length > 0) {
          applyTeam(parsed.team, "Browser LocalCache");
        }
      }
    } catch {}

    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data.team && Array.isArray(data.team) && data.team.length > 0) {
          const storageLabel = data._meta?.kvConnected ? "Upstash KV Database" : `Fallback (${data._meta?.storageType || "local"})`;
          applyTeam(data.team, storageLabel);
        }
      })
      .catch((err) => console.error("[Impano CMS Team] Failed to load dynamic team data", err));
  }, []);

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
            {teamMembers.map((member: any, index: number) => (
              <div key={index} className={styles.teamCard}>
                <div className={styles.imageWrapper}>
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={`${member.name} - ${member.role}`}
                      className={styles.teamImg}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                      priority={index < 2}
                    />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, backgroundColor: "#181717", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "2rem", fontWeight: 700, color: "#d4af37", opacity: 0.4 }}>
                        {member.name ? member.name.charAt(0) : "I"}
                      </span>
                    </div>
                  )}
                  <div className={styles.cardGradientOverlay} />
                </div>
                <div className={styles.info}>
                  <div className={styles.infoTop}>
                    <span className={styles.role}>{member.role}</span>
                    <h3 className={styles.name}>{member.name}</h3>
                  </div>
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

