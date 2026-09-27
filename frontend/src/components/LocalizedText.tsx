"use client";

import { useLanguage } from "@/lib/LanguageProvider";

export default function LocalizedText({ id, fallback }: { id: string; fallback?: string }) {
  const { t } = useLanguage();
  const value = t(id);
  return <>{value === id && fallback ? fallback : value}</>;
}
