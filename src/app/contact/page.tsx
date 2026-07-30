"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "Cinematography",
    budget: "",
    message: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      // Simulate API submit
      setSubmitted(true);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--bg-dark)" }}>
      {/* Contact Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.heroTag}>Connect with us</span>
          <h1 className={styles.heroTitle}>
            Let's Create <span>Impact</span>
            <br />
            Together
          </h1>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="container">
        <div className={styles.contactGrid}>
          {/* Left Form Column */}
          <div className={styles.formContainer}>
            {!submitted ? (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="John Doe"
                      className={styles.input}
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="john@example.com"
                      className={styles.input}
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="projectType" className={styles.label}>
                      Project Type
                    </label>
                    <select
                      id="projectType"
                      className={styles.select}
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    >
                      <option value="Cinematography">Cinematography</option>
                      <option value="Commercial">Commercial/Ads</option>
                      <option value="Documentary">Documentary</option>
                      <option value="Post-Production">Post-Production</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="budget" className={styles.label}>
                      Budget Range
                    </label>
                    <input
                      type="text"
                      id="budget"
                      placeholder="$5,000 - $15,000"
                      className={styles.input}
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    placeholder="Tell us about your vision..."
                    className={styles.textarea}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>
                  Send Inquiry
                </button>
              </form>
            ) : (
              <div className={styles.successContainer}>
                <div className={styles.successCircle}>
                  <div className={styles.successCheck}></div>
                </div>
                <h3 className={styles.successTitle}>Inquiry Sent!</h3>
                <p className={styles.successDesc}>
                  Thank you for reaching out, <strong>{formData.name}</strong>. We have received your inquiry
                  about <strong>{formData.projectType}</strong> and will get back to you within 24 hours.
                </p>
                <button className="btn-outline" onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", projectType: "Cinematography", budget: "", message: "" }); }}>
                  Send Another Message
                </button>
              </div>
            )}
          </div>

          {/* Right Information Column */}
          <div className={styles.infoPanel}>
            {/* Styled Map Box */}
            <div className={styles.mapCard}>
              <Image
                src="/images/kigali_map_mock.png"
                alt="Impano Studio Location Map Kigali"
                className={styles.mapImg}
                fill
                sizes="(max-width: 992px) 100vw, 40vw"
              />
              <div className={styles.mapOverlayCard}>
                <div className={styles.pinIcon}>
                  <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 0C4.03 0 0 4.03 0 9C0 15.75 9 22 9 22C9 22 18 15.75 18 9C18 4.03 13.97 0 9 0ZM9 12.25C7.21 12.25 5.75 10.79 5.75 9C5.75 7.21 7.21 5.75 9 5.75C10.79 5.75 12.25 7.21 12.25 9C12.25 10.79 10.79 12.25 9 12.25Z"
                      fill="#0D0C0C"
                    />
                  </svg>
                </div>
                <div className={styles.pinInfo}>
                  <span className={styles.pinTitle}>Kigali Office</span>
                  <span className={styles.pinDesc}>Innovation Tower, Level 4</span>
                </div>
              </div>
            </div>

            {/* Email and Call Details */}
            <div className={styles.contactsRow}>
              <div className={styles.infoCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>@</span>
                  <span className={styles.cardTitle}>Email Us</span>
                </div>
                <a href="mailto:hello@impano.studio" className={styles.cardValue}>
                  hello@impano.studio
                </a>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.cardHeader}>
                  <svg width="16" height="24" viewBox="0 0 16 26" fill="none" className={styles.cardIcon} xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="14" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8" cy="21" r="1.5" fill="currentColor" />
                  </svg>
                  <span className={styles.cardTitle}>Call Us</span>
                </div>
                <a href="tel:+250788000000" className={styles.cardValue}>
                  +250 788 000 000
                </a>
              </div>
            </div>

            {/* Social Links Panel */}
            <div className={styles.socialConnect}>
              <span className={styles.socialsTitle}>Connect Digitally</span>
              <div className={styles.socialIconsList}>
                {/* Globe/Web */}
                <a href="https://impano.studio" target="_blank" rel="noopener noreferrer" className={styles.iconButton} aria-label="Website">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </a>
                {/* Video/Play */}
                <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer" className={styles.iconButton} aria-label="Vimeo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </a>
                {/* Briefcase/Portfolio */}
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.iconButton} aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </a>
                {/* Megaphone/Announce */}
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.iconButton} aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
