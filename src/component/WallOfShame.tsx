"use client";

import { useEffect, useState } from "react";
import Toast from "./Toast";
import { playClickSound } from "@/lib/sounds";

export interface HistoryItem {
  id: string;
  name: string;
  mode: string;
  roast: string;
  date: string;
}

interface WallOfShameProps {
  theme: "cyberpunk" | "inferno" | "toxic";
  refreshTrigger: number;
}

export default function WallOfShame({ theme, refreshTrigger }: WallOfShameProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const themeColors = {
    cyberpunk: { text: "text-violet-400", border: "border-violet-500/20 hover:border-violet-500/50" },
    inferno: { text: "text-orange-500", border: "border-orange-500/20 hover:border-orange-500/50" },
    toxic: { text: "text-lime-500", border: "border-lime-500/20 hover:border-lime-500/50" }
  };

  const currentTheme = themeColors[theme] || themeColors.cyberpunk;

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem("roast_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem("roast_history", JSON.stringify(updated));
    setHistory(updated);
    if (expandedId === id) setExpandedId(null);
    setToastMsg("Roast wiped from history! 🧼");
  };

  const handleCopy = (roast: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    navigator.clipboard.writeText(roast);
    setToastMsg("Roast copied to clipboard! 🔥");
  };

  const handleToggle = (id: string) => {
    playClickSound();
    setExpandedId(expandedId === id ? null : id);
  };

  if (history.length === 0) return null;

  return (
    <div className="mt-20 border-t border-zinc-800/80 pt-16">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          💀 Wall of <span className={currentTheme.text}>Shame</span>
        </h3>
        <p className="text-zinc-500 text-sm font-medium">
          A glorious archive of your past emotional damage.
        </p>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        {history.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`bg-zinc-900 border rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                isExpanded ? "border-zinc-700 bg-zinc-900/50" : currentTheme.border
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {item.mode === "github" ? "🧑‍💻" : item.mode === "resume" ? "💼" : "😄"}
                  </span>
                  <div className="text-left">
                    <h4 className="font-semibold text-white text-sm">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500">
                      {item.mode.toUpperCase()} MODE · {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCopy(item.roast, e)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    title="Copy Roast"
                  >
                    📋
                  </button>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 bg-zinc-800 hover:bg-red-950/40 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                    title="Delete Roast"
                  >
                    🗑️
                  </button>
                  <span className="text-zinc-500 text-xs font-semibold pl-1">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-zinc-850 text-left animate-in fade-in duration-300">
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {item.roast}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg("")} />}
    </div>
  );
}
