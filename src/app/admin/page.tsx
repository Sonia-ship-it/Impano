"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import Logo from "../../components/Logo";
import GeometricPattern from "../../components/GeometricPattern";

type Tab = "hero" | "works" | "services" | "clients" | "team";

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

  // 2FA Authentication States
  const [authStep, setAuthStep] = useState<"passcode" | "otp">("passcode");
  const [otpCode, setOtpCode] = useState("");
  const [otpEmailHint, setOtpEmailHint] = useState("uwasesonia43@gmail.com");
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for 2FA Resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

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
        localStorage.removeItem("impano_admin_passcode");
      }
    } catch {
      localStorage.removeItem("impano_admin_passcode");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", passcode: passcode.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAuthStep("otp");
        setOtpEmailHint(data.emailHint || "uwasesonia43@gmail.com");
        setResendTimer(30);
        showToast(`2FA security code sent to ${data.emailHint || "uwasesonia43@gmail.com"}`, "success");
      } else {
        setAuthError(data.error || "Incorrect admin passcode.");
      }
    } catch {
      setAuthError("Failed to connect to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setAuthError("Please enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", passcode: passcode.trim(), otp: otpCode.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.verified) {
        setIsAuthenticated(true);
        localStorage.setItem("impano_admin_passcode", passcode.trim());
        showToast("Identity verified! Welcome to Impano CMS.", "success");
        fetchContent();
      } else {
        setAuthError(data.error || "Invalid or expired 2FA code.");
      }
    } catch {
      setAuthError("Failed to verify security code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    setIsLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend", passcode: passcode.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResendTimer(30);
        showToast("New verification code dispatched to your email.", "info");
      } else {
        setAuthError(data.error || "Failed to resend verification code.");
      }
    } catch {
      setAuthError("Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const [metaInfo, setMetaInfo] = useState<{ kvConnected: boolean; storageType: string; warning?: string }>({
    kvConnected: false,
    storageType: "checking...",
  });

  const defaultHeroImages = [
    "/images/hero_bg.png",
    "/images/echo_of_hills.png",
    "/images/grading_console.png",
    "/images/lens_close_up.png"
  ];

  const fetchContent = async (showNotification = false) => {
    let localCache: any = null;
    try {
      const cachedStr = localStorage.getItem("impano_cms_content_cache");
      if (cachedStr) {
        localCache = JSON.parse(cachedStr);
      }
    } catch {}

    try {
      const res = await fetch(`/api/content?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
      });
      let data: any = {};
      if (res.ok) {
        data = await res.json();
      }

      if (data && data._meta) {
        setMetaInfo(data._meta);
        if (data._meta.kvConnected) {
          console.log("%c[Impano CMS Admin] Upstash KV Cloud Database Connected! Content is permanently synced.", "color: #10b981; font-weight: bold;");
        } else {
          console.warn("%c[Impano CMS Admin] Warning: Upstash KV unconfigured on Vercel. Saved in temporary server cache.", "color: #f59e0b; font-weight: bold;");
        }
      }

      const hasValidServerData = data && (data.works || data.services || data.clients || data.team || data.hero);
      const source = hasValidServerData ? data : (localCache || {});

      const defaultWorkImages = [
        "/images/echo_of_hills.png",
        "/images/grading_console.png",
        "/images/about_story.png",
        "/images/hero_bg.png"
      ];

      const defaultServiceImages = [
        "/images/lens_close_up.png",
        "/images/grading_console.png",
        "/images/about_story.png"
      ];

      const defaultClientLogos = [
        "/images/logo_kfc.png",
        "/images/logo_rba.png",
        "/images/logo_asw.png",
        "/images/logo_lmg.png",
        "/images/logo_vv.png",
        "/images/logo_vch.png"
      ];

      const defaultTeamImages = [
        "/images/chrispin.jpeg",
        "/images/sonia.png",
        "/images/Fiston.jpeg",
        "/images/Ally.png"
      ];

      const defaultClients = [
        { name: "Kigali Film Commission", logo: defaultClientLogos[0] },
        { name: "Rwanda Broadcasting Agency", logo: defaultClientLogos[1] },
        { name: "Africa Screen Works", logo: defaultClientLogos[2] },
        { name: "Legacy Media Group", logo: defaultClientLogos[3] },
        { name: "Vivid Ventures", logo: defaultClientLogos[4] },
        { name: "Volcano Creative Hub", logo: defaultClientLogos[5] }
      ];

      const defaultServices = [
        {
          num: "01",
          name: "Production Services",
          desc: "Producing and Directing, Camera Crews, Drone Visuals, Multi Cameras, Live Stream, Professional Interviews, Motion Graphics, 3D animation, Script Writing, StoryBoard.",
          image: defaultServiceImages[0],
        },
        {
          num: "02",
          name: "Post-Production Services",
          desc: "Offline / Online Edit, Color Correction, and Sound Design services optimizing raw captures into visual legacies.",
          image: defaultServiceImages[1],
        },
        {
          num: "03",
          name: "Creative Development & Strategy",
          desc: "Our reputable approach to design thinking combines creative, critical thinking, and experience to transform information and ideas into authentic work.",
          image: defaultServiceImages[2],
        }
      ];

      const defaultTeam = [
        {
          name: "ISHIMWE CHRISPIN",
          role: "Founder & Drone Pilot",
          bio: "Visionary leader and executive producer managing Impano's strategic growth, pioneering international partnerships, and scaling Rwanda's cinematic footprint globally.",
          image: defaultTeamImages[0],
        },
        {
          name: "UWASE SONIA",
          role: "Co-Founder, Project Manager",
          bio: "Technical anchor managing studio systems, high-speed storage pipelines, render farms, and secure media servers to ensure seamless production workflow.",
          image: defaultTeamImages[1],
        },
        {
          name: "ISHIMWE FISTON",
          role: "Editor",
          bio: "Master of rhythm and pacing, weaving raw cinematic footage into cohesive, powerful stories with precision editing and dynamic audio integration.",
          image: defaultTeamImages[2],
        },
        {
          name: "MUGISHA ALLY",
          role: "Assistant Production",
          bio: "Key coordinator handling logistics, scheduling, and on-set operations, ensuring our complex film productions run smoothly and on schedule.",
          image: defaultTeamImages[3],
        }
      ];

      const resolveImage = (url: string, fallback: string) => (url && url.trim() ? url : fallback);

      const rawWorks = (source.works && source.works.length > 0) ? source.works : [
        { title: "The Echo of Hills", category: "Narrative Film", image: defaultWorkImages[0] },
        { title: "Impano Entertainment", category: "Studio Showcase", image: defaultWorkImages[1] },
        { title: "Commercials", category: "Crafted", image: defaultWorkImages[2] },
        { title: "VFX Composites", category: "Animation", image: defaultWorkImages[3] }
      ];
      const rawServices = (source.services && source.services.length > 0) ? source.services : defaultServices;
      const rawClients = (source.clients && source.clients.length > 0) ? source.clients : defaultClients;
      const rawTeam = (source.team && source.team.length > 0) ? source.team : defaultTeam;

      const heroImages = (source.hero?.images && Array.isArray(source.hero.images) && source.hero.images.length > 0)
        ? source.hero.images
        : defaultHeroImages;

      const safeData = {
        passcode: source.passcode || passcode,
        hero: {
          tagline: "Connect with us",
          titlePart1: "Crafting",
          titleOutline: "Visual",
          titleGold: "Legacies.",
          description: "From the heart of Kigali, we craft premium commercial films, documentaries, and post-production experiences. We translate bold concepts into memorable cinematic assets.",
          playText: "WATCH SHOWREEL",
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-cinematic-shot-of-a-misty-forest-42475-large.mp4",
          images: heroImages,
          ...(source.hero || {})
        },
        works: rawWorks.map((item: any, i: number) => ({
          title: item.title || `Project ${i + 1}`,
          category: item.category || "Film",
          image: resolveImage(item.image, defaultWorkImages[i % defaultWorkImages.length] || "")
        })),
        services: rawServices.map((item: any, i: number) => ({
          ...item,
          image: resolveImage(item.image, defaultServiceImages[i] || "")
        })),
        clients: rawClients.map((item: any, i: number) => ({
          ...item,
          logo: resolveImage(item.logo, defaultClientLogos[i] || "")
        })),
        team: rawTeam.map((item: any, i: number) => ({
          ...item,
          image: resolveImage(item.image, defaultTeamImages[i] || "")
        }))
      };
      
      setContent(safeData);
      try {
        localStorage.setItem("impano_cms_content_cache", JSON.stringify(safeData));
      } catch {}
      if (showNotification) {
        showToast("Synchronized with latest cloud database!", "success");
      }
    } catch (err) {
      if (localCache) {
        setContent(localCache);
      } else {
        console.error("Failed to load content database.");
      }
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

  const handleSave = async (contentToSave?: any) => {
    const isEvent = contentToSave && typeof contentToSave === "object" && ("nativeEvent" in contentToSave || "preventDefault" in contentToSave || "target" in contentToSave);
    const targetContent = (!isEvent && contentToSave && typeof contentToSave === "object") ? contentToSave : content;
    if (!targetContent) return;

    setIsLoading(true);
    setSaveStatus(null);
    
    try {
      localStorage.setItem("impano_cms_content_cache", JSON.stringify(targetContent));
    } catch {}

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": passcode,
        },
        body: JSON.stringify(targetContent),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setContent(targetContent);
        setSaveStatus({ success: true, message: "Content updated successfully! Changes are live." });
        
        if (data.kvSaved) {
          setMetaInfo({ storageType: "kv", kvConnected: true });
          showToast("Changes PERMANENTLY saved to Upstash Cloud Database!", "success");
        } else {
          setMetaInfo({ storageType: "tmp", kvConnected: false, warning: data.warning });
          showToast("Saved to server cache. Changes are active!", "info");
        }

        if (targetContent.passcode && targetContent.passcode !== passcode) {
          setPasscode(targetContent.passcode);
          localStorage.setItem("impano_admin_passcode", targetContent.passcode);
        }
        
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        setContent(targetContent);
        setSaveStatus({ success: false, message: data.error || "Failed to save content changes to server." });
        showToast("Saved locally, but server output: " + (data.error || "Failed server save"), "info");
      }
    } catch (err) {
      setContent(targetContent);
      setSaveStatus({ success: true, message: "Changes saved to local browser cache." });
      showToast("Network error. Changes saved to local browser storage.", "info");
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
    getUpdatedContent: (url: string) => any
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const inputTarget = e.target;
    setIsLoading(true);
    showToast("Uploading image directly to Cloudinary...", "info");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dztttzycr";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "dztttzycr";

    let uploadedUrl = "";

    try {
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
          uploadedUrl = data.secure_url;
        }
      }

      if (!uploadedUrl) {
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
          uploadedUrl = apiData.url;
        } else {
          showToast(apiData.error || `Upload error (Status ${apiRes.status})`, "error");
          return;
        }
      }

      if (uploadedUrl) {
        const updatedContent = getUpdatedContent(uploadedUrl);
        await handleSave(updatedContent);
        showToast("Image uploaded and permanently saved!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Upload error. Please select a slightly smaller image file.", "error");
    } finally {
      setIsLoading(false);
      if (inputTarget) inputTarget.value = "";
    }
  };

  // Hero section mutators
  const updateHero = (key: string, value: any) => {
    const updatedHero = { ...content.hero, [key]: value };
    const newContent = { ...content, hero: updatedHero };
    setContent(newContent);
    return newContent;
  };

  const updateHeroImage = (index: number, url: string) => {
    const currentImages = Array.isArray(content.hero?.images) ? [...content.hero.images] : [...defaultHeroImages];
    currentImages[index] = url;
    return updateHero("images", currentImages);
  };

  const addHeroImage = () => {
    const currentImages = Array.isArray(content.hero?.images) ? [...content.hero.images] : [...defaultHeroImages];
    const newImages = [...currentImages, ""];
    updateHero("images", newImages);
    showToast("Added new hero background image slot!", "info");
  };

  const removeHeroImage = (index: number) => {
    const currentImages = Array.isArray(content.hero?.images) ? [...content.hero.images] : [...defaultHeroImages];
    if (currentImages.length <= 1) {
      showToast("Hero slideshow must have at least 1 image.", "error");
      return;
    }
    const newImages = currentImages.filter((_: any, i: number) => i !== index);
    updateHero("images", newImages);
    showToast("Hero image removed.", "info");
  };

  const moveHeroImage = (index: number, direction: "up" | "down") => {
    const currentImages = Array.isArray(content.hero?.images) ? [...content.hero.images] : [...defaultHeroImages];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentImages.length) return;
    const temp = currentImages[index];
    currentImages[index] = currentImages[targetIndex];
    currentImages[targetIndex] = temp;
    updateHero("images", currentImages);
  };

  // Content state mutators for Works (NO DESCRIPTION)
  const updateWork = (index: number, key: string, value: any) => {
    const updatedWorks = [...content.works];
    updatedWorks[index] = { ...updatedWorks[index], [key]: value };
    const newContent = { ...content, works: updatedWorks };
    setContent(newContent);
    return newContent;
  };

  const addWork = () => {
    const newProject = {
      title: `Project ${content.works.length + 1}`,
      category: "Cinematic Film",
      image: "",
    };
    const updatedWorks = [...content.works, newProject];
    const newContent = { ...content, works: updatedWorks };
    setContent(newContent);
    showToast("New project added! Click Save Changes when ready.", "info");
    return newContent;
  };

  const removeWork = (index: number) => {
    if (content.works.length <= 1) {
      showToast("Portfolio must have at least 1 project.", "error");
      return;
    }
    const updatedWorks = content.works.filter((_: any, i: number) => i !== index);
    const newContent = { ...content, works: updatedWorks };
    setContent(newContent);
    showToast("Project removed. Click Save Changes to apply.", "info");
    return newContent;
  };

  const moveWork = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= content.works.length) return;
    const updatedWorks = [...content.works];
    const temp = updatedWorks[index];
    updatedWorks[index] = updatedWorks[targetIndex];
    updatedWorks[targetIndex] = temp;
    const newContent = { ...content, works: updatedWorks };
    setContent(newContent);
    return newContent;
  };

  const updateClient = (index: number, key: string, value: string) => {
    const updatedClients = [...content.clients];
    updatedClients[index] = { ...updatedClients[index], [key]: value };
    const newContent = { ...content, clients: updatedClients };
    setContent(newContent);
    return newContent;
  };

  const addClient = () => {
    setContent({
      ...content,
      clients: [...content.clients, { name: "New Client", logo: "" }],
    });
  };

  const removeClient = (index: number) => {
    const updatedClients = content.clients.filter((_: any, i: number) => i !== index);
    setContent({ ...content, clients: updatedClients });
  };

  const updateTeam = (index: number, key: string, value: string) => {
    const updatedTeam = [...content.team];
    updatedTeam[index] = { ...updatedTeam[index], [key]: value };
    const newContent = { ...content, team: updatedTeam };
    setContent(newContent);
    return newContent;
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
          image: "",
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
    const newContent = { ...content, services: updatedServices };
    setContent(newContent);
    return newContent;
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.adminWrapper} style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
        <GeometricPattern />
        <div className={styles.lockScreen} style={{ position: "relative", zIndex: 10 }}>
          {authStep === "passcode" ? (
            <form className={styles.lockCard} onSubmit={handlePasscodeSubmit}>
              <div className={styles.lockLogoWrapper}>
                <Logo size={64} />
              </div>
              <h2 className={styles.lockTitle}>IMPANO CMS</h2>
              <p className={styles.lockDesc}>Enter administrative passcode to initiate 2FA authentication.</p>
              
              <div className={styles.passcodeFieldWrapper}>
                <input
                  type={showPasscode ? "text" : "password"}
                  placeholder="Enter Passcode"
                  className={styles.lockInput}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  required
                  disabled={isLoading}
                  autoFocus
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

              <button type="submit" className={styles.lockSubmitBtn} disabled={isLoading || !passcode.trim()}>
                {isLoading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  "Continue to 2FA ➔"
                )}
              </button>
              
              {authError && (
                <div className={`${styles.statusMessage} ${styles.statusError}`} style={{ justifyContent: "center" }}>
                  ⚠️ {authError}
                </div>
              )}
            </form>
          ) : (
            <form className={styles.lockCard} onSubmit={handleOtpSubmit}>
              <div className={styles.twoFaBadge}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Two-Factor Authentication
              </div>

              <h2 className={styles.lockTitle}>Verify Code</h2>
              <p className={styles.lockDesc} style={{ marginBottom: "1.5rem" }}>
                A 6-digit security verification code has been dispatched to:
                <br />
                <span className={styles.twoFaEmailText}>{otpEmailHint}</span>
              </p>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                className={styles.otpInput}
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setOtpCode(val);
                }}
                required
                autoFocus
                disabled={isLoading}
              />

              <button type="submit" className={styles.lockSubmitBtn} disabled={isLoading || otpCode.length !== 6}>
                {isLoading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  "Verify & Unlock Dashboard"
                )}
              </button>

              <div className={styles.resendRow}>
                <button
                  type="button"
                  className={styles.backToPasscodeBtn}
                  onClick={() => {
                    setAuthStep("passcode");
                    setAuthError("");
                    setOtpCode("");
                  }}
                >
                  ← Back to Passcode
                </button>

                <button
                  type="button"
                  className={styles.resendBtn}
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isLoading}
                >
                  {resendTimer > 0 ? `Resend code (${resendTimer}s)` : "Resend Code"}
                </button>
              </div>

              {authError && (
                <div className={`${styles.statusMessage} ${styles.statusError}`} style={{ justifyContent: "center", marginTop: "1.2rem" }}>
                  ⚠️ {authError}
                </div>
              )}
            </form>
          )}
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
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <h1>Impano CMS</h1>
              {metaInfo.kvConnected ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "4px 12px", borderRadius: "20px", border: "1px solid rgba(16, 185, 129, 0.3)", fontWeight: 600 }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                  Cloud Database Connected (Upstash KV)
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", padding: "4px 12px", borderRadius: "20px", border: "1px solid rgba(245, 158, 11, 0.3)", fontWeight: 600 }} title="To persist changes permanently across Vercel deployments, add KV_REST_API_URL and KV_REST_API_TOKEN in Vercel Project Settings -> Environment Variables.">
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }}></span>
                  Temporary Server Cache (Set Vercel Env Vars)
                </span>
              )}
            </div>
            <p className={styles.subtitle}>Manage homepage sections, clients, and team profiles dynamically.</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button 
              type="button" 
              className={styles.logoutBtn} 
              style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", gap: "6px" }}
              onClick={() => fetchContent(true)}
              title="Pull latest live data from cloud database"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              Sync Database
            </button>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Workspace Layout */}
        <div className={styles.dashboardLayout}>
          {/* Sidebar */}
          <aside className={styles.tabList}>
            <button
              className={`${styles.tabBtn} ${activeTab === "hero" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("hero")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              Hero Slides
            </button>
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
            {activeTab === "hero" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h3 className={styles.panelTitle} style={{ marginBottom: "0.25rem", borderBottom: "none", paddingBottom: 0 }}>Hero Slideshow Pictures</h3>
                    <p style={{ color: "var(--text-grey)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                      Upload and manage the background images that switch with animation effects on the homepage Hero section.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    className={styles.addBtn} 
                    style={{ width: "auto", margin: 0, padding: "0.6rem 1.4rem", display: "inline-flex", alignItems: "center", gap: "6px" }} 
                    onClick={addHeroImage}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    + Add Hero Picture
                  </button>
                </div>

                <div className={styles.listGrid}>
                  {(content.hero?.images || defaultHeroImages).map((imgUrl: string, index: number) => (
                    <div key={index} className={styles.itemCard}>
                      <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Hero Picture #{index + 1}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <button
                            type="button"
                            title="Move Up"
                            disabled={index === 0}
                            onClick={() => moveHeroImage(index, "up")}
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: index === 0 ? "var(--text-muted)" : "var(--text-white)",
                              cursor: index === 0 ? "not-allowed" : "pointer",
                              padding: "0.35rem 0.6rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            title="Move Down"
                            disabled={index === (content.hero?.images || defaultHeroImages).length - 1}
                            onClick={() => moveHeroImage(index, "down")}
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: index === (content.hero?.images || defaultHeroImages).length - 1 ? "var(--text-muted)" : "var(--text-white)",
                              cursor: index === (content.hero?.images || defaultHeroImages).length - 1 ? "not-allowed" : "pointer",
                              padding: "0.35rem 0.6rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            ▼
                          </button>
                          <button 
                            type="button" 
                            className={styles.removeBtn} 
                            onClick={() => removeHeroImage(index)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className={styles.formGrid}>
                        <div className={`${styles.logoUploadGroup} ${styles.formGroupFull}`}>
                          <label className={styles.label}>Hero Background Picture</label>
                          <div className={styles.logoUploadContainer}>
                            {imgUrl ? (
                              <div className={styles.logoPreviewWrapper} style={{ width: "200px", height: "110px" }}>
                                <img
                                  src={imgUrl}
                                  alt={`Hero Slide ${index + 1}`}
                                  className={styles.logoPreview}
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                            ) : (
                              <div className={styles.logoPlaceholder} style={{ width: "200px", height: "110px" }}>
                                No Picture
                              </div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                              <input
                                type="text"
                                className={styles.input}
                                placeholder="Image URL or upload file..."
                                value={imgUrl || ""}
                                onChange={(e) => updateHeroImage(index, e.target.value)}
                              />
                              <label className={styles.uploadLabel}>
                                {imgUrl ? "Change Picture File" : "Upload Picture File"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: "none" }}
                                  onChange={(e) => handleImageUpload(e, (url) => {
                                    const updated = Array.isArray(content.hero?.images) ? [...content.hero.images] : [...defaultHeroImages];
                                    updated[index] = url;
                                    return { ...content, hero: { ...content.hero, images: updated } };
                                  })}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  type="button" 
                  className={styles.addBtn} 
                  onClick={addHeroImage}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "1.5rem" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  + Add Another Hero Picture
                </button>

                {/* Hero Headlines Settings */}
                <div style={{ borderTop: "1px solid var(--border-color-light)", paddingTop: "2.5rem", marginTop: "3rem" }}>
                  <h4 className={styles.panelTitle} style={{ fontSize: "1.1rem", borderBottom: "none", marginBottom: "0.25rem", paddingBottom: 0 }}>Hero Text & Showreel</h4>
                  <p style={{ color: "var(--text-grey)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                    Edit the main headline, tagline, and showreel video modal.
                  </p>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Tagline</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={content.hero?.tagline || ""}
                        onChange={(e) => updateHero("tagline", e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Title Part 1 (e.g. Crafting)</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={content.hero?.titlePart1 || ""}
                        onChange={(e) => updateHero("titlePart1", e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Title Outline Text (e.g. Visual)</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={content.hero?.titleOutline || ""}
                        onChange={(e) => updateHero("titleOutline", e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Title Gold Accent (e.g. Legacies.)</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={content.hero?.titleGold || ""}
                        onChange={(e) => updateHero("titleGold", e.target.value)}
                      />
                    </div>
                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                      <label className={styles.label}>Hero Description</label>
                      <textarea
                        className={styles.textarea}
                        value={content.hero?.description || ""}
                        onChange={(e) => updateHero("description", e.target.value)}
                      />
                    </div>
                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                      <label className={styles.label}>Showreel Video URL (MP4 / Stream)</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="https://...video.mp4"
                        value={content.hero?.videoUrl || ""}
                        onChange={(e) => updateHero("videoUrl", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "works" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h3 className={styles.panelTitle} style={{ marginBottom: "0.25rem", borderBottom: "none", paddingBottom: 0 }}>Manage Portfolio Works</h3>
                    <p style={{ color: "var(--text-grey)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                      Total Projects: <strong style={{ color: "var(--accent-gold)" }}>{content.works.length}</strong> (First 4 featured on Home in 3D rotation & all on Portfolio page).
                    </p>
                  </div>
                  <button 
                    type="button" 
                    className={styles.addBtn} 
                    style={{ width: "auto", margin: 0, padding: "0.6rem 1.4rem", display: "inline-flex", alignItems: "center", gap: "6px" }} 
                    onClick={addWork}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    + Add New Project
                  </button>
                </div>

                <div className={styles.listGrid}>
                  {content.works.map((work: any, index: number) => (
                    <div key={index} className={styles.itemCard}>
                      <div className={styles.cardHeader}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span className={styles.cardTitle}>Project #{index + 1}: {work.title || "Untitled"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <button
                            type="button"
                            title="Move Up"
                            disabled={index === 0}
                            onClick={() => moveWork(index, "up")}
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: index === 0 ? "var(--text-muted)" : "var(--text-white)",
                              cursor: index === 0 ? "not-allowed" : "pointer",
                              padding: "0.35rem 0.6rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            title="Move Down"
                            disabled={index === content.works.length - 1}
                            onClick={() => moveWork(index, "down")}
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: index === content.works.length - 1 ? "var(--text-muted)" : "var(--text-white)",
                              cursor: index === content.works.length - 1 ? "not-allowed" : "pointer",
                              padding: "0.35rem 0.6rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            ▼
                          </button>
                          <button 
                            type="button" 
                            className={styles.removeBtn} 
                            onClick={() => removeWork(index)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Project Title</label>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g. The Echo of Hills"
                            value={work.title || ""}
                            onChange={(e) => updateWork(index, "title", e.target.value)}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Category</label>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g. Narrative Film, Commercial, VFX, Documentary"
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

                <button 
                  type="button" 
                  className={styles.addBtn} 
                  onClick={addWork}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "1.5rem" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  + Add Another Project to Portfolio
                </button>

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
              <button type="button" className={styles.saveBtn} onClick={() => handleSave()} disabled={isLoading}>
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
