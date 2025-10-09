import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Güvenli property okuma
const getP = (p, keys, fb = null) => {
  for (const k of keys) if (p && p[k] !== undefined && p[k] !== null) return p[k];
  return fb;
};
// Basit quantile
const qtiles = (arr) => {
  const a = arr.filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return { min: 0, q25: 0.25, med: 0.5, q75: 0.75, max: 1 };
  const at = (p) => a[Math.floor((a.length - 1) * p)];
  return { min: a[0], q25: at(0.25), med: at(0.5), q75: at(0.75), max: a[a.length - 1] };
};

export default function App() {
  const mapRef = useRef(null);
  const mapDivRef = useRef(null);
  const popupRef = useRef(null);
  const [mode, setMode] = useState("risk"); // "risk" | "vs30"
  const stopsRef = useRef({ risk: null, vs30: null });

  const applyChoropleth = (m) => {
    const map = mapRef.current;
    if (!map || !map.getLayer("mah-fill")) return;

    if (m === "risk") {
      const s = stopsRef.current.risk;
      map.setPaintProperty("mah-fill", "fill-color", [
        "case",
        // risk değeri yoksa gri
        ["!", ["to-boolean", ["coalesce",
          ["to-number", ["get", "combined_risk_index"]],
          ["to-number", ["get", "risk_score"]],
          ["to-number", ["get", "bilesik_risk_skoru"]], // TR alanı da dene
          null
        ]]],
        "#BBBBBB",
        // varsa quantile ile boya (0–1 veya 0–100 fark etmez)
        [
          "interpolate", ["linear"],
          // normalize: eğer değer 1'den büyükse 0–100 kabul et
          ["let", "r",
            ["coalesce",
              ["to-number", ["get", "combined_risk_index"]],
              ["to-number", ["get", "risk_score"]],
              ["*", ["to-number", ["get", "bilesik_risk_skoru"]], 100]
            ]
          ,
            ["case", [">", ["var", "r"], 1], ["var", "r"], [ "*", ["var", "r"], 100 ]]
          ],
          s.min, "#2ECC71",
          s.q25, "#A3D977",
          s.med, "#F1C40F",
          s.q75, "#E67E22",
          s.max, "#E74C3C"
        ]
      ]);
    } else {
      const s = stopsRef.current.vs30;
      map.setPaintProperty("mah-fill", "fill-color", [
        "case",
        ["!", ["to-boolean", ["to-number", ["get", "vs30"]]]],
        "#BBBBBB",
        [
          "interpolate", ["linear"], ["to-number", ["get", "vs30"]],
          s.min, "#E74C3C",   // düşük vs30 = zayıf zemin (kırmızı)
          s.q25, "#E67E22",
          s.med, "#F1C40F",
          s.q75, "#A3D977",
          s.max, "#2ECC71"    // yüksek vs30 = daha sağlam (yeşil)
        ]
      ]);
    }
  };

  useEffect(() => {
    const styleUrl =
      import.meta.env.VITE_MAP_STYLE ||
      `https://api.maptiler.com/maps/streets/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`;

    const map = new maplibregl.Map({
      container: mapDivRef.current,
      style: styleUrl,
      center: [32.5, 40.8],
      zoom: 6
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    popupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: true });

    map.on("load", async () => {
      // Dosyaları sırayla çek: (Ankara risk/VS30 yoksa sorun değil, gri görünür)
      const urls = [
        "/data/istanbul_mahalle_risk.geojson",
        "/data/ankara_mahalle_risk.geojson"
      ];
      const parts = [];
      for (const u of urls) {
        try { const r = await fetch(u); if (r.ok) parts.push(await r.json()); } catch {}
      }
      if (!parts.length) return;

      const all = { type: "FeatureCollection", features: parts.flatMap(fc => fc.features || []) };

      // Eşikler (yalnızca değeri olan feature'lar)
      const riskVals = all.features.map(f => {
        const p = f.properties || {};
        const raw = getP(p, ["combined_risk_index", "risk_score"], null);
        const tr = getP(p, ["bilesik_risk_skoru"], null); // 0–1 olabilir
        if (raw !== null) return Number(raw);
        if (tr !== null) return Number(tr) > 1 ? Number(tr) : Number(tr) * 100;
        return NaN;
      });
      const vs30Vals = all.features.map(f => Number(getP(f.properties, ["vs30"], NaN)));

      stopsRef.current = { risk: qtiles(riskVals), vs30: qtiles(vs30Vals) };

      // Kaynak + katman
      map.addSource("mah", { type: "geojson", data: all });
      map.addLayer({ id: "mah-fill", type: "fill", source: "mah",
        paint: { "fill-color": "#CCCCCC", "fill-opacity": 0.55 } });
      map.addLayer({ id: "mah-line", type: "line", source: "mah",
        paint: { "line-color": "#333", "line-width": 0.6 } });

      // Boyamayı uygula
      applyChoropleth(mode);

      // Haritayı kapsa
      const coords = [];
      for (const f of all.features) {
        const g = f.geometry; if (!g) continue;
        if (g.type === "Polygon") coords.push(...g.coordinates.flat(1));
        else if (g.type === "MultiPolygon") coords.push(...g.coordinates.flat(2));
      }
      if (coords.length) {
        const xs = coords.map(c => c[0]), ys = coords.map(c => c[1]);
        map.fitBounds([[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]],
          { padding: 24, duration: 600 });
      }

      // Tıklama → 3 kritik alan
      map.on("click", "mah-fill", (e) => {
        const f = e.features?.[0]; if (!f) return;
        const p = f.properties || {};

        const name = getP(p, ["clean_name", "mahalle_adi", "Name", "name"], "Mahalle");
        const ilce = getP(p, ["ilce_adi", "district", "ilce"], "—");

        // Risk değeri (0–1 veya 0–100 her ikisini de yakala)
        let risk = getP(p, ["combined_risk_index", "risk_score"], null);
        if (risk === null) {
          const tr = getP(p, ["bilesik_risk_skoru"], null);
          if (tr !== null) risk = Number(tr) > 1 ? Number(tr) : Number(tr) * 100;
        }
        const label = getP(p, ["risk_label_5li", "risk_label_normalized", "risk_label", "label"], null);
        const vs30 = getP(p, ["vs30"], null);

        const html = `
          <div style="font:12px/1.4 system-ui,sans-serif;">
            <div style="font-weight:700;margin-bottom:4px">${name}</div>
            <div>İlçe: <b>${ilce}</b></div>
            <div>Risk: <b>${risk !== null ? Number(risk).toFixed(2) : "-"}</b>${label !== null ? ` <span style="opacity:.8">(label: ${label})</span>` : ""}</div>
            <div>VS30: <b>${vs30 !== null ? Number(vs30).toFixed(0) : "-"}</b> m/s</div>
          </div>`;
        popupRef.current.setLngLat(e.lngLat).setHTML(html).addTo(map);
      });

      map.on("mouseenter", "mah-fill", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "mah-fill", () => (map.getCanvas().style.cursor = ""));
    });

    return () => { popupRef.current?.remove(); map.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { applyChoropleth(mode); }, [mode]);

  return (
    <>
      {/* Mod seçici */}
      <div style={{
        position: "absolute", zIndex: 2, top: 16, left: 16,
        background: "rgba(255,255,255,.95)", padding: "8px 10px",
        borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,.15)",
        fontFamily: "system-ui, sans-serif", fontSize: 12
      }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Görselleştirme</div>
        <label style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
          <input type="radio" name="mode" value="risk"
            checked={mode === "risk"} onChange={() => setMode("risk")} />
          Risk Skoru
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="radio" name="mode" value="vs30"
            checked={mode === "vs30"} onChange={() => setMode("vs30")} />
          VS30 (m/s)
        </label>
      </div>

      <div ref={mapDivRef} style={{ width: "100vw", height: "100vh" }} />
    </>
  );
}
