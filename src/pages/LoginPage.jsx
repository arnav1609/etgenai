import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useCognitoAuth } from "../hooks/useCognitoAuth";

export default function LoginPage() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const overlayRef = useRef(null);
  const formRefs = useRef([]);

  const { auth, login } = useCognitoAuth();

  // --- ANIMATIONS ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".glow-orb", {
        y: -40,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 1.5,
      });

      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power3.out" }
      );

      gsap.fromTo(
        formRefs.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          delay: 0.4,
          ease: "power2.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // --- SPOTLIGHT EFFECT ---
  const handleMouseMove = (e) => {
    if (!cardRef.current || !overlayRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    overlayRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(125, 95, 255, 0.15) 0%, transparent 100%)`;
    overlayRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(125, 95, 255, 0.15) 0%, transparent 100%)`;
  };



  return (
    <main
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#05050A] text-white px-4"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="glow-orb absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#6dcffc]/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="glow-orb absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#7d5fff]/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div
        ref={cardRef}
        className="relative w-full max-w-[420px] rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group"
      >
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        />

        <div className="relative z-10 p-8 sm:p-10 space-y-8">

          <div className="text-center space-y-2">
            <div ref={(el) => (formRefs.current[0] = el)} className="inline-block mb-2">
              <div className="h-10 w-10 mx-auto bg-gradient-to-br from-white/20 to-white/5 rounded-xl border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white/90">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h1 ref={(el) => (formRefs.current[1] = el)} className="text-3xl font-light tracking-tight text-white">
              Welcome back
            </h1>
            <p ref={(el) => (formRefs.current[2] = el)} className="text-sm text-neutral-400">
              Sign in securely with your NeuroFin account.
            </p>
          </div>

          {auth.isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <div ref={(el) => (formRefs.current[3] = el)} className="space-y-4">
              <button
                onClick={login}
                className="relative w-full group overflow-hidden rounded-xl bg-white text-black font-semibold py-3.5 text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                  Continue with NeuroFin
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shineSweep_1s_ease-in-out] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </button>

              <p className="text-center text-xs text-neutral-500">
                Powered by AWS Cognito — enterprise-grade security
              </p>
            </div>
          )}

          <p ref={(el) => (formRefs.current[8] = el)} className="text-center text-xs text-neutral-500">
            New to NeuroFin?{" "}
            <Link to="/signup" className="text-white hover:underline underline-offset-4 decoration-neutral-500">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}