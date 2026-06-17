"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md border border-violet-500/30 px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.15)] animate-in slide-in-from-bottom-4 duration-300">
      <span className="text-xl">🔥</span>
      <p className="text-white text-sm font-medium">{message}</p>
    </div>
  );
}
