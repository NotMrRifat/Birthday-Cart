import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════
   GLOBAL STYLES — Keyframes, fonts, utilities
═══════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #f5c842;
    --rose: #ff6b9d;
    --purple: #a855f7;
    --cyan: #22d3ee;
    --green: #22c55e;
    --dark: #04040f;
    --glass: rgba(255,255,255,0.04);
  }

  html, body { overflow: hidden; cursor: none !important; }

  @keyframes float-particle {
    0%,100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.5; }
    33%      { transform: translateY(-22px) rotate(120deg) scale(1.1); opacity: 1; }
    66%      { transform: translateY(-10px) rotate(240deg) scale(0.9); opacity: 0.7; }
  }

  @keyframes mesh-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes glow-pulse {
    0%,100% { box-shadow: 0 0 24px var(--gold), 0 0 48px rgba(245,200,66,0.3); }
    50%      { box-shadow: 0 0 40px var(--gold), 0 0 80px rgba(245,200,66,0.5), 0 0 120px rgba(245,200,66,0.2); }
  }

  @keyframes gift-float {
    0%,100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-12px) scale(1.03); }
  }

  @keyframes blink-cursor {
    0%,50%   { opacity: 1; }
    51%,100% { opacity: 0; }
  }

  @keyframes unfold-letter {
    from { clip-path: inset(0 0 100% 0); opacity: 0; transform: translateY(20px); }
    to   { clip-path: inset(0 0 0% 0); opacity: 1; transform: translateY(0); }
  }

  @keyframes blur-scale-in {
    from { filter: blur(24px); transform: scale(0.75); opacity: 0; }
    to   { filter: blur(0);    transform: scale(1);    opacity: 1; }
  }

  @keyframes blur-scale-out {
    from { filter: blur(0);    transform: scale(1);    opacity: 1; }
    to   { filter: blur(24px); transform: scale(0.75); opacity: 0; }
  }

  @keyframes slide-from-left  { from { transform: translateX(-90px); opacity:0; } to { transform: translateX(0); opacity:1; } }
  @keyframes slide-from-right { from { transform: translateX(90px);  opacity:0; } to { transform: translateX(0); opacity:1; } }

  @keyframes rainbow-flow {
    0%   { background-position: 0%   50%; }
    100% { background-position: 200% 50%; }
  }

  @keyframes explode-box {
    0%   { transform: scale(1);   opacity: 1; }
    40%  { transform: scale(1.6); opacity: 0.6; }
    100% { transform: scale(0);   opacity: 0; }
  }

  @keyframes gift-idle   { animation: gift-float 2.4s ease-in-out infinite; }

  .mesh-bg {
    background: linear-gradient(-45deg, #04040f, #0b0720, #180432, #04040f, #0a1030, #120824);
    background-size: 600% 600%;
    animation: mesh-shift 10s ease infinite;
  }

  .glass-card {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.09);
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .glow-gold { animation: glow-pulse 2.5s ease-in-out infinite; }
  .gift-idle { animation: gift-float 2.4s ease-in-out infinite; }

  .rainbow-border::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background: linear-gradient(135deg,#ff0080,#ff8c00,#ffd700,#00ff88,#00cfff,#9b59b6);
    background-size: 300%;
    animation: rainbow-flow 2s linear infinite;
    z-index: -1;
  }
`;

/* ═══════════════════════════════════════════════════
   CURSOR TRAIL
═══════════════════════════════════════════════════ */
function CursorTrail() {
  const [trail, setTrail] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    const onMove = (e) => {
      const id = idRef.current++;
      setTrail(t => [...t.slice(-20), { id, x: e.clientX, y: e.clientY, ts: Date.now() }]);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setTrail(tr => tr.filter(d => now - d.ts < 700));
    }, 80);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {trail.map((dot, i) => {
        const age = Math.min(1, (Date.now() - dot.ts) / 700);
        const frac = (i + 1) / trail.length;
        const sz = Math.max(3, 24 * frac * (1 - age * 0.6));
        return (
          <div
            key={dot.id}
            style={{
              position: "fixed",
              left: dot.x - sz / 2,
              top: dot.y - sz / 2,
              width: sz,
              height: sz,
              borderRadius: "50%",
              background: `radial-gradient(circle, #f5c842, #ff6b9d, #a855f7)`,
              opacity: (1 - age) * frac,
              filter: `blur(${age * 5}px)`,
              pointerEvents: "none",
              zIndex: 99999,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   FLOATING PARTICLES LAYER
═══════════════════════════════════════════════════ */
function FloatingParticles() {
  const particles = useRef(
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3.5 + 1,
      dur: Math.random() * 12 + 6,
      delay: Math.random() * 6,
      color: ["#f5c842","#ff6b9d","#a855f7","#22d3ee","rgba(255,255,255,0.7)","#ff9500"][
        Math.floor(Math.random() * 6)
      ],
    }))
  ).current;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            animation: `float-particle ${p.dur}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CONFETTI CANVAS
═══════════════════════════════════════════════════ */
function ConfettiCanvas({ active, rainbow = false }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const palette = rainbow
      ? ["#ff0000","#ff7700","#ffff00","#00ff77","#00cfff","#8b00ff","#ff69b4","#fff"]
      : ["#f5c842","#ff6b9d","#a855f7","#22d3ee","#ffffff","#ff9500","#ffd700"];

    const cx = canvas.width / 2, cy = canvas.height / 2;
    const pieces = Array.from({ length: 240 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 18 + 4;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 8,
        w: Math.random() * 12 + 4,
        h: Math.random() * 6 + 2,
        color: palette[Math.floor(Math.random() * palette.length)],
        rot: Math.random() * 360,
        rspeed: (Math.random() - 0.5) * 12,
        grav: 0.45 + Math.random() * 0.2,
        drag: 0.98,
        shape: ["rect","circle","tri"][Math.floor(Math.random()*3)],
      };
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pieces) {
        p.vx *= p.drag; p.vy *= p.drag;
        p.x += p.vx; p.y += p.vy;
        p.vy += p.grav;
        p.rot += p.rspeed;
        const alpha = Math.max(0, 1 - p.y / canvas.height);
        if (alpha > 0) alive = true;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w/2, 0, Math.PI*2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.h); ctx.lineTo(p.w/2, p.h); ctx.lineTo(-p.w/2, p.h);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
      if (alive) rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, rainbow]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:500 }}
    />
  );
}

/* ═══════════════════════════════════════════════════
   TYPING TEXT
═══════════════════════════════════════════════════ */
function TypingText({ text, speed = 38, onComplete }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= text.length) { onComplete?.(); return; }
    const t = setTimeout(() => setIdx(i => i + 1), speed);
    return () => clearTimeout(t);
  }, [idx, text, speed, onComplete]);

  return (
    <span>
      {text.slice(0, idx)}
      {idx < text.length && (
        <span style={{ display:"inline-block", width:2, height:"1em", background:"#f5c842",
          verticalAlign:"middle", marginLeft:3, animation:"blink-cursor 0.7s step-end infinite" }} />
      )}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   STAGE 0 — THE LOCKED PORTAL
═══════════════════════════════════════════════════ */
function StageIntro({ onUnlock }) {
  const [progress, setProgress] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [exploding, setExploding] = useState(false);
  const intervalRef = useRef(null);
  const progressRef = useRef(0);

  const R = 56;
  const circ = 2 * Math.PI * R;

  const startPress = useCallback(() => {
    if (exploding) return;
    setPressing(true);
    progressRef.current = progress;
    intervalRef.current = setInterval(() => {
      progressRef.current = Math.min(100, progressRef.current + 2.2);
      setProgress(progressRef.current);
      if (progressRef.current >= 100) {
        clearInterval(intervalRef.current);
        setPressing(false);
        setExploding(true);
        setTimeout(onUnlock, 900);
      }
    }, 40);
  }, [exploding, progress, onUnlock]);

  const stopPress = useCallback(() => {
    if (exploding) return;
    clearInterval(intervalRef.current);
    setPressing(false);
    progressRef.current = 0;
    setProgress(0);
  }, [exploding]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      {/* Header text */}
      <div style={{ textAlign:"center", marginBottom:56 }}>
        <p style={{ fontFamily:"Space Mono,monospace", fontSize:"0.65rem", letterSpacing:"0.35em", color:"rgba(245,200,66,0.5)", marginBottom:12 }}>
          FOR MUNTAHINA · FROM FARUK
        </p>
        <h1 style={{
          fontFamily:"Cormorant Garamond,serif", fontStyle:"italic", fontWeight:300,
          fontSize:"clamp(2.2rem,8vw,5rem)", color:"#f5c842",
          textShadow:"0 0 60px rgba(245,200,66,0.4), 0 2px 40px rgba(245,200,66,0.2)",
          lineHeight:1.1,
        }}>
          A Secret Awaits
        </h1>
        <div style={{ width:80, height:1, background:"linear-gradient(90deg,transparent,#f5c842,transparent)", margin:"20px auto" }} />
      </div>

      {/* Long-press gift */}
      <div
        onMouseDown={startPress} onMouseUp={stopPress} onMouseLeave={stopPress}
        onTouchStart={startPress} onTouchEnd={stopPress}
        style={{ position:"relative", width:128, height:128, display:"flex", alignItems:"center", justifyContent:"center", cursor:"none", userSelect:"none" }}
      >
        {/* SVG circular progress */}
        <svg width={128} height={128} style={{ position:"absolute", inset:0, transform:"rotate(-90deg)" }}>
          <circle cx={64} cy={64} r={R} fill="none" stroke="rgba(245,200,66,0.12)" strokeWidth={3.5} />
          <circle
            cx={64} cy={64} r={R} fill="none"
            stroke="#f5c842" strokeWidth={3.5} strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (progress / 100) * circ}
            style={{ transition:"stroke-dashoffset 0.04s linear", filter:"drop-shadow(0 0 6px #f5c842)" }}
          />
        </svg>

        {/* Gift box */}
        <div
          className={exploding ? "" : "gift-idle"}
          style={{
            position:"relative", width:78, height:78,
            transform: exploding ? undefined : pressing ? "scale(0.9)" : "scale(1)",
            transition: "transform 0.1s ease",
            animation: exploding ? "explode-box 0.8s cubic-bezier(0.36,0.07,0.19,0.97) forwards" : undefined,
          }}
        >
          {/* Box body */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:56,
            background:"linear-gradient(145deg,#1a0b30,#2c1555,#1a0b30)",
            border:`2px solid #f5c842`,
            borderRadius:8,
            boxShadow:pressing ? "0 0 50px rgba(245,200,66,0.8),inset 0 0 20px rgba(245,200,66,0.1)" : "0 0 22px rgba(245,200,66,0.35)",
            transition:"box-shadow 0.15s ease",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:28,
          }}>🎁</div>
          {/* Lid */}
          <div style={{
            position:"absolute", top:0, left:-3, right:-3, height:22,
            background:"linear-gradient(145deg,#2c1555,#1a0b30)",
            border:"2px solid #f5c842", borderRadius:"6px 6px 0 0",
            boxShadow:pressing ? "0 0 30px rgba(245,200,66,0.6)" : "0 0 14px rgba(245,200,66,0.25)",
            transition:"box-shadow 0.15s ease",
          }} />
          {/* Vertical ribbon */}
          <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:14, height:"100%", background:"rgba(245,200,66,0.85)", borderRadius:3 }} />
          {/* Horizontal ribbon */}
          <div style={{ position:"absolute", top:10, left:0, right:0, height:10, background:"rgba(245,200,66,0.85)", borderRadius:3 }} />
        </div>
      </div>

      {/* Hint text */}
      <p style={{
        marginTop:36, fontFamily:"Space Mono,monospace", fontSize:"0.65rem",
        letterSpacing:"0.25em", color:"rgba(255,255,255,0.35)",
        animation: pressing ? "none" : "float-particle 3s ease-in-out infinite",
      }}>
        {exploding ? "✨ UNLOCKED ✨" : pressing ? `UNLOCKING... ${Math.floor(progress)}%` : "HOLD TO UNLOCK"}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STAGE 1 — THE UNWRAPPING
═══════════════════════════════════════════════════ */
function StageUnwrapping({ onContinue }) {
  const [showLetter, setShowLetter] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowLetter(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typingDone) {
      const t = setTimeout(() => setShowBtn(true), 400);
      return () => clearTimeout(t);
    }
  }, [typingDone]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:10, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <ConfettiCanvas active />

      {showLetter && (
        <div
          className="glass-card"
          style={{
            maxWidth:580, width:"100%", borderRadius:22, padding:"44px 48px",
            position:"relative", zIndex:20, overflow:"hidden",
            animation:"unfold-letter 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards",
          }}
        >
          {/* Top color bar */}
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:3,
            background:"linear-gradient(90deg,#f5c842,#ff6b9d,#a855f7,#22d3ee)",
          }} />

          <p style={{ fontFamily:"Space Mono,monospace", fontSize:"0.6rem", letterSpacing:"0.35em", color:"rgba(245,200,66,0.55)", marginBottom:28 }}>
            📜 A SECRET LETTER
          </p>

          <div style={{
            fontFamily:"Cormorant Garamond,serif", fontSize:"clamp(1.1rem,3vw,1.45rem)",
            color:"#f0e6d0", lineHeight:1.85, fontWeight:300,
          }}>
            <TypingText
              text="Hi Gu Khor, I has a secret for you... but you must pass the tests first! 🔮"
              speed={32}
              onComplete={() => setTypingDone(true)}
            />
          </div>

          {showBtn && (
            <button
              onClick={onContinue}
              style={{
                marginTop:36, padding:"13px 38px",
                background:"linear-gradient(135deg,#f5c842,#ff9500)",
                border:"none", borderRadius:50,
                color:"#0a0610", fontFamily:"Space Mono,monospace", fontSize:"0.75rem",
                fontWeight:700, letterSpacing:"0.12em", cursor:"none",
                boxShadow:"0 4px 24px rgba(245,200,66,0.4)",
                animation:"blur-scale-in 0.5s ease forwards",
                transition:"transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={e => { e.target.style.transform="scale(1.06)"; e.target.style.boxShadow="0 6px 32px rgba(245,200,66,0.6)"; }}
              onMouseLeave={e => { e.target.style.transform="scale(1)";    e.target.style.boxShadow="0 4px 24px rgba(245,200,66,0.4)"; }}
            >
              I'M READY — LET'S GO →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STAGE 2 — MEMORY LANE
═══════════════════════════════════════════════════ */
const MEMORIES = [
  { emoji:"🌸", title:"The First Hello",    body:"কোচিং এ থাকতে প্রচুর মেজাজ খারাপ হইতো তোর কাহিনী দেখলে আমার, এখন ও হয়. হালার পুৎ" },
  { emoji:"💫", title:"Your Laughter",      body:"Your smile is so beautiful. It feels like a black dog has wandered in the Kochu forest." },
  { emoji:"🌙", title:"Late Night Vibes",   body:"রাত কইরা হঠাৎ তোর স্টোরিতে দেওয়া ছবি  আমার সামনে আইলে রে ভাই কি যে ভয় লাগে আমার পুরা শাকচুন্নি" },
  { emoji:"🎨", title:"Your Creativity",    body:"You see colors in places others only see grey. That's not a skill — Only Gays are see this color." },
  { emoji:"☕", title:"The Small Moments",  body:"তুই নিজে এ তো small তোর সবকিছুই small :)" },
  { emoji:"✨", title:"Bhalo Hoye Jao.",   body:"May Allah grant him a good and prosperous life, Ameen." },
];

function MemoryLane({ onContinue }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:10, overflowY:"auto" }}>
      <div style={{ minHeight:"100%", padding:"64px 24px 56px", display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <p style={{ fontFamily:"Space Mono,monospace", fontSize:"0.6rem", letterSpacing:"0.35em", color:"rgba(245,200,66,0.5)" }}>
            CHAPTER II
          </p>
          <h2 style={{
            fontFamily:"Cormorant Garamond,serif", fontStyle:"italic", fontWeight:300,
            fontSize:"clamp(2.2rem,6vw,3.8rem)", color:"#f0e6d0",
            textShadow:"0 0 50px rgba(245,200,66,0.25)", marginTop:8,
          }}>
            Memory Lane
          </h2>
          <div style={{ width:70, height:1, background:"linear-gradient(90deg,transparent,#f5c842,transparent)", margin:"18px auto" }} />
        </div>

        {/* Cards */}
        <div style={{ width:"100%", maxWidth:700, display:"flex", flexDirection:"column", gap:20 }}>
          {MEMORIES.map((m, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding:"28px 32px", borderRadius:18,
                  maxWidth:380, width:"100%",
                  alignSelf: isLeft ? "flex-start" : "flex-end",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0) scale(1)" : `translateX(${isLeft ? -70 : 70}px) scale(0.92)`,
                  transition:`all 0.75s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.13}s`,
                  borderLeft: isLeft ? "3px solid rgba(245,200,66,0.35)" : "none",
                  borderRight: isLeft ? "none" : "3px solid rgba(255,107,157,0.35)",
                }}
              >
                <div style={{ fontSize:34, marginBottom:12 }}>{m.emoji}</div>
                <h3 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"1.3rem", fontWeight:600, color:"#f5c842", marginBottom:8 }}>
                  {m.title}
                </h3>
                <p style={{ fontFamily:"Cormorant Garamond,serif", fontStyle:"italic", fontSize:"1rem", color:"rgba(255,255,255,0.65)", lineHeight:1.75 }}>
                  {m.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          style={{
            marginTop:52, padding:"14px 42px",
            background:"transparent", border:"1px solid rgba(245,200,66,0.35)", borderRadius:50,
            color:"#f5c842", fontFamily:"Space Mono,monospace", fontSize:"0.72rem",
            letterSpacing:"0.2em", cursor:"none",
            opacity: visible ? 1 : 0, transition:"opacity 1s ease 0.9s, transform 0.2s ease, border-color 0.2s ease, background 0.2s ease",
          }}
          onMouseEnter={e => { e.target.style.background="rgba(245,200,66,0.08)"; e.target.style.borderColor="#f5c842"; e.target.style.transform="scale(1.04)"; }}
          onMouseLeave={e => { e.target.style.background="transparent"; e.target.style.borderColor="rgba(245,200,66,0.35)"; e.target.style.transform="scale(1)"; }}
        >
          CONTINUE THE JOURNEY →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STAGE 3 — THE IMPOSSIBLE QUESTION
═══════════════════════════════════════════════════ */
function ImpossibleQuestion({ onYes }) {
  const [noPos, setNoPos] = useState(null);        // null = not yet initialized
  const [noIsYes, setNoIsYes] = useState(false);   // if somehow clicked
  const [yesHit, setYesHit] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const noBtnRef = useRef(null);

  // Set initial position after mount
  useEffect(() => {
    setNoPos({ x: window.innerWidth / 2 + 90, y: window.innerHeight / 2 + 10 });
  }, []);

  const flee = useCallback(() => {
    const margin = 90;
    setNoPos({
      x: margin + Math.random() * (window.innerWidth  - margin * 2 - 130),
      y: margin + Math.random() * (window.innerHeight - margin * 2 - 56),
    });
  }, []);

  // Proximity detection
  useEffect(() => {
    if (!noPos) return;
    const onMove = (e) => {
      if (!noBtnRef.current) return;
      const r = noBtnRef.current.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < 140) flee();
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [noPos, flee]);

  const handleYes = () => {
    setYesHit(true);
    setConfetti(true);
    setTimeout(onYes, 2800);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <ConfettiCanvas active={confetti} rainbow />

      <div style={{ textAlign:"center", maxWidth:640 }}>
        <p style={{ fontFamily:"Space Mono,monospace", fontSize:"0.6rem", letterSpacing:"0.35em", color:"rgba(255,107,157,0.7)", marginBottom:20 }}>
          ⚠️ SERIOUS QUESTION ALERT
        </p>
        <h2 style={{
          fontFamily:"Cormorant Garamond,serif", fontWeight:600,
          fontSize:"clamp(1.4rem,4.5vw,2.6rem)", color:"#f0e6d0", lineHeight:1.35,
          textShadow:"0 0 40px rgba(255,107,157,0.3)", marginBottom:12,
        }}>
          Wait! Before we proceed,<br />I have a very serious question...
        </h2>

        <p style={{
          fontFamily:"Cormorant Garamond,serif", fontStyle:"italic", fontWeight:600,
          fontSize:"clamp(2.2rem,8vw,5.5rem)", color:"#ff6b9d",
          textShadow:"0 0 50px rgba(255,107,157,0.6)", lineHeight:1.1, marginBottom:52,
        }}>
          Are You Gay? 🏳️‍🌈
        </p>

        {/* YES button — always in-flow */}
        <button
          onClick={handleYes}
          style={{
            padding:"15px 52px",
            background: yesHit
              ? "linear-gradient(135deg,#22c55e,#16a34a)"
              : "linear-gradient(135deg,rgba(34,197,94,0.25),rgba(22,163,74,0.25))",
            border:"2px solid #22c55e", borderRadius:50, color:"#fff",
            fontFamily:"Space Mono,monospace", fontWeight:700, fontSize:"1rem",
            letterSpacing:"0.1em", cursor:"none",
            boxShadow: yesHit ? "0 0 40px rgba(34,197,94,0.6)" : "0 0 18px rgba(34,197,94,0.3)",
            transition:"all 0.25s ease",
            transform: yesHit ? "scale(1.12)" : "scale(1)",
            position:"relative", zIndex:20,
          }}
        >
          YES 💚
        </button>

        {/* NO button — fixed, fleeing */}
        {noPos && (
          <button
            ref={noBtnRef}
            onClick={() => setNoIsYes(true)}
            onMouseEnter={flee}
            style={{
              position:"fixed",
              left: noPos.x,
              top: noPos.y,
              transition:"left 0.14s cubic-bezier(0.34,1.56,0.64,1), top 0.14s cubic-bezier(0.34,1.56,0.64,1)",
              padding:"15px 52px",
              background: noIsYes
                ? "linear-gradient(135deg,#22c55e,#16a34a)"
                : "linear-gradient(135deg,rgba(239,68,68,0.22),rgba(220,38,38,0.22))",
              border:`2px solid ${noIsYes ? "#22c55e" : "#ef4444"}`, borderRadius:50,
              color:"#fff", fontFamily:"Space Mono,monospace", fontWeight:700, fontSize:"1rem",
              letterSpacing:"0.1em", cursor:"none",
              boxShadow:`0 0 18px ${noIsYes ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.35)"}`,
              zIndex:200,
              transition:"left 0.14s cubic-bezier(0.34,1.56,0.64,1), top 0.14s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, border-color 0.2s",
            }}
          >
            {noIsYes ? "YES 💚" : "NO ❌"}
          </button>
        )}

        {yesHit && (
          <p style={{
            marginTop:36, fontFamily:"Cormorant Garamond,serif", fontStyle:"italic",
            fontSize:"1.6rem", color:"#f5c842",
            animation:"blur-scale-in 0.5s ease forwards",
          }}>
            Haha! Ami jantam tui Gay! 🎉 Moving on...
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STAGE 4 — SEQUENTIAL HEARTFELT MESSAGES
═══════════════════════════════════════════════════ */
const MESSAGES = [
  { emoji:"💻", text:"In every line of code I write..." },
  { emoji:"🌸", text:"You are the most Irritating logic..." },
  { emoji:"🎂", text:"Happy Birthday Bro, Muntahina Banin!" },
];

function HeartfeltMessages({ onComplete }) {
  const [idx, setIdx]         = useState(0);
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    if (idx >= MESSAGES.length) { setTimeout(onComplete, 700); return; }
    const stayT = setTimeout(() => {
      setEntering(false);
      setTimeout(() => {
        setIdx(i => i + 1);
        setEntering(true);
      }, 650);
    }, 3000);
    return () => clearTimeout(stayT);
  }, [idx, onComplete]);

  if (idx >= MESSAGES.length) return null;
  const msg = MESSAGES[idx];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{
        textAlign:"center", padding:"24px",
        opacity: entering ? 1 : 0,
        filter: entering ? "blur(0)" : "blur(20px)",
        transform: entering ? "scale(1)" : "scale(0.8)",
        transition:"all 0.65s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{ fontSize:72, marginBottom:28, filter:"drop-shadow(0 0 30px rgba(245,200,66,0.7))", lineHeight:1 }}>
          {msg.emoji}
        </div>
        <p style={{
          fontFamily:"Cormorant Garamond,serif", fontStyle:"italic", fontWeight:300,
          fontSize:"clamp(2rem,7vw,5rem)", color:"#f0e6d0", lineHeight:1.25,
          textShadow:"0 0 80px rgba(245,200,66,0.35)",
          maxWidth:700,
        }}>
          {msg.text}
        </p>
        <div style={{
          marginTop:28, height:1,
          background:"linear-gradient(90deg,transparent,#f5c842,transparent)",
          width:160, margin:"28px auto 0",
        }} />
        <p style={{ marginTop:14, fontFamily:"Space Mono,monospace", fontSize:"0.55rem", letterSpacing:"0.3em", color:"rgba(255,255,255,0.18)" }}>
          {idx + 1} / {MESSAGES.length}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STAGE 5 — THE GRAND GIFT REVEAL
═══════════════════════════════════════════════════ */
function GiftReveal({ onReset }) {
  const [vis, setVis] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => { setVis(true); }, 100);
    const t2 = setTimeout(() => setConfetti(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:10, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <ConfettiCanvas active={confetti} />

      <div
        className="glass-card rainbow-border"
        style={{
          position:"relative", maxWidth:540, width:"100%", borderRadius:26, padding:"52px 48px",
          textAlign:"center", zIndex:20,
          opacity: vis ? 1 : 0, transform: vis ? "scale(1)" : "scale(0.65)",
          transition:"all 1.1s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow:"0 0 80px rgba(245,200,66,0.18), 0 0 160px rgba(168,85,247,0.1)",
          border:"1px solid rgba(245,200,66,0.3)",
          overflow:"hidden",
        }}
      >
        {/* Radial inner glow */}
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 30%, rgba(245,200,66,0.07) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div style={{ fontSize:80, marginBottom:24, filter:"drop-shadow(0 0 40px rgba(245,200,66,0.7))", lineHeight:1, position:"relative", zIndex:1 }}>
          🎁
        </div>

        <h2 style={{
          fontFamily:"Cormorant Garamond,serif", fontWeight:600,
          fontSize:"clamp(1.8rem,4.5vw,2.8rem)", color:"#f5c842",
          textShadow:"0 0 50px rgba(245,200,66,0.5)", lineHeight:1.2, marginBottom:20,
          position:"relative", zIndex:1,
        }}>
          I has a special gift for you!
        </h2>

        <p style={{
          fontFamily:"Cormorant Garamond,serif", fontStyle:"italic",
          fontSize:"1.15rem", color:"rgba(255,255,255,0.65)", lineHeight:1.8,
          marginBottom:28, position:"relative", zIndex:1,
        }}>
          DM me for the surprise ✨<br />
          Something beautiful is on its way...
          (Eto o spacial kicu dimu na tore.)
        </p>

        <div style={{
          padding:"16px 24px", background:"rgba(245,200,66,0.07)",
          border:"1px solid rgba(245,200,66,0.18)", borderRadius:14, marginBottom:36,
          position:"relative", zIndex:1,
        }}>
          <p style={{ fontFamily:"Space Mono,monospace", fontSize:"0.72rem", color:"rgba(245,200,66,0.8)", letterSpacing:"0.14em" }}>
            🎂 Subho PaydaDibos, MUNTAHINA 🎂
          </p>
        </div>

        <p style={{ fontFamily:"Cormorant Garamond,serif", fontStyle:"italic", fontSize:"1.05rem", color:"rgba(255,255,255,0.35)", marginBottom:40, position:"relative", zIndex:1 }}>
          — With Hate, Faruk 💛
        </p>

        <button
          onClick={onReset}
          style={{
            padding:"13px 36px", background:"transparent",
            border:"1px solid rgba(255,255,255,0.18)", borderRadius:50,
            color:"rgba(255,255,255,0.4)", fontFamily:"Space Mono,monospace",
            fontSize:"0.65rem", letterSpacing:"0.2em", cursor:"none",
            transition:"all 0.3s ease", position:"relative", zIndex:1,
          }}
          onMouseEnter={e => { e.target.style.color="rgba(255,255,255,0.75)"; e.target.style.borderColor="rgba(255,255,255,0.45)"; e.target.style.transform="scale(1.04)"; }}
          onMouseLeave={e => { e.target.style.color="rgba(255,255,255,0.4)"; e.target.style.borderColor="rgba(255,255,255,0.18)"; e.target.style.transform="scale(1)"; }}
        >
          ↺ CLOSE & WRAP IT BACK UP
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MUSIC PLAYER (Placeholder)
═══════════════════════════════════════════════════ */
function MusicPlayer() {
  const [on, setOn] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setPulse(p => !p), 600);
    return () => clearInterval(t);
  }, [on]);

  return (
    <div
      onClick={() => setOn(p => !p)}
      style={{
        position:"fixed", bottom:24, right:24, zIndex:1000,
        display:"flex", alignItems:"center", gap:10, padding:"10px 18px",
        background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)",
        border:"1px solid rgba(255,255,255,0.1)", borderRadius:50, cursor:"none",
        transition:"border-color 0.3s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor="rgba(245,200,66,0.3)"}
      onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}
    >
      {[1,2,3].map(b => (
        <div key={b} style={{
          width:3, borderRadius:2,
          height: on && pulse ? `${6 + b * 4}px` : "6px",
          background: on ? "#f5c842" : "rgba(255,255,255,0.25)",
          transition:"height 0.3s ease, background 0.3s ease",
          boxShadow: on ? "0 0 6px #f5c842" : "none",
        }} />
      ))}
      <span style={{ fontFamily:"Space Mono,monospace", fontSize:"0.58rem", letterSpacing:"0.2em", color: on ? "rgba(245,200,66,0.7)" : "rgba(255,255,255,0.3)", transition:"color 0.3s" }}>
        {on ? "♪ PLAYING" : "♪ MUSIC"}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STAGE TRANSITION FADE WRAPPER
═══════════════════════════════════════════════════ */
function FadeStage({ children }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShown(true), 30); return () => clearTimeout(t); }, []);
  return (
    <div style={{ opacity: shown ? 1 : 0, transition:"opacity 0.5s ease", position:"fixed", inset:0, zIndex:5 }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════ */
export default function BirthdayTribute() {
  const [stage, setStage]           = useState(0);
  const [transitioning, setTrans]   = useState(false);

  const advance = useCallback((next) => {
    setTrans(true);
    setTimeout(() => {
      setStage(next);
      setTrans(false);
    }, 450);
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden" }}>
      <style>{STYLES}</style>

      {/* Animated mesh gradient background */}
      <div className="mesh-bg" style={{ position:"fixed", inset:0, zIndex:0 }} />

      {/* Vignette overlay */}
      <div style={{
        position:"fixed", inset:0, zIndex:2, pointerEvents:"none",
        background:"radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
      }} />

      {/* Ambient particles */}
      <FloatingParticles />

      {/* Custom cursor trail */}
      <CursorTrail />

      {/* Music player UI */}
      <MusicPlayer />

      {/* Stage indicator */}
      <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:1000,
        display:"flex", gap:6, alignItems:"center" }}>
        {[0,1,2,3,4,5].map(s => (
          <div key={s} style={{
            width: s === stage ? 20 : 6, height:6, borderRadius:3,
            background: s === stage ? "#f5c842" : "rgba(255,255,255,0.15)",
            boxShadow: s === stage ? "0 0 8px #f5c842" : "none",
            transition:"all 0.4s ease",
          }} />
        ))}
      </div>

      {/* Stage rendering with cross-fade */}
      <div style={{ opacity: transitioning ? 0 : 1, transition:"opacity 0.45s ease", position:"fixed", inset:0, zIndex:5 }}>
        {stage === 0 && <FadeStage key="intro">    <StageIntro         onUnlock={()   => advance(1)} /></FadeStage>}
        {stage === 1 && <FadeStage key="unwrap">   <StageUnwrapping    onContinue={()  => advance(2)} /></FadeStage>}
        {stage === 2 && <FadeStage key="memory">   <MemoryLane         onContinue={()  => advance(3)} /></FadeStage>}
        {stage === 3 && <FadeStage key="question"> <ImpossibleQuestion onYes={()      => advance(4)} /></FadeStage>}
        {stage === 4 && <FadeStage key="msgs">     <HeartfeltMessages  onComplete={()  => advance(5)} /></FadeStage>}
        {stage === 5 && <FadeStage key="reveal">   <GiftReveal         onReset={()    => advance(0)} /></FadeStage>}
      </div>
    </div>
  );
}
