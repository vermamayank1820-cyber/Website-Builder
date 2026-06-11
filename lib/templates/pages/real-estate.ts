export const realEstateTemplateCode = `function Page() {
  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">Meridian Estates</span>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#listings" className="hover:text-slate-900">Listings</a>
            <a href="#why" className="hover:text-slate-900">Why Meridian</a>
            <a href="#contact" className="hover:text-slate-900">Contact</a>
          </div>
          <a href="#contact" className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">Book a viewing</a>
        </div>
      </nav>

      <header className="relative">
        <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80&auto=format&fit=crop" alt="A Meridian listing at dusk" width="1920" height="1080" className="h-[70vh] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-14 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Bay Area · Est. 2009</p>
          <h1 className="mt-3 max-w-2xl text-5xl font-extrabold tracking-tight">Homes chosen like we&apos;d live there ourselves</h1>
          <p className="mt-4 max-w-lg text-slate-200">A boutique brokerage representing 40 exceptional properties a year — never more.</p>
        </div>
      </header>

      <section id="listings" className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Featured listings</h2>
          <a href="#contact" className="text-sm font-semibold text-emerald-700 hover:underline">View all →</a>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop", "Marin Hillside Modern", "4 bd · 3.5 ba · 3,480 sq ft", "$3,250,000"],
            ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop", "Palo Alto Villa", "5 bd · 5 ba · pool & studio", "$6,900,000"],
            ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80&auto=format&fit=crop", "Noe Valley Craftsman", "3 bd · 2 ba · 2,150 sq ft", "$2,180,000"],
          ].map(([src, title, specs, price]) => (
            <article key={title} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl">
              <div className="overflow-hidden">
                <img src={src} alt={title} width="1200" height="800" className="h-56 w-full object-cover transition duration-300 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{specs}</p>
                <p className="mt-3 text-lg font-bold text-emerald-700">{price}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="why" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format&fit=crop" alt="A staged Meridian interior" width="1200" height="900" className="h-96 w-full rounded-2xl object-cover" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Fewer clients. Better outcomes.</h2>
            <div className="mt-8 space-y-6">
              {[
                ["12 days", "average time on market vs. 31-day area average"],
                ["103%", "of asking price achieved across 2025 sales"],
                ["1:1", "a senior partner on every transaction — no handoffs"],
              ].map(([stat, body]) => (
                <div key={stat} className="flex items-baseline gap-5">
                  <span className="w-24 shrink-0 text-2xl font-extrabold text-emerald-700">{stat}</span>
                  <p className="text-sm leading-relaxed text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Tell us what home means to you</h2>
          <p className="mt-3 text-slate-600">We&apos;ll reply within a business day with a tailored shortlist.</p>
          <form className="mt-8 space-y-3 text-left" onSubmit={(e) => e.preventDefault()}>
            <input type="text" required placeholder="Your name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none" />
            <input type="email" required placeholder="Email address" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none" />
            <textarea rows="3" placeholder="Neighborhoods, budget, must-haves…" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none" />
            <button type="submit" className="w-full rounded-xl bg-emerald-700 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600">Request shortlist</button>
          </form>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10 text-center text-sm text-slate-500">
        © 2026 Meridian Estates · DRE #01923456 · San Francisco
      </footer>
    </div>
  );
}`
