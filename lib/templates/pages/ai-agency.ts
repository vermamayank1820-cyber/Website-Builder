export const aiAgencyTemplateCode = `function Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav className="sticky top-0 z-50 border-b border-violet-500/10 bg-[#0a0a0f]/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">Synthetiq</span>
          <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a href="#services" className="hover:text-white">Services</a>
            <a href="#work" className="hover:text-white">Case studies</a>
            <a href="#process" className="hover:text-white">Process</a>
          </div>
          <a href="#contact" className="rounded-full border border-violet-400/40 bg-violet-500/10 px-5 py-2.5 text-sm font-semibold text-violet-200 hover:bg-violet-500/20">Book a call</a>
        </div>
      </nav>

      <header className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 max-w-3xl rounded-full bg-violet-600/20 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">AI implementation studio</p>
        <h1 className="relative mx-auto mt-6 max-w-3xl text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">We ship AI systems that pay for themselves</h1>
        <p className="relative mx-auto mt-6 max-w-xl text-lg text-zinc-400">Strategy, build, and deployment of production AI — from internal copilots to customer-facing agents — in weeks, not quarters.</p>
        <div className="relative mt-9 flex justify-center gap-4">
          <a href="#contact" className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:brightness-110">Start a project</a>
          <a href="#work" className="rounded-full border border-zinc-700 px-8 py-3.5 text-sm font-semibold text-zinc-300 hover:border-zinc-400">See results</a>
        </div>
      </header>

      <section id="services" className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold tracking-tight">What we build</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Custom copilots", "Internal assistants grounded in your data, deployed behind your SSO.", "◆"],
              ["Customer-facing agents", "Support and sales agents with guardrails, evals, and human handoff.", "◇"],
              ["Pipeline automation", "Document, email, and workflow automation measured in hours saved.", "◈"],
            ].map(([title, body, glyph]) => (
              <div key={title} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition hover:border-violet-400/40">
                <span className="text-2xl text-violet-400">{glyph}</span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="border-t border-white/5 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold tracking-tight">Recent outcomes</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Logistics enterprise", "−62%", "time spent on document intake after deploying an extraction pipeline"],
              ["Series B fintech", "4.2x", "support tickets resolved per agent with a grounded copilot"],
              ["Retail marketplace", "+$1.8M", "annual revenue from AI-assisted merchandising decisions"],
            ].map(([client, stat, body]) => (
              <div key={client} className="rounded-2xl border border-white/10 p-7">
                <p className="text-xs uppercase tracking-widest text-zinc-500">{client}</p>
                <p className="mt-3 bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-4xl font-extrabold text-transparent">{stat}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold tracking-tight">A process designed for production</h2>
          <div className="mt-10 space-y-4">
            {[
              ["Week 1", "Discovery sprint", "Map workflows, data, and the highest-ROI use case. You get a build plan with cost and impact estimates."],
              ["Weeks 2–5", "Build & evaluate", "Working system in your environment with eval suites, not demos in ours."],
              ["Week 6+", "Deploy & hand over", "Production rollout, team training, and runbooks. We stay on call, you own the system."],
            ].map(([phase, title, body]) => (
              <div key={phase} className="flex flex-col gap-2 rounded-2xl border border-white/10 p-6 md:flex-row md:items-baseline md:gap-8">
                <span className="w-28 shrink-0 text-sm font-semibold text-violet-300">{phase}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-white/5 py-20 text-center">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="text-4xl font-extrabold tracking-tight">Have a use case in mind?</h2>
          <p className="mt-4 text-zinc-400">Tell us about it. We respond within one business day with an honest take on feasibility and ROI.</p>
          <a href="mailto:hello@synthetiq.studio" className="mt-8 inline-block rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:brightness-110">hello@synthetiq.studio</a>
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 text-center text-sm text-zinc-600">
        © 2026 Synthetiq Studio · London & remote
      </footer>
    </div>
  );
}`
