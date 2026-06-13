import { Wordmark } from "./Wordmark";
import { ArrowUpRight } from "./icons";

const COLUMNS = [
  { title: "Product", links: ["Overview", "Blast radius", "Rollbacks", "Changelog", "Pricing"] },
  { title: "Company", links: ["About", "Customers", "Careers", "Security"] },
  { title: "Resources", links: ["Docs", "API", "Status", "Changelog"] },
];

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--m-line)", paddingBlock: "clamp(3rem, 2rem + 3vw, 5rem)" }}>
      <div className="m-container">
        <div className="m-footer-grid">
          <div className="m-footer-col">
            <Wordmark />
            <p style={{ marginTop: "1.25rem", color: "var(--m-muted)", fontSize: "0.9rem", maxWidth: "26ch", lineHeight: 1.55 }}>
              Release intelligence for engineering teams who ship with taste.
            </p>
            <a
              href="#start"
              className="m-link"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginTop: "1.5rem", color: "var(--m-accent)" }}
            >
              Start free <ArrowUpRight />
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="m-footer-col">
              <h4>{col.title}</h4>
              {col.links.map((link) => (
                <a key={link} href="#">{link}</a>
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "clamp(2.5rem, 2rem + 3vw, 4rem)",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--m-line)",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.8rem",
            color: "var(--m-faint)",
          }}
        >
          <span style={{ fontFamily: "var(--m-mono)", letterSpacing: "0.04em" }}>
            © {new Date().getFullYear()} Meridian Systems, Inc.
          </span>
          <span style={{ display: "flex", gap: "1.5rem" }}>
            <a href="#" className="m-link" style={{ color: "var(--m-muted)" }}>Privacy</a>
            <a href="#" className="m-link" style={{ color: "var(--m-muted)" }}>Terms</a>
            <a href="#" className="m-link" style={{ color: "var(--m-muted)" }}>Security</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
