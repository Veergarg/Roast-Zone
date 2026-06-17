"use client";

import { useState, useEffect } from "react";
import LZString from "lz-string";
import ModeSelector, { RoastMode } from "@/component/ModeSelector";
import GitHubRoaster from "@/component/GitHubRoaster";
import PersonalRoaster from "@/component/PersonalRoaster";
import ResumeRoaster from "@/component/ResumeRoaster";
import RoastResult from "@/component/RoastResult";
import WallOfShame from "@/component/WallOfShame";
import { playClickSound, setMuteState, getMuteState } from "@/lib/sounds";

export default function Home() {
  const [mode, setMode] = useState<RoastMode>("github");
  const [theme, setTheme] = useState<"cyberpunk" | "inferno" | "toxic">("cyberpunk");
  const [isMuted, setIsMuted] = useState(false);
  const [historyTrigger, setHistoryTrigger] = useState(0);

  // Sharing layout states
  const [sharedRoast, setSharedRoast] = useState<string | null>(null);
  const [sharedTheme, setSharedTheme] = useState<"cyberpunk" | "inferno" | "toxic">("cyberpunk");
  const [sharedName, setSharedName] = useState<string>("");
  const [sharedMode, setSharedMode] = useState<string>("");
  const [isSharedViewActive, setIsSharedViewActive] = useState(false);

  useEffect(() => {
    const muted = getMuteState();
    setIsMuted(muted);
    
    const storedTheme = localStorage.getItem("roast_theme");
    if (storedTheme === "inferno" || storedTheme === "toxic" || storedTheme === "cyberpunk") {
      setTheme(storedTheme);
    }

    // Dynamic sharing scanning
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const shareData = params.get("share");
      if (shareData) {
        if (shareData.length <= 10) {
          // Short sharing ID: fetch from server
          fetch(`/api/share?id=${shareData}`)
            .then((res) => {
              if (!res.ok) throw new Error("Failed to load short share payload");
              return res.json();
            })
            .then((payload) => {
              if (payload && payload.roast) {
                setSharedRoast(payload.roast);
                if (payload.theme) {
                  setSharedTheme(payload.theme);
                  setTheme(payload.theme);
                }
                setSharedName(payload.name || "Someone");
                setSharedMode(payload.mode || "everyone");
                setIsSharedViewActive(true);
              }
            })
            .catch((err) => {
              console.error("Error loading shared roast", err);
            });
        } else {
          // Compressed payload: parse client-side
          try {
            let decompressed = LZString.decompressFromEncodedURIComponent(shareData);
            if (!decompressed) {
              try {
                decompressed = decodeURIComponent(escape(atob(shareData)));
              } catch (fallbackErr) {
                console.warn("Base64 fallback decoding failed", fallbackErr);
              }
            }

            if (decompressed) {
              const payload = JSON.parse(decompressed);
              if (payload.roast) {
                setSharedRoast(payload.roast);
                if (payload.theme) {
                  setSharedTheme(payload.theme);
                  setTheme(payload.theme);
                }
                setSharedName(payload.name || "Someone");
                setSharedMode(payload.mode || "everyone");
                setIsSharedViewActive(true);
              }
            }
          } catch (e) {
            console.error("Failed to parse shared query payload", e);
          }
        }
      }
    }
  }, []);

  const handleThemeChange = (newTheme: "cyberpunk" | "inferno" | "toxic") => {
    setTheme(newTheme);
    localStorage.setItem("roast_theme", newTheme);
    playClickSound();
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setMuteState(nextMuted);
    if (!nextMuted) {
      setTimeout(() => playClickSound(), 50);
    }
  };

  const handleSuccess = () => {
    setHistoryTrigger((prev) => prev + 1);
  };

  const handleResetShareView = () => {
    setIsSharedViewActive(false);
    setSharedRoast(null);
    if (typeof window !== "undefined") {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const themeConfig = {
    cyberpunk: {
      orbs: ["bg-violet-600/10", "bg-violet-800/10"],
      textAccent: "text-violet-500",
      badge: "bg-violet-600/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20",
      footerLink: "text-violet-500 hover:text-violet-400"
    },
    inferno: {
      orbs: ["bg-orange-600/10", "bg-red-800/10"],
      textAccent: "text-orange-500",
      badge: "bg-orange-600/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20",
      footerLink: "text-orange-500 hover:text-orange-400"
    },
    toxic: {
      orbs: ["bg-lime-600/10", "bg-green-800/10"],
      textAccent: "text-lime-500",
      badge: "bg-lime-600/10 border-lime-500/20 text-lime-400 hover:bg-lime-500/20",
      footerLink: "text-lime-500 hover:text-lime-400"
    }
  };

  const currentTheme = themeConfig[theme] || themeConfig.cyberpunk;

  return (
    <main className="bg-black min-h-screen relative overflow-hidden font-sans antialiased text-white">
      {/* Grid background overlay with radial mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Background orbs */}
      <div className={`fixed top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${currentTheme.orbs[0]}`} />
      <div className={`fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${currentTheme.orbs[1]}`} />

      {/* Floating Control Hub */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3 bg-zinc-900/60 backdrop-blur-md border border-zinc-800 px-4 py-2.5 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        {/* Sound toggle */}
        <button
          onClick={handleMuteToggle}
          className="text-lg hover:scale-110 active:scale-95 transition-transform"
          title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>

        <div className="w-[1px] h-4 bg-zinc-800" />

        {/* Theme select buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleThemeChange("cyberpunk")}
            className={`w-5 h-5 rounded-full bg-violet-600 border ${theme === "cyberpunk" ? "border-white scale-110 shadow-[0_0_8px_#8b5cf6]" : "border-transparent opacity-60 hover:opacity-100"}`}
            title="Cyberpunk Theme"
          />
          <button
            onClick={() => handleThemeChange("inferno")}
            className={`w-5 h-5 rounded-full bg-orange-600 border ${theme === "inferno" ? "border-white scale-110 shadow-[0_0_8px_#ea580c]" : "border-transparent opacity-60 hover:opacity-100"}`}
            title="Inferno Theme"
          />
          <button
            onClick={() => handleThemeChange("toxic")}
            className={`w-5 h-5 rounded-full bg-lime-500 border ${theme === "toxic" ? "border-white scale-110 shadow-[0_0_8px_#84cc16]" : "border-transparent opacity-60 hover:opacity-100"}`}
            title="Toxic Theme"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 border text-sm font-medium px-4 py-2 rounded-full mb-6 cursor-default transition-all duration-500 ${currentTheme.badge}`}>
            <span>🔥</span>
            {isSharedViewActive ? "Roast Shared With You" : "AI Powered Roasting"}
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-4 tracking-tight">
            Roast<span className={`transition-all duration-500 ${currentTheme.textAccent}`}>Zone</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
            {isSharedViewActive
              ? `Check out this custom roast created for ${sharedName || "you"} inside the app!`
              : "Get brutally roasted by AI. Choose Developer Mode for GitHub, Everyone Mode for a personal roast, or Resume Mode for a career reality check."}
          </p>
        </div>

        {/* Active Mode / Shared Viewer */}
        {isSharedViewActive && sharedRoast ? (
          <RoastResult
            roast={sharedRoast}
            onReset={handleResetShareView}
            theme={sharedTheme}
            name={sharedName}
            mode={sharedMode}
            isSharedView={true}
          />
        ) : (
          <>
            {/* Mode Selector */}
            <ModeSelector mode={mode} setMode={(m) => { playClickSound(); setMode(m); }} theme={theme} />

            {/* Active Mode */}
            {mode === "github" && <GitHubRoaster theme={theme} onSuccess={handleSuccess} />}
            {mode === "personal" && <PersonalRoaster theme={theme} onSuccess={handleSuccess} />}
            {mode === "resume" && <ResumeRoaster theme={theme} onSuccess={handleSuccess} />}
          </>
        )}

        {/* History Logger */}
        <WallOfShame theme={theme} refreshTrigger={historyTrigger} />

        {/* Footer */}
        <p className="text-center text-zinc-700 text-sm mt-20 font-medium">
          Built by{" "}
          <a
            href="https://veer-portfolio-six.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className={`font-semibold transition-colors duration-500 ${currentTheme.footerLink}`}
          >
            Veer
          </a>{" "}
          · No humans were permanently damaged in the making of this app 🔥
        </p>
      </div>
    </main>
  );
}