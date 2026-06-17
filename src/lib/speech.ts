"use client";

// Pre-fetch voices on load to prevent empty getVoices() on first call
let voicesCached: SpeechSynthesisVoice[] = [];
if (typeof window !== "undefined" && window.speechSynthesis) {
  voicesCached = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    voicesCached = window.speechSynthesis.getVoices();
  };
}

export function speakText(text: string, onStart?: () => void, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  // Strip emoji characters so they aren't spoken as technical tags
  const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");

  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  // Refresh current voices list
  const currentVoices = window.speechSynthesis.getVoices().length > 0 
    ? window.speechSynthesis.getVoices() 
    : voicesCached;
  
  // Preferred natural sounding voices in order of delivery quality
  const preferredVoiceNames = [
    "Microsoft Guy Online (Natural)",
    "Microsoft Ryan Online (Natural)",
    "Microsoft Andrew Online (Natural)",
    "Google US English",
    "Google UK English Male",
    "Microsoft David",
    "Microsoft Zira"
  ];

  let selectedVoice: SpeechSynthesisVoice | null = null;

  // 1. Try matching our exact list of preferred high-quality natural voices
  for (const name of preferredVoiceNames) {
    const found = currentVoices.find(v => v.name.includes(name) && v.lang.startsWith("en-"));
    if (found) {
      selectedVoice = found;
      break;
    }
  }

  // 2. Fall back to search for any containing "Natural" or "Google"
  if (!selectedVoice) {
    selectedVoice = currentVoices.find(v => 
      v.lang.startsWith("en-") && 
      (v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("google"))
    ) || null;
  }

  // 3. Fall back to any English voice
  if (!selectedVoice) {
    selectedVoice = currentVoices.find(v => v.lang.startsWith("en-")) || null;
  }

  // 4. Fall back to default browser selection
  if (!selectedVoice && currentVoices.length > 0) {
    selectedVoice = currentVoices[0];
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // Natural pitch and speed adjustments
  utterance.rate = 1.0; 
  utterance.pitch = 0.95; // Slightly lower pitch for a dry, cynical delivery without sounding electronic

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
