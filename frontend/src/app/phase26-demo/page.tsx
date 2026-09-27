"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageProvider";

export default function Phase26Demo() {
  const { t } = useLanguage();

  return (
    <main className="phase26-demo">
      <header className="phase26-demo__header">
        <div>
          <span className="phase26-kicker">SETU · PHASE 26</span>
          <h1>{t("welcome")}</h1>
          <p>{t("citizenServices")}</p>
        </div>
        <LanguageSwitcher />
      </header>

      <section className="phase26-demo__grid">
        {[
          ["services", "findService", "/services"],
          ["schemes", "findScheme", "/schemes"],
          ["trackApplication", "trackYourApplication", "/journeys"],
          ["documents", "manageDocuments", "/vault"],
          ["grievance", "registerGrievance", "/grievance"],
          ["assistant", "assistant", "/assistant"],
        ].map(([title, description, route]) => (
          <Link className="phase26-card" href={route} key={title}>
            <span>{t(title)}</span>
            <strong>{t(description)}</strong>
            <em>→</em>
          </Link>
        ))}
      </section>

      <div className="phase26-notice">{t("privacyNotice")}</div>
    </main>
  );
}
