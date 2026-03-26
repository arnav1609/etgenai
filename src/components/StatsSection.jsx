import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./landing2.css";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { num: 42000, suffix: "+", label: "People on the waitlist", color: "#818cf8", glow: "rgba(79,70,229,0.25)" },
  { num: 9.2,   suffix: "/10", label: "Average NeuroFin score", color: "#34d399", glow: "rgba(16,185,129,0.2)", decimals: 1 },
  { num: 46,    suffix: "L+",  label: "Net worth tracked per user", prefix: "₹", color: "#38bdf8", glow: "rgba(14,165,233,0.2)" },
];

export default function StatsSection() {
  const sectionRef = useRef(null);
  const numRefs    = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      numRefs.current.forEach((el, i) => {
        if (!el) return;
        const s = STATS[i];
        const obj = { val: 0 };

        gsap.to(obj, {
          val: s.num,
          duration: 2.2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 78%", once: true },
          onUpdate() {
            const v = s.decimals ? obj.val.toFixed(s.decimals) : Math.round(obj.val).toLocaleString();
            el.textContent = `${s.prefix || ""}${v}${s.suffix}`;
          },
        });
      });

      // Section entrance
      gsap.fromTo(sectionRef.current.querySelectorAll(".nf2-stat-col"),
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, stagger: 0.15, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="nf2-section relative"
      style={{ background: "#08080F", padding: "8rem 0" }}
    >
      <div className="nf2-grain" />

      {/* Top edge */}
      <div className="nf2-divider mb-16 max-w-7xl mx-auto px-12" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section label */}
        <div className="nf2-label mb-16 text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
          NeuroFin by the numbers
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
          {STATS.map((s, i) => (
            <div key={i} className="nf2-stat-col relative flex flex-col items-center text-center px-8 py-8 min-w-0 overflow-hidden">
              {/* Ambient glow behind number */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none" style={{
                background: `radial-gradient(ellipse, ${s.glow} 0%, transparent 70%)`,
                filter: "blur(30px)",
              }} />

              {/* The number */}
              <div
                ref={el => (numRefs.current[i] = el)}
                className="nf2-stat-mega mb-4"
                style={{
                  color: s.color,
                  fontSize: "clamp(1.8rem, 2.6vw, 3.2rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                  display: "block",
                }}
              >
                0
              </div>

              <div className="nf2-label" style={{ color: "rgba(255,255,255,0.35)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom edge */}
      <div className="nf2-divider mt-16 max-w-7xl mx-auto px-12" />
    </section>
  );
}
