"use client";

import CinematicHero        from "../components/CinematicHero";
import MarqueeBand          from "../components/MarqueeBand";
import ManifestoSection     from "../components/ManifestoSection";
import VisualInterlude      from "../components/VisualInterlude";
import ProductRevealSection from "../components/ProductRevealSection";
import StatsSection         from "../components/StatsSection";
import AIConversationSection from "../components/AIConversationSection";
import FeatureScenesSection from "../components/FeatureScenesSection";
import TestimonialStrip     from "../components/TestimonialStrip";
import FinalCTA             from "../components/FinalCTA";
import Footer               from "../components/Footer";

export default function Home() {
  return (
    <main style={{ background: "#050507", color: "#f0f0f8", overflowX: "hidden" }}>

      {/* ① Hero — full screen cinematic opener */}
      <CinematicHero />

      {/* Kinetic marquee band — product attributes in motion */}
      <MarqueeBand />

      {/* ② One editorial statement over atmosphere image */}
      <ManifestoSection />

      {/* ③ Amber network interlude — pure visual breath */}
      <VisualInterlude
        image="/vis-network.png"
        tint="rgba(5,5,7,0.32)"
        height="52vh"
        caption="YOUR MONEY · CONNECTED · INTELLIGENT"
      />

      {/* ④ Product — frame only, no section header */}
      <ProductRevealSection />

      {/* ⑤ Stats — three animated numbers, minimal */}
      <StatsSection />

      {/* Blue atmosphere interlude — pure visual, no text */}
      <VisualInterlude
        image="/vis-atmosphere.png"
        imagePos="center 40%"
        tint="rgba(5,5,7,0.48)"
        height="40vh"
      />

      {/* ⑥ AI conversation — starts immediately, no header */}
      <AIConversationSection />

      {/* ⑦ Feature reel — horizontal scroll, minimal copy */}
      <FeatureScenesSection />

      {/* Bloom interlude — breath before voices */}
      <VisualInterlude
        image="/vis-bloom.png"
        tint="rgba(5,5,7,0.38)"
        height="42vh"
        parallax={false}
      />

      {/* ⑧ Testimonials — kinetic quote marquee, two rows */}
      <TestimonialStrip />

      {/* ⑨ Final CTA — "Your turn." + 2 buttons */}
      <FinalCTA />

      <Footer />
    </main>
  );
}
