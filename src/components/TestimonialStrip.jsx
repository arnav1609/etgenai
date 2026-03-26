import "./landing2.css";

// Kinetic scrolling quote strip — no explanatory copy, no cards.
// Just the voices, in motion.
const QUOTES = [
  { q: "First time money just made sense.",       loc: "Bengaluru" },
  { q: "I just ask NeuroFin.",                    loc: "Hyderabad" },
  { q: "Hinglish mein samjhaata hai.",            loc: "Pune" },
  { q: "SIPs, rent, goals — one place.",          loc: "Mumbai" },
  { q: "Finally, clarity.",                       loc: "Delhi" },
  { q: "Like a CFO in my pocket.",                loc: "Chennai" },
  { q: "Planned my Goa trip and my SIP.",         loc: "Bengaluru" },
];

export default function TestimonialStrip() {
  // Duplicate for seamless loop
  const items = [...QUOTES, ...QUOTES];

  return (
    <section
      className="nf2-section relative overflow-hidden"
      style={{ background: "#050507", padding: "6rem 0" }}
    >
      <div className="nf2-grain" />

      {/* Edge fades */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: "12%", zIndex: 10, pointerEvents: "none",
        background: "linear-gradient(to right, #050507, transparent)",
      }} />
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: "12%", zIndex: 10, pointerEvents: "none",
        background: "linear-gradient(to left, #050507, transparent)",
      }} />

      {/* Bloom behind */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 700, height: 400, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(79,70,229,0.07) 0%, transparent 65%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      {/* Ambient section label */}
      <div style={{
        textAlign: "center", marginBottom: "2.5rem",
        fontFamily: "'Inter', sans-serif", fontSize: "0.62rem",
        color: "rgba(255,255,255,0.18)", letterSpacing: "0.28em", textTransform: "uppercase",
      }}>
        42,000+ people · 4 Indian cities
      </div>

      {/* Quote marquee — large kinetic type */}
      <div style={{ overflow: "hidden", position: "relative" }}>
        <div style={{
          display: "flex",
          animation: "nf2-marquee 45s linear infinite",
          whiteSpace: "nowrap",
          width: "max-content",
        }}
        onMouseEnter={e => e.currentTarget.style.animationPlayState = "paused"}
        onMouseLeave={e => e.currentTarget.style.animationPlayState = "running"}
        >
          {items.map((item, i) => (
            <div key={i} style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: "0.7rem",
              paddingRight: "3.5rem",
              flexShrink: 0,
            }}>
              {/* Quote text — large */}
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.6rem, 2.8vw, 2.5rem)",
                letterSpacing: "-0.025em",
                color: "rgba(255,255,255,0.75)",
                whiteSpace: "nowrap",
              }}>
                "{item.q}"
              </span>
              {/* City tiny sub */}
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                paddingBottom: "0.2rem",
                whiteSpace: "nowrap",
              }}>
                {item.loc}
              </span>
              {/* Separator dot */}
              <span style={{ color: "rgba(255,255,255,0.1)", fontSize: "1.5rem", paddingRight: "1rem" }}>·</span>
            </div>
          ))}
        </div>
      </div>

      {/* Second row — reverse direction, slightly different timing */}
      <div style={{ overflow: "hidden", marginTop: "1.2rem" }}>
        <div style={{
          display: "flex",
          animation: "nf2-marquee 60s linear infinite reverse",
          whiteSpace: "nowrap",
          width: "max-content",
        }}
        onMouseEnter={e => e.currentTarget.style.animationPlayState = "paused"}
        onMouseLeave={e => e.currentTarget.style.animationPlayState = "running"}
        >
          {[...items].reverse().map((item, i) => (
            <div key={i} style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: "0.7rem",
              paddingRight: "3.5rem",
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
                letterSpacing: "-0.02em",
                color: "rgba(255,255,255,0.38)",
                whiteSpace: "nowrap",
              }}>
                "{item.q}"
              </span>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: "0.65rem",
                color: "rgba(255,255,255,0.13)", letterSpacing: "0.1em",
                textTransform: "uppercase", paddingBottom: "0.1rem",
              }}>
                {item.loc}
              </span>
              <span style={{ color: "rgba(255,255,255,0.08)", fontSize: "1.2rem", paddingRight: "1rem" }}>·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
