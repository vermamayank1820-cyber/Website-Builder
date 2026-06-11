export const saasTemplateCode = `function Page() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">Pulseboard</span>
          <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#metrics" className="hover:text-white">Customers</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </div>
          <a href="#pricing" className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Start free trial</a>
        </div>
      </nav>

      <header className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-20 lg:grid-cols-2">
        <div>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300">New · AI anomaly alerts</span>
          <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight">Product analytics your whole team will actually read</h1>
          <p className="mt-5 max-w-md text-lg text-slate-400">Pulseboard turns raw events into plain-language insights, delivered where your team already works.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#pricing" className="rounded-lg bg-cyan-500 px-7 py-3.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Start 14-day trial</a>
            <a href="#features" className="rounded-lg border border-white/15 px-7 py-3.5 text-sm font-semibold text-slate-200 hover:border-white/40">Live demo</a>
          </div>
          <p className="mt-5 text-xs text-slate-500">No credit card required · SOC 2 Type II</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-cyan-500/5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-sm font-semibold">Weekly active users</span>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">▲ 18.2%</span>
          </div>
          <div className="mt-5 flex h-40 items-end gap-2">
            {[34, 48, 41, 58, 52, 66, 74, 69, 82, 78, 91, 100].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-cyan-600 to-cyan-400" style={{ height: h + "%" }} />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[["12.4k", "Active users"], ["3.1%", "Churn"], ["$48k", "MRR"]].map(([value, label]) => (
              <div key={label} className="rounded-xl bg-white/5 p-3 text-center">
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[11px] text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section id="features" className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Built for teams who hate dashboards</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["Plain-language insights", "Every chart ships with a sentence explaining what changed and why it matters."],
              ["Anomaly alerts", "Get pinged in Slack the moment a metric moves outside its normal band."],
              ["One-click reports", "Board-ready summaries generated from live data, not stale screenshots."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
                <div className="h-1.5 w-10 rounded-full bg-cyan-400" />
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="metrics" className="border-t border-white/10 bg-white/[0.02] py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
          {[["4,200+", "Teams"], ["1.2B", "Events / day"], ["99.99%", "Uptime"], ["4.8/5", "G2 rating"]].map(([value, label]) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-cyan-300">{value}</p>
              <p className="mt-1 text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Simple pricing</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 p-8">
              <h3 className="font-semibold">Starter</h3>
              <p className="mt-3 text-4xl font-extrabold">$0<span className="text-base font-medium text-slate-400">/mo</span></p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-400">
                <li>✓ 50k events / month</li>
                <li>✓ 3 teammates</li>
                <li>✓ 30-day history</li>
              </ul>
              <a href="#" className="mt-8 block rounded-lg border border-white/15 py-3 text-center text-sm font-semibold hover:border-white/40">Start free</a>
            </div>
            <div className="rounded-2xl border border-cyan-400/40 bg-cyan-500/5 p-8">
              <h3 className="font-semibold text-cyan-300">Growth</h3>
              <p className="mt-3 text-4xl font-extrabold">$79<span className="text-base font-medium text-slate-400">/mo</span></p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-300">
                <li>✓ Unlimited events</li>
                <li>✓ Unlimited teammates</li>
                <li>✓ AI insights + alerts</li>
              </ul>
              <a href="#" className="mt-8 block rounded-lg bg-cyan-500 py-3 text-center text-sm font-semibold text-slate-950 hover:bg-cyan-400">Start trial</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-slate-500">
        © 2026 Pulseboard, Inc. · Security · Status · Docs
      </footer>
    </div>
  );
}`
