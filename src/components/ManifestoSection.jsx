import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./landing2.css";

gsap.registerPlugin(ScrollTrigger);

// ONE line. No sub-caption. No marquee (moved to standalone MarqueeBand).
// The atmosphere image carries the section. Text is secondary.
export default function ManifestoSection() {
  const sectionRef = useRef(null);
  const imgRef     = useRef(null);
  const lineRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax
      gsap.to(imgRef.current, {
        y: "-12%", ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom", end: "bottom top", scrub: true,
        },
      });
      // Single line reveal
      const inner = lineRef.current?.querySelector(".nf2-manifesto-text");
      if (inner) {
        gsap.fromTo(inner,
          { y: "108%" },
          {
            y: "0%", duration: 1.1, ease: "expo.out",
            scrollTrigger: { trigger: lineRef.current, start: "top 82%", once: true },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="nf2-section relative overflow-hidden"
      style={{ background: "#050507" }}
    >
      <div className="nf2-grain" />

      {/* Full-bleed image */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <img
          ref={imgRef}
          src="/vis-atmosphere.png"
          alt="" aria-hidden
          style={{
            width: "100%", height: "130%",
            objectFit: "cover", objectPosition: "center 40%",
            filter: "brightness(0.5) saturate(0.65)",
            willChange: "transform",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, #050507 0%, rgba(5,5,7,0.45) 35%, rgba(5,5,7,0.45) 65%, #050507 100%)",
        }} />
      </div>

      {/* Single editorial statement — full-width left-aligned */}
      <div className="relative max-w-6xl mx-auto px-6 lg:px-12" style={{ zIndex: 2, padding: "8rem 3rem" }}>
        <div ref={lineRef} className="nf2-manifesto-line">
          <div className="nf2-manifesto-text" style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(3.5rem, 8vw, 10rem)",
            lineHeight: 0.96,
            letterSpacing: "-0.04em",
            color: "rgba(255,255,255,0.93)",
            textShadow: "0 2px 40px rgba(0,0,0,0.5)",
          }}>
            One system.<br />
            <span style={{ color: "#818cf8" }}>Every rupee.</span>
          </div>
        </div>
      </div>

      <div className="nf2-divider" style={{ position: "relative", zIndex: 2 }} />
    </section>
  );
}
