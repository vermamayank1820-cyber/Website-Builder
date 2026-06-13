import { SiteNav } from "./_components/SiteNav";
import { Hero } from "./_components/Hero";
import { LogoMarquee } from "./_components/LogoMarquee";
import { FeatureShowcase } from "./_components/FeatureShowcase";
import { Workflow } from "./_components/Workflow";
import { Metrics } from "./_components/Metrics";
import { PullQuote } from "./_components/PullQuote";
import { FinalCTA } from "./_components/FinalCTA";
import { SiteFooter } from "./_components/SiteFooter";

export default function MeridianPage() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <LogoMarquee />
        <FeatureShowcase />
        <Workflow />
        <Metrics />
        <PullQuote />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
