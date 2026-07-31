import Link from "next/link";
import styles from "./Footer.module.css";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Innovative watermarked background branding text */}
      <div className={styles.innovativeWatermark}>
        {"IMPANO".split("").map((letter, index) => (
          <span
            key={index}
            className={index % 2 === 0 ? styles.watermarkLetter : styles.watermarkLetterOutline}
            style={{ animationDelay: `${index * 0.3}s` }}
          >
            {letter}
          </span>
        ))}
      </div>

      <div className={`${styles.container} container`}>
        <div className={styles.topRow}>
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <Logo size={36} />
              <div className={styles.brandName} style={{ marginBottom: 0 }}>Impano Entertainment</div>
            </div>
            <p className={styles.brandDesc}>
              Elevating Rwandan creative expression to the global stage through
              cinematic excellence and innovative storytelling. We don&apos;t just
              record; we curate visual legacies.
            </p>
          </div>

          {/* Links Columns */}
          <div className={styles.linksCol}>
            <div>
              <h4 className={styles.colTitle}>Navigation</h4>
              <ul className={styles.linksList}>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/services">Services</Link>
                </li>
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/team">Team</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={styles.colTitle}>Connect</h4>
              <ul className={styles.linksList}>
                <li>
                  <a href="https://instagram.com/Impano_Entertainment" target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://x.com" target="_blank" rel="noopener noreferrer">
                    Twitter/X
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={styles.colTitle}>Studio Address</h4>
              <div className={styles.addressText}>
                Innovation Tower, Level 4
                <br />
                Kigali, Rwanda
                <br />
                <span style={{ color: "var(--accent-gold)", display: "inline-block", marginTop: "0.5rem" }}>
                  impanoent@gmail.com
                </span>
                <br />
                <span style={{ color: "var(--text-grey)", display: "inline-block", marginTop: "0.25rem", fontSize: "0.85rem" }}>
                  0780124489
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} Impano Entertainment. All Rights Reserved.
          </div>
          <div className={styles.socialsRow}>
            <a href="https://instagram.com" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://vimeo.com" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
              Vimeo
            </a>
            <a href="https://linkedin.com" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="https://twitter.com" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
