"use client";

import { useState, useEffect } from "react";
import Toast from "./Toast";
import { speakText, stopSpeaking } from "@/lib/speech";
import { playClickSound } from "@/lib/sounds";
import LZString from "lz-string";

interface RoastResultProps {
  roast: string;
  onReset: () => void;
  theme: "cyberpunk" | "inferno" | "toxic";
  name?: string;
  mode?: string;
  isSharedView?: boolean;
}

export default function RoastResult({
  roast,
  onReset,
  theme,
  name,
  mode,
  isSharedView = false,
}: RoastResultProps) {
  const [toastMessage, setToastMessage] = useState("");
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator.share === "function") {
      setShareSupported(true);
    }
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleCopy = () => {
    playClickSound();
    navigator.clipboard.writeText(roast);
    setToastMessage("Roast text copied! 🔥");
  };

  const getShareUrl = async (payload: any): Promise<string> => {
    const jsonString = JSON.stringify(payload);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    const fallbackUrl = `${window.location.origin}/?share=${compressed}`;

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonString,
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          return `${window.location.origin}/?share=${data.id}`;
        }
      }
    } catch (e) {
      console.warn("Server share link generation failed, falling back to compressed URL", e);
    }
    return fallbackUrl;
  };

  const handleCopyShareLink = async () => {
    playClickSound();
    try {
      const payload = {
        roast,
        theme,
        name: name || "Someone",
        mode: mode || "everyone",
      };
      const shareUrl = await getShareUrl(payload);
      await navigator.clipboard.writeText(shareUrl);
      setToastMessage("Share link copied! 🔗");
    } catch {
      setToastMessage("Failed to generate link. Copy text instead.");
    }
  };

  const handleWebShare = async () => {
    playClickSound();
    try {
      const payload = {
        roast,
        theme,
        name: name || "Someone",
        mode: mode || "everyone",
      };
      const shareUrl = await getShareUrl(payload);

      if (typeof navigator.share === "function") {
        await navigator.share({
          title: "RoastZone 🔥",
          text: `Check out this brutal AI roast of ${name || "me"}! 💀`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setToastMessage("Share link copied! 🔗");
      }
    } catch (e) {
      console.warn("Share failed or aborted", e);
    }
  };

  const handleTwitterShare = () => {
    playClickSound();
    const text = `I just got roasted by AI 🔥\n\n${roast}\n\nGet roasted at roast-zone.vercel.app`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleSpeak = () => {
    playClickSound();
    if (isPlayingSpeech) {
      stopSpeaking();
      setIsPlayingSpeech(false);
    } else {
      speakText(
        roast,
        () => setIsPlayingSpeech(true),
        () => setIsPlayingSpeech(false)
      );
    }
  };

  const drawCardCanvas = (canvas: HTMLCanvasElement): boolean => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    const themeColors = {
      cyberpunk: { stroke: "#8b5cf6", glow: "rgba(139, 92, 246, 0.12)", title: "#8b5cf6" },
      inferno: { stroke: "#ea580c", glow: "rgba(234, 88, 12, 0.12)", title: "#ea580c" },
      toxic: { stroke: "#84cc16", glow: "rgba(132, 204, 22, 0.12)", title: "#84cc16" },
    };

    const currentTheme = themeColors[theme] || themeColors.cyberpunk;

    // 1. Draw Background (Zinc-950)
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Radial Gradient Glow
    const glowGrad = ctx.createRadialGradient(600, 400, 50, 600, 400, 700);
    glowGrad.addColorStop(0, currentTheme.glow);
    glowGrad.addColorStop(1, "rgba(9, 9, 11, 0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Draw Outer Card border glow (rounded rect)
    ctx.strokeStyle = currentTheme.stroke;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(40, 40, 1120, 720, 24);
    ctx.stroke();

    // 4. Draw Inner Roast Card Background
    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.roundRect(80, 150, 1040, 480, 16);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Draw Title / Logo
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px system-ui, -apple-system, sans-serif";
    ctx.fillText("🔥 Roast", 100, 105);
    
    ctx.fillStyle = currentTheme.title;
    ctx.fillText("Zone", 255, 105);

    // 6. Draw Roast Text
    ctx.fillStyle = "#e4e4e7"; // zinc-200
    ctx.font = "normal 23px system-ui, -apple-system, sans-serif";
    
    const wrapText = (
      c: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number
    ) => {
      const paragraphs = text.split("\n");
      let currentY = y;

      for (const para of paragraphs) {
        if (!para.trim()) {
          currentY += lineHeight * 0.5;
          continue;
        }
        
        const words = para.split(" ");
        let line = "";

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = c.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            c.fillText(line, x, currentY);
            line = words[n] + " ";
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        c.fillText(line, x, currentY);
        currentY += lineHeight * 1.3;
      }
    };

    wrapText(ctx, roast, 120, 220, 960, 36);

    // 7. Draw Footer text
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "medium 18px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Get roasted at roast-zone.vercel.app", 600, 715);

    return true;
  };

  const handleDownloadCard = () => {
    playClickSound();
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    if (!drawCardCanvas(canvas)) return;

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "my-roast-card.png";
      link.href = dataUrl;
      link.click();
      setToastMessage("Card downloaded! 🖼️");
    } catch {
      setToastMessage("Download failed. Copy text instead.");
    }
  };

  const handleCopyCardImage = () => {
    playClickSound();
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    if (!drawCardCanvas(canvas)) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setToastMessage("Failed to generate image blob.");
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);
          setToastMessage("Card copied to clipboard! 📋🎨");
        } catch {
          setToastMessage("Clipboard block. Download image instead.");
        }
      }, "image/png");
    } catch {
      setToastMessage("Action failed. Try downloading.");
    }
  };

  const handleResetClick = () => {
    playClickSound();
    stopSpeaking();
    onReset();
  };

  const themeConfig = {
    cyberpunk: {
      accentBorder: "border-violet-500/40 shadow-[0_0_30px_rgba(139,92,246,0.15)]",
      accentText: "text-violet-400",
      primary: "bg-violet-600 hover:bg-violet-700 shadow-violet-600/20 hover:shadow-violet-600/30",
      secondary: "hover:border-violet-500/40"
    },
    inferno: {
      accentBorder: "border-orange-500/40 shadow-[0_0_30px_rgba(234,88,12,0.15)]",
      accentText: "text-orange-500",
      primary: "bg-orange-600 hover:bg-orange-700 shadow-orange-600/20 hover:shadow-orange-600/30",
      secondary: "hover:border-orange-500/40"
    },
    toxic: {
      accentBorder: "border-lime-500/50 shadow-[0_0_30px_rgba(132,204,22,0.15)]",
      accentText: "text-lime-500",
      primary: "bg-lime-600 hover:bg-lime-700 shadow-lime-600/20 hover:shadow-lime-600/30",
      secondary: "hover:border-lime-500/40"
    }
  };

  const btnTheme = themeConfig[theme] || themeConfig.cyberpunk;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={`bg-zinc-900 border rounded-2xl p-8 mb-6 relative overflow-hidden transition-all duration-500 ${btnTheme.accentBorder}`}>
        {/* Subtle fire emoji background watermark */}
        <div className="absolute right-4 bottom-2 text-9xl opacity-5 pointer-events-none select-none">
          🔥
        </div>
        <div className="relative z-10 text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🔥</span>
              <h3 className={`font-bold text-lg tracking-wide uppercase transition-colors duration-500 ${btnTheme.accentText}`}>
                {isSharedView ? `Shared Roast for ${name || "You"}` : "Your Roast"}
              </h3>
            </div>
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-950 text-xs font-semibold hover:border-zinc-700 transition-colors ${isPlayingSpeech ? "text-red-400 animate-pulse border-red-500/20" : "text-zinc-300"}`}
              title={isPlayingSpeech ? "Stop Speaking" : "Listen to Roast"}
            >
              {isPlayingSpeech ? "⏹️ Mute voice" : "🔊 Speak Roast"}
            </button>
          </div>
          <p className="text-zinc-100 text-lg leading-relaxed whitespace-pre-line font-medium">
            {roast}
          </p>
        </div>
      </div>

      {isSharedView ? (
        <div className="flex flex-col gap-4">
          <button
            onClick={handleResetClick}
            className={`w-full text-white font-bold py-4 rounded-full transition-all duration-300 text-sm shadow-md hover:shadow-lg active:scale-95 transition-colors duration-500 ${btnTheme.primary}`}
          >
            Create My Own Roast 🔥
          </button>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={handleCopy}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-semibold px-4 py-3 rounded-full transition-all duration-300 text-sm active:scale-95 hover:border-zinc-700"
            >
              Copy Text 📋
            </button>
            <button
              onClick={handleCopyCardImage}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-semibold px-4 py-3 rounded-full transition-all duration-300 text-sm active:scale-95 hover:border-zinc-700"
            >
              Copy Image 📷
            </button>
            <button
              onClick={handleDownloadCard}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-semibold px-4 py-3 rounded-full transition-all duration-300 text-sm active:scale-95 hover:border-zinc-700"
            >
              Download Card 📥
            </button>
            <button
              onClick={handleWebShare}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-semibold px-4 py-3 rounded-full transition-all duration-300 text-sm active:scale-95 hover:border-zinc-700"
            >
              Share 🔗
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={handleCopy}
              className={`text-white font-semibold px-4 py-3 rounded-full transition-all duration-300 text-sm shadow-md hover:shadow-lg active:scale-95 transition-colors duration-500 ${btnTheme.primary}`}
            >
              Copy Text 📋
            </button>
            <button
              onClick={handleCopyCardImage}
              className={`bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-semibold px-4 py-3 rounded-full transition-all duration-300 text-sm active:scale-95 ${btnTheme.secondary}`}
            >
              Copy Image 📷
            </button>
            <button
              onClick={handleDownloadCard}
              className={`bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-semibold px-4 py-3 rounded-full transition-all duration-300 text-sm active:scale-95 ${btnTheme.secondary}`}
            >
              Download Card 🖼️
            </button>
            <button
              onClick={handleCopyShareLink}
              className={`bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-semibold px-4 py-3 rounded-full transition-all duration-300 text-sm active:scale-95 ${btnTheme.secondary}`}
            >
              Copy Link 🔗
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleWebShare}
              className="flex-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold px-5 py-3 rounded-full transition-all duration-300 text-sm active:scale-95"
            >
              {shareSupported ? "Send to Friend 💬" : "Share on Twitter 🐦"}
            </button>
            {!shareSupported && (
              <button
                onClick={handleTwitterShare}
                className="flex-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold px-5 py-3 rounded-full transition-all duration-300 text-sm active:scale-95"
              >
                Share on Twitter 🐦
              </button>
            )}
            <button
              onClick={handleResetClick}
              className="flex-1 bg-white/5 border border-white/10 text-gray-300 hover:text-white font-semibold px-5 py-3 rounded-full transition-all duration-300 text-sm active:scale-95 hover:border-zinc-700"
            >
              Roast Again 🔄
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
}