"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import Logo from "../../components/Logo";
import GeometricPattern from "../../components/GeometricPattern";

type Tab = "works" | "clients" | "team" | "services";

export default function AdminDashboard() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  
  const [activeTab, setActiveTab] = useState<Tab>("works");
  const [content, setContent] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Toast notification states
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
          works: data.works || [
            {
              title: "The Echo of Hills",
              category: "Narrative Film",
              image: "/images/echo_of_hills.png"
            },
            {
              title: "Impano Entertainment",
              category: "Studio Showcase",
              image: "/images/grading_console.png"
            },
            {
              title: "Commercials",
              category: "Crafted",
              image: "/images/about_story.png"
            },
            {
              title: "VFX Composites",
              category: "Animation",
              image: "/images/hero_bg.png"
            }
          ],
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
        showToast("Content updated successfully! Changes are live.", "success");
        
        // Sync passcode local state and localStorage if reset
        if (content.passcode && content.passcode !== passcode) {
          setPasscode(content.passcode);
          localStorage.setItem("impano_admin_passcode", content.passcode);
        }
        
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        setSaveStatus({ success: false, message: data.error || "Failed to save content changes." });
        showToast(data.error || "Failed to save content changes.", "error");
      }
    } catch (err) {
      setSaveStatus({ success: false, message: "Network error. Failed to save changes." });
      showToast("Network error. Failed to save changes.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasscodeSubmit = async () => {
    if (!oldPasscode) {
      showToast("Please enter your current passcode.", "error");
      return;
    }
    if (oldPasscode !== passcode) {
      showToast("The current passcode you entered is incorrect.", "error");
      return;
    }
    if (!newPasscode.trim()) {
      showToast("New passcode cannot be empty.", "error");
      return;
    }
    if (newPasscode !== confirmPasscode) {
      showToast("New passcodes do not match.", "error");
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
        showToast("Passcode updated successfully!", "success");
      } else {
        showToast(data.error || "Failed to update passcode.", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to update passcode.", "error");
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

    const inputTarget = e.target;
    setIsLoading(true);
    showToast("Uploading image directly to Cloudinary...", "info");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dztttzycr";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "dztttzycr";

    try {
      // 1. Direct High-Speed CDN Upload to Cloudinary (bypasses Next.js 4MB size limits)
      const directFormData = new FormData();
      directFormData.append("file", file);
      directFormData.append("upload_preset", uploadPreset);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: directFormData,
        }
      );

      if (cloudinaryRes.ok) {
        const data = await cloudinaryRes.json();
        if (data.secure_url) {
          onUploadSuccess(data.secure_url);
          showToast("Image uploaded to Cloudinary successfully!", "success");
          return;
        }
      }

      // 2. Fallback to /api/upload Route Handler if direct upload is blocked by network/CORS
      const fallbackFormData = new FormData();
      fallbackFormData.append("file", file);

      const apiRes = await fetch("/api/upload", {
        method: "POST",
        body: fallbackFormData,
      });

      let apiData: any = {};
      try {
        apiData = await apiRes.json();
      } catch {
        throw new Error(`Server payload limit exceeded (Status ${apiRes.status})`);
      }

      if (apiRes.ok && apiData.url) {
        onUploadSuccess(apiData.url);
        showToast("Image uploaded successfully!", "success");
      } else {
        showToast(apiData.error || `Upload error (Status ${apiRes.status})`, "error");
      }
    } catch (err: any) {
      showToast(err.message || "Upload error. Please select a slightly smaller image file.", "error");
    } finally {
      setIsLoading(false);
      if (inputTarget) inputTarget.value = "";
    }
  };

  // Content state mutators
  const updateWork = (index: number, key: string, value: string) => {
    const updatedWorks = [...content.works];
    updatedWorks[index] = { ...updatedWorks[index], [key]: value };
    setContent({ ...content, works: updatedWorks });
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
              className={`${styles.tabBtn} ${activeTab === "works" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("works")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Selected Works
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "services" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("services")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <line x1="7" y1="2" x2="7" y2="22" />
                <line x1="17" y1="2" x2="17" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="2" y1="7" x2="7" y2="7" />
                <line x1="2" y1="17" x2="7" y2="17" />
                <line x1="17" y1="17" x2="22" y2="17" />
                <line x1="17" y1="7" x2="22" y2="7" />
              </svg>
              Studio Services
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "clients" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("clients")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              Client Showcase
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "team" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("team")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Team Roster
            </button>
          </aside>

          {/* Panel Card */}
          <main className={styles.panelCard}>
            {activeTab === "works" && (
              <div>
                <h3 className={styles.panelTitle}>Manage Selected Works</h3>
                <div className={styles.listGrid}>
                  {content.works.map((work: any, index: number) => (
                    <div key={index} className={styles.itemCard}>
                      <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Project #{index + 1}: {work.title || "Untitled"}</span>
                      </div>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Project Title</label>
                          <input
                            type="text"
                            className={styles.input}
                            value={work.title || ""}
                            onChange={(e) => updateWork(index, "title", e.target.value)}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Category</label>
                          <input
                            type="text"
                            className={styles.input}
                            value={work.category || ""}
                            onChange={(e) => updateWork(index, "category", e.target.value)}
                          />
                        </div>
                        <div className={`${styles.logoUploadGroup} ${styles.formGroupFull}`}>
                          <label className={styles.label}>Project Cover Image</label>
                          <div className={styles.logoUploadContainer}>
                            {work.image ? (
                              <div className={styles.logoPreviewWrapper} style={{ width: "160px", height: "90px" }}>
                                <img
                                  src={work.image}
                                  alt={work.title || "Project Image"}
                                  className={styles.logoPreview}
                                />
                              </div>
                            ) : (
                              <div className={styles.logoPlaceholder} style={{ width: "160px", height: "90px" }}>
                                No Image
                              </div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                              <input
                                type="text"
                                className={styles.input}
                                placeholder="Image URL or upload file..."
                                value={work.image || ""}
                                onChange={(e) => updateWork(index, "image", e.target.value)}
                              />
                              <label className={styles.uploadLabel}>
                                {work.image ? "Change Image File" : "Upload Image File"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: "none" }}
                                  onChange={(e) => handleImageUpload(e, (url) => updateWork(index, "image", url))}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                        <div className={`${styles.logoUploadGroup} ${styles.formGroupFull}`}>
                          <label className={styles.label}>Service Cover Image</label>
                          <div className={styles.logoUploadContainer}>
                            {service.image ? (
                              <div className={styles.logoPreviewWrapper} style={{ width: "160px", height: "90px" }}>
                                <img
                                  src={service.image}
                                  alt={service.name || "Service Image"}
                                  className={styles.logoPreview}
                                />
                              </div>
                            ) : (
                              <div className={styles.logoPlaceholder} style={{ width: "160px", height: "90px" }}>
                                No Image
                              </div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                              <input
                                type="text"
                                className={styles.input}
                                placeholder="Image URL or upload file..."
                                value={service.image || ""}
                                onChange={(e) => updateService(index, "image", e.target.value)}
                              />
                              <label className={styles.uploadLabel}>
                                {service.image ? "Change Image File" : "Upload Image File"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: "none" }}
                                  onChange={(e) => handleImageUpload(e, (url) => updateService(index, "image", url))}
                                />
                              </label>
                            </div>
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
                        <div className={styles.logoUploadGroup}>
                          <label className={styles.label}>Client Logo Image</label>
                          <div className={styles.logoUploadContainer}>
                            {client.logo ? (
                              <div className={styles.logoPreviewWrapper}>
                                <img
                                  src={client.logo}
                                  alt={client.name || "Client Logo"}
                                  className={styles.logoPreview}
                                />
                              </div>
                            ) : (
                              <div className={styles.logoPlaceholder}>
                                No Logo
                              </div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                              <input
                                type="text"
                                className={styles.input}
                                placeholder="Logo URL or upload file..."
                                value={client.logo || ""}
                                onChange={(e) => updateClient(index, "logo", e.target.value)}
                              />
                              <label className={styles.uploadLabel}>
                                {client.logo ? "Change Logo File" : "Upload Logo File"}
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
                        <div className={`${styles.logoUploadGroup} ${styles.formGroupFull}`}>
                          <label className={styles.label}>Team Member Portrait</label>
                          <div className={styles.logoUploadContainer}>
                            {member.image ? (
                              <div className={styles.logoPreviewWrapper} style={{ width: "90px", height: "110px" }}>
                                <img
                                  src={member.image}
                                  alt={member.name || "Team Portrait"}
                                  className={styles.logoPreview}
                                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                                />
                              </div>
                            ) : (
                              <div className={styles.logoPlaceholder} style={{ width: "90px", height: "110px" }}>
                                No Portrait
                              </div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                              <input
                                type="text"
                                className={styles.input}
                                placeholder="Portrait URL or upload file..."
                                value={member.image || ""}
                                onChange={(e) => updateTeam(index, "image", e.target.value)}
                              />
                              <label className={styles.uploadLabel}>
                                {member.image ? "Change Portrait File" : "Upload Portrait File"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: "none" }}
                                  onChange={(e) => handleImageUpload(e, (url) => updateTeam(index, "image", url))}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
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

      {/* Dynamic Custom Toast Notification System */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.type === "success" && (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {toast.type === "error" && (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {toast.type === "info" && (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          )}
          <span>{toast.message}</span>
          <button className={styles.toastCloseBtn} onClick={() => setToast(null)} aria-label="Dismiss notification">
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
