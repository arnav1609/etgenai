import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./landing2.css";

gsap.registerPlugin(ScrollTrigger);

const SLIDES = [
  { src: "/dashboard-analytics.png", tab: "Analytics" },
  { src: "/dashboard-main.png",      tab: "Overview" },
  { src: "/dashboard-family.png",    tab: "Family" },
];

const BADGES = [
  { text: "₹90k avg income",  top: "14%",  left: "-12%",  delay: "0s",   color: "#34d399" },
  { text: "9.2 / 10 score",   top: "58%",  left: "-13%",  delay: "1.6s", color: "#818cf8" },
  { text: "37.6% saved",      top: "18%",  right: "-12%", delay: "0.8s", color: "#38bdf8" },
  { text: "9 SIPs on track",  top: "60%",  right: "-12%", delay: "2.2s", color: "#fbbf24" },
];

export default function ProductRevealSection() {
  const sectionRef = useRef(null);
  const frameRef   = useRef(null);
  const imgRef     = useRef(null);
  const badgesRef  = useRef(null);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(frameRef.current,
        { opacity: 0, y: 70, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 1.5, ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
        }
      );
      const badges = badgesRef.current?.querySelectorAll(".nf2-feature-badge");
      if (badges) {
        gsap.fromTo(badges,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1, scale: 1, stagger: 0.2, duration: 0.9, ease: "back.out(1.5)",
            scrollTrigger: { trigger: frameRef.current, start: "top 65%", once: true },
          }
        );
      }
    }, sectionRef);

    const timer = setInterval(() => setSlide(prev => (prev + 1) % SLIDES.length), 3400);
    return () => { ctx.revert(); clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (!imgRef.current) return;
    gsap.fromTo(imgRef.current,
      { opacity: 0, scale: 1.04 },
      { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" }
    );
  }, [slide]);

  return (
    <section
      ref={sectionRef}
      className="nf2-section relative"
      style={{ background: "#050507", padding: "6rem 0 8rem" }}
    >
      <div className="nf2-grain" />
      <div className="nf2-orb absolute pointer-events-none" style={{
        width: 1000, height: 500, top: "55%", left: "50%",
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(ellipse, rgba(79,70,229,0.07) 0%, transparent 65%)",
        animationDuration: "14s",
      }} />

      <div className="max-w-6xl mx-auto px-6 lg:px-12">

        {/* ── Just the frame — no header text ── */}
        <div ref={frameRef} className="relative" style={{ opacity: 0 }}>

          {/* Tiny ambient label — only context, not a headline */}
          <div style={{
            position: "absolute", top: -22, left: 0,
            fontFamily: "'Inter', sans-serif", fontSize: "0.62rem",
            color: "rgba(255,255,255,0.2)", letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}>
            Live&nbsp;·&nbsp;{SLIDES[slide].tab}
          </div>

          {/* Floating badges */}
          <div ref={badgesRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
            {BADGES.map((b, i) => (
              <div
                key={i}
                className={`nf2-feature-badge nf2-badge-float-${(i % 3) + 1}`}
                style={{ top: b.top, left: b.left, right: b.right, opacity: 0 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: b.color, boxShadow: `0 0 6px ${b.color}` }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.76rem", fontWeight: 500, color: "#e5e7eb", whiteSpace: "nowrap" }}>
                    {b.text}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Glow behind frame */}
          <div style={{
            position: "absolute", inset: -8,
            background: "radial-gradient(ellipse at center, rgba(79,70,229,0.18) 0%, transparent 55%)",
            filter: "blur(40px)", borderRadius: 40, pointerEvents: "none",
          }} />

          {/* Frame */}
          <div className="nf2-product-frame">
            <div className="nf2-sweep" />
            <div className="nf2-product-chrome">
              <div className="nf2-dot" style={{ background: "#FF5F57" }} />
              <div className="nf2-dot" style={{ background: "#FFBD2E" }} />
              <div className="nf2-dot" style={{ background: "#28CA41" }} />
              <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 100, padding: "3px 14px",
                  fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#6b7280",
                }}>
                  <span style={{ color: "#34d399", fontSize: "0.55rem" }}>●</span>
                  app.neurofin.in
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {SLIDES.map((_, i) => (
                  <button key={i} onClick={() => setSlide(i)} style={{
                    width: 6, height: 6, borderRadius: "50%", border: "none", cursor: "pointer",
                    background: i === slide ? "#4f46e5" : "rgba(255,255,255,0.15)",
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>
            </div>
            <div style={{ position: "relative", background: "#0a0a14", lineHeight: 0 }}>
              <img
                ref={imgRef}
                src={SLIDES[slide].src}
                alt="NeuroFin dashboard"
                style={{ width: "100%", display: "block", height: 500, objectFit: "cover", objectPosition: "top" }}
              />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
                background: "linear-gradient(to top, #050507, transparent)",
              }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
