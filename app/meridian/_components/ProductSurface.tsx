/**
 * The Meridian app, rendered entirely in CSS/SVG — the product *is* the
 * proof. A release-intelligence view: blast radius across services, a risk
 * score, and the change narrative. No screenshots, no images.
 */

interface Service {
  name: string;
  status: "ok" | "warn" | "risk";
  load: number; // 0..100 confidence/coverage
  note: string;
}

const SERVICES: Service[] = [
  { name: "api-gateway", status: "ok", load: 96, note: "no schema drift" },
  { name: "payments", status: "warn", load: 72, note: "2 flagged queries" },
  { name: "search-index", status: "ok", load: 91, note: "warm, healthy" },
  { name: "billing-worker", status: "risk", load: 41, note: "migration pending" },
];

const STATUS_COLOR: Record<Service["status"], string> = {
  ok: "var(--m-ok)",
  warn: "var(--m-warn)",
  risk: "var(--m-risk)",
};

const RAIL = [
  { label: "Overview", active: true },
  { label: "Releases", active: false },
  { label: "Blast radius", active: false },
  { label: "Rollbacks", active: false },
  { label: "Signals", active: false },
];

export function ProductSurface() {
  return (
    <div className="m-surface" role="img" aria-label="Meridian release overview showing four services with health meters and a risk score">
      <div className="m-surface-glow" aria-hidden="true" />

      <div className="m-surface-bar">
        <div className="m-surface-dots" aria-hidden="true">
          <span /><span /><span />
        </div>
        <span style={{ fontFamily: "var(--m-mono)", fontSize: "0.72rem", color: "var(--m-muted)" }}>
          meridian / web · release 4.21
        </span>
        <span
          className="m-chip"
          style={{ marginLeft: "auto", borderColor: "var(--m-accent-line)", color: "var(--m-accent)" }}
        >
          <span className="m-chip-dot m-live-dot" style={{ background: "var(--m-accent)" }} />
          deploying
        </span>
      </div>

      <div className="m-surface-body">
        <aside className="m-surface-rail" aria-hidden="true">
          <div style={{ fontFamily: "var(--m-mono)", fontSize: "0.62rem", letterSpacing: "0.12em", color: "var(--m-faint)", padding: "0 0.6rem 0.5rem", textTransform: "uppercase" }}>
            Workspace
          </div>
          {RAIL.map((item) => (
            <div key={item.label} className={`m-rail-item ${item.active ? "is-active" : ""}`}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: item.active ? "var(--m-accent)" : "var(--m-line-3)" }} />
              {item.label}
            </div>
          ))}
        </aside>

        <div className="m-surface-main">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <div style={{ fontFamily: "var(--m-display)", fontSize: "1.25rem", letterSpacing: "-0.01em" }}>
                Blast radius
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--m-muted)" }}>
                4 services touched · 18 commits · 3 authors
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--m-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", color: "var(--m-faint)", textTransform: "uppercase" }}>
                Risk score
              </div>
              <div style={{ fontFamily: "var(--m-display)", fontSize: "1.9rem", lineHeight: 1, color: "var(--m-warn)" }}>
                34<span style={{ fontSize: "0.9rem", color: "var(--m-faint)" }}>/100</span>
              </div>
            </div>
          </div>

          <div>
            {SERVICES.map((svc, i) => (
              <div key={svc.name} className="m-svc-row">
                <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: STATUS_COLOR[svc.status] }} />
                    <span style={{ fontFamily: "var(--m-mono)", fontSize: "0.78rem", color: "var(--m-ink)" }}>{svc.name}</span>
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--m-faint)", paddingLeft: "1.2rem" }}>{svc.note}</span>
                </div>
                <div className="m-meter" aria-hidden="true">
                  <span
                    style={{
                      width: `${svc.load}%`,
                      background: STATUS_COLOR[svc.status],
                      animationDelay: `${0.3 + i * 0.12}s`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
