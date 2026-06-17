"use client";

export type RoastMode = "github" | "personal" | "resume";

interface ModeSelectorProps {
  mode: RoastMode;
  setMode: (mode: RoastMode) => void;
  theme: "cyberpunk" | "inferno" | "toxic";
}

export default function ModeSelector({ mode, setMode, theme }: ModeSelectorProps) {
  const themeColors = {
    cyberpunk: {
      active: "bg-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.3)] border-violet-500",
      hover: "hover:border-violet-500/40"
    },
    inferno: {
      active: "bg-orange-600 shadow-[0_0_12px_rgba(234,88,12,0.3)] border-orange-500",
      hover: "hover:border-orange-500/40"
    },
    toxic: {
      active: "bg-lime-650 shadow-[0_0_12px_rgba(132,204,22,0.3)] border-lime-500",
      hover: "hover:border-lime-500/40"
    }
  };

  const currentTheme = themeColors[theme] || themeColors.cyberpunk;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
      <button
        onClick={() => setMode("github")}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border transition-all duration-300 ${
          mode === "github"
            ? `${currentTheme.active} text-white`
            : `bg-white/5 border-white/10 text-zinc-400 ${currentTheme.hover} hover:text-white`
        }`}
      >
        🧑‍💻 Developer Mode
      </button>
      <button
        onClick={() => setMode("personal")}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border transition-all duration-300 ${
          mode === "personal"
            ? `${currentTheme.active} text-white`
            : `bg-white/5 border-white/10 text-zinc-400 ${currentTheme.hover} hover:text-white`
        }`}
      >
        😄 Everyone Mode
      </button>
      <button
        onClick={() => setMode("resume")}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border transition-all duration-300 ${
          mode === "resume"
            ? `${currentTheme.active} text-white`
            : `bg-white/5 border-white/10 text-zinc-400 ${currentTheme.hover} hover:text-white`
        }`}
      >
        💼 Resume Mode
      </button>
    </div>
  );
}