import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useCognitoAuth } from "../hooks/useCognitoAuth";

export default function SignupPage() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const formRefs = useRef([]);

  const { auth, login } = useCognitoAuth();

  // --- ANIMATIONS ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".glow-orb-signup", {
        scale: 1.2,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, rotateX: 10 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1.4, ease: "power3.out" }
      );

      gsap.fromTo(
        formRefs.current,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.08,
          delay: 0.5,
          ease: "power2.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);



  return (
    <main
      ref={containerRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#05050A] text-white px-4 py-12"
    >
      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="glow-orb-signup absolute top-[20%] right-[20%] w-[500px] h-[500px] bg-[#7d5fff]/15 blur-[140px] rounded-full" />
        <div className="glow-orb-signup absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-[#6dcffc]/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* --- CARD --- */}
      <div
        ref={cardRef}
        className="relative w-full max-w-[460px] rounded-[2.5rem] border border-white/10 bg-black/60 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
      >
        {/* Top Accent Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[2px]"></div>

        <div className="p-8 sm:p-12">
          {/* Header */}
          <div className="mb-8">
            <p ref={el => formRefs.current[0] = el} className="text-[#6dcffc] text-xs font-bold tracking-[0.2em] mb-2">
              NUEROFIN ID
            </p>
            <h1 ref={el => formRefs.current[1] = el} className="text-3xl sm:text-4xl font-light text-white tracking-tight">
              Create your <br /> Money OS.
            </h1>
          </div>

          {auth.isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <div ref={el => formRefs.current[2] = el} className="space-y-5">
              {/* Feature list */}
              {[
                "Secure signup managed by AWS Cognito",
                "No passwords stored in our database",
                "MFA & social login support",
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6dcffc]/20 border border-[#6dcffc]/40 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6dcffc" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-sm text-neutral-300">{feat}</span>
                </div>
              ))}

              <button
                onClick={login}
                className="relative w-full group overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 p-[1px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 mt-4"
              >
                <div className="relative rounded-full bg-black/50 backdrop-blur-md px-8 py-4 transition-all duration-300 group-hover:bg-transparent">
                  <div className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    </svg>
                    <span className="text-sm font-semibold text-white tracking-wide">
                      Create Account with NeuroFin
                    </span>
                  </div>
                </div>
              </button>

              <p className="text-center text-xs text-neutral-500">
                Powered by AWS Cognito — enterprise-grade security
              </p>
            </div>
          )}

          <div ref={el => formRefs.current[7] = el} className="mt-8 text-center">
            <p className="text-xs text-neutral-500">
              Already part of the cohort?{" "}
              <Link to="/login" className="text-[#6dcffc] hover:text-white transition-colors font-medium">
                Log in here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}