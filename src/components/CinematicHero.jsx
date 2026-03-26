import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ParticleCanvas from "./ParticleCanvas";
import "./landing2.css";

gsap.registerPlugin(ScrollTrigger);

export default function CinematicHero() {
  const heroRef   = useRef(null);
  const titleRef  = useRef(null);
  const videoRef  = useRef(null);

  const TITLE = "NeuroFin";

  useEffect(() => {
    const ctx = gsap.context(() => {
      const chars   = heroRef.current.querySelectorAll(".nf2-char");
      const subEls  = heroRef.current.querySelectorAll(".nf2-fade-in");

      // Reset
      gsap.set(chars,  { y: "115%", opacity: 0, rotateX: -70 });
      gsap.set(subEls, { opacity: 0, y: 22 });

      // Cinematic entrance timeline
      const tl = gsap.timeline({ delay: 0.15 });
      tl.to(chars, {
          y: "0%", opacity: 1, rotateX: 0,
          stagger: 0.06, duration: 1.1, ease: "expo.out",
        })
        .to(subEls, {
          opacity: 1, y: 0, stagger: 0.13, duration: 0.9, ease: "power3.out",
        }, "-=0.5");

      // Video cross-fade in after title settles
      gsap.to(videoRef.current, {
        opacity: 1, duration: 2.5, delay: 1.4, ease: "power2.inOut",
      });

      // Scroll parallax — title drifts up and fades
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate(self) {
          if (!titleRef.current) return;
          titleRef.current.style.transform = `translateY(${self.progress * 100}px)`;
          titleRef.current.style.opacity   = String(1 - self.progress * 2);
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="nf2-section relative w-full min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#050507" }}
    >
      {/* ── Static atmospheric image (loads instantly) ── */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <img
          src="/vis-wide.png"
          alt=""
          aria-hidden
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center center",
            filter: "brightness(0.4) saturate(0.6)",
          }}
        />
        {/* Darken center so title is legible */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, rgba(5,5,7,0.7) 0%, rgba(5,5,7,0.2) 100%)",
        }} />
      </div>

      {/* ── Video void (fades in over the still image) ── */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>

        <video
          ref={videoRef}
          autoPlay loop muted playsInline
          style={{
            width: "120%", height: "120%", objectFit: "cover",
            filter: "brightness(0.14) saturate(0.3) hue-rotate(220deg)",
            opacity: 0, transform: "translate(-10%, -10%)",
          }}
        >
          <source src="https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_25fps.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/3136524/3136524-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Grid bg */}
      <div className="nf2-grid-bg absolute inset-0 pointer-events-none" style={{ zIndex: 1, opacity: 0.5 }} />

      {/* Grain */}
      <div className="nf2-grain" />

      {/* Particles */}
      <div className="absolute inset-0" style={{ zIndex: 3 }}>
        <ParticleCanvas count={38} color="#4f46e5" opacity={0.22} speed={0.18} />
      </div>

      {/* Ambient indigo bloom */}
      <div className="nf2-orb" style={{
        width: 700, height: 700,
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(circle, rgba(79,70,229,0.13) 0%, transparent 70%)",
        zIndex: 2, animationDuration: "10s",
      }} />

      {/* ── Main title ── */}
      <div ref={titleRef} className="relative text-center px-6 select-none will-change-transform" style={{ zIndex: 10 }}>

        {/* Eyebrow pill */}
        <div className="nf2-fade-in inline-flex items-center gap-2 mb-8 rounded-full border border-white/10 bg-white/3 px-5 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px rgba(52,211,153,0.8)" }} />
          <span className="nf2-label" style={{ color: "#a3a3b3", letterSpacing: "0.2em" }}>
            Early Access · Founding India Cohort
          </span>
        </div>

        {/* NEUROFIN — letter by letter */}
        <h1 className="nf2-display mb-6" style={{
          fontSize: "clamp(4.5rem, 10vw, 11rem)",
          lineHeight: 0.88,
          perspective: "800px",
        }}>
          {TITLE.split("").map((char, i) => (
            <span key={i} className="nf2-char" style={{
              display: "inline-block",
              transformOrigin: "50% 100%",
              willChange: "transform, opacity",
            }}>
              {char}
            </span>
          ))}
        </h1>

        {/* Tagline */}
        <p className="nf2-fade-in nf2-body mb-3" style={{
          fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
          color: "#9ca3af",
          letterSpacing: "0.06em",
          fontWeight: 300,
        }}>
          The money OS for modern India.
        </p>

        <div className="nf2-fade-in flex items-center justify-center gap-2 mb-10">
          <span style={{ fontSize: "0.95rem" }}>🇮🇳</span>
          <span className="nf2-label">Built for Bharat · Ask in Hinglish</span>
        </div>

        {/* CTAs */}
        <div className="nf2-fade-in flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/signup" className="nf2-btn-primary">
            Join free — ₹0 to start
          </a>
          <a href="/subscribe" className="nf2-btn-ghost">
            Founding pricing: ₹899/year →
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ zIndex: 10, opacity: 0.35 }}>
        <span className="nf2-label" style={{ letterSpacing: "0.3em" }}>Scroll</span>
        <div style={{ width: 1, height: 56, background: "linear-gradient(to bottom, #4f46e5, transparent)" }} />
      </div>

      {/* Bottom fade-out */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{
        height: 200, zIndex: 8,
        background: "linear-gradient(to top, #050507, transparent)",
      }} />
    </section>
  );
}
