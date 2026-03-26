import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ParticleCanvas from "./ParticleCanvas";
import "./landing2.css";

gsap.registerPlugin(ScrollTrigger);

// Zero paragraph. Zero trust icons. Zero sub-text.
// Just: "Your turn." + 2 CTAs + atmosphere.
export default function FinalCTA() {
  const sectionRef = useRef(null);
  const videoBgRef = useRef(null);

  const PHRASE = ["Your", "CFO"];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const chars = sectionRef.current.querySelectorAll(".nf2-cta-char");
      gsap.set(chars, { y: "110%", opacity: 0 });

      gsap.to(chars, {
        y: "0%", opacity: 1, stagger: 0.07, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 72%", once: true },
      });

      gsap.from(sectionRef.current.querySelectorAll(".nf2-cta-reveal"), {
        opacity: 0, y: 24, stagger: 0.12, duration: 0.85, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%", once: true, delay: 0.4 },
      });

      if (videoBgRef.current) {
        ScrollTrigger.create({
          trigger: sectionRef.current, start: "top 80%",
          onEnter: () => {
            videoBgRef.current.play().catch(() => {});
            gsap.to(videoBgRef.current, { opacity: 1, duration: 2.5, ease: "power2.inOut" });
          },
        });
      }

      gsap.to(".nf2-cta-orb", {
        scale: 1.12, opacity: 0.8, duration: 5.5,
        repeat: -1, yoyo: true, ease: "sine.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="nf2-section relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#050507" }}
    >
      {/* Video */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <video
          ref={videoBgRef}
          loop muted playsInline
          style={{
            width: "120%", height: "120%", objectFit: "cover",
            filter: "brightness(0.15) saturate(0.3)",
            opacity: 0, transform: "translate(-10%,-10%)",
          }}
        >
          <source src="https://videos.pexels.com/video-files/3253197/3253197-hd_1920_1080_25fps.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="nf2-grid-bg absolute inset-0 pointer-events-none" style={{ zIndex: 1, opacity: 0.35 }} />
      <div className="nf2-grain" />

      <div className="absolute inset-0" style={{ zIndex: 3 }}>
        <ParticleCanvas count={28} color="#4f46e5" opacity={0.18} speed={0.15} />
      </div>

      <div className="nf2-cta-orb absolute pointer-events-none" style={{
        width: 650, height: 650, top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(circle, rgba(79,70,229,0.17) 0%, transparent 60%)",
        filter: "blur(55px)", borderRadius: "50%", zIndex: 2, opacity: 0.5,
      }} />

      {/* Content — title + 2 CTAs only */}
      <div className="relative z-10 text-center px-6 select-none">

        {/* Tiny eyebrow — single stat, not a list */}
        <div className="nf2-cta-reveal nf2-label mb-8" style={{ color: "rgba(255,255,255,0.18)" }}>
          42,000+ already in
        </div>

        {/* "Your turn." */}
        <div style={{ marginBottom: "2.8rem" }}>
          {PHRASE.map((word, wi) => (
            <div key={wi} style={{ overflow: "hidden", display: "block" }}>
              <span className="nf2-display" style={{
                fontSize: "clamp(5rem, 16vw, 18rem)",
                lineHeight: 0.87, display: "block",
              }}>
                {wi === 1 ? (
                  <span className="nf2-text-indigo">
                    {word.split("").map((c, ci) => (
                      <span key={ci} className="nf2-cta-char" style={{ display: "inline-block" }}>{c}</span>
                    ))}
                  </span>
                ) : (
                  word.split("").map((c, ci) => (
                    <span key={ci} className="nf2-cta-char" style={{ display: "inline-block", color: "#f0f0f8" }}>{c}</span>
                  ))
                )}
              </span>
            </div>
          ))}
        </div>

        {/* The only 2 CTAs */}
        <div className="nf2-cta-reveal flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/signup" className="nf2-btn-primary" style={{ fontSize: "1rem", padding: "1rem 2.8rem" }}>
            Join free — ₹0 to start
          </a>
          <a href="/subscribe" className="nf2-btn-ghost" style={{ fontSize: "0.9rem" }}>
            Founding plan: ₹899/year →
          </a>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-28 pointer-events-none" style={{
        background: "linear-gradient(to bottom, #050507, transparent)", zIndex: 8,
      }} />
    </section>
  );
}
