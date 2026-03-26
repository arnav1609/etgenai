import "./landing2.css";

// Standalone kinetic marquee band — pure motion between sections.
// No text above, no text below. Just the words moving.
export default function MarqueeBand() {
  return (
    <div style={{
      background: "#050507",
      borderTop: "1px solid rgba(255,255,255,0.055)",
      borderBottom: "1px solid rgba(255,255,255,0.055)",
      padding: "11px 0",
      overflow: "hidden",
      position: "relative",
    }}>
      <div className="nf2-streak" />
      <div className="nf2-marquee-track">
        {Array(5).fill(0).map((_, i) => (
          <span key={i} style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.65rem", fontWeight: 500,
            letterSpacing: "0.26em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.17)",
            padding: "0 2.2rem", whiteSpace: "nowrap",
          }}>
            INTELLIGENT MONEY &nbsp;·&nbsp; BUILT FOR INDIA &nbsp;·&nbsp;
            UPI + BANK ACCOUNTS &nbsp;·&nbsp; AI-FIRST &nbsp;·&nbsp;
            HINGLISH SUPPORT &nbsp;·&nbsp; GOAL FORECASTING &nbsp;·&nbsp;
            FAMILY FINANCE &nbsp;·&nbsp; LIVE ACCOUNTS &nbsp;·&nbsp;&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}
