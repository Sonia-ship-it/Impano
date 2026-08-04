"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import Logo from "../../components/Logo";
import GeometricPattern from "../../components/GeometricPattern";

type Tab = "hero" | "clients" | "team" | "services";

export default function AdminDashboard() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [content, setContent] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // States for passcode reset form
  const [oldPasscode, setOldPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [showOldPasscode, setShowOldPasscode] = useState(false);
  const [showNewPasscode, setShowNewPasscode] = useState(false);
  const [showConfirmPasscode, setShowConfirmPasscode] = useState(false);

  // Check if passcode is saved in localStorage
  useEffect(() => {
    const savedPasscode = localStorage.getItem("impano_admin_passcode");
    if (savedPasscode) {
      verifyPasscode(savedPasscode);
    }
  }, []);

  const verifyPasscode = async (codeToVerify: string) => {
    setIsLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": codeToVerify,
        },
        body: JSON.stringify({ dryRun: true }),
      });

      const data = await res.json();
      if (res.ok && data.verified) {
        setIsAuthenticated(true);
        localStorage.setItem("impano_admin_passcode", codeToVerify);
        setPasscode(codeToVerify);
        fetchContent();
      } else {
        setAuthError(data.error || "Invalid passcode.");
        localStorage.removeItem("impano_admin_passcode");
      }
    } catch (err) {
      setAuthError("Failed to connect to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        
        // Ensure all sections are structured to prevent rendering crashes
        const safeData = {
          passcode: data.passcode || passcode,
          hero: data.hero || {
            tagline: "Connect with us",
            titlePart1: "Crafting",
            titleOutline: "Visual",
            titleGold: "Legacies.",
            description: "From the heart of Kigali, we craft premium commercial films, documentaries, and post-production experiences. We translate bold concepts into memorable cinematic assets.",
            playText: "WATCH SHOWREEL",
            videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-cinematic-shot-of-a-misty-forest-42475-large.mp4"
          },
          services: data.services || [],
          clients: data.clients || [],
          team: data.team || []
        };
        
        setContent(safeData);
      }
    } catch (err) {
      console.error("Failed to load content database.");
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim()) {
      verifyPasscode(passcode.trim());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("impano_admin_passcode");
    setIsAuthenticated(false);
    setPasscode("");
    setContent(null);
    router.push("/");
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": passcode,
        },
        body: JSON.stringify(content),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({ success: true, message: "Content updated successfully! Changes are live." });
        
        // Sync passcode local state and localStorage if reset
        if (content.passcode && content.passcode !== passcode) {
          setPasscode(content.passcode);
          localStorage.setItem("impano_admin_passcode", content.passcode);
        }
        
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        setSaveStatus({ success: false, message: data.error || "Failed to save content changes." });
      }
    } catch (err) {
      setSaveStatus({ success: false, message: "Network error. Failed to save changes." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasscodeSubmit = async () => {
    if (!oldPasscode) {
      alert("Please enter your current passcode.");
      return;
    }
    if (oldPasscode !== passcode) {
      alert("The current passcode you entered is incorrect.");
      return;
    }
    if (!newPasscode.trim()) {
      alert("New passcode cannot be empty.");
      return;
    }
    if (newPasscode !== confirmPasscode) {
      alert("New passcodes do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const updatedContent = { ...content, passcode: newPasscode };
      const res = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": passcode,
        },
        body: JSON.stringify(updatedContent),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasscode(newPasscode);
        localStorage.setItem("impano_admin_passcode", newPasscode);
        setContent(updatedContent);
        setOldPasscode("");
        setNewPasscode("");
        setConfirmPasscode("");
        alert("Passcode updated successfully!");
      } else {
        alert(data.error || "Failed to update passcode.");
      }
    } catch (err) {
      alert("Network error. Failed to update passcode.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onUploadSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onUploadSuccess(data.url);
      } else {
        alert(data.error || "Failed to upload image.");
      }
    } catch (err) {
      alert("Failed to upload image. Server connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Content state mutators
  const updateHero = (key: string, value: string) => {
    setContent({
      ...content,
      hero: {
        ...content.hero,
        [key]: value,
      },
    });
  };



  const updateClient = (index: number, key: string, value: string) => {
    const updatedClients = [...content.clients];
    updatedClients[index] = { ...updatedClients[index], [key]: value };
    setContent({ ...content, clients: updatedClients });
  };

  const addClient = () => {
    setContent({
      ...content,
      clients: [...content.clients, { name: "New Client", logo: "/images/logo_placeholder.png" }],
    });
  };

  const removeClient = (index: number) => {
    const updatedClients = content.clients.filter((_: any, i: number) => i !== index);
    setContent({ ...content, clients: updatedClients });
  };

  const updateTeam = (index: number, key: string, value: string) => {
    const updatedTeam = [...content.team];
    updatedTeam[index] = { ...updatedTeam[index], [key]: value };
    setContent({ ...content, team: updatedTeam });
  };

  const addTeamMember = () => {
    setContent({
      ...content,
      team: [
        ...content.team,
        {
          name: "NEW MEMBER",
          role: "Co-Worker",
          bio: "Description of the member's professional expertise and details.",
          image: "/images/sonia.png",
        },
      ],
    });
  };

  const removeTeamMember = (index: number) => {
    const updatedTeam = content.team.filter((_: any, i: number) => i !== index);
    setContent({ ...content, team: updatedTeam });
  };

  const updateService = (index: number, key: string, value: string) => {
    const updatedServices = [...content.services];
    updatedServices[index] = { ...updatedServices[index], [key]: value };
    setContent({ ...content, services: updatedServices });
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.adminWrapper} style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
        <GeometricPattern />
        <div className={styles.lockScreen} style={{ position: "relative", zIndex: 10 }}>
          <form className={styles.lockCard} onSubmit={handleLoginSubmit}>
            <div className={styles.lockLogoWrapper}>
              <Logo size={64} />
            </div>
            <h2 className={styles.lockTitle}>IMPANO CMS</h2>
            <p className={styles.lockDesc}>Enter administrative passcode to unlock editing controls.</p>
            
            <div className={styles.passcodeFieldWrapper}>
              <input
                type={showPasscode ? "text" : "password"}
                placeholder="Enter Passcode"
                className={styles.lockInput}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                disabled={isLoading}
              />
              <button 
                type="button" 
                className={styles.toggleVisibilityBtn}
                onClick={() => setShowPasscode(!showPasscode)}
                aria-label="Toggle passcode visibility"
              >
                {showPasscode ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <button type="submit" className={styles.lockSubmitBtn} disabled={isLoading}>
              {isLoading ? (
                <span className={styles.spinner}></span>
              ) : (
                "Unlock Dashboard"
              )}
            </button>
            
            {authError && (
              <div className={`${styles.statusMessage} ${styles.statusError}`} style={{ justifyContent: "center" }}>
                ⚠️ {authError}
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className={styles.adminWrapper}>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <h2>Loading Content Settings...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminWrapper}>
      <div className="container">
        {/* Header */}
        <header className={styles.dashboardHeader}>
          <div className={styles.titleSection}>
            <h1>Impano CMS</h1>
            <p className={styles.subtitle}>Manage homepage sections, clients, and team profiles dynamically.</p>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* Workspace Layout */}
        <div className={styles.dashboardLayout}>
          {/* Sidebar */}
          <aside className={styles.tabList}>
            <button
              className={`${styles.tabBtn} ${activeTab === "hero" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("hero")}
            >
              🎬 Hero & Settings
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "services" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("services")}
            >
              🎥 Studio Services
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "clients" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("clients")}
            >
              💼 Client Showcase
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "team" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("team")}
            >
              👥 Team Roster
            </button>
          </aside>

          {/* Panel Card */}
          <main className={styles.panelCard}>
            {activeTab === "hero" && (
              <div>
                <h3 className={styles.panelTitle}>Homepage Hero Settings</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tagline</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={content.hero.tagline}
                      onChange={(e) => updateHero("tagline", e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Watch Video Text</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={content.hero.playText}
                      onChange={(e) => updateHero("playText", e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Hero Title - Line 1 (White)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={content.hero.titlePart1}
                      onChange={(e) => updateHero("titlePart1", e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Hero Title - Line 2 (Outline)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={content.hero.titleOutline}
                      onChange={(e) => updateHero("titleOutline", e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Hero Title - Line 3 (Gold Accent)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={content.hero.titleGold}
                      onChange={(e) => updateHero("titleGold", e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Showreel Video URL (Vimeo/YouTube Embed)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={content.hero.videoUrl}
                      onChange={(e) => updateHero("videoUrl", e.target.value)}
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label className={styles.label}>Hero Paragraph Description</label>
                    <textarea
                      className={styles.textarea}
                      value={content.hero.description}
                      onChange={(e) => updateHero("description", e.target.value)}
                    />
                  </div>
                  
                  <div className={`${styles.formGroup} ${styles.formGroupFull}`} style={{ borderTop: "1px solid var(--border-color-light)", paddingTop: "2.5rem", marginTop: "2.5rem" }}>
                    <h4 className={styles.panelTitle} style={{ fontSize: "1.1rem", borderBottom: "none", marginBottom: "0.25rem", paddingBottom: 0 }}>Reset Admin Passcode</h4>
                    <p style={{ color: "var(--text-grey)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                      To update your security passcode, enter your current passcode and confirm the new one below.
                    </p>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Current Passcode</label>
                        <div className={styles.passcodeFieldWrapper} style={{ marginBottom: 0 }}>
                          <input
                            type={showOldPasscode ? "text" : "password"}
                            className={styles.input}
                            style={{ width: "100%", paddingRight: "3rem" }}
                            placeholder="Enter current passcode"
                            value={oldPasscode}
                            onChange={(e) => setOldPasscode(e.target.value)}
                          />
                          <button
                            type="button"
                            className={styles.toggleVisibilityBtn}
                            onClick={() => setShowOldPasscode(!showOldPasscode)}
                            aria-label="Toggle current passcode visibility"
                          >
                            {showOldPasscode ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>New Passcode</label>
                        <div className={styles.passcodeFieldWrapper} style={{ marginBottom: 0 }}>
                          <input
                            type={showNewPasscode ? "text" : "password"}
                            className={styles.input}
                            style={{ width: "100%", paddingRight: "3rem" }}
                            placeholder="Enter new passcode"
                            value={newPasscode}
                            onChange={(e) => setNewPasscode(e.target.value)}
                          />
                          <button
                            type="button"
                            className={styles.toggleVisibilityBtn}
                            onClick={() => setShowNewPasscode(!showNewPasscode)}
                            aria-label="Toggle new passcode visibility"
                          >
                            {showNewPasscode ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Confirm New Passcode</label>
                        <div className={styles.passcodeFieldWrapper} style={{ marginBottom: 0 }}>
                          <input
                            type={showConfirmPasscode ? "text" : "password"}
                            className={styles.input}
                            style={{ width: "100%", paddingRight: "3rem" }}
                            placeholder="Confirm new passcode"
                            value={confirmPasscode}
                            onChange={(e) => setConfirmPasscode(e.target.value)}
                          />
                          <button
                            type="button"
                            className={styles.toggleVisibilityBtn}
                            onClick={() => setShowConfirmPasscode(!showConfirmPasscode)}
                            aria-label="Toggle confirm passcode visibility"
                          >
                            {showConfirmPasscode ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.formGroup} style={{ justifyContent: "flex-end", paddingTop: "1.7rem" }}>
                        <button
                          type="button"
                          className={styles.saveBtn}
                          style={{ background: "transparent", border: "1px solid var(--accent-gold)", color: "var(--accent-gold)", padding: "0.8rem 1.8rem" }}
                          onClick={handleResetPasscodeSubmit}
                          disabled={isLoading}
                        >
                          {isLoading ? "Updating..." : "Update Passcode"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "services" && (
              <div>
                <h3 className={styles.panelTitle}>Manage Studio Services</h3>
                <div className={styles.listGrid}>
                  {content.services.map((service: any, index: number) => (
                    <div key={index} className={styles.itemCard}>
                      <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Service {service.num}</span>
                      </div>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Service Name</label>
                          <input
                            type="text"
                            className={styles.input}
                            value={service.name}
                            onChange={(e) => updateService(index, "name", e.target.value)}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Cover Image Path</label>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <input
                              type="text"
                              className={styles.input}
                              style={{ flex: 1 }}
                              value={service.image}
                              onChange={(e) => updateService(index, "image", e.target.value)}
                            />
                            <label className={styles.uploadLabel}>
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => handleImageUpload(e, (url) => updateService(index, "image", url))}
                              />
                            </label>
                          </div>
                        </div>
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                          <label className={styles.label}>Service Description</label>
                          <textarea
                            className={styles.textarea}
                            value={service.desc}
                            onChange={(e) => updateService(index, "desc", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "clients" && (
              <div>
                <h3 className={styles.panelTitle}>Manage Client Logos</h3>
                <div className={styles.listGrid}>
                  {content.clients.map((client: any, index: number) => (
                    <div key={index} className={styles.itemCard}>
                      <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Client #{index + 1}</span>
                        <button className={styles.removeBtn} onClick={() => removeClient(index)}>
                          Remove
                        </button>
                      </div>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Client Name</label>
                          <input
                            type="text"
                            className={styles.input}
                            value={client.name}
                            onChange={(e) => updateClient(index, "name", e.target.value)}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Logo File Path</label>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <input
                              type="text"
                              className={styles.input}
                              style={{ flex: 1 }}
                              value={client.logo}
                              onChange={(e) => updateClient(index, "logo", e.target.value)}
                            />
                            <label className={styles.uploadLabel}>
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => handleImageUpload(e, (url) => updateClient(index, "logo", url))}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className={styles.addBtn} onClick={addClient}>
                  + Add New Client Logo
                </button>
              </div>
            )}

            {activeTab === "team" && (
              <div>
                <h3 className={styles.panelTitle}>Manage Team Profiles</h3>
                <div className={styles.listGrid}>
                  {content.team.map((member: any, index: number) => (
                    <div key={index} className={styles.itemCard}>
                      <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>{member.name || "UNNAMED"}</span>
                        <button className={styles.removeBtn} onClick={() => removeTeamMember(index)}>
                          Remove
                        </button>
                      </div>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Member Name</label>
                          <input
                            type="text"
                            className={styles.input}
                            value={member.name}
                            placeholder="e.g. UWASE SONIA"
                            onChange={(e) => updateTeam(index, "name", e.target.value)}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Role</label>
                          <input
                            type="text"
                            className={styles.input}
                            value={member.role}
                            placeholder="e.g. Editor"
                            onChange={(e) => updateTeam(index, "role", e.target.value)}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Portrait Image Path</label>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <input
                              type="text"
                              className={styles.input}
                              style={{ flex: 1 }}
                              value={member.image}
                              onChange={(e) => updateTeam(index, "image", e.target.value)}
                            />
                            <label className={styles.uploadLabel}>
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => handleImageUpload(e, (url) => updateTeam(index, "image", url))}
                              />
                            </label>
                          </div>
                        </div>
                        <div className={styles.formGroup} style={{ visibility: "hidden" }} />
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                          <label className={styles.label}>Bio Biography</label>
                          <textarea
                            className={styles.textarea}
                            value={member.bio}
                            onChange={(e) => updateTeam(index, "bio", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className={styles.addBtn} onClick={addTeamMember}>
                  + Add New Team Member
                </button>
              </div>
            )}

            {/* Save Buttons */}
            <div className={styles.actionRow}>
              <button className={styles.saveBtn} onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving changes..." : "Save Changes"}
              </button>
            </div>

            {saveStatus && (
              <div
                className={`${styles.statusMessage} ${
                  saveStatus.success ? styles.statusSuccess : styles.statusError
                }`}
              >
                {saveStatus.success ? "✅" : "❌"} {saveStatus.message}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
