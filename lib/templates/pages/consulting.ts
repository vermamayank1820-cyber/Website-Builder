export const consultingTemplateCode = `function Page() {
  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">Harbor & Gray</span>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#practice" className="hover:text-slate-900">Practice areas</a>
            <a href="#results" className="hover:text-slate-900">Results</a>
            <a href="#team" className="hover:text-slate-900">Team</a>
          </div>
          <a href="#contact" className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Schedule consultation</a>
        </div>
      </nav>

      <header className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-20 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">Operations & growth consultancy</p>
          <h1 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight">Clarity for companies at an inflection point</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-600">We work with leadership teams navigating scale, succession, and turnarounds — bringing thirty years of operator experience, not slideware.</p>
          <div className="mt-8 flex gap-4">
            <a href="#contact" className="rounded-lg bg-blue-700 px-7 py-3.5 text-sm font-semibold text-white hover:bg-blue-600">Book a working session</a>
            <a href="#results" className="rounded-lg border border-slate-300 px-7 py-3.5 text-sm font-semibold text-slate-700 hover:border-slate-500">Client outcomes</a>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1400&q=80&auto=format&fit=crop" alt="A Harbor & Gray strategy session" width="1400" height="1000" className="h-[420px] w-full rounded-2xl object-cover shadow-2xl shadow-slate-200" />
      </header>

      <section id="practice" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold tracking-tight">Practice areas</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Scale readiness", "Org design, operating cadence, and systems for companies doubling headcount."],
              ["Margin recovery", "Pricing, procurement, and process work that shows up in the P&L within two quarters."],
              ["Leadership transitions", "Succession planning and first-100-day support for incoming executives."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-7">
                <div className="h-1 w-10 rounded-full bg-blue-700" />
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="results" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold tracking-tight">Measured outcomes</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {[
              ["+9.4 pts", "EBITDA margin recovered for a $120M logistics firm in 14 months"],
              ["3 of 3", "family-business successions completed with leadership retained"],
              ["92%", "of engagements extended or referred by the client"],
            ].map(([stat, body]) => (
              <div key={stat} className="border-l-2 border-blue-700 pl-6">
                <p className="text-4xl font-extrabold text-slate-900">{stat}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
          <blockquote className="mt-14 rounded-2xl bg-slate-900 p-10 text-white">
            <p className="max-w-3xl text-xl font-medium leading-relaxed">“Harbor & Gray told us things our board wouldn&apos;t. Eighteen months later, the numbers speak for themselves.”</p>
            <footer className="mt-5 text-sm text-slate-400">— CEO, mid-market manufacturing client</footer>
          </blockquote>
        </div>
      </section>

      <section id="team" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&q=80&auto=format&fit=crop" alt="The Harbor & Gray partner team" width="1400" height="930" className="h-80 w-full rounded-2xl object-cover" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Partners, not analysts</h2>
            <p className="mt-5 leading-relaxed text-slate-600">Every engagement is staffed by a partner who has run a P&L — former COOs and CFOs from industrial, healthcare, and software businesses. We take four clients per partner, per year.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 text-center">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="text-3xl font-bold tracking-tight">Start with a working session</h2>
          <p className="mt-4 text-slate-600">Two hours with a partner. You leave with a diagnosis and a plan — whether or not you hire us.</p>
          <a href="mailto:engage@harborgray.com" className="mt-8 inline-block rounded-lg bg-blue-700 px-9 py-4 text-sm font-semibold text-white hover:bg-blue-600">engage@harborgray.com</a>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10 text-center text-sm text-slate-500">
        © 2026 Harbor & Gray LLC · Boston · Chicago
      </footer>
    </div>
  );
}`
