export const ecommerceTemplateCode = `function Page() {
  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="bg-stone-900 py-2 text-center text-xs font-medium tracking-wide text-stone-100">Free carbon-neutral shipping over $75 · Returns within 60 days</div>

      <nav className="sticky top-0 z-50 border-b border-stone-200 bg-[#fcfbf9]/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">Field & Form</span>
          <div className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex">
            <a href="#shop" className="hover:text-stone-900">Shop</a>
            <a href="#story" className="hover:text-stone-900">Our story</a>
            <a href="#reviews" className="hover:text-stone-900">Reviews</a>
          </div>
          <a href="#shop" className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700">Shop the drop</a>
        </div>
      </nav>

      <header className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-16 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Spring collection · live now</p>
          <h1 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">Everyday goods, built to outlive trends</h1>
          <p className="mt-5 max-w-md text-lg text-stone-600">Small-batch apparel and home goods in natural fibers — made by workshops we visit, priced without the markup theater.</p>
          <div className="mt-8 flex gap-4">
            <a href="#shop" className="rounded-full bg-amber-700 px-8 py-3.5 text-sm font-semibold text-white hover:bg-amber-600">Shop new arrivals</a>
            <a href="#story" className="rounded-full border border-stone-300 px-8 py-3.5 text-sm font-semibold text-stone-700 hover:border-stone-500">Why we exist</a>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80&auto=format&fit=crop" alt="Inside the Field & Form flagship store" width="1400" height="1000" className="h-[420px] w-full rounded-3xl object-cover" />
      </header>

      <section id="shop" className="border-t border-stone-200 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Best sellers</h2>
            <a href="#" className="text-sm font-semibold text-amber-700 hover:underline">View all →</a>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80&auto=format&fit=crop", "The Weekend Shirt", "Organic cotton twill", "$88"],
              ["https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80&auto=format&fit=crop", "Atelier Jacket", "Belgian linen, garment-dyed", "$240"],
              ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80&auto=format&fit=crop", "City Tote", "Vegetable-tanned leather", "$165"],
            ].map(([src, name, detail, price]) => (
              <article key={name} className="group">
                <div className="overflow-hidden rounded-2xl bg-stone-100">
                  <img src={src} alt={name} width="1200" height="1400" className="h-80 w-full object-cover transition duration-300 group-hover:scale-105" />
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <h3 className="font-semibold">{name}</h3>
                    <p className="text-sm text-stone-500">{detail}</p>
                  </div>
                  <span className="font-bold">{price}</span>
                </div>
                <button type="button" className="mt-3 w-full rounded-full border border-stone-300 py-2.5 text-sm font-semibold transition hover:bg-stone-900 hover:text-white">Add to cart</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="bg-stone-900 py-20 text-stone-100">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">Our story</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">Three workshops. Forty styles. Zero landfill.</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-stone-300">We started Field & Form after a decade in fast fashion, tired of watching good materials become disposable product. Every piece is cut to order from deadstock and certified natural fibers, sewn in workshops we audit ourselves.</p>
          <div className="mt-12 grid grid-cols-3 gap-8">
            {[["100%", "natural fibers"], ["60-day", "no-questions returns"], ["12k+", "five-star orders"]].map(([stat, label]) => (
              <div key={label}>
                <p className="text-3xl font-extrabold text-amber-400">{stat}</p>
                <p className="mt-1 text-sm text-stone-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Loved hard, worn often</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["“The Weekend Shirt has survived two years of weekly wear and still looks new.”", "Priya N."],
              ["“Finally a brand whose ‘sustainable’ label survives a closer look.”", "Marcus T."],
              ["“Bought one tote. Came back for four more as gifts.”", "Elena V."],
            ].map(([quote, name]) => (
              <figure key={name} className="rounded-2xl border border-stone-200 bg-white p-7">
                <p className="text-amber-500">★★★★★</p>
                <blockquote className="mt-3 text-sm leading-relaxed text-stone-700">{quote}</blockquote>
                <figcaption className="mt-4 text-xs font-semibold text-stone-500">{name} · Verified buyer</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-10 text-center text-sm text-stone-500">
        © 2026 Field & Form · Shipping · Returns · Care guide
      </footer>
    </div>
  );
}`
