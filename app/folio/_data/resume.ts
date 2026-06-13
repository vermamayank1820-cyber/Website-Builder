/**
 * FIXTURE RESUME — synthesized demo input for the Resume → Portfolio
 * pipeline. Not a real person. This module stands in for the parsed output
 * of a PDF/DOCX/text resume so the rendered site is driven entirely by
 * structured data (resume → data → site), exactly as the pipeline would.
 */

export interface ResumeRole {
  org: string;
  title: string;
  period: string;
  location: string;
  blurb: string;
}

export interface ResumeProject {
  index: string;
  name: string;
  kind: string;
  year: string;
  summary: string;
  outcome: string;
  stack: string[];
}

export interface Resume {
  name: string;
  initials: string;
  headline: string;
  location: string;
  summary: string;
  roles: ResumeRole[];
  projects: ResumeProject[];
  skills: string[];
  writing: { title: string; venue: string; year: string }[];
  education: string;
  voice: string;
}

export const RESUME: Resume = {
  name: "Priya Raman",
  initials: "PR",
  headline: "Design Engineer & Creative Technologist",
  location: "Berlin, prev. Bangalore",
  summary:
    "I work at the seam where design becomes code — interfaces, design systems, and generative work that teams can actually ship. I care about the millimetre and the millisecond.",
  roles: [
    {
      org: "Independent",
      title: "Design Engineer — studio of one",
      period: "2022 — now",
      location: "Berlin",
      blurb:
        "Seed to Series B teams hire me for the interactions they're told are impossible: design systems, motion layers, and live data canvases. Fintech, climate, developer tools.",
    },
    {
      org: "Stripe",
      title: "Design Engineer, Design Systems",
      period: "2019 — 2022",
      location: "Remote",
      blurb:
        "Built the motion and theming layer of the design system behind Checkout surfaces — the part that makes a payment feel calm instead of fragile.",
    },
    {
      org: "Obvious",
      title: "Interaction Designer",
      period: "2016 — 2019",
      location: "Bangalore",
      blurb:
        "Consumer apps for millions of first-time-internet users. Started the studio's prototyping practice; learned that taste is a craft, not a gift.",
    },
  ],
  projects: [
    {
      index: "01",
      name: "Tideline",
      kind: "Real-time data canvas",
      year: "2024",
      summary:
        "A live coastline that redraws itself from flood-sensor data for a climate-risk startup — risk you can feel, not just read.",
      outcome: "Cut time-to-insight for analysts from minutes to a glance.",
      stack: ["WebGL", "TypeScript", "signed distance fields"],
    },
    {
      index: "02",
      name: "Plotter Type",
      kind: "Open-source tool · Config talk",
      year: "2023",
      summary:
        "A pipeline that turns variable fonts into pen-plotter paths — letterforms drawn by a machine, one continuous line at a time.",
      outcome: "1.4k stars · talk at Config 2023.",
      stack: ["Canvas", "OpenType.js", "G-code"],
    },
    {
      index: "03",
      name: "Calm Motion",
      kind: "Design system motion language",
      year: "2022",
      summary:
        "A motion grammar for a fintech's design system — spring curves and interruption rules that made the whole product feel steadier.",
      outcome: "40% faster perceived load · zero new jank budget.",
      stack: ["Framer Motion", "spring physics", "a11y"],
    },
  ],
  skills: [
    "TypeScript / React",
    "WebGL / Canvas",
    "Design systems",
    "Motion & interaction",
    "Creative coding",
    "Figma plugins",
    "Accessibility",
  ],
  writing: [
    { title: "Craft at the seam of design and code", venue: "Essay", year: "2024" },
    { title: "Why motion is an accessibility problem", venue: "Smashing Conf", year: "2023" },
    { title: "Drawing letterforms with a robot", venue: "Config", year: "2023" },
  ],
  education: "B.Des — National Institute of Design",
  voice: "precise, generous, quietly confident, a little wry",
};
