"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import Logo from "./Logo";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Works", path: "/works" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Team", path: "/team" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
      <div className={`${styles.container} container`}>
        {/* Logo (Far Left Circular Capsule) */}
        <Link href="/" className={styles.logoCircleWrapper} onClick={closeMenu}>
          <Logo size={36} />
        </Link>

        {/* Floating Pill Navbar Capsule (Desktop) */}
        <div className={styles.navbarPill}>
          {/* Main Navigation Links */}
          <nav className={styles.nav}>
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`${styles.navLink} ${
                    isActive ? styles.navLinkActive : ""
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>



          {/* CTA Get in Touch Button */}
          <Link href="/contact" className={styles.ctaButton}>
            Get in Touch
          </Link>
        </div>

        {/* Mobile Hamburger Menu Trigger */}
        <button
          className={`${styles.hamburger} ${
            isMenuOpen ? styles.hamburgerActive : ""
          }`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          id="menu-trigger"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Navigation Drawer Overlay */}
        <div
          className={`${styles.mobileMenu} ${
            isMenuOpen ? styles.mobileMenuOpen : ""
          }`}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={closeMenu}
                className={`${styles.mobileNavLink} ${
                  isActive ? styles.mobileNavLinkActive : ""
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className={styles.mobileMenuCta}>
            <Link
              href="/contact"
              onClick={closeMenu}
              className="btn-primary"
              style={{ width: "100%", display: "flex" }}
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
