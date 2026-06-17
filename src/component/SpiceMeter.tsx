"use client";

export type SpiceLevel = "mild" | "spicy" | "nuclear" | "extreme";

interface SpiceMeterProps {
  value: SpiceLevel;
  onChange: (level: SpiceLevel) => void;
  theme?: "cyberpunk" | "inferno" | "toxic";
}

const selectedColors = {
  cyberpunk: "bg-violet-600 border-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]",
  inferno: "bg-orange-600 border-orange-500 text-white shadow-[0_0_12px_rgba(234,88,12,0.3)]",
  toxic: "bg-lime-600 border-lime-500 text-white shadow-[0_0_12px_rgba(132,204,22,0.3)]",
};

const levels: { value: SpiceLevel; label: string; icon: string; desc: string; color: string }[] = [
  { value: "mild", label: "Mild", icon: "🌶️", desc: "Gentle teasing", color: "text-green-400 border-green-500/20 bg-green-500/5 hover:border-green-500/40" },
  { value: "spicy", label: "Spicy", icon: "🌶️🌶️", desc: "Sarcastic fun", color: "text-amber-400 border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40" },
  { value: "nuclear", label: "Nuclear", icon: "🔥", desc: "No holding back", color: "text-orange-500 border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40" },
  { value: "extreme", label: "Career Ending", icon: "💀", desc: "Emotional damage", color: "text-red-500 border-red-500/20 bg-red-500/5 hover:border-red-500/40" },
];

export default function SpiceMeter({ value, onChange, theme = "cyberpunk" }: SpiceMeterProps) {
  return (
    <div className="flex flex-col gap-2 w-full mb-6">
      <label className="text-zinc-400 text-xs font-semibold tracking-wide uppercase">
        Select Roast Intensity
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {levels.map((lvl) => {
          const isSelected = value === lvl.value;
          return (
            <button
              key={lvl.value}
              type="button"
              onClick={() => onChange(lvl.value)}
              className={`flex flex-col items-center text-center p-3 rounded-xl border text-xs font-semibold transition-all duration-300 ${
                isSelected
                  ? selectedColors[theme]
                  : `bg-zinc-900 border-zinc-800 ${lvl.color}`
              }`}
            >
              <span className="text-base mb-1">{lvl.icon}</span>
              <span className="truncate w-full">{lvl.label}</span>
              <span className="text-[10px] text-zinc-500 mt-1 font-normal block truncate w-full">
                {lvl.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
