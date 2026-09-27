"use client";

import AccessibilityToolbar from "@/components/AccessibilityToolbar";

export default function AccessibilityPage() {
  return (
    <main id="main-content" className="setu-accessibility-page">
      <section className="setu-accessibility-hero">
        <span className="setu-eyebrow">SETU · ACCESSIBILITY</span>
        <h1>Services designed for more citizens.</h1>
        <p>
          SETU's interface supports keyboard navigation, readable text,
          responsive layouts, reduced motion and accessibility preferences.
        </p>
        <AccessibilityToolbar />
      </section>

      <section className="setu-accessibility-grid">
        <article>
          <h2>Keyboard access</h2>
          <p>Interactive controls are reachable using the keyboard, with visible focus states and a skip-to-content link.</p>
        </article>
        <article>
          <h2>Readable interface</h2>
          <p>Text can be scaled through the accessibility controls without changing the core citizen workflow.</p>
        </article>
        <article>
          <h2>Reduced motion</h2>
          <p>Motion-sensitive users can disable non-essential transitions and animations.</p>
        </article>
        <article>
          <h2>Responsive design</h2>
          <p>Core navigation and service workflows are designed for desktop, tablet and mobile screens.</p>
        </article>
        <article>
          <h2>Assistive technology</h2>
          <p>Semantic landmarks, labels, button states and live regions are used where appropriate.</p>
        </article>
        <article>
          <h2>Contrast</h2>
          <p>A high-contrast preference is available for users who need stronger visual separation.</p>
        </article>
      </section>
    </main>
  );
}
