import { GenerativeField } from "./GenerativeField";
import { RESUME } from "../_data/resume";

export function SceneHero() {
  return (
    <section id="top" className="f-hero">
      <div className="f-hero-canvas">
        <GenerativeField />
      </div>
      <div className="f-hero-scrim" />

      <div className="f-hero-inner f-container">
        <span className="f-eyebrow">Design Engineer · Creative Technologist</span>

        <h1 className="f-display" style={{ marginTop: "1.5rem", maxWidth: "16ch" }}>
          Design that<br />survives<br />
          <span className="f-blue">contact with code.</span>
        </h1>

        <div className="f-hero-meta">
          <p className="f-lead" style={{ maxWidth: "40ch", flex: "1 1 28rem" }}>
            {RESUME.summary}
          </p>
          <div className="f-coord" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", lineHeight: 1.6 }}>
            <span>{RESUME.name}</span>
            <span>{RESUME.location}</span>
            <span style={{ color: "var(--f-blue)" }}>Available · Q3</span>
          </div>
        </div>
      </div>
    </section>
  );
}
