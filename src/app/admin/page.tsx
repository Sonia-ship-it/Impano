"use client";

import React, { useState, useEffect } from "react";
import styles from "./admin.module.css";
import Logo from "../../components/Logo";
import GeometricPattern from "../../components/GeometricPattern";

type Tab = "hero" | "clients" | "team" | "services";

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [content, setContent] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);

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
        setContent(data);
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
                {showPasscode ? "👁️" : "👁️‍🗨️"}
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
                          <input
                            type="text"
                            className={styles.input}
                            value={service.image}
                            onChange={(e) => updateService(index, "image", e.target.value)}
                          />
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
                          <input
                            type="text"
                            className={styles.input}
                            value={client.logo}
                            onChange={(e) => updateClient(index, "logo", e.target.value)}
                          />
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
                          <input
                            type="text"
                            className={styles.input}
                            value={member.image}
                            onChange={(e) => updateTeam(index, "image", e.target.value)}
                          />
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
