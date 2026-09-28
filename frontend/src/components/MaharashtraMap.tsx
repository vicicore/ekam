"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageProvider";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MapControls,
  type MapRef,
} from "@/components/ui/map";

export type DistrictData = {
  id: string;
  name: string;
  division: string;
  latitude: number;
  longitude: number;
  headquarters?: string;
  activeServices?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  r?: number;
};

// 36 districts of Maharashtra arranged across 6 administrative divisions with precise coordinates
export const MAHARASHTRA_DISTRICTS: DistrictData[] = [
  // Konkan Division (West Coast)
  { id: "palghar", name: "Palghar", division: "Konkan", latitude: 19.6967, longitude: 72.7689, headquarters: "Palghar", activeServices: 14, x: 42, y: 76, w: 50, h: 36, r: 6 },
  { id: "thane", name: "Thane", division: "Konkan", latitude: 19.2183, longitude: 72.9781, headquarters: "Thane", activeServices: 14, x: 50, y: 122, w: 48, h: 34, r: 6 },
  { id: "mumbai-city", name: "Mumbai City", division: "Konkan", latitude: 18.9388, longitude: 72.8347, headquarters: "Mumbai", activeServices: 14, x: 30, y: 164, w: 40, h: 28, r: 6 },
  { id: "mumbai-suburban", name: "Mumbai Suburban", division: "Konkan", latitude: 19.0760, longitude: 72.8656, headquarters: "Bandra", activeServices: 14, x: 74, y: 164, w: 44, h: 28, r: 6 },
  { id: "raigad", name: "Raigad", division: "Konkan", latitude: 18.5158, longitude: 73.0169, headquarters: "Alibag", activeServices: 14, x: 46, y: 200, w: 52, h: 38, r: 6 },
  { id: "ratnagiri", name: "Ratnagiri", division: "Konkan", latitude: 16.9902, longitude: 73.3120, headquarters: "Ratnagiri", activeServices: 14, x: 50, y: 246, w: 50, h: 46, r: 6 },
  { id: "sindhudurg", name: "Sindhudurg", division: "Konkan", latitude: 16.1668, longitude: 73.7125, headquarters: "Oros", activeServices: 14, x: 56, y: 300, w: 48, h: 42, r: 6 },

  // Nashik Division (North-West)
  { id: "nandurbar", name: "Nandurbar", division: "Nashik", latitude: 21.3739, longitude: 74.2403, headquarters: "Nandurbar", activeServices: 14, x: 110, y: 24, w: 56, h: 36, r: 6 },
  { id: "dhule", name: "Dhule", division: "Nashik", latitude: 20.9042, longitude: 74.7749, headquarters: "Dhule", activeServices: 14, x: 174, y: 32, w: 54, h: 38, r: 6 },
  { id: "jalgaon", name: "Jalgaon", division: "Nashik", latitude: 21.0077, longitude: 75.5626, headquarters: "Jalgaon", activeServices: 14, x: 238, y: 44, w: 62, h: 40, r: 6 },
  { id: "nashik", name: "Nashik", division: "Nashik", latitude: 19.9975, longitude: 73.7898, headquarters: "Nashik", activeServices: 14, x: 106, y: 78, w: 62, h: 46, r: 6 },
  { id: "ahmednagar", name: "Ahmednagar", division: "Nashik", latitude: 19.0948, longitude: 74.7496, headquarters: "Ahilyanagar", activeServices: 14, x: 136, y: 136, w: 68, h: 54, r: 6 },

  // Pune Division (South-West)
  { id: "pune", name: "Pune", division: "Pune", latitude: 18.5204, longitude: 73.8567, headquarters: "Pune", activeServices: 14, x: 110, y: 202, w: 68, h: 50, r: 6 },
  { id: "satara", name: "Satara", division: "Pune", latitude: 17.6805, longitude: 73.9903, headquarters: "Satara", activeServices: 14, x: 112, y: 260, w: 62, h: 44, r: 6 },
  { id: "solapur", name: "Solapur", division: "Pune", latitude: 17.6599, longitude: 75.9064, headquarters: "Solapur", activeServices: 14, x: 188, y: 254, w: 66, h: 52, r: 6 },
  { id: "sangli", name: "Sangli", division: "Pune", latitude: 16.8524, longitude: 74.5815, headquarters: "Sangli", activeServices: 14, x: 118, y: 312, w: 64, h: 42, r: 6 },
  { id: "kolhapur", name: "Kolhapur", division: "Pune", latitude: 16.7050, longitude: 74.2433, headquarters: "Kolhapur", activeServices: 14, x: 112, y: 362, w: 60, h: 44, r: 6 },

  // Chhatrapati Sambhajinagar Division (Marathwada - Central)
  { id: "aurangabad", name: "Chh. Sambhajinagar", division: "Chhatrapati Sambhajinagar", latitude: 19.8762, longitude: 75.3433, headquarters: "Chh. Sambhajinagar", activeServices: 14, x: 216, y: 102, w: 74, h: 46, r: 6 },
  { id: "jalna", name: "Jalna", division: "Chhatrapati Sambhajinagar", latitude: 19.8347, longitude: 75.8830, headquarters: "Jalna", activeServices: 14, x: 298, y: 108, w: 56, h: 42, r: 6 },
  { id: "parbhani", name: "Parbhani", division: "Chhatrapati Sambhajinagar", latitude: 19.2686, longitude: 76.7748, headquarters: "Parbhani", activeServices: 14, x: 342, y: 158, w: 56, h: 42, r: 6 },
  { id: "hingoli", name: "Hingoli", division: "Chhatrapati Sambhajinagar", latitude: 19.7173, longitude: 77.1435, headquarters: "Hingoli", activeServices: 14, x: 382, y: 116, w: 52, h: 38, r: 6 },
  { id: "beed", name: "Beed", division: "Chhatrapati Sambhajinagar", latitude: 18.9891, longitude: 75.7605, headquarters: "Beed", activeServices: 14, x: 226, y: 168, w: 64, h: 46, r: 6 },
  { id: "nanded", name: "Nanded", division: "Chhatrapati Sambhajinagar", latitude: 19.1383, longitude: 77.3178, headquarters: "Nanded", activeServices: 14, x: 396, y: 166, w: 64, h: 48, r: 6 },
  { id: "latur", name: "Latur", division: "Chhatrapati Sambhajinagar", latitude: 18.4088, longitude: 76.5656, headquarters: "Latur", activeServices: 14, x: 278, y: 228, w: 60, h: 44, r: 6 },
  { id: "dharashiv", name: "Dharashiv", division: "Chhatrapati Sambhajinagar", latitude: 18.1856, longitude: 76.0440, headquarters: "Dharashiv", activeServices: 14, x: 224, y: 228, w: 50, h: 42, r: 6 },

  // Amravati Division (Vidarbha - West)
  { id: "buldhana", name: "Buldhana", division: "Amravati", latitude: 20.5303, longitude: 76.1804, headquarters: "Buldhana", activeServices: 14, x: 312, y: 52, w: 56, h: 44, r: 6 },
  { id: "akola", name: "Akola", division: "Amravati", latitude: 20.7002, longitude: 77.0082, headquarters: "Akola", activeServices: 14, x: 376, y: 58, w: 50, h: 42, r: 6 },
  { id: "washim", name: "Washim", division: "Amravati", latitude: 20.1065, longitude: 77.1333, headquarters: "Washim", activeServices: 14, x: 374, y: 108, w: 50, h: 40, r: 6 },
  { id: "amravati", name: "Amravati", division: "Amravati", latitude: 20.9320, longitude: 77.7523, headquarters: "Amravati", activeServices: 14, x: 434, y: 46, w: 64, h: 46, r: 6 },
  { id: "yavatmal", name: "Yavatmal", division: "Amravati", latitude: 20.3888, longitude: 78.1252, headquarters: "Yavatmal", activeServices: 14, x: 436, y: 106, w: 68, h: 48, r: 6 },

  // Nagpur Division (Vidarbha - East)
  { id: "wardha", name: "Wardha", division: "Nagpur", latitude: 20.7453, longitude: 78.6022, headquarters: "Wardha", activeServices: 14, x: 506, y: 78, w: 52, h: 42, r: 6 },
  { id: "nagpur", name: "Nagpur", division: "Nagpur", latitude: 21.1458, longitude: 79.0882, headquarters: "Nagpur", activeServices: 14, x: 524, y: 32, w: 64, h: 44, r: 6 },
  { id: "bhandara", name: "Bhandara", division: "Nagpur", latitude: 21.1714, longitude: 79.6558, headquarters: "Bhandara", activeServices: 14, x: 596, y: 36, w: 54, h: 40, r: 6 },
  { id: "gondia", name: "Gondia", division: "Nagpur", latitude: 21.4598, longitude: 80.1961, headquarters: "Gondia", activeServices: 14, x: 658, y: 38, w: 54, h: 42, r: 6 },
  { id: "chandrapur", name: "Chandrapur", division: "Nagpur", latitude: 19.9615, longitude: 79.2961, headquarters: "Chandrapur", activeServices: 14, x: 524, y: 136, w: 68, h: 54, r: 6 },
  { id: "gadchiroli", name: "Gadchiroli", division: "Nagpur", latitude: 20.1849, longitude: 80.0033, headquarters: "Gadchiroli", activeServices: 14, x: 604, y: 118, w: 76, h: 78, r: 8 },
];

const DIVISION_COLORS: Record<string, { fill: string; stroke: string; label: string; dot: string }> = {
  Konkan: { fill: "#e2ecf5", stroke: "#2b6cb0", label: "Konkan Division", dot: "#3182ce" },
  Pune: { fill: "#e5f0e9", stroke: "#2f855a", label: "Pune Division", dot: "#38a169" },
  Nashik: { fill: "#fbf3e4", stroke: "#b7791f", label: "Nashik Division", dot: "#d69e2e" },
  "Chhatrapati Sambhajinagar": { fill: "#f1ebf7", stroke: "#805ad5", label: "Chhatrapati Sambhajinagar Division", dot: "#805ad5" },
  Amravati: { fill: "#eaf3fa", stroke: "#0284c7", label: "Amravati Division", dot: "#0284c7" },
  Nagpur: { fill: "#f6ebe6", stroke: "#ea580c", label: "Nagpur Division", dot: "#ea580c" },
};

const DIVISION_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  All: { center: [76.2, 19.35], zoom: 6.3 },
  Konkan: { center: [73.2, 18.2], zoom: 7.2 },
  Pune: { center: [74.6, 17.6], zoom: 7.3 },
  Nashik: { center: [74.6, 20.4], zoom: 7.2 },
  "Chhatrapati Sambhajinagar": { center: [76.4, 19.2], zoom: 7.2 },
  Amravati: { center: [77.3, 20.6], zoom: 7.2 },
  Nagpur: { center: [79.6, 20.8], zoom: 7.1 },
};

export interface MaharashtraMapProps {
  onSelectDistrict?: (districtId: string) => void;
}

export default function MaharashtraMap({ onSelectDistrict }: MaharashtraMapProps = {}) {
  const { t } = useLanguage();
  const mapRef = useRef<MapRef | null>(null);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [selectedId, setSelectedId] = useState<string>("pune");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [divisionFilter, setDivisionFilter] = useState<string>("All");

  const selected = useMemo(() => {
    return MAHARASHTRA_DISTRICTS.find((d) => d.id === selectedId) ?? MAHARASHTRA_DISTRICTS[0];
  }, [selectedId]);

  const activeDistrict = hoveredId
    ? MAHARASHTRA_DISTRICTS.find((d) => d.id === hoveredId) ?? selected
    : selected;

  const filteredDistricts = useMemo(() => {
    if (divisionFilter === "All") return MAHARASHTRA_DISTRICTS;
    return MAHARASHTRA_DISTRICTS.filter((d) => d.division === divisionFilter);
  }, [divisionFilter]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectDistrict?.(id);

    const target = MAHARASHTRA_DISTRICTS.find((d) => d.id === id);
    if (target && mapRef.current) {
      mapRef.current.flyTo({
        center: [target.longitude, target.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 7.4),
        duration: 700,
      });
    }
  };

  const handleDivisionChange = (div: string) => {
    setDivisionFilter(div);
    const target = DIVISION_CENTERS[div] ?? DIVISION_CENTERS.All;
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: target.center,
        zoom: target.zoom,
        duration: 750,
      });
    }

    if (div !== "All") {
      const firstInDiv = MAHARASHTRA_DISTRICTS.find((d) => d.division === div);
      if (firstInDiv && activeDistrict.division !== div) {
        setSelectedId(firstInDiv.id);
        onSelectDistrict?.(firstInDiv.id);
      }
    }
  };

  return (
    <section className="setu-map-section" aria-labelledby="map-heading">
      <div className="setu-section-head">
        <div>
          <span className="setu-ink-kicker">{t("mh_map_kicker")}</span>
          <h2 id="map-heading">{t("mh_map_title")}</h2>
          <p className="setu-muted" style={{ margin: "4px 0 0" }}>
            {t("mh_map_desc")}
          </p>
        </div>
        <Link href="/maharashtra/intelligence" className="setu-btn setu-btn-secondary">
          {t("full_state_directory")}
        </Link>
      </div>

      <div className="setu-map-filter-bar" role="tablist" aria-label="Administrative division filters">
        <span className="setu-map-filter-label">{t("filter_division")} ({filteredDistricts.length} districts):</span>
        {["All", "Konkan", "Pune", "Nashik", "Chhatrapati Sambhajinagar", "Amravati", "Nagpur"].map((div) => (
          <button
            key={div}
            role="tab"
            aria-selected={divisionFilter === div}
            className={`setu-map-chip ${divisionFilter === div ? "is-active" : ""}`}
            onClick={() => handleDivisionChange(div)}
          >
            {div}
          </button>
        ))}
      </div>

      <div className="setu-mh-map">
        {/* MapCN Interactive Map Visualization */}
        <div
          className="setu-mh-canvas-wrap"
          role="region"
          aria-label="Interactive MapCN map of Maharashtra districts"
          style={{
            position: "relative",
            width: "100%",
            height: "560px",
            minHeight: "560px",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid var(--setu-line, #cbd5e1)",
            background: "#f8fafc",
          }}
        >
          {isMounted ? (
            <Map
              ref={mapRef}
              center={[76.2, 19.35]}
              zoom={6.3}
              minZoom={5.4}
              maxZoom={12}
              className="h-full w-full"
            >
              <MapControls position="top-right" showZoom showCompass showFullscreen />

              {MAHARASHTRA_DISTRICTS.map((d) => {
                const isSelected = d.id === selectedId;
                const isHovered = d.id === hoveredId;
                const isDimmed = divisionFilter !== "All" && d.division !== divisionFilter;
                const divColor = DIVISION_COLORS[d.division] || DIVISION_COLORS.Pune;

                return (
                  <MapMarker
                    key={d.id}
                    longitude={d.longitude}
                    latitude={d.latitude}
                    onClick={() => handleSelect(d.id)}
                    onMouseEnter={() => setHoveredId(d.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <MarkerContent>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`${d.name} District, ${d.division} Division`}
                        aria-pressed={isSelected}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelect(d.id);
                          }
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: isSelected ? "4px 10px" : "3px 8px",
                          borderRadius: "9999px",
                          background: isSelected
                            ? "var(--setu-saffron, #c47b16)"
                            : isHovered
                            ? "var(--setu-navy, #102a43)"
                            : "#ffffff",
                          color: isSelected || isHovered ? "#ffffff" : "#1e293b",
                          border: isSelected
                            ? "2px solid #ffffff"
                            : isHovered
                            ? "1.5px solid #0f172a"
                            : `1.5px solid ${divColor.stroke}`,
                          boxShadow: isSelected
                            ? "0 4px 14px rgba(196, 123, 22, 0.45), 0 0 0 2px rgba(196, 123, 22, 0.3)"
                            : "0 2px 6px rgba(0,0,0,0.12)",
                          fontSize: isSelected ? "11px" : "10px",
                          fontWeight: isSelected ? 800 : 600,
                          cursor: "pointer",
                          opacity: isDimmed ? 0.3 : 1,
                          transform: isSelected ? "scale(1.12)" : isHovered ? "scale(1.08)" : "scale(1)",
                          transition: "all 160ms cubic-bezier(0.4, 0, 0.2, 1)",
                          whiteSpace: "nowrap",
                          userSelect: "none",
                        }}
                      >
                        <span
                          style={{
                            width: isSelected ? "7px" : "6px",
                            height: isSelected ? "7px" : "6px",
                            borderRadius: "50%",
                            background: isSelected ? "#ffffff" : divColor.dot,
                            display: "inline-block",
                          }}
                        />
                        <span>{d.name}</span>
                      </div>
                    </MarkerContent>
                    <MarkerTooltip className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl border border-slate-700 min-w-[150px]">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "12px", color: "#fef08a" }}>
                        <span>📍</span>
                        <span>{d.name} District</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "2px" }}>
                        {d.division} Division
                      </div>
                      <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px", borderTop: "1px solid #334155", paddingTop: "4px" }}>
                        Click to view intelligence
                      </div>
                    </MarkerTooltip>
                  </MapMarker>
                );
              })}
            </Map>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#f8fafc",
                color: "#64748b",
                fontSize: "0.88rem",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  border: "2px solid #cbd5e1",
                  borderTopColor: "var(--setu-saffron, #c47b16)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <span>Loading Maharashtra MapCN visualization...</span>
            </div>
          )}

          {/* Interactive Legend Overlay */}
          <div
            className="setu-map-legend"
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              zIndex: 10,
              background: "rgba(255, 255, 255, 0.94)",
              backdropFilter: "blur(6px)",
              padding: "6px 12px",
              borderRadius: "6px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              border: "1px solid #e2e8f0",
              fontSize: "11px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
              maxWidth: "calc(100% - 20px)",
            }}
          >
            <span style={{ fontWeight: 700, color: "#102a43" }}>Map Legend:</span>
            {Object.entries(DIVISION_COLORS).map(([name, conf]) => (
              <span
                key={name}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "10.5px",
                }}
              >
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: conf.dot,
                    display: "inline-block",
                  }}
                />
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Selected District Intelligence Card / Panel */}
        <div className="setu-panel setu-mh-card" aria-live="polite">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="setu-kicker" style={{ color: "var(--setu-saffron, #c47b16)" }}>DISTRICT INTELLIGENCE</span>
            <span className="setu-status setu-status-verified">{activeDistrict.division}</span>
          </div>

          <h3 style={{ fontSize: "1.45rem", margin: "6px 0 2px", color: "var(--setu-navy)" }}>
            {activeDistrict.name}
          </h3>
          <p className="setu-muted" style={{ fontSize: "0.8rem", margin: "0 0 14px" }}>
            Coordinating state public services and local administration for {activeDistrict.name} District.
          </p>

          <div className="setu-mh-metrics">
            <div>
              <strong>14</strong>
              <span>Notified Services</span>
            </div>
            <div>
              <strong>06</strong>
              <span>State Departments</span>
            </div>
            <div>
              <strong>02</strong>
              <span>Connected Journeys</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Vault Verification</span>
            </div>
          </div>

          <div style={{ margin: "14px 0", fontSize: "0.8rem" }}>
            <strong style={{ display: "block", color: "var(--setu-navy)", marginBottom: "4px" }}>
              Key Public Services in {activeDistrict.name}:
            </strong>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--setu-muted)", lineHeight: "1.6" }}>
              <li>Income & Domicile Certificates (Revenue)</li>
              <li>Higher Education Scholarships (Technical Edu.)</li>
              <li>Shops & Establishment (Labour Welfare)</li>
              <li>Local Municipal Clearances (Urban Dev.)</li>
            </ul>
          </div>

          <div style={{ display: "grid", gap: "8px", marginTop: "16px" }}>
            <Link
              href={`/maharashtra/intelligence?district=${encodeURIComponent(activeDistrict.id)}`}
              className="setu-btn setu-btn-primary"
            >
              Explore {activeDistrict.name} Services
            </Link>
            <Link href="/services" className="setu-btn setu-btn-secondary">
              View All 14 Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
