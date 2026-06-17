"use client";

import { useState } from "react";
import RoastResult from "./RoastResult";
import SpiceMeter, { SpiceLevel } from "./SpiceMeter";
import LoadingPhases from "./LoadingPhases";
import { useCardGlow } from "@/lib/useCardGlow";
import { playClickSound, playSizzleSound } from "@/lib/sounds";
import { checkRateLimit } from "@/lib/rateLimit";

interface PersonalRoasterProps {
  theme: "cyberpunk" | "inferno" | "toxic";
  onSuccess: () => void;
}

export default function PersonalRoaster({ theme, onSuccess }: PersonalRoasterProps) {
  const [form, setForm] = useState({
    name: "",
    occupation: "",
    facts: "",
    bio: "",
  });
  const [spice, setSpice] = useState<SpiceLevel>("spicy");
  const [loading, setLoading] = useState(false);
  const [roast, setRoast] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState<number | null>(null);

  const { ref, handleMouseMove } = useCardGlow();


  const handleRoast = async () => {
    if (!form.name || !form.occupation || !form.facts) return;

    playClickSound();

    if (!checkRateLimit(setCooldown)) {
      setError(`Rate limit reached. Please wait ${cooldown || 15} minute(s) before trying again to avoid server load.`);
      return;
    }

    setLoading(true);
    setError("");
    setRoast("");
    playSizzleSound();

    try {
      const roastRes = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mode: "personal", 
          data: { ...form, spice } 
        }),
      });
      if (!roastRes.ok) {
        throw new Error();
      }
      const roastData = await roastRes.json();
      setRoast(roastData.roast);
      playSizzleSound();

      // Log to localStorage history
      const newHistoryItem = {
        id: Math.random().toString(36).substring(7),
        name: form.name,
        mode: "personal",
        roast: roastData.roast,
        date: new Date().toISOString()
      };

      let history = [];
      try {
        history = JSON.parse(localStorage.getItem("roast_history") || "[]");
      } catch {
        history = [];
      }
      localStorage.setItem("roast_history", JSON.stringify([newHistoryItem, ...history].slice(0, 10)));
      if (onSuccess) onSuccess();

    } catch {
      setError("Failed to generate roast. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (roast) {
    return (
      <RoastResult
        roast={roast}
        onReset={() => setRoast("")}
        theme={theme}
        name={form.name}
        mode="personal"
      />
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <LoadingPhases />
      </div>
    );
  }

  const themeColors = {
    cyberpunk: {
      glow: "rgba(139, 92, 246, 0.08)",
      border: "hover:border-violet-500/30",
      button: "bg-violet-600 hover:bg-violet-700 shadow-violet-600/20 hover:shadow-violet-600/30",
      focusRing: "focus:border-violet-500 focus:ring-violet-500"
    },
    inferno: {
      glow: "rgba(234, 88, 12, 0.08)",
      border: "hover:border-orange-500/30",
      button: "bg-orange-600 hover:bg-orange-700 shadow-orange-600/20 hover:shadow-orange-600/30",
      focusRing: "focus:border-orange-500 focus:ring-orange-500"
    },
    toxic: {
      glow: "rgba(132, 204, 22, 0.08)",
      border: "hover:border-lime-500/30",
      button: "bg-lime-600 hover:bg-lime-700 shadow-lime-600/20 hover:shadow-lime-600/30",
      focusRing: "focus:border-lime-500 focus:ring-lime-500"
    }
  };

  const currentTheme = themeColors[theme] || themeColors.cyberpunk;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div 
        ref={ref}
        onMouseMove={handleMouseMove}
        className={`relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 overflow-hidden group transition-all duration-300 ${currentTheme.border}`}
      >
        {/* Spotlight overlay */}
        <div 
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), ${currentTheme.glow}, transparent 80%)`
          }}
        />

        <div className="relative z-10 text-left">
          <div className="text-4xl mb-4 text-center">😄</div>
          <h3 className="text-white font-bold text-xl text-center mb-2">
            Personal Roaster
          </h3>
          <p className="text-zinc-400 text-sm text-center mb-6">
            Tell us about yourself and AI will roast you into oblivion — with love.
          </p>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                Your Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Veer"
                className={`text-white bg-zinc-950 w-full px-4 py-3 rounded-xl border border-zinc-800 outline-none text-sm transition-all duration-200 focus:ring-1 ${currentTheme.focusRing}`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                What do you do? *
              </label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                placeholder="e.g. Full-Stack Developer, Student, Designer"
                className={`text-white bg-zinc-950 w-full px-4 py-3 rounded-xl border border-zinc-800 outline-none text-sm transition-all duration-200 focus:ring-1 ${currentTheme.focusRing}`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                3 fun facts about yourself *
              </label>
              <textarea
                rows={3}
                value={form.facts}
                onChange={(e) => setForm({ ...form, facts: e.target.value })}
                placeholder="e.g. I drink 5 coffees a day, I've never finished a side project..."
                className={`text-white bg-zinc-950 w-full px-4 py-3 rounded-xl border border-zinc-800 outline-none text-sm transition-all duration-200 resize-none focus:ring-1 ${currentTheme.focusRing}`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                Your bio / about you (optional)
              </label>
              <textarea
                rows={2}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Paste your LinkedIn bio or describe yourself..."
                className={`text-white bg-zinc-950 w-full px-4 py-3 rounded-xl border border-zinc-800 outline-none text-sm transition-all duration-200 resize-none focus:ring-1 ${currentTheme.focusRing}`}
              />
            </div>

            {/* Spice Meter component */}
            <SpiceMeter value={spice} onChange={(val) => { playClickSound(); setSpice(val); }} theme={theme} />

            {error && (
              <p className="text-red-400 text-sm text-center font-medium bg-red-950/20 border border-red-500/20 p-3 rounded-xl">
                {error}
              </p>
            )}

            <button
              onClick={handleRoast}
              disabled={!form.name || !form.occupation || !form.facts}
              className={`w-full text-white font-semibold py-3.5 rounded-full shadow-lg transition-all duration-300 text-sm mt-2 ${currentTheme.button}`}
            >
              Roast Me 🔥
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}