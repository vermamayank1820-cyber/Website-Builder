export const restaurantTemplateCode = `function Page() {
  return (
    <div className="min-h-screen bg-[#120e0a] text-stone-100" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <nav className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="text-xl tracking-[0.25em] text-amber-100">MAISON NOIR</span>
          <div className="hidden items-center gap-10 text-sm tracking-widest text-stone-300 md:flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <a href="#menu" className="hover:text-amber-200">MENU</a>
            <a href="#chef" className="hover:text-amber-200">CHEF</a>
            <a href="#reserve" className="hover:text-amber-200">RESERVATIONS</a>
          </div>
        </div>
      </nav>

      <header className="relative flex min-h-[90vh] items-center justify-center text-center">
        <img src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1920&q=80&auto=format&fit=crop" alt="The candle-lit dining room at Maison Noir" width="1920" height="1080" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#120e0a]/40 via-transparent to-[#120e0a]" />
        <div className="relative px-6">
          <p className="text-xs tracking-[0.5em] text-amber-200" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>EST. 2018 · ONE MICHELIN STAR</p>
          <h1 className="mt-6 text-6xl font-light italic md:text-7xl">A table worth crossing the city for</h1>
          <p className="mx-auto mt-6 max-w-md text-stone-300" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>Seasonal French cooking, a 400-bottle cellar, and twelve tables under candlelight.</p>
          <a href="#reserve" className="mt-10 inline-block border border-amber-200/60 px-10 py-4 text-xs tracking-[0.3em] text-amber-100 transition hover:bg-amber-200 hover:text-stone-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>RESERVE A TABLE</a>
        </div>
      </header>

      <section id="menu" className="mx-auto max-w-5xl px-6 py-24">
        <p className="text-center text-xs tracking-[0.4em] text-amber-200" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>TASTING MENU</p>
        <h2 className="mt-4 text-center text-4xl font-light italic">This season, on the table</h2>
        <div className="mt-14 grid gap-12 md:grid-cols-2">
          <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop" alt="A plated course from the tasting menu" width="1200" height="800" className="h-96 w-full rounded-sm object-cover" />
          <div className="flex flex-col justify-center space-y-8" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {[
              ["Velouté of white asparagus", "smoked crème fraîche, chive oil", "24"],
              ["Line-caught turbot", "young leeks, champagne beurre blanc", "58"],
              ["Aged duck à la presse", "cherries, foie gras jus — for two", "120"],
              ["Dark chocolate soufflé", "salted caramel, crème anglaise", "22"],
            ].map(([dish, detail, price]) => (
              <div key={dish} className="flex items-baseline justify-between gap-6 border-b border-stone-800 pb-4">
                <div>
                  <h3 className="text-base text-stone-100">{dish}</h3>
                  <p className="mt-1 text-sm text-stone-400">{detail}</p>
                </div>
                <span className="text-amber-200">{price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="chef" className="border-t border-stone-800 bg-[#17120c] py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.4em] text-amber-200" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>THE KITCHEN</p>
            <h2 className="mt-4 text-4xl font-light italic">Chef Élise Marchand</h2>
            <p className="mt-6 leading-relaxed text-stone-300" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>After a decade at three-star houses in Lyon and Paris, Élise returned home to cook the food she grew up with — elevated, precise, and unapologetically seasonal. The menu changes every six weeks; the standards never do.</p>
            <p className="mt-6 text-sm italic text-amber-200/80">“Luxury is a kitchen that says no to everything except the season.”</p>
          </div>
          <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1200&q=80&auto=format&fit=crop" alt="Chef Élise Marchand in the Maison Noir kitchen" width="1200" height="1500" className="h-[480px] w-full rounded-sm object-cover" />
        </div>
      </section>

      <section id="reserve" className="py-24 text-center">
        <div className="mx-auto max-w-xl px-6">
          <p className="text-xs tracking-[0.4em] text-amber-200" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>RESERVATIONS</p>
          <h2 className="mt-4 text-4xl font-light italic">Twelve tables. One sitting.</h2>
          <p className="mt-5 text-stone-300" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>Wednesday — Sunday, from 18:30. Reservations open on the first of each month.</p>
          <div className="mt-10 flex flex-col items-center gap-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <a href="tel:+33142000000" className="border border-amber-200/60 px-10 py-4 text-xs tracking-[0.3em] text-amber-100 transition hover:bg-amber-200 hover:text-stone-900">+33 1 42 00 00 00</a>
            <p className="text-xs text-stone-500">14 Rue de la Lune, Paris 2e</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-800 py-10 text-center text-xs tracking-widest text-stone-500" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        MAISON NOIR © 2026 · PARIS
      </footer>
    </div>
  );
}`
