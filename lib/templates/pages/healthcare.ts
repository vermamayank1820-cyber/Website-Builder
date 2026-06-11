export const healthcareTemplateCode = `function Page() {
  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">+</span>
            Bluebird Health
          </span>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#services" className="hover:text-slate-900">Services</a>
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </div>
          <a href="#book" className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500">Book an appointment</a>
        </div>
      </nav>

      <header className="bg-gradient-to-b from-teal-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-20 lg:grid-cols-2">
          <div>
            <span className="rounded-full bg-teal-100 px-4 py-1.5 text-xs font-semibold text-teal-800">Now accepting new patients</span>
            <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight">Primary care that actually knows your name</h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600">Same-week appointments, 30-minute visits, and a care team you can message anytime — in clinic or from your couch.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#book" className="rounded-full bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-100 hover:bg-teal-500">Book your first visit</a>
              <a href="#services" className="rounded-full border border-slate-300 px-8 py-3.5 text-sm font-semibold text-slate-700 hover:border-teal-500">Explore services</a>
            </div>
            <p className="mt-5 text-xs text-slate-500">Most major insurance accepted · HIPAA-secure portal</p>
          </div>

          <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-xl shadow-teal-50">
            <p className="text-sm font-semibold text-slate-700">Next available appointments</p>
            <div className="mt-4 space-y-3">
              {[
                ["Today, 3:40 PM", "Video visit · Dr. Okafor", "teal"],
                ["Tomorrow, 9:10 AM", "In clinic · Dr. Lindqvist", "teal"],
                ["Thu, 1:00 PM", "Annual physical · Dr. Okafor", "slate"],
              ].map(([time, detail]) => (
                <div key={time} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold">{time}</p>
                    <p className="text-xs text-slate-500">{detail}</p>
                  </div>
                  <span className="rounded-full bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white">Book</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section id="services" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Care for the whole picture</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              ["🩺", "Primary care", "Annual physicals, chronic condition management, urgent concerns."],
              ["🧠", "Mental health", "Therapy and medication support integrated with your medical care."],
              ["🧪", "On-site labs", "Bloodwork during your visit, results in the portal within 24 hours."],
              ["💬", "24/7 messaging", "Real answers from your care team, not a call center."],
            ].map(([icon, title, body]) => (
              <div key={title} className="rounded-2xl border border-slate-100 p-6 transition hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50">
                <span className="text-3xl">{icon}</span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Membership, minus the mystery</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["1", "Join in 5 minutes", "Sign up online, add your insurance, pick your doctor."],
              ["2", "Meet your team", "A 30-minute first visit to build your baseline — no rushed intake."],
              ["3", "Stay connected", "Message anytime; same-week visits whenever you need them."],
            ].map(([step, title, body]) => (
              <div key={step} className="rounded-2xl bg-white p-7 text-center shadow-sm">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">{step}</span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Common questions</h2>
          <div className="mt-10 space-y-4">
            {[
              ["Do you take my insurance?", "We accept most major plans including Aetna, Blue Cross, Cigna, and United. Membership covers what insurance doesn't: messaging, same-week access, and longer visits."],
              ["Can I keep my specialists?", "Yes — we coordinate referrals and share records with any specialist you already see."],
              ["Is the portal really secure?", "All messaging and records run on a HIPAA-compliant, SOC 2-audited platform with end-to-end encryption."],
            ].map(([q, a]) => (
              <details key={q} className="group rounded-2xl border border-slate-200 p-5">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">{q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="book" className="bg-teal-700 py-20 text-center text-white">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="text-4xl font-extrabold tracking-tight">Your first visit, this week</h2>
          <p className="mt-4 text-teal-100">Join 9,000+ patients who stopped dreading the doctor&apos;s office.</p>
          <a href="#" className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-sm font-bold text-teal-700 hover:bg-teal-50">Book an appointment</a>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-slate-500">
        © 2026 Bluebird Health · Privacy practices · Patient rights · Careers
      </footer>
    </div>
  );
}`
