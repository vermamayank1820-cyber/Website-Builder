import { Reveal } from "./Reveal";
import { RESUME } from "../_data/resume";

export function SceneContact() {
  return (
    <section id="contact" className="f-contact">
      <div className="f-scene f-container">
        <Reveal>
          <span className="f-eyebrow">Start a project</span>
        </Reveal>
        <Reveal delay={80}>
          <h2
            className="f-h2"
            style={{ marginTop: "1.75rem", color: "var(--f-paper)", maxWidth: "18ch" }}
          >
            Got an interaction everyone says is <span style={{ color: "#9db0ff" }}>impossible?</span>
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p style={{ marginTop: "1.5rem", color: "rgba(230,230,224,0.66)", fontSize: "1.15rem", lineHeight: 1.5, maxWidth: "44ch" }}>
            I take on a few engagements a quarter — design systems, prototypes,
            and the details that make a product feel inevitable. Tell me what
            you&rsquo;re building.
          </p>
        </Reveal>

        <Reveal delay={220}>
          <div style={{ marginTop: "clamp(2.5rem, 2rem + 3vw, 4rem)" }}>
            <a href="mailto:hello@priyaraman.studio" className="f-contact-mail">
              hello@priyaraman.studio
            </a>
          </div>
        </Reveal>

        <Reveal delay={280}>
          <div
            style={{
              marginTop: "clamp(3rem, 2rem + 4vw, 5rem)",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(230,230,224,0.16)",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem 2rem",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="f-coord" style={{ color: "rgba(230,230,224,0.5)" }}>
              {RESUME.name} · {RESUME.location}
            </span>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {["GitHub", "Read the essays", "Are.na"].map((l) => (
                <a key={l} href="#" className="f-coord" style={{ color: "rgba(230,230,224,0.7)", textDecoration: "none" }}>
                  {l}
                </a>
              ))}
            </div>
            <span className="f-coord" style={{ color: "rgba(230,230,224,0.4)" }}>
              © {new Date().getFullYear()} — built by hand
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
