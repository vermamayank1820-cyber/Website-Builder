export const startupTemplateCode = `function Page() {
  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">Northwind</span>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#product" className="hover:text-slate-900">Product</a>
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
          </div>
          <a href="#cta" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Get early access</a>
        </div>
      </nav>

      <header className="mx-auto max-w-6xl px-6 pb-24 pt-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">Backed by Founders Fund · Seed round open</span>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-extrabold tracking-tight md:text-6xl">Launch your idea before your coffee gets cold</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">Northwind turns rough product ideas into validated landing experiments, so your team ships what users actually want.</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a href="#cta" className="rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500">Start free</a>
          <a href="#how" className="rounded-full border border-slate-200 px-7 py-3.5 text-sm font-semibold text-slate-700 hover:border-slate-400">See how it works</a>
        </div>
        <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200">
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80&auto=format&fit=crop" alt="The Northwind team collaborating in the studio" width="1600" height="900" className="h-72 w-full object-cover md:h-96" />
        </div>
      </header>

      <section id="product" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Everything a tiny team needs to move fast</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["⚡", "Idea to live page", "Describe the experiment and get a hosted page with analytics in minutes."],
              ["📊", "Signal, not noise", "Conversion benchmarks tuned for pre-launch products, not mature funnels."],
              ["🔁", "Iterate weekly", "Duplicate, tweak, and re-run experiments without engineering time."],
            ].map(([icon, title, body]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Three steps to your first validated idea</h2>
          <ol className="mt-12 space-y-6">
            {[
              ["01", "Describe the experiment", "Write one paragraph about the audience and the promise you want to test."],
              ["02", "Ship the page", "Northwind builds the page, wires the analytics, and gives you a share link."],
              ["03", "Read the verdict", "A clear go / refine / kill recommendation lands in your inbox after 7 days."],
            ].map(([step, title, body]) => (
              <li key={step} className="flex gap-6 rounded-2xl border border-slate-200 p-6">
                <span className="text-2xl font-extrabold text-indigo-600">{step}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="cta" className="bg-slate-900 py-20 text-center text-white">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-4xl font-extrabold tracking-tight">Validate your next big thing</h2>
          <p className="mt-4 text-slate-300">Join 2,400+ founders running smarter pre-launch experiments.</p>
          <form className="mx-auto mt-8 flex max-w-md gap-3" onSubmit={(e) => e.preventDefault()}>
            <input type="email" required placeholder="you@startup.com" className="w-full rounded-full border border-slate-700 bg-slate-800 px-5 py-3 text-sm text-white placeholder-slate-400 focus:border-indigo-400 focus:outline-none" />
            <button type="submit" className="shrink-0 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold hover:bg-indigo-400">Join</button>
          </form>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10 text-center text-sm text-slate-500">
        © 2026 Northwind Labs · Privacy · Terms
      </footer>
    </div>
  );
}`
