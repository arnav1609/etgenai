import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./landing2.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * VisualInterlude — a full-bleed breathing space between sections.
 * image: the src to display
 * caption: optional minimal label
 * imagePos: CSS object-position
 * tint: overlay color (default dark navy)
 * height: section height (default 60vh)
 */
export default function VisualInterlude({
  image,
  caption,
  imagePos = "center center",
  tint = "rgba(5,5,7,0.45)",
  height = "62vh",
  parallax = true,
}) {
  const sectionRef = useRef(null);
  const imgRef     = useRef(null);

  useEffect(() => {
    if (!parallax || !imgRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(imgRef.current, {
        y: "-12%",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [parallax]);

  return (
    <div
      ref={sectionRef}
      className="nf2-section relative overflow-hidden"
      style={{ height }}
    >
      {/* Parallax image */}
      <img
        ref={imgRef}
        src={image}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "115%",
          objectFit: "cover",
          objectPosition: imagePos,
          display: "block",
          willChange: "transform",
          userSelect: "none",
        }}
      />

      {/* Dark tint overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: tint,
        zIndex: 1,
      }} />

      {/* Edge fades — seamless bleeding into adjacent sections */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "30%",
        background: "linear-gradient(to bottom, #050507, transparent)",
        zIndex: 2,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "30%",
        background: "linear-gradient(to top, #050507, transparent)",
        zIndex: 2,
        pointerEvents: "none",
      }} />

      {/* Optional caption */}
      {caption && (
        <div style={{
          position: "absolute",
          bottom: "22%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          textAlign: "center",
        }}>
          <span className="nf2-label" style={{
            color: "rgba(255,255,255,0.28)",
            letterSpacing: "0.3em",
          }}>
            {caption}
          </span>
        </div>
      )}
    </div>
  );
}
