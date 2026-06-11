export const portfolioTemplateCode = `function Page() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <span className="text-sm font-bold uppercase tracking-[0.2em]">Ana Reyes</span>
        <div className="flex items-center gap-7 text-sm text-stone-500">
          <a href="#work" className="hover:text-stone-900">Work</a>
          <a href="#about" className="hover:text-stone-900">About</a>
          <a href="#contact" className="hover:text-stone-900">Contact</a>
        </div>
      </nav>

      <header className="mx-auto max-w-5xl px-6 pb-24 pt-16">
        <h1 className="max-w-3xl text-6xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
          Brand designer for products people <span className="italic underline decoration-orange-400 decoration-4 underline-offset-8">remember</span>
        </h1>
        <p className="mt-8 max-w-md text-lg leading-relaxed text-stone-600">I help early-stage teams find a visual voice — identity, packaging, and digital design from São Paulo, working worldwide.</p>
        <div className="mt-10 flex items-center gap-6 text-sm">
          <a href="#work" className="rounded-full bg-stone-900 px-7 py-3.5 font-semibold text-white hover:bg-stone-700">Selected work</a>
          <a href="#contact" className="font-semibold text-stone-600 underline underline-offset-4 hover:text-stone-900">Currently booking Q3 →</a>
        </div>
      </header>

      <section id="work" className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            ["Lume Coffee", "Identity & packaging", "bg-orange-100", "☕"],
            ["Tidal Finance", "Brand system & web", "bg-sky-100", "〰"],
            ["Foray Outdoors", "Identity & art direction", "bg-emerald-100", "△"],
            ["Plural Mag", "Editorial design", "bg-rose-100", "¶"],
          ].map(([title, kind, bg, glyph], i) => (
            <article key={title} className={"group cursor-pointer rounded-3xl p-10 transition hover:-translate-y-1 " + bg + (i % 2 === 1 ? " md:translate-y-10" : "")}>
              <span className="text-5xl">{glyph}</span>
              <h3 className="mt-16 text-2xl font-bold tracking-tight">{title}</h3>
              <p className="mt-1 text-sm text-stone-600">{kind}</p>
              <p className="mt-6 text-sm font-semibold text-stone-900 opacity-0 transition group-hover:opacity-100">View case study →</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="border-t border-stone-200 py-24">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-[1fr_2fr]">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">About</h2>
          <div className="space-y-6 text-lg leading-relaxed text-stone-700">
            <p>Ten years in, I still believe most brands don&apos;t need more decoration — they need a sharper point of view. My work starts with strategy and ends with systems your team can actually use.</p>
            <p>Previously at Wieden+Kennedy and Work & Co. Clients include early teams that went on to raise from a16z and Sequoia, and a few hundred-year-old companies that needed a new pulse.</p>
            <div className="flex flex-wrap gap-2 pt-2 text-xs font-semibold">
              {["Identity", "Packaging", "Art direction", "Design systems", "Web"].map((tag) => (
                <span key={tag} className="rounded-full border border-stone-300 px-3.5 py-1.5">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-stone-900 py-24 text-center text-stone-100">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="text-5xl font-extrabold tracking-tight">Let&apos;s make something worth keeping</h2>
          <p className="mt-5 text-stone-400">Projects start at $8k. One client at a time, full attention.</p>
          <a href="mailto:ana@anareyes.design" className="mt-9 inline-block rounded-full bg-orange-400 px-10 py-4 text-sm font-bold text-stone-900 hover:bg-orange-300">ana@anareyes.design</a>
        </div>
      </section>

      <footer className="bg-stone-900 pb-10 text-center text-xs text-stone-500">
        © 2026 Ana Reyes · São Paulo · Instagram · Dribbble
      </footer>
    </div>
  );
}`
