import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ParticleCanvas from "./ParticleCanvas";
import "./landing2.css";

gsap.registerPlugin(ScrollTrigger);

// Zero body paragraphs. Scene = number + 4-word headline + chips + screenshot.
const SCENES = [
  {
    number: "01",
    label:  "Spending",
    title:  ["Every rupee,", "seen."],
    accent: "#818cf8",
    glow:   "rgba(79,70,229,0.16)",
    img:    "/dashboard-analytics.png",
    chips:  ["Cash flow", "37.6% saved", "Auto-tagged"],
  },
  {
    number: "02",
    label:  "Automation",
    title:  ["Bills.", "Never missed."],
    accent: "#38bdf8",
    glow:   "rgba(14,165,233,0.13)",
    img:    "/dashboard-main.png",
    chips:  ["30-day calendar", "EMI alerts", "SIP tracking"],
  },
  {
    number: "03",
    label:  "Goals",
    title:  ["10 years.", "Mapped."],
    accent: "#34d399",
    glow:   "rgba(16,185,129,0.13)",
    img:    "/dashboard-family.png",
    chips:  ["₹46L+ tracked", "Goal timelines", "Family view"],
  },
];

export default function FeatureScenesSection() {
  const containerRef = useRef(null);
  const trackRef     = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const track     = trackRef.current;
    if (!container || !track) return;

    const panels   = track.querySelectorAll(".nf2-scene");
    const getTravel = () => (panels.length - 1) * window.innerWidth;

    const ctx = gsap.context(() => {
      const tween = gsap.to(track, {
        x: () => -getTravel(),
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${getTravel()}`,
          pin: true, scrub: 1.1,
          anticipatePin: 1, invalidateOnRefresh: true,
        },
      });

      panels.forEach((panel, i) => {
        if (i === 0) return;
        const img     = panel.querySelector(".nf2-scene-img");
        const content = panel.querySelector(".nf2-scene-content");
        [img, content].forEach(el => {
          if (!el) return;
          gsap.fromTo(el,
            { opacity: 0, x: 50 },
            {
              opacity: 1, x: 0, duration: 0.75, ease: "power3.out",
              scrollTrigger: {
                trigger: panel, containerAnimation: tween,
                start: "left 75%", toggleActions: "play none none reverse",
              },
            }
          );
        });
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="nf2-scenes-container" style={{ height: "100vh" }}>
      <div ref={trackRef} className="nf2-scenes-track" style={{ height: "100vh" }}>
        {SCENES.map((scene, i) => (
          <div
            key={i}
            className="nf2-scene nf2-grid-bg"
            style={{ background: "#050507" }}
          >
            <div className="nf2-grain" />

            {/* Ambient orb */}
            <div className="nf2-orb absolute pointer-events-none" style={{
              width: 500, height: 500, top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              background: `radial-gradient(circle, ${scene.glow} 0%, transparent 65%)`,
              animationDuration: "9s",
            }} />

            {/* Particles */}
            <div className="absolute inset-0" style={{ zIndex: 1 }}>
              <ParticleCanvas count={18} color={scene.accent} opacity={0.1} speed={0.14} />
            </div>

            {/* Layout */}
            <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

              {/* Left — ultra-minimal text */}
              <div className="nf2-scene-content lg:w-[38%] space-y-5" style={i === 0 ? {} : { opacity: 0 }}>

                {/* Number + label row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="nf2-scene-number">{scene.number}</span>
                  <div style={{ width: 24, height: 1, background: "rgba(255,255,255,0.12)" }} />
                  <span style={{
                    fontFamily: "'Inter', sans-serif", fontSize: "0.65rem",
                    fontWeight: 500, color: scene.accent, letterSpacing: "0.22em",
                    textTransform: "uppercase",
                  }}>{scene.label}</span>
                </div>

                {/* Headline — max 4 words, split to 2 lines */}
                <h2 className="nf2-display" style={{ fontSize: "clamp(3rem, 5.5vw, 6rem)", lineHeight: 0.95 }}>
                  {scene.title[0]}
                  <br />
                  <span style={{ color: scene.accent }}>{scene.title[1]}</span>
                </h2>

                {/* Chips only — no paragraph */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, paddingTop: 4 }}>
                  {scene.chips.map((c, ci) => (
                    <span key={ci} style={{
                      fontFamily: "'Inter', sans-serif", fontSize: "0.7rem",
                      color: scene.accent, border: `1px solid ${scene.accent}28`,
                      borderRadius: 100, padding: "4px 11px",
                      background: `${scene.accent}0E`,
                    }}>{c}</span>
                  ))}
                </div>

                {/* Progress dots */}
                <div style={{ display: "flex", gap: 5, paddingTop: 6 }}>
                  {SCENES.map((_, di) => (
                    <div key={di} style={{
                      width: di === i ? 18 : 5, height: 5, borderRadius: 100,
                      background: di === i ? scene.accent : "rgba(255,255,255,0.1)",
                      transition: "all 0.3s",
                    }} />
                  ))}
                </div>
              </div>

              {/* Right — screenshot */}
              <div className="nf2-scene-img lg:w-[62%] relative" style={i === 0 ? {} : { opacity: 0 }}>
                <div style={{
                  position: "absolute", inset: -16,
                  background: `radial-gradient(ellipse, ${scene.glow} 0%, transparent 60%)`,
                  filter: "blur(28px)", borderRadius: 28,
                }} />
                <div style={{ position: "relative" }}>
                  <div style={{
                    borderRadius: 14, overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: `0 40px 120px rgba(0,0,0,0.92), 0 0 50px ${scene.glow}`,
                  }}>
                    <div className="nf2-product-chrome">
                      <div className="nf2-dot" style={{ background: "#FF5F57" }} />
                      <div className="nf2-dot" style={{ background: "#FFBD2E" }} />
                      <div className="nf2-dot" style={{ background: "#28CA41" }} />
                    </div>
                    <div className="nf2-sweep" />
                    <img
                      src={scene.img}
                      alt={scene.title.join(" ")}
                      style={{ width: "100%", display: "block", height: 430, objectFit: "cover", objectPosition: "top" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scene counter */}
            <div className="absolute bottom-8 right-10" style={{ zIndex: 10 }}>
              <span className="nf2-scene-number">{String(i + 1).padStart(2,"0")} / {String(SCENES.length).padStart(2,"0")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
