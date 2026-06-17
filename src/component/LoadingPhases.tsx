"use client";

import { useEffect, useState } from "react";


const phrases = [
  "Gathering intelligence data...",
  "Analyzing commit timestamps for fake activity...",
  "Scanning repositories for abandoned projects...",
  "Detecting elevated levels of confidence...",
  "Consulting the roast dictionary...",
  "Igniting the thrusters of destruction...",
  "Generating severe emotional damage..."
];

export default function LoadingPhases() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Dynamic burning flame animation with ring */}
      <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
        <span className="text-4xl animate-bounce">🔥</span>
        <div className="absolute inset-0 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
      <p className="text-white font-medium text-lg mb-2 h-8 transition-all duration-300">
        {phrases[index]}
      </p>
      <p className="text-zinc-500 text-xs">This might take a few seconds...</p>
    </div>
  );
}
