"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import styles from "./works.module.css";
import GeometricPattern from "../../components/GeometricPattern";

export default function WorksPage() {
  const defaultWorkImages = [
    "/images/echo_of_hills.png",
    "/images/grading_console.png",
    "/images/about_story.png",
    "/images/hero_bg.png"
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
      category: "Crafted",
      image: defaultWorkImages[2],
    },
    {
      title: "VFX Composites",
      category: "Animation",
      image: defaultWorkImages[3],
    }
  ];

  const [works, setWorks] = useState(initialWorks);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalWork, setActiveModalWork] = useState<any>(null);

  useEffect(() => {
    const resolveImage = (url: string, fallback: string) => (url && url.trim() ? url : fallback);

    const applyData = (data: any, sourceName: string) => {
      if (Array.isArray(data.works) && data.works.length > 0) {
        setWorks(data.works.map((w: any, idx: number) => ({
          title: w.title || `Project ${idx + 1}`,
          category: w.category || "Film",
          image: resolveImage(w.image, defaultWorkImages[idx % defaultWorkImages.length] || "")
        })));
        console.log(`%c[Impano CMS Works] Content loaded from ${sourceName}. Total works: ${data.works.length}`, "color: #10b981; font-weight: bold;");
      }
    };

    try {
      const cached = localStorage.getItem("impano_cms_content_cache");
      if (cached) {
        applyData(JSON.parse(cached), "Browser LocalCache");
      }
    } catch {}

    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        const storageLabel = data._meta?.kvConnected ? "Upstash KV Database" : `Fallback (${data._meta?.storageType || "local"})`;
        applyData(data, storageLabel);
      })
      .catch((err) => console.warn("[Impano CMS Works] Failed to fetch dynamic content from API", err));
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeModalWork) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeModalWork]);

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    works.forEach((w) => {
      if (w.category && w.category.trim()) {
        set.add(w.category.trim());
      }
    });
    return ["All", ...Array.from(set)];
  }, [works]);

  // Filtered works by category and search
  const filteredWorks = useMemo(() => {
    return works.filter((work) => {
      const matchesCategory = selectedCategory === "All" || work.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = searchQuery.trim() === "" ||
        work.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [works, selectedCategory, searchQuery]);

  // 3D Card tilt tracking
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div style={{ backgroundColor: "var(--bg-dark)", minHeight: "100vh" }}>
      {/* Works Hero Header */}
      <section className={styles.hero}>
        <GeometricPattern />
        <div className={`${styles.heroContent} container`}>
          <span className={styles.heroTag}>Portfolio Archive</span>
          <h1 className={styles.heroTitle}>
            Visual <span className={styles.goldText}>Legacies</span>
            <br />
            <span className={styles.outlineText}>& Masterworks</span>
          </h1>
          <p className={styles.heroDesc}>
            Explore the complete archive of our cinematic productions, commercial films, documentaries, and post-production assets created with cutting-edge artistry from Kigali to the world.
          </p>
        </div>
      </section>

      {/* Sticky Filter & Search Bar */}
      <section className={styles.filterSection}>
        <div className={`${styles.filterContainer} container`}>
          {/* Dynamic Categories */}
          <div className={styles.categoryPills}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.categoryBtn} ${
                  selectedCategory === cat ? styles.categoryBtnActive : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className={styles.searchBox}>
            <svg
              className={styles.searchIcon}
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search projects by name..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Works Gallery Grid */}
      <section className={styles.gallerySection}>
        <div className="container">
          <div className={styles.galleryHeader}>
            <span>Showing <strong>{filteredWorks.length}</strong> of <strong>{works.length}</strong> Projects</span>
            {selectedCategory !== "All" && (
              <button
                type="button"
                style={{ color: "var(--accent-gold)", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }}
                onClick={() => setSelectedCategory("All")}
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className={styles.worksGrid}>
            {filteredWorks.map((work, index) => (
              <div
                key={index}
                className={styles.archiveCard}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                onClick={() => setActiveModalWork(work)}
                data-cursor="view"
              >
                <div className={styles.cardImgWrapper}>
                  {work.image ? (
                    <img
                      src={work.image}
                      alt={work.title}
                      className={styles.cardImg}
                    />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, backgroundColor: "#181717" }} />
                  )}
                </div>

                {/* Card Badges */}
                <div className={styles.cardTopBadges}>
                  <span className={styles.cardIndexBadge}>
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>
                  <span className={styles.cardCategoryPill}>{work.category}</span>
                </div>

                {/* Card Bottom Overlay */}
                <div className={styles.cardBottomOverlay}>
                  <h3 className={styles.cardTitle}>{work.title}</h3>
                  <span className={styles.cardAction}>
                    View Project ➔
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredWorks.length === 0 && (
            <div style={{ textAlign: "center", padding: "6rem 0", color: "var(--text-grey)" }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "var(--text-white)" }}>No projects found</h3>
              <p>No project matches your search query &quot;{searchQuery}&quot;.</p>
              <button
                type="button"
                className="btn-outline"
                style={{ marginTop: "1.5rem" }}
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox / Details Modal */}
      {activeModalWork && (
        <div className={styles.modalOverlay} onClick={() => setActiveModalWork(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalCloseBtn}
              onClick={() => setActiveModalWork(null)}
              aria-label="Close Project Modal"
            >
              &times;
            </button>

            <div className={styles.modalMediaWrapper}>
              {activeModalWork.image ? (
                <img
                  src={activeModalWork.image}
                  alt={activeModalWork.title}
                  className={styles.modalImg}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", backgroundColor: "#181717" }} />
              )}
            </div>

            <div className={styles.modalBody}>
              <span className={styles.modalCategory}>{activeModalWork.category}</span>
              <h2 className={styles.modalTitle}>{activeModalWork.title}</h2>

              <div className={styles.modalActions}>
                <Link href="/contact" className="btn-primary" onClick={() => setActiveModalWork(null)}>
                  Commission Similar Project
                </Link>
                <button type="button" className="btn-outline" onClick={() => setActiveModalWork(null)}>
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
