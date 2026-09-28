"use client";

import { useEffect, useState } from "react";

type Preferences = {
  fontScale: number;
  highContrast: boolean;
  reducedMotion: boolean;
};

const DEFAULTS: Preferences = {
  fontScale: 1,
  highContrast: false,
  reducedMotion: false,
};

export default function AccessibilityToolbar() {
  const [prefs, setPrefs] = useState(DEFAULTS);

  useEffect(() => {
    const saved = localStorage.getItem("setu-a11y");
    if (!saved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { setPrefs({ ...DEFAULTS, ...JSON.parse(saved) }); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("setu-a11y", JSON.stringify(prefs));
    const root = document.documentElement;
    root.style.setProperty("--setu-font-scale", String(prefs.fontScale));
    root.toggleAttribute("data-high-contrast", prefs.highContrast);
    root.toggleAttribute("data-reduced-motion", prefs.reducedMotion);
  }, [prefs]);

  const update = (patch: Partial<Preferences>) =>
    setPrefs((current) => ({ ...current, ...patch }));

  return (
    <div className="setu-a11y-toolbar" role="region" aria-label="Accessibility controls">
      <button type="button" onClick={() => update({ fontScale: Math.min(1.2, +(prefs.fontScale + 0.05).toFixed(2)) })}>
        A+ <span className="sr-only">Increase text size</span>
      </button>
      <button type="button" onClick={() => update({ fontScale: Math.max(0.9, +(prefs.fontScale - 0.05).toFixed(2)) })}>
        A− <span className="sr-only">Decrease text size</span>
      </button>
      <button
        type="button"
        aria-pressed={prefs.highContrast}
        onClick={() => update({ highContrast: !prefs.highContrast })}
      >
        Contrast
      </button>
      <button
        type="button"
        aria-pressed={prefs.reducedMotion}
        onClick={() => update({ reducedMotion: !prefs.reducedMotion })}
      >
        Reduce motion
      </button>
      <button type="button" onClick={() => setPrefs(DEFAULTS)}>Reset</button>
    </div>
  );
}
