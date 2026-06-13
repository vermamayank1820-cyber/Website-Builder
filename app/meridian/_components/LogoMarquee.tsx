import { Reveal } from "./Reveal";

/**
 * Fictional customer wordmarks rendered as type (no faked real-brand
 * logos). Duplicated once so the -50% marquee keyframe loops seamlessly.
 */
const CUSTOMERS = [
  "Northwind",
  "Halcyon",
  "Cartograph",
  "Vellum",
  "Brightwire",
  "Lumen Labs",
  "Sundial",
  "Ironwood",
];

export function LogoMarquee() {
  const row = [...CUSTOMERS, ...CUSTOMERS];

  return (
    <section style={{ paddingBlock: "clamp(2.5rem, 2rem + 2vw, 4rem)" }} aria-label="Customers">
      <div className="m-container">
        <Reveal>
          <p
            style={{
              textAlign: "center",
              fontFamily: "var(--m-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--m-faint)",
              marginBottom: "2.25rem",
            }}
          >
            Trusted by teams who ship on Friday
          </p>
        </Reveal>
      </div>

      <div
        className="m-marquee"
        style={{
          position: "relative",
          maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div className="m-marquee-track" aria-hidden="true">
          {row.map((name, i) => (
            <span
              key={`${name}-${i}`}
              style={{
                fontFamily: "var(--m-display)",
                fontSize: "1.5rem",
                fontWeight: 480,
                letterSpacing: "-0.02em",
                color: "var(--m-ink)",
                opacity: 0.5,
                paddingInline: "2.4rem",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
