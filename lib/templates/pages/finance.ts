export const financeTemplateCode = `function Page() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1120]/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">Ledgerline</span>
          <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#product" className="hover:text-white">Product</a>
            <a href="#security" className="hover:text-white">Security</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </div>
          <a href="#cta" className="rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300">Open an account</a>
        </div>
      </nav>

      <header className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-20 lg:grid-cols-2">
        <div>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-300">4.6% APY on idle cash</span>
          <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight">Banking built for companies that watch every basis point</h1>
          <p className="mt-5 max-w-md text-lg text-slate-400">Operating accounts, treasury, and corporate cards in one ledger — with yield that starts on dollar one.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#cta" className="rounded-lg bg-amber-400 px-7 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-300">Open an account</a>
            <a href="#product" className="rounded-lg border border-white/15 px-7 py-3.5 text-sm font-semibold hover:border-white/40">Talk to sales</a>
          </div>
          <p className="mt-5 text-xs text-slate-500">FDIC insured up to $5M through partner banks · No monthly fees</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101830] p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Treasury overview</span>
            <span className="text-xs text-slate-500">Updated 2 min ago</span>
          </div>
          <p className="mt-4 text-4xl font-extrabold">$4,218,540<span className="text-lg text-slate-500">.22</span></p>
          <p className="mt-1 text-xs font-semibold text-emerald-400">+$14,302 yield earned this month</p>
          <div className="mt-6 space-y-3">
            {[
              ["Operating", "$820,540", "w-1/5"],
              ["Treasury · 4.6% APY", "$3,100,000", "w-4/5"],
              ["Cards", "$298,000", "w-1/12"],
            ].map(([label, amount, width]) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-slate-400"><span>{label}</span><span className="font-semibold text-slate-200">{amount}</span></div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/5"><div className={"h-full rounded-full bg-amber-400 " + width} /></div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section id="product" className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">One ledger for all your money movement</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["Treasury that works", "Automated sweeps between operating and yield accounts based on rules you set."],
              ["Cards with controls", "Issue unlimited virtual cards with per-vendor limits and real-time receipts."],
              ["Close-ready books", "Every transaction categorized and synced to your ERP the moment it settles."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
                <div className="h-1.5 w-10 rounded-full bg-amber-400" />
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Security your CFO can sign off on</h2>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[["SOC 2", "Type II"], ["$5M", "FDIC coverage"], ["SSO", "SAML + SCIM"], ["4-eyes", "payment approvals"]].map(([stat, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 p-6">
                <p className="text-2xl font-extrabold text-amber-300">{stat}</p>
                <p className="mt-1 text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 text-center">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="text-3xl font-bold tracking-tight">Free to operate. Paid to grow.</h2>
          <p className="mt-4 text-slate-400">No monthly fees, no minimums. We earn when your idle cash does.</p>
        </div>
      </section>

      <section id="cta" className="border-t border-white/10 py-20 text-center">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="text-4xl font-extrabold tracking-tight">Open your account in 10 minutes</h2>
          <p className="mt-4 text-slate-400">Join 6,000+ companies earning while they operate.</p>
          <a href="#" className="mt-8 inline-block rounded-lg bg-amber-400 px-10 py-4 text-sm font-bold text-slate-950 hover:bg-amber-300">Get started</a>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-xs leading-relaxed text-slate-600">
        © 2026 Ledgerline Financial Technologies, Inc. Ledgerline is a financial technology company, not a bank.<br />Banking services provided by partner banks, Members FDIC.
      </footer>
    </div>
  );
}`
