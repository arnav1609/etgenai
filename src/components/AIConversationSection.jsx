import { useEffect, useRef } from "react";
import "./landing2.css";

// Only the conversation — no header section, no h2, no paragraph.
// The chat card is the entire section. Let it speak.
const CONVERSATION = [
  { role: "user", text: "Meri savings se Hyderabad mein flat lene mein kitna time lagega?" },
  { role: "ai",   text: "At 22% savings rate — ₹19,800/month — you hit ₹12L down payment in ~5 years. Redirect ₹3,400/month from low-priority spends to an index SIP and you're there in 3.8.", accent: "#818cf8" },
  { role: "user", text: "Agar rent ₹5,000 badh gaya?" },
  { role: "ai",   text: "Free cash flow drops 9%. Goal slips ~7 months. Emergency fund and SIPs stay untouched. Want me to run the rental offset scenario?", accent: "#34d399" },
  { role: "user", text: "Ha, and add parents' medical fund too." },
  { role: "ai",   text: "₹4,000/month parallel into a liquid fund. Flat: 4.4 years. Medical buffer: ₹2L in 14 months. Both on track.", accent: "#38bdf8" },
];

export default function AIConversationSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const bubbles = sectionRef.current.querySelectorAll(".nf2-bubble");
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        bubbles.forEach((b, i) => setTimeout(() => b.classList.add("visible"), i * 650));
      });
    }, { threshold: 0.15 });
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="nf2-section relative"
      style={{ background: "#08080F", padding: "7rem 0 8rem" }}
    >
      {/* Bloom behind the card */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        <img src="/vis-bloom.png" alt="" aria-hidden style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "75%", height: "75%", objectFit: "contain",
          opacity: 0.28, filter: "blur(6px)", mixBlendMode: "screen",
        }} />
      </div>
      <div className="nf2-grain" />

      <div className="max-w-2xl mx-auto px-6" style={{ position: "relative", zIndex: 2 }}>

        {/* Ambient label above card — NOT a section header */}
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: "0.62rem",
          color: "rgba(255,255,255,0.18)", letterSpacing: "0.25em",
          textTransform: "uppercase", marginBottom: "1.5rem",
          textAlign: "center",
        }}>
          Hinglish &nbsp;·&nbsp; Hindi &nbsp;·&nbsp; English
        </div>

        {/* Chat card — the entire section */}
        <div style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24, overflow: "hidden",
        }}>
          {/* Chrome bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: "rgba(79,70,229,0.2)", border: "1px solid rgba(79,70,229,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Syne', sans-serif", fontSize: "0.62rem", fontWeight: 800, color: "#818cf8",
            }}>AI</div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", fontWeight: 500, color: "#f0f0f8" }}>
                Neha — NeuroFin Advisor
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 5px rgba(52,211,153,0.9)" }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "#34d399" }}>
                  Hyderabad · Live context
                </span>
              </div>
            </div>
          </div>

          {/* Bubbles */}
          <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
            {CONVERSATION.map((msg, i) => (
              <div key={i} className="nf2-bubble" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "ai" && (
                  <div style={{
                    width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                    background: "rgba(79,70,229,0.18)", border: "1px solid rgba(79,70,229,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Syne', sans-serif", fontSize: "0.52rem", fontWeight: 800, color: "#818cf8",
                    marginRight: 8, marginTop: 2,
                  }}>AI</div>
                )}
                <div style={{
                  maxWidth: "76%", padding: "9px 13px", borderRadius: 14,
                  fontFamily: "'Inter', sans-serif", fontSize: "0.83rem", lineHeight: 1.5,
                  ...(msg.role === "user"
                    ? { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)", color: "#e5e7eb" }
                    : {
                        background: `rgba(${msg.accent === "#818cf8" ? "79,70,229" : msg.accent === "#34d399" ? "16,185,129" : "14,165,233"},0.1)`,
                        border: `1px solid ${msg.accent}28`, color: "#e5e7eb",
                      }
                  ),
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Typing dots */}
            <div className="nf2-bubble" style={{ display: "flex" }}>
              <div style={{
                width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                background: "rgba(79,70,229,0.18)", border: "1px solid rgba(79,70,229,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Syne', sans-serif", fontSize: "0.52rem", fontWeight: 800, color: "#818cf8",
                marginRight: 8, marginTop: 2,
              }}>AI</div>
              <div style={{
                padding: "11px 14px", borderRadius: 14,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                display: "flex", gap: 4, alignItems: "center",
              }}>
                {[0, 0.28, 0.56].map((d, i) => (
                  <span key={i} style={{
                    display: "inline-block", width: 5, height: 5, borderRadius: "50%",
                    background: "#374151",
                    animation: "nf2-dot-pulse 1s ease-in-out infinite",
                    animationDelay: `${d}s`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Capability chips — tiny, below card */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: "1.4rem" }}>
          {["Live account data", "Goal-linked", "Tax-aware", "Family context"].map((c, i) => (
            <span key={i} style={{
              fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "rgba(255,255,255,0.22)",
              border: "1px solid rgba(255,255,255,0.07)", borderRadius: 100, padding: "4px 11px",
            }}>{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
