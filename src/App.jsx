import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
// SHARPMIND v2 — Game-Centric Cognitive Training
// 8 playable executive function games, analytics, compete
// ═══════════════════════════════════════════════════════════

const C = {
  navy: "#171c38", gold: "#d9ad52", cream: "#faf5eb", slate: "#5a616e",
  teal: "#2e9490", coral: "#e06b5c", sage: "#8cb385", lavender: "#9e8ac7",
  success: "#4db075", warning: "#e8b840", error: "#d94d47",
  bg: "#f5f0e6", cardBg: "#ffffff", darkBg: "#171c38",
};

const font = (size, weight = 400) => ({
  fontFamily: "'DM Sans', 'Nunito', system-ui, sans-serif",
  fontSize: size, fontWeight: weight, lineHeight: 1.4
});
const mono = (size, weight = 700) => ({
  fontFamily: "'DM Mono', 'SF Mono', monospace",
  fontSize: size, fontWeight: weight
});
const displayFont = (size) => ({
  fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif",
  fontSize: size, fontWeight: 700, lineHeight: 1.1
});

const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Outfit:wght@400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  return null;
};

// ── Shared Components ──────────────────────────────────────
const Card = ({ children, style, glow, glowColor = C.gold, onClick }) => (
  <div onClick={onClick} style={{
    padding: 20, background: C.cardBg, borderRadius: 20,
    boxShadow: glow ? `0 6px 24px ${glowColor}40, inset 0 0 0 1px ${glowColor}4d` : "0 4px 16px rgba(0,0,0,0.06)",
    cursor: onClick ? "pointer" : "default", transition: "transform 0.2s, box-shadow 0.2s", ...style
  }}>{children}</div>
);

const ProgressRing = ({ progress, size = 80, stroke = 10, color = C.gold, trackColor = "#1a1e3218", children }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(Math.min(progress, 1)), 50); return () => clearTimeout(t); }, [progress]);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - anim)}
          style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
};

const Btn = ({ children, onClick, color = C.gold, textColor = C.navy, disabled, style }) => (
  <button onClick={disabled ? undefined : onClick} style={{
    ...font(18, 600), color: textColor, background: color, border: "none",
    borderRadius: 16, padding: "16px 32px", width: "100%", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1, transition: "transform 0.15s, opacity 0.2s", ...style
  }}
    onMouseDown={e => !disabled && (e.currentTarget.style.transform = "scale(0.97)")}
    onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
  >{children}</button>
);

const SectionHeader = ({ title, subtitle, icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
    {icon && <span style={{ fontSize: 22 }}>{icon}</span>}
    <div>
      <div style={{ ...displayFont(22), color: C.navy }}>{title}</div>
      {subtitle && <div style={{ ...font(14, 500), color: C.slate }}>{subtitle}</div>}
    </div>
  </div>
);

const StatPill = ({ label, value, color }) => (
  <div style={{ flex: 1, textAlign: "center", padding: "10px 8px", background: color + "14", borderRadius: 12 }}>
    <div style={{ ...mono(18), color }}>{value}</div>
    <div style={{ ...font(11, 500), color: C.slate, marginTop: 2 }}>{label}</div>
  </div>
);

const SkillBar = ({ name, score, color, max = 10 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ ...font(14, 500), color: C.slate, width: 90 }}>{name}</div>
    <div style={{ flex: 1, height: 10, background: C.navy + "10", borderRadius: 5, overflow: "hidden" }}>
      <div style={{ width: `${(score / max) * 100}%`, height: "100%", background: color, borderRadius: 5, transition: "width 0.8s ease-out" }} />
    </div>
    <div style={{ ...mono(14), color: C.navy, width: 24, textAlign: "right" }}>{score}</div>
  </div>
);

// ── Game Registry ──────────────────────────────────────────
const GAMES = [
  { id: "pattern", name: "Pattern Recall", icon: "🧩", color: C.teal, skill: "Memory", desc: "Memorize and repeat tile patterns", difficulty: "Medium" },
  { id: "number", name: "Number Flow", icon: "🔢", color: C.gold, skill: "Logic", desc: "Solve sequences and equations fast", difficulty: "Medium" },
  { id: "focus", name: "Focus Grid", icon: "🎯", color: C.lavender, skill: "Attention", desc: "Find targets in a visual field", difficulty: "Easy" },
  { id: "decision", name: "Decision Lab", icon: "⚖️", color: C.sage, skill: "Judgment", desc: "Navigate executive scenarios", difficulty: "Hard" },
  { id: "wordmaze", name: "Word Maze", icon: "🔤", color: C.coral, skill: "Creativity", desc: "Build word chains from connections", difficulty: "Medium" },
  { id: "priority", name: "Priority Matrix", icon: "📋", color: "#d4814e", skill: "Planning", desc: "Sort tasks by urgency and impact", difficulty: "Hard" },
  { id: "dualn", name: "Dual N-Back", icon: "🔁", color: "#5ca0d6", skill: "Working Memory", desc: "Track two streams simultaneously", difficulty: "Hard" },
  { id: "speedsort", name: "Speed Sort", icon: "⚡", color: "#d6a75c", skill: "Flexibility", desc: "Categorize rapidly under pressure", difficulty: "Easy" },
];

const SKILLS = [
  { name: "Memory", color: C.teal, games: ["pattern", "dualn"] },
  { name: "Logic", color: C.gold, games: ["number"] },
  { name: "Attention", color: C.lavender, games: ["focus"] },
  { name: "Judgment", color: C.sage, games: ["decision"] },
  { name: "Creativity", color: C.coral, games: ["wordmaze"] },
  { name: "Planning", color: "#d4814e", games: ["priority"] },
  { name: "Flexibility", color: "#d6a75c", games: ["speedsort"] },
];

// ── Default Profile ────────────────────────────────────────
const makeProfile = (name = "Alex") => ({
  firstName: name, totalXP: 2450, currentLevel: 5, currentStreak: 12, longestStreak: 21,
  avatarTitle: "Strategic Mind", ceoScore: 70,
  skillScores: { Memory: 7, Logic: 6, Attention: 8, Judgment: 7, Creativity: 6, Planning: 5, Flexibility: 6 },
  gameHistory: GAMES.map(g => ({
    id: g.id, bestScore: Math.floor(Math.random() * 100 + 80), timesPlayed: Math.floor(Math.random() * 15 + 3),
    lastScore: Math.floor(Math.random() * 80 + 60),
  })),
  weekScores: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => ({
    day: d, score: i === 5 ? 0 : Math.floor(Math.random() * 300 + 200)
  })),
  achievements: [
    { id: 1, name: "First Workout", icon: "🏅", earned: true },
    { id: 2, name: "7-Day Streak", icon: "🔥", earned: true },
    { id: 3, name: "Score 200+", icon: "💎", earned: true },
    { id: 4, name: "All Games Played", icon: "🌟", earned: true },
    { id: 5, name: "30-Day Streak", icon: "👑", earned: false },
    { id: 6, name: "Score 500+", icon: "🏆", earned: false },
    { id: 7, name: "Master Memory", icon: "🧠", earned: false },
    { id: 8, name: "Perfect Round", icon: "⭐", earned: false },
  ],
});

// ═══════════════════════════════════════════════════════════
// ONBOARDING (streamlined — 3 pages, game-focused)
// ═══════════════════════════════════════════════════════════
const OnboardingView = ({ onComplete }) => {
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const [animIn, setAnimIn] = useState(false);
  useEffect(() => { setTimeout(() => setAnimIn(true), 100); }, []);

  const pages = [
    <div key={0} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 32, textAlign: "center" }}>
      <div style={{ position: "relative", marginBottom: 32 }}>
        <div style={{ width: 220, height: 220, borderRadius: "50%", background: `${C.gold}14`, position: "absolute", top: "50%", left: "50%", transform: `translate(-50%,-50%) scale(${animIn ? 1 : 0.3})`, transition: "transform 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
        <div style={{ width: 160, height: 160, borderRadius: "50%", background: `${C.gold}26`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${animIn ? 1 : 0.5})`, transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <span style={{ fontSize: 72, filter: `opacity(${animIn ? 1 : 0})`, transition: "filter 0.5s" }}>🧠</span>
        </div>
      </div>
      <div style={{ ...displayFont(42), color: "#fff", opacity: animIn ? 1 : 0, transition: "opacity 0.6s 0.2s" }}>SharpMind</div>
      <div style={{ ...font(20, 600), color: C.gold, marginTop: 8, opacity: animIn ? 1 : 0, transition: "opacity 0.6s 0.3s" }}>Train Your Executive Mind</div>
      <p style={{ ...font(18), color: "rgba(255,255,255,0.75)", marginTop: 16, maxWidth: 340, opacity: animIn ? 1 : 0, transition: "opacity 0.6s 0.4s" }}>
        8 cognitive games designed to sharpen memory, decision-making, strategic thinking, and mental agility.
      </p>
      <div style={{ flex: 1 }} />
      <Btn onClick={() => setPage(1)} style={{ opacity: animIn ? 1 : 0, transition: "opacity 0.6s 0.5s" }}>Get Started</Btn>
    </div>,
    <div key={1} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 32, textAlign: "center" }}>
      <span style={{ fontSize: 56, marginBottom: 20 }}>👤</span>
      <div style={{ ...displayFont(28), color: "#fff", marginBottom: 24 }}>What should we call you?</div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your first name"
        style={{ ...font(20, 600), color: "#fff", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 14, padding: "14px 20px", textAlign: "center", width: "80%", outline: "none" }} />
      <p style={{ ...font(14, 500), color: "rgba(255,255,255,0.5)", marginTop: 12, maxWidth: 300 }}>We'll personalize your training based on your performance.</p>
      <div style={{ flex: 1 }} />
      <Btn onClick={() => setPage(2)} disabled={!name.trim()}>Continue</Btn>
    </div>,
    <div key={2} style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", padding: 24, overflowY: "auto" }}>
      <div style={{ ...displayFont(26), color: "#fff", marginBottom: 8 }}>Your Training Arsenal</div>
      <div style={{ ...font(15), color: "rgba(255,255,255,0.6)", marginBottom: 20, textAlign: "center" }}>8 games across 7 cognitive skills</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
        {GAMES.map(g => (
          <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(255,255,255,0.06)", borderRadius: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: g.color + "26", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{g.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ ...font(16, 600), color: "#fff" }}>{g.name}</div>
              <div style={{ ...font(13, 500), color: "rgba(255,255,255,0.5)" }}>{g.skill} · {g.difficulty}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 20 }} />
      <Btn onClick={() => onComplete(makeProfile(name))}>Start Training 🚀</Btn>
    </div>,
  ];

  return (
    <div style={{ height: "100%", background: C.navy, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `${C.gold}0a`, top: -200, left: -100 }} />
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: `${C.teal}0d`, bottom: -100, right: -50 }} />
      <div style={{ display: "flex", justifyContent: "center", gap: 8, paddingTop: 20, position: "relative", zIndex: 2 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: i === page ? 28 : 8, height: 8, borderRadius: 4, background: i === page ? C.gold : "rgba(255,255,255,0.25)", transition: "all 0.3s" }} />
        ))}
      </div>
      <div style={{ height: "calc(100% - 48px)", position: "relative", zIndex: 2 }}>{pages[page]}</div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ALL 8 GAMES — Fully Playable
// ═══════════════════════════════════════════════════════════

// Game chrome wrapper
const GameChrome = ({ name, icon, color, round, totalRounds, score, timeLeft, maxTime, children, subtitle }) => (
  <div style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
    <div style={{ ...displayFont(22), color: "#fff", marginBottom: 2 }}>{icon} {name}</div>
    {subtitle && <div style={{ ...font(14, 500), color: `${color}cc`, marginBottom: 8 }}>{subtitle}</div>}
    <div style={{ display: "flex", gap: 16, width: "100%", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <span style={{ ...mono(13), color: "rgba(255,255,255,0.7)" }}>R{round}/{totalRounds}</span>
      {maxTime > 0 && (
        <div style={{ flex: 1, maxWidth: 120, height: 6, background: "rgba(255,255,255,0.12)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${(timeLeft / maxTime) * 100}%`, height: "100%", background: timeLeft > maxTime * 0.3 ? color : C.coral, borderRadius: 3, transition: "width 0.3s linear" }} />
        </div>
      )}
      <span style={{ ...mono(13), color: C.gold }}>★ {score}</span>
    </div>
    <div style={{ flex: 1, width: "100%", overflow: "auto" }}>{children}</div>
  </div>
);

// ── 1. Pattern Recall (Memory) ─────────────────────────────
const PatternRecallGame = ({ onComplete }) => {
  const [phase, setPhase] = useState("countdown");
  const [countdown, setCountdown] = useState(3);
  const [sequence, setSequence] = useState([]);
  const [showIdx, setShowIdx] = useState(-1);
  const [playerInput, setPlayerInput] = useState([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [seqLen, setSeqLen] = useState(3);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase === "countdown") {
      timerRef.current = setInterval(() => {
        setCountdown(c => { if (c <= 1) { clearInterval(timerRef.current); startRound(); return 3; } return c - 1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startRound = useCallback(() => {
    const seq = Array.from({ length: seqLen }, () => Math.floor(Math.random() * 9));
    setSequence(seq); setPlayerInput([]); setResult(null); setShowIdx(-1); setPhase("watching");
    seq.forEach((_, i) => {
      setTimeout(() => setShowIdx(i), i * 700 + 300);
      setTimeout(() => { setShowIdx(-1); if (i === seq.length - 1) setTimeout(() => setPhase("recalling"), 200); }, i * 700 + 700);
    });
  }, [seqLen]);

  const handleTap = (idx) => {
    if (phase !== "recalling") return;
    const next = [...playerInput, idx];
    setPlayerInput(next);
    if (next.length === sequence.length) {
      const correct = next.every((v, i) => v === sequence[i]);
      const pts = correct ? seqLen * 20 + round * 5 : 0;
      setResult(correct); setScore(s => s + pts); setPhase("feedback");
      setTimeout(() => {
        if (round < 5) { setRound(r => r + 1); if (correct) setSeqLen(l => Math.min(l + 1, 7)); startRound(); }
        else onComplete(score + pts);
      }, 1200);
    }
  };

  if (phase === "countdown") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column" }}>
      <div style={{ ...displayFont(72), color: C.gold }}>{countdown}</div>
      <div style={{ ...font(16, 500), color: "rgba(255,255,255,0.5)", marginTop: 12 }}>Get ready...</div>
    </div>
  );

  return (
    <GameChrome name="Pattern Recall" icon="🧩" color={C.teal} round={round} totalRounds={5} score={score} timeLeft={0} maxTime={0}
      subtitle={phase === "watching" ? "Watch the pattern" : phase === "recalling" ? "Tap the tiles in order" : result ? "Nailed it!" : "Almost!"}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "min(100%, 280px)", margin: "0 auto" }}>
        {Array.from({ length: 9 }, (_, i) => {
          const isLit = phase === "watching" && showIdx >= 0 && sequence[showIdx] === i;
          const isTapped = playerInput.includes(i);
          return (
            <div key={i} onClick={() => handleTap(i)} style={{
              aspectRatio: "1", borderRadius: 14, cursor: phase === "recalling" ? "pointer" : "default",
              background: isLit ? C.teal : isTapped ? `${C.teal}80` : "rgba(255,255,255,0.08)",
              border: `2px solid ${isLit ? C.teal : "rgba(255,255,255,0.1)"}`,
              transform: isLit ? "scale(1.08)" : "scale(1)", transition: "all 0.2s",
              boxShadow: isLit ? `0 0 20px ${C.teal}66` : "none"
            }} />
          );
        })}
      </div>
      {phase === "recalling" && (
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 16 }}>
          {Array.from({ length: seqLen }, (_, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: i < playerInput.length ? C.teal : "rgba(255,255,255,0.2)" }} />
          ))}
        </div>
      )}
      {result !== null && <div style={{ ...font(16, 600), color: result ? C.success : C.coral, textAlign: "center", marginTop: 12 }}>{result ? `✓ +${seqLen * 20 + round * 5}` : "✗ Keep going!"}</div>}
    </GameChrome>
  );
};

// ── 2. Number Flow (Logic) ─────────────────────────────────
const NumberFlowGame = ({ onComplete }) => {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef(null);
  const [problems] = useState(() => Array.from({ length: 8 }, (_, i) => {
    if (i % 2 === 0) {
      const start = Math.floor(Math.random() * 8) + 2, step = Math.floor(Math.random() * 4) + 2;
      const seq = Array.from({ length: 4 }, (_, j) => start + step * j), answer = start + step * 4;
      const ch = new Set([answer]); while (ch.size < 4) { const o = Math.floor(Math.random() * 5) + 1; ch.add(Math.random() > 0.5 ? answer + o : Math.max(1, answer - o)); }
      return { type: "seq", seq, answer, choices: [...ch].sort(() => Math.random() - 0.5) };
    } else {
      const a = Math.floor(Math.random() * 40) + 10, b = Math.floor(Math.random() * 20) + 5, answer = a + b;
      const ch = new Set([answer]); while (ch.size < 4) { const o = Math.floor(Math.random() * 8) + 1; ch.add(Math.random() > 0.5 ? answer + o : Math.max(1, answer - o)); }
      return { type: "eq", equation: `${a} + ${b} = ?`, answer, choices: [...ch].sort(() => Math.random() - 0.5) };
    }
  }));

  useEffect(() => {
    setTimeLeft(10); setSelected(null); clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
    return () => clearInterval(timerRef.current);
  }, [round]);

  const pick = (c) => {
    if (selected !== null) return; clearInterval(timerRef.current); setSelected(c);
    const pts = c === problems[round].answer ? 10 + timeLeft * 2 : 0;
    setScore(s => s + pts);
    setTimeout(() => { if (round < 7) setRound(r => r + 1); else onComplete(score + pts); }, 1000);
  };

  const p = problems[round];
  return (
    <GameChrome name="Number Flow" icon="🔢" color={C.gold} round={round + 1} totalRounds={8} score={score} timeLeft={timeLeft} maxTime={10} subtitle="Find the pattern or solve it">
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        {p.type === "seq" ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {p.seq.map((n, i) => <div key={i} style={{ ...mono(24), color: "#fff", padding: "8px 12px", background: "rgba(255,255,255,0.08)", borderRadius: 10, minWidth: 44, textAlign: "center" }}>{n}</div>)}
            <div style={{ ...displayFont(26), color: C.gold, padding: "8px 12px", background: `${C.gold}26`, borderRadius: 10, border: `2px solid ${C.gold}4d`, minWidth: 44 }}>?</div>
          </div>
        ) : <div style={{ ...displayFont(30), color: "#fff" }}>{p.equation}</div>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 300, margin: "0 auto" }}>
        {p.choices.map(c => {
          const isA = selected !== null && c === p.answer, isW = selected === c && c !== p.answer;
          return <div key={c} onClick={() => pick(c)} style={{ ...mono(22), textAlign: "center", padding: 16, borderRadius: 14, cursor: selected ? "default" : "pointer", color: isA ? C.navy : "#fff", background: isA ? C.success : isW ? `${C.coral}4d` : "rgba(255,255,255,0.08)", border: `2px solid ${isA ? C.success : "transparent"}`, transition: "all 0.3s" }}>{c}</div>;
        })}
      </div>
    </GameChrome>
  );
};

// ── 3. Focus Grid (Attention) ──────────────────────────────
const FocusGridGame = ({ onComplete }) => {
  const symSets = [{ target: "★", dist: ["●","▲","■","◆"] }, { target: "♥", dist: ["♠","♣","◆","●"] }, { target: "☾", dist: ["☀","☁","★","✦"] }];
  const [round, setRound] = useState(0);
  const [grid, setGrid] = useState([]);
  const [target, setTarget] = useState("");
  const [found, setFound] = useState(0);
  const [total, setTotal] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(80);
  const [roundDone, setRoundDone] = useState(false);
  const timerRef = useRef(null);

  const buildRound = useCallback((r) => {
    const sym = symSets[r % symSets.length]; const numT = Math.min(3 + Math.floor(r / 2), 6);
    setTarget(sym.target); setTotal(numT); setFound(0); setRoundDone(false); setTimeLeft(80);
    const pos = new Set(); while (pos.size < numT) pos.add(Math.floor(Math.random() * 25));
    setGrid(Array.from({ length: 25 }, (_, i) => ({ id: i, symbol: pos.has(i) ? sym.target : sym.dist[Math.floor(Math.random() * sym.dist.length)], isTarget: pos.has(i), tapped: false })));
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); setRoundDone(true); return 0; } return t - 1; }), 100);
  }, []);

  useEffect(() => { buildRound(0); return () => clearInterval(timerRef.current); }, []);
  useEffect(() => { if (roundDone) { clearInterval(timerRef.current); setTimeout(() => { if (round + 1 < 6) { setRound(r => r + 1); buildRound(round + 1); } else onComplete(score); }, 1200); } }, [roundDone]);

  const tap = (cell) => {
    if (cell.tapped || roundDone) return;
    setGrid(g => g.map(c => c.id === cell.id ? { ...c, tapped: true } : c));
    if (cell.isTarget) { const nf = found + 1; setFound(nf); setScore(s => s + 15 + Math.floor(timeLeft / 10)); if (nf === total) setRoundDone(true); }
    else setScore(s => Math.max(0, s - 5));
  };

  return (
    <GameChrome name="Focus Grid" icon="🎯" color={C.lavender} round={round + 1} totalRounds={6} score={score} timeLeft={timeLeft / 10} maxTime={8} subtitle={`Find all ${target} symbols`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", background: "rgba(255,255,255,0.06)", borderRadius: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ ...font(14, 600), color: "rgba(255,255,255,0.6)" }}>Find:</span><span style={{ fontSize: 26, color: C.gold }}>{target}</span></div>
        <span style={{ ...mono(16), color: C.lavender }}>{found}/{total}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, maxWidth: 320, margin: "0 auto" }}>
        {grid.map(cell => (
          <div key={cell.id} onClick={() => tap(cell)} style={{
            aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, cursor: cell.tapped || roundDone ? "default" : "pointer", fontSize: 20,
            color: cell.tapped && cell.isTarget ? C.success : cell.tapped ? C.coral : roundDone && cell.isTarget && !cell.tapped ? C.gold : "rgba(255,255,255,0.7)",
            background: cell.tapped && cell.isTarget ? `${C.success}33` : cell.tapped ? `${C.coral}26` : "rgba(255,255,255,0.06)", transition: "all 0.2s"
          }}>{cell.symbol}</div>
        ))}
      </div>
    </GameChrome>
  );
};

// ── 4. Decision Lab (Judgment) ─────────────────────────────
const DecisionLabGame = ({ onComplete }) => {
  const allS = [
    { cat: "Leadership", sit: "Your team member made a major error on a client deliverable. The client hasn't noticed yet.", choices: ["Immediately tell the client and offer a fix", "Quietly fix it and send an 'updated version'", "Wait to see if the client notices", "Document the incident for review"], best: 0, why: "Proactive transparency builds trust. Clients respect honesty far more than perfection." },
    { cat: "Risk Assessment", sit: "Option A: guaranteed 8% return. Option B: 60% chance of 25%, 40% chance of -10%. This is 30% of your capital.", choices: ["Option A — guaranteed return", "Option B — higher expected value", "Split evenly between both", "Need more information"], best: 2, why: "Diversification reduces risk while capturing upside — almost always optimal." },
    { cat: "Time Management", sit: "3 tasks due today: board presentation (3hrs), routine report (1hr), urgent emails (30min). 3 hours left.", choices: ["Board presentation first", "Emails, report, then presentation", "Delegate report, skip email, focus presentation", "Report first for a quick win"], best: 2, why: "Focus irreplaceable expertise on the highest-impact task. Delegate what others can do." },
    { cat: "Emotional IQ", sit: "A colleague publicly criticizes your project. The criticism has valid points but delivery was inappropriate.", choices: ["Thank them, discuss privately later", "Defend your decision point by point", "Redirect to agenda, address privately", "Acknowledge valid points, note private feedback pref"], best: 3, why: "Acknowledging valid points shows security. Setting the boundary models professionalism." },
    { cat: "Strategic Thinking", sit: "Your industry is being disrupted by AI. Your skills are valuable now but may not be in 5 years.", choices: ["Double down on current expertise", "Learn AI tools to augment your skills", "Pivot to an AI-resistant field", "Focus on leadership and human skills"], best: 1, why: "AI augmentation of existing expertise is highest-leverage — domain knowledge plus AI multipliers." },
  ];
  const [scenarios] = useState(() => [...allS].sort(() => Math.random() - 0.5));
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef(null);
  const labels = ["A","B","C","D"];

  useEffect(() => {
    setTimeLeft(20); setSelected(null); clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
    return () => clearInterval(timerRef.current);
  }, [round]);

  const pick = (i) => { if (selected !== null) return; clearInterval(timerRef.current); setSelected(i); setScore(s => s + (i === scenarios[round].best ? 20 + timeLeft * 2 : 5)); };
  const s = scenarios[round];

  return (
    <GameChrome name="Decision Lab" icon="⚖️" color={C.sage} round={round + 1} totalRounds={5} score={score} timeLeft={timeLeft} maxTime={20} subtitle="Choose the best executive move">
      <div style={{ padding: 14, background: "rgba(255,255,255,0.06)", borderRadius: 14, marginBottom: 14 }}>
        <span style={{ ...font(11, 600), color: C.sage, textTransform: "uppercase", letterSpacing: 1, padding: "3px 10px", background: `${C.sage}26`, borderRadius: 12, display: "inline-block", marginBottom: 8 }}>{s.cat}</span>
        <div style={{ ...font(15), color: "#fff", lineHeight: 1.5 }}>{s.sit}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {s.choices.map((c, i) => {
          const isB = selected !== null && i === s.best, isW = selected === i && i !== s.best;
          return (
            <div key={i} onClick={() => pick(i)} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 12, borderRadius: 12, cursor: selected ? "default" : "pointer", background: isB ? `${C.success}1f` : isW ? `${C.coral}14` : "rgba(255,255,255,0.04)", border: `2px solid ${isB ? `${C.success}66` : "transparent"}`, transition: "all 0.3s" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...mono(14), color: isB ? C.navy : "#fff", background: isB ? C.success : "rgba(255,255,255,0.1)" }}>{labels[i]}</div>
              <div style={{ ...font(14), color: isB ? "#fff" : selected !== null ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>{c}</div>
            </div>
          );
        })}
      </div>
      {selected !== null && (
        <div style={{ padding: 12, background: `${C.gold}14`, borderRadius: 12, marginTop: 12 }}>
          <div style={{ ...font(14, 600), color: C.gold, marginBottom: 4 }}>💡 {s.why}</div>
          <Btn onClick={() => { if (round < 4) setRound(r => r + 1); else onComplete(score); }} style={{ marginTop: 8, padding: "10px 24px" }}>{round < 4 ? "Next Scenario" : "Finish"}</Btn>
        </div>
      )}
    </GameChrome>
  );
};

// ── 5. Word Maze (Creativity) ──────────────────────────────
const WordMazeGame = ({ onComplete }) => {
  const chains = [
    { start: "FIRE", end: "WATER", words: ["FIRE","FLAME","HEAT","STEAM","WATER"], decoys: ["SMOKE","COLD","BURN"] },
    { start: "MIND", end: "BODY", words: ["MIND","BRAIN","HEAD","NECK","BODY"], decoys: ["THOUGHT","SPINE","SKULL"] },
    { start: "SEED", end: "TREE", words: ["SEED","SPROUT","STEM","BRANCH","TREE"], decoys: ["ROOT","LEAF","BARK"] },
    { start: "IDEA", end: "PROFIT", words: ["IDEA","PLAN","ACTION","RESULT","PROFIT"], decoys: ["DREAM","HOPE","LOSS"] },
    { start: "DAWN", end: "NIGHT", words: ["DAWN","MORNING","NOON","EVENING","NIGHT"], decoys: ["SUNSET","DUSK","MIDDAY"] },
  ];
  const [round, setRound] = useState(0);
  const [chain, setChain] = useState([]);
  const [available, setAvailable] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  const setupRound = useCallback((r) => {
    const c = chains[r]; setChain([c.words[0]]);
    setAvailable([...c.words.slice(1), ...c.decoys].sort(() => Math.random() - 0.5));
    setDone(false); setTimeLeft(15); clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); setDone(true); return 0; } return t - 1; }), 1000);
  }, []);

  useEffect(() => { setupRound(0); return () => clearInterval(timerRef.current); }, []);

  const pickWord = (w) => {
    if (done) return;
    const c = chains[round];
    if (w === c.words[chain.length]) {
      const nc = [...chain, w]; setChain(nc); setAvailable(a => a.filter(x => x !== w));
      const pts = 15 + timeLeft * 2; setScore(s => s + pts);
      if (nc.length === c.words.length) { clearInterval(timerRef.current); setDone(true); setTimeout(() => { if (round + 1 < 5) { setRound(r => r + 1); setupRound(round + 1); } else onComplete(score + pts); }, 1200); }
    } else { setScore(s => Math.max(0, s - 10)); }
  };

  const c = chains[round];
  return (
    <GameChrome name="Word Maze" icon="🔤" color={C.coral} round={round + 1} totalRounds={5} score={score} timeLeft={timeLeft} maxTime={15} subtitle={`Connect: ${c.start} → ${c.end}`}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
        {chain.map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ ...font(15, 700), color: "#fff", padding: "6px 14px", background: C.coral, borderRadius: 10 }}>{w}</div>
            {i < chain.length - 1 && <span style={{ color: "rgba(255,255,255,0.3)" }}>→</span>}
          </div>
        ))}
        {chain.length < c.words.length && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "rgba(255,255,255,0.3)" }}>→</span><div style={{ ...font(14, 600), color: C.coral, padding: "6px 14px", border: `2px dashed ${C.coral}66`, borderRadius: 10 }}>?</div></div>}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {available.map(w => <div key={w} onClick={() => pickWord(w)} style={{ ...font(15, 600), color: "rgba(255,255,255,0.85)", padding: "10px 18px", background: "rgba(255,255,255,0.08)", borderRadius: 12, cursor: done ? "default" : "pointer" }}>{w}</div>)}
      </div>
      {done && chain.length === c.words.length && <div style={{ ...font(16, 600), color: C.success, textAlign: "center", marginTop: 16 }}>✓ Chain complete!</div>}
    </GameChrome>
  );
};

// ── 6. Priority Matrix (Planning) ──────────────────────────
const PriorityMatrixGame = ({ onComplete }) => {
  const rounds = [
    { items: [{ text: "Client presentation due in 2 hours", correct: "ui" }, { text: "Reply to vendor about next month", correct: "ni" }, { text: "Fix a typo your boss noticed", correct: "un" }, { text: "Organize email folders", correct: "nn" }] },
    { items: [{ text: "Server down — customers can't login", correct: "ui" }, { text: "Plan next quarter's hiring", correct: "ni" }, { text: "Coworker needs font opinion", correct: "un" }, { text: "Update LinkedIn profile", correct: "nn" }] },
    { items: [{ text: "Board meeting prep — meeting tomorrow", correct: "ui" }, { text: "Build relationships with new team", correct: "ni" }, { text: "Boss wants status update by EOD", correct: "un" }, { text: "Clean up old shared drive files", correct: "nn" }] },
    { items: [{ text: "Critical security vulnerability found", correct: "ui" }, { text: "Research emerging competitors", correct: "ni" }, { text: "Schedule this week's team lunches", correct: "un" }, { text: "Redesign break room whiteboard", correct: "nn" }] },
    { items: [{ text: "Key partner threatening to leave", correct: "ui" }, { text: "Write long-term product vision", correct: "ni" }, { text: "IT needs you to restart laptop today", correct: "un" }, { text: "Unsubscribe from old newsletters", correct: "nn" }] },
  ];
  const quads = { ui: { label: "Do First", color: C.coral, icon: "🔴" }, ni: { label: "Schedule", color: C.teal, icon: "🔵" }, un: { label: "Delegate", color: C.gold, icon: "🟡" }, nn: { label: "Eliminate", color: C.slate, icon: "⚫" } };
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [ci, setCi] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(12);
  const timerRef = useRef(null);

  useEffect(() => {
    setCi(0); setLastResult(null); setTimeLeft(12); clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
    return () => clearInterval(timerRef.current);
  }, [round]);

  const place = (q) => {
    if (ci >= rounds[round].items.length) return;
    const correct = rounds[round].items[ci].correct === q;
    const pts = correct ? 20 + timeLeft * 2 : 0;
    setScore(s => s + pts); setLastResult(correct ? "correct" : "wrong");
    setTimeout(() => {
      setLastResult(null);
      if (ci + 1 >= rounds[round].items.length) { clearInterval(timerRef.current); setTimeout(() => { if (round + 1 < 5) setRound(r => r + 1); else onComplete(score + pts); }, 600); }
      else { setCi(c => c + 1); setTimeLeft(12); }
    }, 600);
  };

  const item = rounds[round].items[ci];
  return (
    <GameChrome name="Priority Matrix" icon="📋" color="#d4814e" round={round + 1} totalRounds={5} score={score} timeLeft={timeLeft} maxTime={12} subtitle="Sort each task into the right quadrant">
      {ci < rounds[round].items.length && (
        <div style={{ padding: 14, background: lastResult === "correct" ? `${C.success}26` : lastResult === "wrong" ? `${C.coral}26` : "rgba(255,255,255,0.08)", borderRadius: 14, textAlign: "center", marginBottom: 14, transition: "background 0.3s", border: `2px solid ${lastResult === "correct" ? C.success : lastResult === "wrong" ? C.coral : "transparent"}` }}>
          <div style={{ ...font(11, 600), color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>CLASSIFY:</div>
          <div style={{ ...font(16, 600), color: "#fff" }}>{item.text}</div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 340, margin: "0 auto" }}>
        {Object.entries(quads).map(([key, q]) => (
          <div key={key} onClick={() => place(key)} style={{ padding: 14, borderRadius: 14, cursor: "pointer", textAlign: "center", minHeight: 70, background: `${q.color}14`, border: `2px solid ${q.color}33`, transition: "all 0.2s" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{q.icon}</div>
            <div style={{ ...font(13, 700), color: q.color }}>{q.label}</div>
          </div>
        ))}
      </div>
      <div style={{ ...font(12, 500), color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 10 }}>Task {ci + 1}/{rounds[round].items.length}</div>
    </GameChrome>
  );
};

// ── 7. Dual N-Back (Working Memory) ────────────────────────
const DualNBackGame = ({ onComplete }) => {
  const colors = [C.teal, C.coral, C.gold, C.lavender, C.sage, "#5ca0d6"];
  const nBack = 2;
  const totalTrials = 20;
  const [trial, setTrial] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [currentPos, setCurrentPos] = useState(-1);
  const [currentColor, setCurrentColor] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState("show");
  const [posMatch, setPosMatch] = useState(false);
  const [colorMatch, setColorMatch] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [responded, setResponded] = useState(false);
  const seqRef = useRef([]);

  useEffect(() => {
    const seq = [];
    for (let i = 0; i < totalTrials; i++) {
      let pos = Math.floor(Math.random() * 9), col = Math.floor(Math.random() * colors.length);
      if (i >= nBack && Math.random() < 0.3) pos = seq[i - nBack].pos;
      if (i >= nBack && Math.random() < 0.3) col = seq[i - nBack].col;
      seq.push({ pos, col });
    }
    setSequence(seq); seqRef.current = seq; showTrial(0, seq);
  }, []);

  const showTrial = (t, seq) => {
    if (t >= totalTrials) { onComplete(score); return; }
    setTrial(t); setCurrentPos(seq[t].pos); setCurrentColor(seq[t].col);
    setPhase("show"); setPosMatch(false); setColorMatch(false); setResponded(false); setFeedback(null);
    setTimeout(() => setPhase("respond"), 1500);
  };

  const submit = useCallback(() => {
    if (responded) return;
    setResponded(true);
    const seq = seqRef.current; const t = trial;
    const aPM = t >= nBack && seq[t].pos === seq[t - nBack].pos;
    const aCM = t >= nBack && seq[t].col === seq[t - nBack].col;
    const pC = posMatch === aPM, cC = colorMatch === aCM;
    const pts = (pC ? 10 : 0) + (cC ? 10 : 0);
    setScore(s => s + pts); setFeedback({ posCorrect: pC, colCorrect: cC, pts });
    setTimeout(() => showTrial(t + 1, seq), 1200);
  }, [responded, trial, posMatch, colorMatch]);

  useEffect(() => {
    if (phase === "respond" && !responded) { const t = setTimeout(() => submit(), 3000); return () => clearTimeout(t); }
  }, [phase, responded, submit]);

  return (
    <GameChrome name="Dual N-Back" icon="🔁" color="#5ca0d6" round={trial + 1} totalRounds={totalTrials} score={score} timeLeft={0} maxTime={0} subtitle={`Match position OR color from ${nBack} steps ago`}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, width: "min(100%, 240px)", margin: "0 auto 16px" }}>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{ aspectRatio: "1", borderRadius: 12, background: i === currentPos && phase === "show" ? colors[currentColor] : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s", boxShadow: i === currentPos && phase === "show" ? `0 0 20px ${colors[currentColor]}66` : "none" }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 12 }}>
        <div onClick={() => !responded && setPosMatch(p => !p)} style={{ padding: "12px 16px", borderRadius: 12, cursor: responded ? "default" : "pointer", background: posMatch ? `#5ca0d666` : "rgba(255,255,255,0.06)", border: `2px solid ${posMatch ? "#5ca0d6" : "rgba(255,255,255,0.1)"}`, ...font(13, 600), color: posMatch ? "#fff" : "rgba(255,255,255,0.6)" }}>📍 Position</div>
        <div onClick={() => !responded && setColorMatch(c => !c)} style={{ padding: "12px 16px", borderRadius: 12, cursor: responded ? "default" : "pointer", background: colorMatch ? `${C.coral}66` : "rgba(255,255,255,0.06)", border: `2px solid ${colorMatch ? C.coral : "rgba(255,255,255,0.1)"}`, ...font(13, 600), color: colorMatch ? "#fff" : "rgba(255,255,255,0.6)" }}>🎨 Color</div>
      </div>
      {phase === "respond" && !responded && <Btn onClick={submit} style={{ maxWidth: 200, margin: "0 auto", padding: "10px 24px" }}>Confirm</Btn>}
      {feedback && (
        <div style={{ textAlign: "center", marginTop: 8, display: "flex", gap: 12, justifyContent: "center" }}>
          <span style={{ ...font(14, 600), color: feedback.posCorrect ? C.success : C.coral }}>Pos: {feedback.posCorrect ? "✓" : "✗"}</span>
          <span style={{ ...font(14, 600), color: feedback.colCorrect ? C.success : C.coral }}>Color: {feedback.colCorrect ? "✓" : "✗"}</span>
          <span style={{ ...mono(14), color: C.gold }}>+{feedback.pts}</span>
        </div>
      )}
      <div style={{ ...font(12, 500), color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 12 }}>Toggle matches, then confirm (auto-advances in 3s)</div>
    </GameChrome>
  );
};

// ── 8. Speed Sort (Flexibility) ────────────────────────────
const SpeedSortGame = ({ onComplete }) => {
  const categories = [
    { name: "Living", color: C.sage, items: ["Dog","Oak tree","Bacteria","Mushroom","Whale","Fern","Eagle","Coral"] },
    { name: "Non-Living", color: C.slate, items: ["Rock","Computer","Water","Lightning","Gold","Wind","Diamond","Cloud"] },
  ];
  const [items, setItems] = useState([]);
  const [ci, setCi] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setItems(categories.flatMap(c => c.items.map(item => ({ text: item, category: c.name, color: c.color }))).sort(() => Math.random() - 0.5));
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 0.1) { clearInterval(timerRef.current); setDone(true); return 0; } return +(t - 0.1).toFixed(1); }), 100);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => { if (done) { clearInterval(timerRef.current); setTimeout(() => onComplete(score), 1500); } }, [done]);

  const classify = (cat) => {
    if (done || ci >= items.length) return;
    const correct = items[ci].category === cat;
    setScore(s => Math.max(0, s + (correct ? 10 + (streak >= 3 ? 5 : 0) : -5)));
    setStreak(s => correct ? s + 1 : 0);
    setLastResult(correct ? "correct" : "wrong"); setTimeout(() => setLastResult(null), 300);
    if (ci + 1 >= items.length) setDone(true); else setCi(c => c + 1);
  };

  const item = items[ci];
  return (
    <GameChrome name="Speed Sort" icon="⚡" color="#d6a75c" round={ci + 1} totalRounds={items.length} score={score} timeLeft={timeLeft / 3} maxTime={10}
      subtitle={streak >= 3 ? `🔥 ${streak} streak! Bonus active` : "Classify as fast as you can"}>
      {!done && item ? (
        <>
          <div style={{ padding: 24, borderRadius: 18, textAlign: "center", marginBottom: 20, background: lastResult === "correct" ? `${C.success}26` : lastResult === "wrong" ? `${C.coral}26` : "rgba(255,255,255,0.08)", border: `3px solid ${lastResult === "correct" ? C.success : lastResult === "wrong" ? C.coral : "rgba(255,255,255,0.15)"}`, transition: "all 0.15s" }}>
            <div style={{ ...displayFont(32), color: "#fff" }}>{item.text}</div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {categories.map(c => (
              <div key={c.name} onClick={() => classify(c.name)} style={{ flex: 1, padding: "20px 16px", borderRadius: 16, textAlign: "center", cursor: "pointer", background: `${c.color}1a`, border: `2px solid ${c.color}4d`, transition: "all 0.2s" }}>
                <div style={{ ...font(18, 700), color: c.color }}>{c.name}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <div style={{ ...displayFont(28), color: "#fff" }}>Time's up!</div>
          <div style={{ ...mono(20), color: C.gold, marginTop: 8 }}>Final: {score} pts</div>
        </div>
      )}
    </GameChrome>
  );
};

// ── Game Launcher Map ──────────────────────────────────────
const GAME_COMPONENTS = { pattern: PatternRecallGame, number: NumberFlowGame, focus: FocusGridGame, decision: DecisionLabGame, wordmaze: WordMazeGame, priority: PriorityMatrixGame, dualn: DualNBackGame, speedsort: SpeedSortGame };

// ═══════════════════════════════════════════════════════════
// DAILY WORKOUT
// ═══════════════════════════════════════════════════════════
const DailyWorkoutView = ({ onClose, onXP }) => {
  const [phase, setPhase] = useState("intro");
  const [gameIdx, setGameIdx] = useState(0);
  const [scores, setScores] = useState([]);
  const [todayGames] = useState(() => [...GAMES].sort(() => Math.random() - 0.5).slice(0, 4));

  const handleDone = (s) => { const ns = [...scores, s]; setScores(ns); if (gameIdx < todayGames.length - 1) setGameIdx(gameIdx + 1); else setPhase("summary"); };
  const totalScore = scores.reduce((a, b) => a + b, 0);
  const xp = Math.floor(totalScore * 0.4) + 50;

  if (phase === "intro") return (
    <div style={{ height: "100%", background: C.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <span style={{ fontSize: 64, marginBottom: 20 }}>🧠</span>
      <div style={{ ...displayFont(28), color: "#fff" }}>Daily Brain Workout</div>
      <div style={{ ...font(17), color: "rgba(255,255,255,0.7)", marginTop: 12, marginBottom: 28 }}>{todayGames.length} games · ~8 minutes</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300, marginBottom: 32 }}>
        {todayGames.map((g, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <span style={{ fontSize: 22 }}>{g.icon}</span>
            <div><div style={{ ...font(15, 600), color: "#fff" }}>{g.name}</div><div style={{ ...font(12, 500), color: "rgba(255,255,255,0.5)" }}>{g.skill} · {g.difficulty}</div></div>
          </div>
        ))}
      </div>
      <Btn onClick={() => setPhase("playing")}>Start Workout</Btn>
      <div onClick={onClose} style={{ ...font(14, 500), color: "rgba(255,255,255,0.4)", marginTop: 16, cursor: "pointer" }}>Maybe Later</div>
    </div>
  );

  if (phase === "playing") {
    const Comp = GAME_COMPONENTS[todayGames[gameIdx].id];
    return (
      <div style={{ height: "100%", background: C.navy, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 4, padding: "12px 20px" }}>
          {todayGames.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < gameIdx ? C.success : i === gameIdx ? C.gold : "rgba(255,255,255,0.15)" }} />)}
        </div>
        <div style={{ ...mono(13), color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 4 }}>Game {gameIdx + 1}/{todayGames.length}</div>
        <div style={{ flex: 1, overflow: "auto" }}><Comp key={gameIdx} onComplete={handleDone} /></div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", background: C.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ ...displayFont(28), color: "#fff", marginBottom: 24 }}>Workout Complete! 🎉</div>
      <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
        <div style={{ textAlign: "center" }}><div style={{ ...displayFont(28), color: C.gold }}>{totalScore}</div><div style={{ ...font(12, 500), color: "rgba(255,255,255,0.5)" }}>Total Score</div></div>
        <div style={{ textAlign: "center" }}><div style={{ ...displayFont(28), color: C.teal }}>+{xp}</div><div style={{ ...font(12, 500), color: "rgba(255,255,255,0.5)" }}>XP Earned</div></div>
      </div>
      <div style={{ width: "100%", maxWidth: 300, marginBottom: 24 }}>
        {todayGames.map((g, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ ...font(15), color: "rgba(255,255,255,0.8)" }}>{g.icon} {g.name}</span>
            <span style={{ ...mono(15), color: g.color }}>{scores[i] || 0}</span>
          </div>
        ))}
      </div>
      <Btn onClick={() => { onXP(xp); onClose(); }}>Back to Dashboard</Btn>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// TAB VIEWS
// ═══════════════════════════════════════════════════════════

// ── Dashboard ──────────────────────────────────────────────
const DashboardTab = ({ profile, onPlayGame }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning ☀️" : hour < 17 ? "Good Afternoon 🌤" : hour < 21 ? "Good Evening 🌅" : "Night Owl Mode 🌙";
  const xpInLevel = profile.totalXP - Math.floor(profile.totalXP / 500) * 500;

  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ ...font(14, 500), color: C.slate }}>{greeting}</div>
          <div style={{ ...displayFont(24), color: C.navy }}>Welcome back, {profile.firstName}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${C.coral}1f`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18 }}>🔥</span><span style={{ ...mono(14), color: C.coral }}>{profile.currentStreak}</span>
          </div>
          <div style={{ ...font(10, 500), color: C.slate, marginTop: 2 }}>streak</div>
        </div>
      </div>

      <Card glow style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <ProgressRing progress={profile.ceoScore / 100} size={100} stroke={12}>
            <div style={{ ...displayFont(32), color: C.navy }}>{profile.ceoScore}</div>
            <div style={{ ...font(11, 500), color: C.slate }}>Score</div>
          </ProgressRing>
          <div style={{ flex: 1 }}>
            <div style={{ ...font(18, 600), color: C.navy }}>{profile.avatarTitle}</div>
            <div style={{ ...font(14, 500), color: C.slate, marginBottom: 8 }}>Level {profile.currentLevel}</div>
            <div style={{ height: 6, background: `${C.gold}1a`, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
              <div style={{ width: `${xpInLevel / 500 * 100}%`, height: "100%", background: C.gold, borderRadius: 3 }} />
            </div>
            <div style={{ ...font(11, 500), color: C.slate }}>{xpInLevel}/500 XP to next level</div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionHeader title="Today" icon="📅" />
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <StatPill label="Games" value="3" color={C.teal} />
          <StatPill label="Best" value="245" color={C.gold} />
          <StatPill label="XP" value={`+${Math.floor(profile.totalXP * 0.08)}`} color={C.coral} />
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionHeader title="This Week" subtitle="Daily scores" icon="📊" />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, marginTop: 12, paddingBottom: 20 }}>
          {profile.weekScores.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
              <div style={{ width: "65%", borderRadius: "6px 6px 0 0", minHeight: 4, height: `${Math.max(d.score / 600 * 100, 3)}%`, background: `linear-gradient(to bottom, ${C.gold}, ${C.gold}80)`, transition: "height 0.8s" }} />
              <div style={{ ...font(10, 500), color: C.slate, marginTop: 6 }}>{d.day}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionHeader title="Cognitive Skills" icon="⬡" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {SKILLS.map(s => <SkillBar key={s.name} name={s.name} score={profile.skillScores[s.name] || 5} color={s.color} />)}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Quick Play" subtitle="Jump into a game" icon="🎮" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {GAMES.slice(0, 4).map(g => (
            <div key={g.id} onClick={() => onPlayGame(g.id)} style={{ padding: 12, borderRadius: 14, background: `${g.color}0d`, border: `1px solid ${g.color}26`, cursor: "pointer", textAlign: "center" }}>
              <span style={{ fontSize: 24 }}>{g.icon}</span>
              <div style={{ ...font(13, 600), color: C.navy, marginTop: 4 }}>{g.name}</div>
              <div style={{ ...font(11, 500), color: g.color }}>{g.skill}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ── Games Library ──────────────────────────────────────────
const GamesTab = ({ profile, onPlayGame }) => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? GAMES : GAMES.filter(g => g.skill === filter);

  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <SectionHeader title="Game Library" subtitle="8 cognitive training games" icon="🎮" />
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 0", marginBottom: 8 }}>
        {["all", ...SKILLS.map(s => s.name)].map(f => (
          <div key={f} onClick={() => setFilter(f)} style={{
            ...font(13, filter === f ? 600 : 500), color: filter === f ? C.navy : C.slate,
            padding: "6px 14px", borderRadius: 20, cursor: "pointer", flexShrink: 0,
            background: filter === f ? `${C.gold}33` : `${C.slate}14`,
            border: `1px solid ${filter === f ? C.gold : "transparent"}`
          }}>{f === "all" ? "All Games" : f}</div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(g => {
          const h = profile.gameHistory.find(x => x.id === g.id);
          return (
            <Card key={g.id} onClick={() => onPlayGame(g.id)} style={{ padding: 16, cursor: "pointer" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${g.color}1a`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{g.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ ...font(17, 600), color: C.navy }}>{g.name}</div>
                    <span style={{ ...font(11, 600), color: g.color, padding: "3px 10px", background: `${g.color}14`, borderRadius: 10 }}>{g.difficulty}</span>
                  </div>
                  <div style={{ ...font(14, 500), color: C.slate, marginTop: 2 }}>{g.desc}</div>
                  {h && <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                    <span style={{ ...font(12, 500), color: g.color, fontWeight: 700 }}>{g.skill}</span>
                    <span style={{ ...font(12, 500), color: C.slate }}>Best: <span style={{ ...mono(12), color: C.navy }}>{h.bestScore}</span></span>
                    <span style={{ ...font(12, 500), color: C.slate }}>×{h.timesPlayed}</span>
                  </div>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ── Progress ───────────────────────────────────────────────
const ProgressTab = ({ profile }) => {
  const totalGames = profile.gameHistory.reduce((a, h) => a + h.timesPlayed, 0);
  const avgBest = Math.round(profile.gameHistory.reduce((a, h) => a + h.bestScore, 0) / profile.gameHistory.length);

  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <SectionHeader title="Progress" subtitle="Your cognitive growth" icon="📈" />
      <Card style={{ marginBottom: 16, marginTop: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[["Total Games", totalGames, C.teal], ["Total XP", profile.totalXP, C.gold], ["Avg Best", avgBest, C.coral]].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "center" }}><div style={{ ...mono(22), color: c }}>{v}</div><div style={{ ...font(11, 500), color: C.slate, marginTop: 2 }}>{l}</div></div>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionHeader title="Skill Profile" icon="🧠" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
          {SKILLS.map(s => <SkillBar key={s.name} name={s.name} score={profile.skillScores[s.name] || 5} color={s.color} />)}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionHeader title="Game Performance" icon="🎯" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {GAMES.map(g => {
            const h = profile.gameHistory.find(x => x.id === g.id); if (!h) return null;
            return (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.slate}14` }}>
                <span style={{ fontSize: 20 }}>{g.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ ...font(15, 600), color: C.navy }}>{g.name}</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
                    <span style={{ ...font(12, 500), color: C.slate }}>Best: <span style={{ ...mono(12), color: g.color }}>{h.bestScore}</span></span>
                    <span style={{ ...font(12, 500), color: C.slate }}>Last: <span style={{ ...mono(12) }}>{h.lastScore}</span></span>
                    <span style={{ ...font(12, 500), color: C.slate }}>×{h.timesPlayed}</span>
                  </div>
                </div>
                <div style={{ width: 60, height: 8, background: `${g.color}1a`, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(h.bestScore / 300 * 100, 100)}%`, height: "100%", background: g.color, borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Achievements" subtitle={`${profile.achievements.filter(a => a.earned).length}/${profile.achievements.length} earned`} icon="🏆" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {profile.achievements.map(a => (
            <div key={a.id} style={{ padding: 12, borderRadius: 14, textAlign: "center", background: a.earned ? `${C.gold}14` : `${C.slate}0d`, border: `1px solid ${a.earned ? `${C.gold}33` : `${C.slate}1a`}`, opacity: a.earned ? 1 : 0.5 }}>
              <div style={{ fontSize: 28, filter: a.earned ? "none" : "grayscale(100%)" }}>{a.icon}</div>
              <div style={{ ...font(13, 600), color: a.earned ? C.navy : C.slate, marginTop: 4 }}>{a.name}</div>
              {a.earned && <div style={{ ...font(11, 500), color: C.success, marginTop: 2 }}>✓ Earned</div>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ── Compete ────────────────────────────────────────────────
const CompeteTab = ({ profile }) => {
  const lb = [
    { name: "Margaret T.", xp: 3240, streak: 28, avatar: "👩‍💼" },
    { name: "Robert K.", xp: 2890, streak: 14, avatar: "👨‍💼" },
    { name: "You", xp: profile.totalXP, streak: profile.currentStreak, avatar: "🧑‍💼" },
    { name: "Susan L.", xp: 2120, streak: 9, avatar: "👩‍🏫" },
    { name: "James M.", xp: 1850, streak: 7, avatar: "👨‍🎓" },
    { name: "Patricia D.", xp: 1640, streak: 5, avatar: "👩‍⚕️" },
  ].sort((a, b) => b.xp - a.xp);

  const wc = { name: "Memory Marathon", desc: "Play Pattern Recall and Dual N-Back 5 times each", reward: "500 XP + 🏅", progress: 6, total: 10, icon: "🧩" };
  const h2h = [
    { op: "Robert K.", game: "Pattern Recall", opS: 185, yourS: null, av: "👨‍💼" },
    { op: "Susan L.", game: "Number Flow", opS: 210, yourS: 195, av: "👩‍🏫" },
  ];

  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <SectionHeader title="Compete" subtitle="Challenge yourself and others" icon="🏅" />
      <Card glow glowColor={C.coral} style={{ marginBottom: 16, marginTop: 8 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${C.coral}1a`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{wc.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ ...font(11, 600), color: C.coral, textTransform: "uppercase", letterSpacing: 1 }}>Weekly Challenge</div>
            <div style={{ ...font(17, 600), color: C.navy, marginTop: 2 }}>{wc.name}</div>
            <div style={{ ...font(14), color: C.slate, marginTop: 4 }}>{wc.desc}</div>
            <div style={{ height: 8, background: `${C.coral}1a`, borderRadius: 4, overflow: "hidden", marginTop: 10 }}>
              <div style={{ width: `${wc.progress / wc.total * 100}%`, height: "100%", background: C.coral, borderRadius: 4 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ ...mono(12), color: C.coral }}>{wc.progress}/{wc.total}</span>
              <span style={{ ...font(12, 500), color: C.gold }}>🎁 {wc.reward}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionHeader title="Global Leaderboard" icon="🌍" />
        <div style={{ marginTop: 12 }}>
          {lb.map((p, i) => {
            const medals = ["🥇","🥈","🥉"]; const isYou = p.name === "You";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: isYou ? "10px 20px" : "10px 0", borderBottom: i < lb.length - 1 ? `1px solid ${C.slate}14` : "none", background: isYou ? `${C.gold}0d` : "transparent", margin: isYou ? "0 -20px" : 0, borderRadius: isYou ? 12 : 0 }}>
                <span style={{ width: 30, fontSize: i < 3 ? 20 : 14, ...mono(16), color: C.slate, textAlign: "center" }}>{medals[i] || (i + 1)}</span>
                <span style={{ fontSize: 20, marginLeft: 8 }}>{p.avatar}</span>
                <span style={{ flex: 1, ...font(16, isYou ? 700 : 400), color: isYou ? C.gold : C.navy, marginLeft: 10 }}>{p.name}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ ...mono(14), color: C.navy }}>{p.xp} XP</div>
                  <div style={{ ...font(11, 500), color: C.slate }}>🔥 {p.streak}d</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionHeader title="Head-to-Head" subtitle="Beat their score" icon="⚔️" />
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {h2h.map((h, i) => (
            <div key={i} style={{ padding: 14, background: `${C.slate}0a`, borderRadius: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 20 }}>{h.av}</span><span style={{ ...font(15, 600), color: C.navy }}>{h.op}</span></div>
                <span style={{ ...font(12, 500), color: C.slate }}>{h.game}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ ...font(11, 500), color: C.slate }}>Their Score</div><div style={{ ...mono(18), color: C.coral }}>{h.opS}</div></div>
                <span style={{ ...font(14, 700), color: C.gold }}>VS</span>
                <div style={{ textAlign: "right" }}><div style={{ ...font(11, 500), color: C.slate }}>Your Score</div>{h.yourS ? <div style={{ ...mono(18), color: h.yourS > h.opS ? C.success : C.navy }}>{h.yourS}</div> : <div style={{ ...font(14, 600), color: C.gold, cursor: "pointer" }}>Play →</div>}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ textAlign: "center" }}>
        <span style={{ fontSize: 28 }}>✉️</span>
        <div style={{ ...font(18, 600), color: C.navy, marginTop: 8 }}>Invite a Rival</div>
        <div style={{ ...font(15), color: C.slate, margin: "8px 0 16px" }}>Challenge friends to beat your scores!</div>
        <Btn>📤 Share SharpMind</Btn>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [showWorkout, setShowWorkout] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleOnboardingComplete = (p) => { setProfile(p); setShowOnboarding(false); };
  const handleSkipToDemo = () => { setProfile(makeProfile()); setShowOnboarding(false); };
  const playGame = (id) => setActiveGame(id);
  const handleGameDone = (score) => { setProfile(p => ({ ...p, totalXP: p.totalXP + Math.floor(score * 0.3) + 20 })); setActiveGame(null); };

  if (showOnboarding && !profile) return (
    <div style={{ width: "100%", maxWidth: 430, margin: "0 auto", height: "100vh", background: C.navy, position: "relative", overflow: "hidden", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <FontLoader />
      <OnboardingView onComplete={handleOnboardingComplete} />
      <div onClick={handleSkipToDemo} style={{ position: "absolute", bottom: 16, right: 16, ...font(13, 500), color: "rgba(255,255,255,0.35)", cursor: "pointer", zIndex: 10, padding: "6px 12px", background: "rgba(255,255,255,0.06)", borderRadius: 8 }}>Skip to Demo →</div>
    </div>
  );
  if (!profile) return null;

  if (activeGame) {
    const Comp = GAME_COMPONENTS[activeGame];
    return (
      <div style={{ width: "100%", maxWidth: 430, margin: "0 auto", height: "100vh", background: C.navy, overflow: "auto", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <FontLoader />
        <div style={{ display: "flex", alignItems: "center", padding: "12px 20px" }}>
          <div onClick={() => setActiveGame(null)} style={{ ...font(14, 600), color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "6px 12px", background: "rgba(255,255,255,0.08)", borderRadius: 8 }}>← Back</div>
        </div>
        <Comp onComplete={handleGameDone} />
      </div>
    );
  }

  if (showWorkout) return (
    <div style={{ width: "100%", maxWidth: 430, margin: "0 auto", height: "100vh", background: C.navy, overflow: "auto", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <FontLoader /><DailyWorkoutView onClose={() => setShowWorkout(false)} onXP={(xp) => setProfile(p => ({ ...p, totalXP: p.totalXP + xp }))} />
    </div>
  );

  const tabs = [
    { id: "dashboard", icon: "📊", label: "Home" },
    { id: "games", icon: "🎮", label: "Games" },
    { id: "workout", icon: "🧠", label: "", special: true },
    { id: "progress", icon: "📈", label: "Progress" },
    { id: "compete", icon: "🏅", label: "Compete" },
  ];

  return (
    <div style={{ width: "100%", maxWidth: 430, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", background: C.bg, position: "relative", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <FontLoader />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: C.bg, borderBottom: `1px solid ${C.slate}14` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20, color: C.gold }}>🧠</span><span style={{ ...font(18, 600), color: C.navy }}>SharpMind</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ ...mono(13), color: C.gold }}>{profile.totalXP} XP</span><span style={{ fontSize: 18, color: C.slate + "80", cursor: "pointer" }}>⚙️</span></div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: `linear-gradient(135deg, ${C.bg}, ${C.cream}, ${C.bg}f2)` }}>
        {tab === "dashboard" && <DashboardTab profile={profile} onPlayGame={playGame} />}
        {tab === "games" && <GamesTab profile={profile} onPlayGame={playGame} />}
        {tab === "progress" && <ProgressTab profile={profile} />}
        {tab === "compete" && <CompeteTab profile={profile} />}
      </div>
      <div style={{ display: "flex", alignItems: "center", padding: "8px 8px 12px", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px) saturate(180%)", WebkitBackdropFilter: "blur(16px) saturate(180%)", borderTop: `1px solid ${C.slate}14` }}>
        {tabs.map(t => {
          if (t.special) return (
            <div key={t.id} style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div onClick={() => setShowWorkout(true)} style={{ width: 64, height: 64, borderRadius: "50%", cursor: "pointer", background: `linear-gradient(135deg, ${C.gold}, ${C.gold}d9)`, boxShadow: `0 4px 16px ${C.gold}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginTop: -26 }}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.92)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >🧠</div>
            </div>
          );
          return (
            <div key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, textAlign: "center", cursor: "pointer", padding: "4px 0" }}>
              <div style={{ fontSize: 20, opacity: tab === t.id ? 1 : 0.5 }}>{t.icon}</div>
              <div style={{ ...font(10, tab === t.id ? 600 : 500), color: tab === t.id ? C.gold : C.slate, marginTop: 2 }}>{t.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
