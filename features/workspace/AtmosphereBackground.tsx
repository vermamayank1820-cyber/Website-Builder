/**
 * Cinematic backdrop: pure black base with three ultra-soft atmospheric
 * color fields (violet / indigo / magenta) at single-digit opacities and
 * 300px+ blurs — no visible glow centers or color circles — finished
 * with film grain and a full-viewport glass haze that sits between the
 * atmosphere and the content, like looking through layers of dark glass.
 */
export function AtmosphereBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Layer 1 — pure black base */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* Layer 2 — massive ultra-soft violet atmosphere, center-top */}
      <div className="absolute left-1/2 top-[-30rem] h-[70rem] w-[110rem] -translate-x-1/2">
        <div className="animate-glow-slower h-full w-full rounded-full bg-[#7c5cf6] opacity-[0.07] blur-[320px]" />
      </div>

      {/* Layer 3 — deep indigo ambient light, right side */}
      <div className="absolute right-[-30rem] top-[10%] h-[60rem] w-[70rem]">
        <div className="animate-glow-slow h-full w-full rounded-full bg-[#3730a3] opacity-[0.05] blur-[400px]" />
      </div>

      {/* Layer 4 — subtle magenta atmosphere, bottom left */}
      <div className="absolute bottom-[-20rem] left-[-25rem] h-[55rem] w-[65rem]">
        <div className="animate-glow-slower h-full w-full rounded-full bg-[#a21caf] opacity-[0.04] blur-[350px]" />
      </div>

      {/* Layer 5 — film grain, barely there */}
      <div className="bg-noise absolute inset-0 opacity-[0.025]" />

      {/* Layer 6 — glass haze between atmosphere and content */}
      <div className="absolute inset-0 bg-[#050505]/25 backdrop-blur-3xl" />

      {/* Soft cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(140%_100%_at_50%_30%,transparent_55%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  )
}
