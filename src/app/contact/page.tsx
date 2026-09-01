"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "Cinematography",
    budget: "",
    message: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || "Failed to send message. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg("Failed to send message. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--bg-dark)" }}>
      {/* Contact Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.heroTag}>Connect with us</span>
          <h1 className={styles.heroTitle}>
            Let&apos;s Create <span>Impact</span>
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
                      placeholder="5,000,000 - 15,000,000 RWF"
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

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignSelf: "flex-start" }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isSubmitting}
                    style={{ opacity: isSubmitting ? 0.65 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                  {errorMsg && (
                    <span style={{ color: "#ff6b6b", fontSize: "0.9rem", fontWeight: "500" }}>
                      {errorMsg}
                    </span>
                  )}
                </div>
              </form>
            ) : (
              <div className={styles.successContainer}>
                <div className={styles.successCircle}>
                  <div className={styles.successCheck}></div>
                </div>
                <h3 className={styles.successTitle}>Message Sent!</h3>
                <p className={styles.successDesc}>
                  Thank you for reaching out, <strong>{formData.name}</strong>. We have received your message
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
                alt="Impano Entertainment Location Map Kigali"
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
                <a href="mailto:impanoent@gmail.com" className={styles.cardValue}>
                  impanoent@gmail.com
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
                <a href="tel:0780124489" className={styles.cardValue}>
                  0780124489
                </a>
              </div>
            </div>

            {/* Social Links Panel */}
            <div className={styles.socialConnect}>
              <span className={styles.socialsTitle}>Connect Digitally</span>
              <div className={styles.socialsList} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1.5rem" }}>
                
                {/* Instagram */}
                <a 
                  href="https://www.instagram.com/impano_ent/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.socialLinkItem}
                  style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--text-white)", textDecoration: "none" }}
                >
                  <span className={styles.iconButton} style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.02)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-grey)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Instagram</span>
                    <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--accent-gold)" }}>@impano_ent</span>
                  </div>
                </a>

                {/* Vimeo */}
                <a 
                  href="https://vimeo.com/user262775372" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.socialLinkItem}
                  style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--text-white)", textDecoration: "none" }}
                >
                  <span className={styles.iconButton} style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.02)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 7.5C2.5 7.5 4.5 7 5.5 8.5C6.5 10 8 16 8.5 17.5C9 19 10 19 10.5 18C11 17 14.5 10.5 15 9C15.5 7.5 14 7.5 13 8C13 8 13.5 5 17.5 4.5C21.5 4 21.5 7.5 21 10C20.5 12.5 17.5 18.5 15.5 20C13.5 21.5 11 21 9.5 18.5L7.5 12L5 16L2.5 7.5Z" />
                    </svg>
                  </span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-grey)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Vimeo</span>
                    <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--accent-gold)" }}>Impano Entertainment</span>
                  </div>
                </a>

                {/* LinkedIn */}
                <a 
                  href="https://www.linkedin.com/in/impano-ent-751bb924a/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.socialLinkItem}
                  style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--text-white)", textDecoration: "none" }}
                >
                  <span className={styles.iconButton} style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.02)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-grey)", textTransform: "uppercase", letterSpacing: "0.1em" }}>LinkedIn</span>
                    <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--accent-gold)" }}>Impano Entertainment</span>
                  </div>
                </a>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
