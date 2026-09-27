"use client";

import { useState } from "react";

type Item = { label: string; href: string };

export default function ResponsiveNavMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="setu-responsive-nav" aria-label="Primary navigation">
      <button
        className="setu-menu-button"
        type="button"
        aria-expanded={open}
        aria-controls="setu-mobile-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{open ? "×" : "☰"}</span>
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      <div id="setu-mobile-navigation" className={`setu-mobile-nav ${open ? "is-open" : ""}`}>
        {items.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
