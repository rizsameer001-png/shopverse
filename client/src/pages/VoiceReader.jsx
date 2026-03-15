import React, { useState } from "react";
import { Play, Pause, Square } from "lucide-react";

export default function VoiceReader({ htmlContent }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  const getText = () => {
    if (!htmlContent) return "";
    return htmlContent.replace(/<[^>]*>/g, "");
  };

  const startReading = () => {
    const text = getText();
    if (!text) return;

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;

    speech.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);

    setSpeaking(true);
    setPaused(false);
  };

  const pauseReading = () => {
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const resumeReading = () => {
    window.speechSynthesis.resume();
    setPaused(false);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  return (
    <div className="flex items-center gap-3 mb-6">

      {!speaking && (
        <button
          onClick={startReading}
          className="flex items-center gap-2 text-sm bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition"
        >
          <Play size={14} /> Listen
        </button>
      )}

      {speaking && !paused && (
        <button
          onClick={pauseReading}
          className="flex items-center gap-2 text-sm bg-yellow-500 text-white px-4 py-2 rounded-xl"
        >
          <Pause size={14} /> Pause
        </button>
      )}

      {speaking && paused && (
        <button
          onClick={resumeReading}
          className="flex items-center gap-2 text-sm bg-green-600 text-white px-4 py-2 rounded-xl"
        >
          <Play size={14} /> Resume
        </button>
      )}

      {speaking && (
        <button
          onClick={stopReading}
          className="flex items-center gap-2 text-sm bg-red-500 text-white px-4 py-2 rounded-xl"
        >
          <Square size={14} /> Stop
        </button>
      )}

    </div>
  );
}