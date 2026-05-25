import { useState, useEffect, useRef, useMemo } from "react";

/* ================================================================
   EVOQUEST v6 — Active Recall Evolution Trainer
   + Timed scramble-reveal etymology hints during play
   + Persistent progress via window.storage
   ================================================================ */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// ── ETYMOLOGY ────────────────────────────────────────────────

const ETYM = {
  "cambrian": { root: "Latin: Cambria — Roman name for Wales", mnemonic: "CAMbrian → CAMera capturing the first EXPLOSION of animal life on film" },
  "dichotomous": { root: "Greek: dikho (in two) + tomos (cut)", mnemonic: "DICHO-tomous → DICE-CUT → a knife dicing something in half, again and again, two choices each time" },
  "phenotype": { root: "Greek: phainein (to show) + typos (impression)", mnemonic: "PHENO → PHONE → what you could PHONE home about because you can SEE it. Observable traits." },
  "endosymbiotic": { root: "Greek: endo (within) + sym (together) + bios (life)", mnemonic: "ENDO=INSIDE like endoscopy. SYM=TOGETHER like symphony. Life INSIDE together — permanent roommates." },
  "endosymbiosis": { root: "Greek: endo (within) + sym (together) + bios (life)", mnemonic: "ENDO=INSIDE. SYM=TOGETHER. Prokaryotes moved IN and stayed — roommates for 2 billion years." },
  "homologous": { root: "Greek: homos (same) + logos (relation)", mnemonic: "HOMO=SAME logic. Your arm and a whale flipper: SAME bones, different jobs. Same blueprint, different product." },
  "analogous": { root: "Greek: analogos (proportionate)", mnemonic: "ANALOG watch vs digital — looks similar on surface but works completely differently inside. Same function, different origin." },
  "allopatric": { root: "Greek: allos (other) + patris (fatherland)", mnemonic: "ALLO=OTHER like allophone. PATRIC=LAND like patriot. They moved to OTHER LANDS and couldn't date anymore." },
  "sympatric": { root: "Greek: syn (together) + patris (fatherland)", mnemonic: "SYM=TOGETHER. PATRIC=LAND. Same neighborhood, still broke up — that's the twist. Speciation without moving." },
  "coevolution": { root: "Latin: co- (together) + evolvere (to unroll)", mnemonic: "CO=TOGETHER like co-worker. They EVOLVE as dance partners — each move triggering the other's next step." },
  "equilibrium": { root: "Latin: aequi (equal) + libra (balance/scale)", mnemonic: "EQUI=EQUAL. LIBRA=SCALES. Punctuated equilibrium: the scales get knocked over then re-balance. Burst, calm, burst." },
  "abiogenesis": { root: "Greek: a- (without) + bios (life) + genesis (origin)", mnemonic: "A=WITHOUT like atypical. BIO=LIFE. GENESIS=BEGINNING. The very first beginning — life from non-life." },
  "biogenesis": { root: "Greek: bios (life) + genesis (origin)", mnemonic: "BIO=LIFE. GENESIS=BIRTH. Life begets life. Pasteur's curved flask proved it — no life force in the air." },
  "mimicry": { root: "Greek: mimos (imitator, mime artist)", mnemonic: "MIMOS → MIME → a street mime copies others silently. The Viceroy MIMES the Monarch's poisonous look." },
  "gene pool": { root: "Greek: genos (race/kind)", mnemonic: "Imagine a swimming POOL but instead of water it is filled with every allele in the population. Dive in." },
  "bottleneck effect": { root: "English metaphor from bottle necks", mnemonic: "Flip a bottle — only a few drops squeeze through the NECK. Most genetic diversity gets left behind in the bottle." },
  "founder effect": { root: "English: founder = one who establishes", mnemonic: "The FOUNDERS grabbed a random handful of M&Ms from a huge bag. You won't get every color on your island." },
  "stabilizing selection": { root: "Latin: stabilis (firm, steady)", mnemonic: "STABLE → STABILIZING. Middle is STABLE, extremes get axed. Medium babies survive. Bell curve gets thinner." },
  "directional selection": { root: "Latin: directio (a making straight)", mnemonic: "Think one-way DIRECTION arrow pushing the whole bell curve left or right. One extreme wins." },
  "disruptive selection": { root: "Latin: disrumpere (to break apart)", mnemonic: "DIS-RUPT = BREAK APART the middle. Rip the bell curve in half — two peaks survive, center collapses." },
  "adaptive radiation": { root: "Latin: adaptare (to fit) + radiare (to beam out)", mnemonic: "RADIATE outward like sun RAYS from one point. One ancestor RADIATES into many adapted forms. Darwin's finches." },
  "hardy-weinberg principle": { root: "Named: G.H. Hardy (English) + W. Weinberg (German)", mnemonic: "Hardy-Weinberg = evolution's day off. The math of what happens when ABSOLUTELY NOTHING changes. Baseline." },
  "rna": { root: "Ribonucleic Acid — German Ribose (a sugar)", mnemonic: "RNA = life's ROUGH DRAFT. DNA is the clean copy. RNA came first — it could copy itself AND build proteins." },
};

function findEtym(qType, qData) {
  const found = [];
  const check = (text) => {
    const lower = text.toLowerCase();
    for (const [key, val] of Object.entries(ETYM)) {
      if (lower.includes(key) && !found.some(f => f.key === key)) {
        found.push({ key, ...val });
      }
    }
  };
  if (qType === "fill") { check(qData.q); qData.a.forEach(a => check(a)); }
  else if (qType === "match") { check(qData.term); check(qData.right); }
  else if (qType === "scenario") { check(qData.ans); check(qData.exp); }
  else if (qType === "darwin") { check(qData.exp); }
  else if (qType === "timeline") { qData.items.forEach(i => check(i)); }
  return found.slice(0, 1);
}

// ── QUESTIONS ────────────────────────────────────────────────

const POOL = {
  timeline: [
    { prompt:"Arrange EARLIEST → MOST RECENT", items:["Origin of Earth (4.5 bya)","First fossil bacteria (3.5 bya)","First eukaryotes (2.1 bya)","Cambrian Explosion (543 mya)","Humans evolve (1.8 mya)"] },
    { prompt:"Arrange EARLIEST → MOST RECENT", items:["Photosynthesis evolves (2.7 bya)","First multicellular organisms (1.5 bya)","Ediacaran fauna (600 mya)","Land plants (489 mya)","First amphibians (418 mya)"] },
    { prompt:"Arrange EARLIEST → MOST RECENT", items:["Reptiles evolve (362 mya)","Pangaea fully forms (300 mya)","Permian extinction — 95% dead (251 mya)","Dinosaurs dominate (200 mya)","K-T extinction (65 mya)"] },
    { prompt:"Arrange EARLIEST → MOST RECENT", items:["Chemical evidence of life (4 bya)","Stromatolites (3.5 bya)","Great Oxygenation Event (2.7 bya)","Cambrian Explosion (543 mya)","First birds (146 mya)"] },
  ],
  darwin: [
    { stmt:"A giraffe stretches its neck to reach food, so its offspring inherit longer necks.", ans:"LAMARCK", exp:"Lamarck: acquired traits inherited. Darwin: giraffes BORN with longer necks survived better." },
    { stmt:"Beetles born with thicker shells survive predators better, so thick shells become more common.", ans:"DARWIN", exp:"Natural selection — variation exists first, environment selects favorable traits." },
    { stmt:"A blacksmith works hard all his life, so his children are born with stronger arms.", ans:"LAMARCK", exp:"Lamarck's use/disuse. Building muscles doesn't change DNA." },
    { stmt:"Some bacteria randomly have resistance mutations. When antibiotics are used, resistant ones survive.", ans:"DARWIN", exp:"Natural selection: random variation + selective pressure = population change." },
    { stmt:"Dark peppered moths already existed. Soot-darkened trees let them hide better, so they thrived.", ans:"DARWIN", exp:"Variation existed FIRST. Environment selected for it. Moths didn't will themselves dark." },
    { stmt:"An organism's body changes based on desire and need, then those changes pass to offspring.", ans:"LAMARCK", exp:"Lamarck: desire drives change. Darwin: change is random, environment selects." },
  ],
  match: [
    { term:"Gene Pool", right:"All alleles in a population combined", wrong:["A single organism's DNA","The dominant allele only","Mutations during meiosis"] },
    { term:"Bottleneck Effect", right:"Disaster reduces population → survivors have less genetic diversity", wrong:["Small group colonizes new area","Two populations merge","Selection in large populations"] },
    { term:"Founder Effect", right:"Small group colonizes new area → limited allele diversity", wrong:["Disaster kills most of population","First species to evolve a trait","Adaptive radiation on islands"] },
    { term:"Stabilizing Selection", right:"Middle phenotype favored — curve narrows (e.g. medium babies)", wrong:["One extreme favored — curve shifts","Both extremes favored — splits","Random drift in small populations"] },
    { term:"Directional Selection", right:"One extreme phenotype favored — bell curve shifts one direction", wrong:["Middle phenotype favored","Both extremes favored","Allele frequencies stay constant"] },
    { term:"Disruptive Selection", right:"Both extremes favored over middle — curve splits into two peaks", wrong:["Middle is favored — narrows","One extreme favored — shifts","Human-driven selection"] },
    { term:"Endosymbiotic Theory", right:"Large prokaryotes engulfed small ones → became mitochondria & chloroplasts", wrong:["Eukaryotes from primordial soup","Viruses inserted DNA","Cells merged during reproduction"] },
    { term:"Homologous Structures", right:"Same structure, different function — common ancestor (divergent evolution)", wrong:["Different structures, same function","Structures only in embryos","Vestigial organs"] },
    { term:"Analogous Structures", right:"Different origin, similar function — evolved independently (convergent)", wrong:["Same structure for different functions","Identical DNA sequences","Lost-function organs"] },
    { term:"Hardy-Weinberg Principle", right:"Allele frequencies stay constant only if NO evolutionary forces act", wrong:["Alleles always change over time","Dominant alleles always increase","Evolution fastest in large pops"] },
    { term:"Adaptive Radiation", right:"One species rapidly diversifies into many forms (e.g. Darwin's finches)", wrong:["Unrelated species look similar","Gradual change over millions of years","Radiation causing mutations"] },
    { term:"Coevolution", right:"Two+ species evolve in response to each other (flowers & pollinators)", wrong:["Species splits via isolation","All species evolve at same rate","Shared-ancestor species evolve same"] },
  ],
  fill: [
    { q:"The _____ Explosion (~543 mya) was a rapid diversification of animal body plans.", a:["cambrian"], hint:"A geologic period" },
    { q:"Pasteur used a _____-neck flask to disprove spontaneous generation.", a:["curved","swan"], hint:"Shape of the flask" },
    { q:"Miller & Urey produced amino acids and _____ from early-atmosphere gases.", a:["sugars","sugar"], hint:"Simple carbohydrate" },
    { q:"Oparin said organic compounds in oceans = 'Primordial _____'.", a:["soup"], hint:"A thick mixture" },
    { q:"Lynn Margulis proposed the _____ Theory for eukaryotic cell evolution.", a:["endosymbiotic","endosymbiosis"], hint:"Endo=within, symbiotic=together" },
    { q:"Darwin studied finches and tortoises on the _____ Islands.", a:["galapagos"], hint:"Off South America" },
    { q:"Natural selection acts on _____ (visible traits), not directly on genotype.", a:["phenotype"], hint:"Observable characteristics" },
    { q:"Genetic drift _____ genetic diversity in small populations.", a:["decreases","reduces","lowers"], hint:"Up or down?" },
    { q:"The Viceroy butterfly uses _____ to look like the poisonous Monarch.", a:["mimicry"], hint:"Copying a dangerous look" },
    { q:"A _____ key uses two-choice questions to identify organisms.", a:["dichotomous"], hint:"Greek: cut in two" },
    { q:"The first hereditary molecule was probably _____, not DNA.", a:["rna"], hint:"3-letter nucleic acid" },
    { q:"Punctuated _____ = speciation in quick bursts between stable periods.", a:["equilibrium"], hint:"State of balance, interrupted" },
  ],
  scenario: [
    { story:"Volcano kills 90% of rabbits on an island. Survivors mostly have brown fur.", q:"What concept?", ans:"Bottleneck Effect", opts:["Bottleneck Effect","Founder Effect","Natural Selection","Directional Selection"], exp:"Catastrophe reduced population — survivors' alleles dominate by chance = bottleneck." },
    { story:"River splits lizard population. After 10,000 years they can't interbreed.", q:"What speciation type?", ans:"Allopatric Speciation", opts:["Allopatric Speciation","Sympatric Speciation","Temporal Isolation","Adaptive Radiation"], exp:"Geographic barrier → genetic divergence → can't interbreed = allopatric." },
    { story:"Very dark and very light moths survive. Medium-colored moths get eaten most.", q:"What selection type?", ans:"Disruptive Selection", opts:["Stabilizing Selection","Directional Selection","Disruptive Selection","Artificial Selection"], exp:"Both extremes favored, middle dies — curve splits. Disruptive." },
    { story:"Hospital bacteria no longer respond to antibiotics used for years.", q:"What explains this?", ans:"Natural Selection", opts:["Genetic Drift","Natural Selection","Coevolution","Founder Effect"], exp:"Resistant bacteria survived and reproduced. Natural selection." },
    { story:"Flowers evolve longer tubes. Hummingbirds evolve longer beaks. Cycle continues.", q:"What is this?", ans:"Coevolution", opts:["Convergent Evolution","Adaptive Radiation","Coevolution","Divergent Evolution"], exp:"Two species evolving in response to each other = coevolution." },
    { story:"Very small and very large human babies have lower survival. Medium babies do best.", q:"Selection type?", ans:"Stabilizing Selection", opts:["Directional Selection","Stabilizing Selection","Disruptive Selection","Sexual Selection"], exp:"Middle favored, extremes selected against = stabilizing." },
    { story:"Storm blows a few birds to a remote island. New population has limited genes.", q:"What is this?", ans:"Founder Effect", opts:["Bottleneck Effect","Founder Effect","Adaptive Radiation","Gene Flow"], exp:"Small subgroup colonizes new area = founder effect." },
    { story:"Darwin's finches on different islands evolved different beaks from one ancestor.", q:"Evolution pattern?", ans:"Adaptive Radiation", opts:["Convergent Evolution","Coevolution","Adaptive Radiation","Gradualism"], exp:"One ancestor → many forms = adaptive radiation." },
  ],
};

const TYPES = ["timeline","darwin","match","fill","scenario"];
const META = {
  timeline:{ icon:"⏳", name:"TIME WARP", g1:"#a78bfa", g2:"#e879f9" },
  darwin:  { icon:"🧬", name:"DARWIN or LAMARCK?", g1:"#fbbf24", g2:"#fb923c" },
  match:   { icon:"🔗", name:"CONCEPT LOCK", g1:"#22d3ee", g2:"#60a5fa" },
  fill:    { icon:"🧠", name:"MIND THE GAP", g1:"#34d399", g2:"#2dd4bf" },
  scenario:{ icon:"🌍", name:"SURVIVAL LAB", g1:"#fb7185", g2:"#f472b6" },
};

function buildQueue() {
  const pools = {}; TYPES.forEach(t => pools[t] = shuffle(POOL[t]));
  const idx = {}; TYPES.forEach(t => idx[t] = 0);
  const q = [];
  for (let c = 0; c < 4; c++) for (const t of shuffle(TYPES)) { q.push({ type:t, data:pools[t][idx[t]%pools[t].length] }); idx[t]++; }
  return q;
}

// ── STORAGE ──────────────────────────────────────────────────
async function saveProgress(s) { try { await window.storage.set("evoquest-progress", JSON.stringify(s)); } catch(e){} }
async function loadProgress() { try { const r = await window.storage.get("evoquest-progress"); return r ? JSON.parse(r.value) : null; } catch(e){ return null; } }
async function clearProgress() { try { await window.storage.delete("evoquest-progress"); } catch(e){} }

// ── LAYOUT ───────────────────────────────────────────────────
const BG = "#0b1120";
function Shell({ children }) { return <div style={{ background:BG, minHeight:"100vh", fontFamily:"'Nunito',system-ui,sans-serif", color:"white" }}><link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Nunito:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />{children}</div>; }

function Hud({ pct, score, n, streak, time }) {
  return <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, background:"rgba(11,17,32,0.92)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"8px 16px" }}>
    <div style={{ maxWidth:520, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:11, fontWeight:900, color:"#22d3ee", letterSpacing:"0.1em" }}>{Math.min(n+1,20)}/20</span>
        <div style={{ width:96, height:6, borderRadius:3, background:"rgba(255,255,255,0.1)", overflow:"hidden" }}><div style={{ height:"100%", borderRadius:3, transition:"width 0.5s", width:`${pct}%`, background:"linear-gradient(90deg,#22d3ee,#34d399)" }} /></div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12, fontSize:12 }}>
        {n > 0 && <span style={{ color:"#34d399", fontWeight:700 }}>{score}✓</span>}
        {streak > 1 && <span style={{ color:"#fbbf24", fontWeight:700 }}>🔥{streak}</span>}
        <span style={{ color:"rgba(255,255,255,0.35)", fontFamily:"monospace", fontSize:11 }}>{time}</span>
      </div>
    </div>
  </div>;
}

const btnBase = { width:"100%", textAlign:"left", padding:"12px 16px", borderRadius:12, fontSize:14, fontWeight:600, border:"1px solid rgba(255,255,255,0.12)", cursor:"pointer", transition:"all 0.15s", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.9)" };
const btnUsed = { ...btnBase, background:"rgba(255,255,255,0.02)", borderColor:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.2)", cursor:"default" };
const btnRight = { ...btnBase, background:"rgba(52,211,153,0.15)", borderColor:"rgba(52,211,153,0.3)", color:"#6ee7b7" };
const btnWrong = { ...btnBase, background:"rgba(251,113,133,0.15)", borderColor:"rgba(251,113,133,0.3)", color:"#fda4af" };
const btnFade = { ...btnBase, background:"rgba(255,255,255,0.02)", borderColor:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.2)", cursor:"default" };

// ── HINT REVEALER ────────────────────────────────────────────

function HintRevealer({ etyms, answered }) {
  const hint = etyms && etyms.length > 0 ? etyms[0] : null;
  const [countdown, setCountdown] = useState(6);
  const [revealedSet, setRevealedSet] = useState(new Set());
  const [phase, setPhase] = useState("waiting"); // waiting | revealing | done
  const orderRef = useRef([]);

  // Build random reveal order once
  useEffect(() => {
    if (!hint) return;
    const chars = hint.mnemonic.length;
    const indices = Array.from({ length: chars }, (_, i) => i);
    // shuffle indices
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    orderRef.current = indices;
  }, [hint]);

  // Countdown timer
  useEffect(() => {
    if (!hint || phase !== "waiting" || answered) return;
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { setPhase("revealing"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [hint, phase, answered]);

  // Reveal characters one by one over 5 seconds
  useEffect(() => {
    if (!hint || phase !== "revealing") return;
    const total = hint.mnemonic.length;
    const interval = Math.max(30, 5000 / total);
    let count = 0;
    const iv = setInterval(() => {
      if (count >= total) { setPhase("done"); clearInterval(iv); return; }
      setRevealedSet(prev => {
        const next = new Set(prev);
        next.add(orderRef.current[count]);
        return next;
      });
      count++;
    }, interval);
    return () => clearInterval(iv);
  }, [hint, phase]);

  // If answered, instantly reveal everything
  useEffect(() => {
    if (answered && hint) {
      const all = new Set(Array.from({ length: hint.mnemonic.length }, (_, i) => i));
      setRevealedSet(all);
      setPhase("done");
    }
  }, [answered, hint]);

  if (!hint) return null;

  const text = hint.mnemonic;
  const pctBar = phase === "waiting" ? (countdown / 6) * 100 : 0;

  return (
    <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(167,139,250,0.15)", background: "rgba(167,139,250,0.04)", transition: "opacity 0.3s" }}>
      {/* Root always visible */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 13 }}>📜</span>
        <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 11, color: "#c4b5fd", textTransform: "uppercase", letterSpacing: "0.06em" }}>{hint.root}</span>
      </div>

      {phase === "waiting" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              Revealing mnemonic in <span style={{ color: "#c4b5fd", fontWeight: 700 }}>{countdown}s</span>...
            </span>
          </div>
          <div style={{ width: "100%", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, background: "rgba(167,139,250,0.5)", transition: "width 1s linear", width: `${pctBar}%` }} />
          </div>
        </div>
      )}

      {(phase === "revealing" || phase === "done") && (
        <div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginRight: 4 }}>💡 Remember:</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.7, letterSpacing: "0.02em" }}>
            {text.split("").map((char, i) => {
              const isSpace = char === " ";
              const isRevealed = revealedSet.has(i);
              return (
                <span key={i} style={{
                  color: isSpace ? "transparent" : isRevealed ? "#fbbf24" : "rgba(167,139,250,0.2)",
                  textShadow: isRevealed && !isSpace ? "0 0 8px rgba(251,191,36,0.3)" : "none",
                  transition: "color 0.3s, text-shadow 0.3s",
                }}>
                  {isSpace ? " " : isRevealed ? char : "░"}
                </span>
              );
            })}
          </span>
        </div>
      )}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────

export default function EvoQuest() {
  const [phase, setPhase] = useState("loading");
  const [queue, setQueue] = useState([]);
  const [ci, setCi] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [log, setLog] = useState([]);
  const [fb, setFb] = useState(null);
  const [sec, setSec] = useState(0);
  const [saved, setSaved] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [answered, setAnswered] = useState(false);
  const startMs = useRef(0);
  const phaseRef = useRef("loading");
  phaseRef.current = phase;

  useEffect(() => { loadProgress().then(d => { setSaved(d); setPhase("menu"); }); }, []);
  useEffect(() => {
    if (phase === "menu" || phase === "end" || phase === "loading") return;
    const iv = setInterval(() => setSec(Math.floor((Date.now() - startMs.current) / 1000)), 500);
    return () => clearInterval(iv);
  }, [phase]);
  useEffect(() => {
    if (phase !== "brief") return;
    const t = setTimeout(() => { if (phaseRef.current === "brief") setPhase("play"); }, 1400);
    return () => clearTimeout(t);
  }, [phase, ci]);
  useEffect(() => {
    if (queue.length > 0 && log.length > 0 && phase !== "end")
      saveProgress({ queue, ci, score, streak, best, log, elapsed: sec, startMs: startMs.current });
  }, [log]);

  // Reset answered flag when entering play
  useEffect(() => { if (phase === "play") setAnswered(false); }, [phase]);

  function resumeGame(d) {
    setQueue(d.queue); setCi(d.ci); setScore(d.score); setStreak(d.streak); setBest(d.best); setLog(d.log); setSec(d.elapsed); setFb(null);
    startMs.current = Date.now() - (d.elapsed * 1000); setSaved(null); setPhase("brief");
  }
  function startFresh() {
    setQueue(buildQueue()); setCi(0); setScore(0); setStreak(0); setBest(0); setLog([]); setFb(null); setSec(0); setAnswered(false);
    startMs.current = Date.now(); setSaved(null); setShowConfirm(false); clearProgress(); setPhase("brief");
  }
  function handleRestart() { if (queue.length > 0 && log.length > 0) { setShowConfirm(true); return; } startFresh(); }
  function handleAnswer(correct, explain) {
    setAnswered(true);
    setLog(prev => [...prev, { type: queue[ci].type, data: queue[ci].data, correct }]);
    if (correct) { setScore(s => s + 1); setStreak(s => { const n = s + 1; setBest(b => Math.max(b, n)); return n; }); } else { setStreak(0); }
    setFb({ correct, explain, qType: queue[ci].type, qData: queue[ci].data });
    setPhase("fb");
  }
  function goNext() { if (ci + 1 >= queue.length) { clearProgress(); setPhase("end"); return; } setCi(i => i + 1); setFb(null); setPhase("brief"); }

  const cur = queue[ci];
  const meta = cur ? META[cur.type] : null;
  const pctDone = queue.length ? ((ci + (phase === "fb" ? 1 : 0)) / queue.length) * 100 : 0;
  const timeStr = `${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`;
  const curEtym = cur ? findEtym(cur.type, cur.data) : [];

  const confirmOverlay = showConfirm ? (
    <div style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:BG, border:"1px solid rgba(255,255,255,0.15)", borderRadius:20, padding:28, maxWidth:360, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:36, marginBottom:8 }}>⚠️</div>
        <h3 style={{ fontFamily:"Syne,sans-serif", fontSize:18, fontWeight:900, margin:"0 0 8px" }}>Reset Progress?</h3>
        <p style={{ color:"rgba(255,255,255,0.5)", fontSize:13, margin:"0 0 20px", lineHeight:1.5 }}>Round {ci+1}/20 · {score}/{log.length} correct. This will be erased.</p>
        <button onClick={startFresh} style={{ width:"100%", padding:"14px 0", borderRadius:12, fontWeight:700, fontSize:14, color:"white", background:"rgba(251,113,133,0.2)", border:"1px solid rgba(251,113,133,0.3)", cursor:"pointer", marginBottom:8 }}>Yes, Start Over</button>
        <button onClick={() => setShowConfirm(false)} style={{ width:"100%", padding:"14px 0", borderRadius:12, fontWeight:700, fontSize:14, color:"rgba(255,255,255,0.7)", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", cursor:"pointer" }}>Keep Playing</button>
      </div>
    </div>
  ) : null;

  if (phase === "loading") return <Shell><div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", color:"rgba(255,255,255,0.3)" }}>Loading...</div></Shell>;

  // ── MENU ──
  if (phase === "menu") return (
    <Shell><div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:420, width:"100%" }}>
        <div style={{ fontSize:80, marginBottom:16, filter:"drop-shadow(0 0 20px rgba(34,211,238,0.25))" }}>🧬</div>
        <h1 style={{ fontFamily:"Syne,sans-serif", fontSize:52, fontWeight:900, letterSpacing:"-0.03em", margin:"0 0 6px", background:"linear-gradient(135deg,#22d3ee,#34d399,#fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>EVOQUEST</h1>
        <p style={{ color:"rgba(255,255,255,0.35)", fontSize:11, letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:32 }}>Active Recall · Latin Roots · Mnemonics</p>
        {saved && saved.ci < (saved.queue?.length || 0) ? (
          <div style={{ marginBottom:24 }}>
            <div style={{ padding:"16px 20px", borderRadius:16, border:"1px solid rgba(34,211,238,0.2)", background:"rgba(34,211,238,0.06)", marginBottom:12, textAlign:"left" }}>
              <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:700, color:"#67e8f9" }}>📂 Saved Progress</p>
              <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.5)" }}>Round {saved.ci+1}/20 · {saved.score}/{saved.log.length} correct · {Math.floor(saved.elapsed/60)}:{String(saved.elapsed%60).padStart(2,"0")}</p>
            </div>
            <button onClick={() => resumeGame(saved)} style={{ width:"100%", padding:"16px 0", borderRadius:16, fontFamily:"Syne,sans-serif", fontWeight:900, fontSize:16, color:BG, background:"linear-gradient(135deg,#22d3ee,#34d399)", border:"none", cursor:"pointer", marginBottom:8 }}>CONTINUE</button>
            <button onClick={startFresh} style={{ width:"100%", padding:"14px 0", borderRadius:16, fontWeight:700, fontSize:14, color:"rgba(255,255,255,0.6)", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", cursor:"pointer" }}>Start Fresh</button>
          </div>
        ) : (
          <button onClick={startFresh} style={{ width:"100%", maxWidth:280, margin:"0 auto", display:"block", padding:"18px 0", borderRadius:16, fontFamily:"Syne,sans-serif", fontWeight:900, fontSize:17, color:BG, background:"linear-gradient(135deg,#22d3ee,#34d399)", border:"none", cursor:"pointer", marginBottom:24 }}>START QUEST</button>
        )}
        <div style={{ marginTop:16, textAlign:"left" }}>
          {TYPES.map(t => <div key={t} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", marginBottom:6, borderRadius:12, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.03)" }}><span style={{ fontSize:22 }}>{META[t].icon}</span><span style={{ fontFamily:"Syne,sans-serif", fontWeight:700, color:"rgba(255,255,255,0.85)", fontSize:13 }}>{META[t].name}</span></div>)}
        </div>
      </div>
    </div></Shell>
  );

  // ── BRIEFING ──
  if (phase === "brief" && meta) return (
    <Shell>{confirmOverlay}<Hud pct={pctDone} score={score} n={ci} streak={streak} time={timeStr} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:24 }}>
        <div style={{ textAlign:"center" }} key={`b${ci}`}>
          <div style={{ fontSize:64, marginBottom:12, animation:"popIn .35s ease-out" }}>{meta.icon}</div>
          <h2 style={{ fontFamily:"Syne,sans-serif", fontSize:24, fontWeight:900, margin:0, background:`linear-gradient(135deg,${meta.g1},${meta.g2})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"popIn .35s ease-out .05s both" }}>{meta.name}</h2>
          <div style={{ marginTop:20, width:112, height:4, borderRadius:2, background:"rgba(255,255,255,0.12)", margin:"20px auto 0", overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:2, background:"rgba(255,255,255,0.5)", animation:"drain 1.4s linear forwards" }} />
          </div>
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}} @keyframes drain{from{width:100%}to{width:0%}}`}</style>
    </Shell>
  );

  // ── FEEDBACK ──
  if (phase === "fb" && fb) {
    let recap = null;
    if (!fb.correct && fb.qData) {
      const d = fb.qData;
      if (fb.qType === "darwin") {
        recap = <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
          {["LAMARCK","DARWIN"].map(w => <div key={w} style={{ padding:"10px 0", borderRadius:12, textAlign:"center", fontFamily:"Syne,sans-serif", fontWeight:900, fontSize:14, border:w===d.ans?"2px solid #34d399":"2px solid rgba(255,255,255,0.06)", background:w===d.ans?"rgba(52,211,153,0.12)":"rgba(255,255,255,0.02)", color:w===d.ans?"#6ee7b7":"rgba(255,255,255,0.2)" }}>{w==="LAMARCK"?"🦒":"🐢"} {w}{w===d.ans&&<span style={{ display:"block", fontSize:10, fontWeight:600, marginTop:2, color:"#34d399" }}>✓ CORRECT</span>}</div>)}
        </div>;
      } else if (fb.qType === "match" || fb.qType === "scenario") {
        const ans = fb.qType === "match" ? d.right : d.ans;
        recap = <div style={{ padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16, border:"1px solid rgba(52,211,153,0.3)", background:"rgba(52,211,153,0.1)", color:"#6ee7b7" }}>✓ {ans}</div>;
      } else if (fb.qType === "fill") {
        const parts = d.q.split("_____");
        recap = <div style={{ padding:"12px 16px", borderRadius:12, marginBottom:16, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}><p style={{ margin:0, fontSize:13, color:"rgba(255,255,255,0.7)", lineHeight:1.6 }}>{parts[0]}<span style={{ fontWeight:700, color:"#6ee7b7", borderBottom:"2px solid #34d399", padding:"0 2px" }}>{d.a[0]}</span>{parts[1]}</p></div>;
      }
    }
    const fbEtym = findEtym(fb.qType, fb.qData);
    return (
      <Shell>{confirmOverlay}<Hud pct={pctDone} score={score} n={log.length} streak={streak} time={timeStr} />
        <div style={{ maxWidth:520, margin:"0 auto", padding:"80px 20px 40px", animation:"slideUp .25s ease-out" }}>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:64, height:64, borderRadius:32, fontSize:28, marginBottom:8, background:fb.correct?"rgba(52,211,153,0.15)":"rgba(251,113,133,0.15)" }}>{fb.correct?"✓":"✗"}</div>
            <h3 style={{ fontFamily:"Syne,sans-serif", fontSize:20, fontWeight:900, color:fb.correct?"#34d399":"#fb7185", margin:0 }}>{fb.correct?(streak>2?`🔥 ${streak} STREAK!`:"Locked In!"):"Not Quite"}</h3>
          </div>
          {recap}
          <div style={{ borderRadius:16, padding:20, marginBottom:16, border:fb.correct?"1px solid rgba(52,211,153,0.2)":"1px solid rgba(251,191,36,0.2)", background:fb.correct?"rgba(52,211,153,0.06)":"rgba(251,191,36,0.06)" }}>
            <p style={{ color:"rgba(255,255,255,0.8)", fontSize:14, lineHeight:1.6, margin:0 }}>{fb.explain}</p>
          </div>
          {fbEtym.length > 0 && (
            <div style={{ padding:"10px 14px", borderRadius:12, marginBottom:16, border:"1px solid rgba(167,139,250,0.15)", background:"rgba(167,139,250,0.04)" }}>
              <span style={{ fontSize:11 }}>📜 </span>
              <span style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:11, color:"#c4b5fd", letterSpacing:"0.05em" }}>{fbEtym[0].root}</span>
            </div>
          )}
          <button onClick={goNext} style={{ width:"100%", padding:"16px 0", borderRadius:16, fontWeight:700, fontSize:14, color:"white", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", cursor:"pointer", letterSpacing:"0.05em" }}>{ci+1>=queue.length?"SEE RESULTS →":"NEXT →"}</button>
        </div>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </Shell>
    );
  }

  // ── PLAY ──
  if (phase === "play" && cur) return (
    <Shell>{confirmOverlay}<Hud pct={pctDone} score={score} n={ci} streak={streak} time={timeStr} />
      <div style={{ maxWidth:520, margin:"0 auto", padding:"68px 20px 40px", animation:"slideUp .25s ease-out" }} key={`p${ci}`}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
          <span style={{ fontSize:20 }}>{meta.icon}</span>
          <span style={{ fontFamily:"Syne,sans-serif", fontSize:12, fontWeight:900, letterSpacing:"0.1em", textTransform:"uppercase", background:`linear-gradient(90deg,${meta.g1},${meta.g2})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{meta.name}</span>
        </div>
        {cur.type === "timeline" && <RndTimeline d={cur.data} onDone={handleAnswer} key={ci} />}
        {cur.type === "darwin" && <RndDarwin d={cur.data} onDone={handleAnswer} key={ci} />}
        {cur.type === "match" && <RndMatch d={cur.data} onDone={handleAnswer} key={ci} />}
        {cur.type === "fill" && <RndFill d={cur.data} onDone={handleAnswer} key={ci} />}
        {cur.type === "scenario" && <RndScenario d={cur.data} onDone={handleAnswer} key={ci} />}
        <HintRevealer etyms={curEtym} answered={answered} key={`hint-${ci}`} />
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </Shell>
  );

  // ── END ──
  if (phase === "end") {
    const t = log.length, p = t>0?Math.round((score/t)*100):0;
    const grade = p>=93?"A":p>=85?"B+":p>=78?"B":p>=70?"C":p>=60?"D":"F";
    const gc = p>=85?"#34d399":p>=70?"#fbbf24":"#fb7185";
    const missed = log.filter(r => !r.correct);
    return (
      <Shell><div style={{ maxWidth:420, margin:"0 auto", padding:"40px 20px", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:8 }}>🏆</div>
        <div style={{ fontFamily:"Syne,sans-serif", fontSize:72, fontWeight:900, color:gc, lineHeight:1 }}>{grade}</div>
        <p style={{ color:"rgba(255,255,255,0.6)", fontSize:14, margin:"4px 0" }}>{score}/{t} correct — {p}%</p>
        <p style={{ color:"rgba(255,255,255,0.3)", fontSize:12, marginBottom:32 }}>{timeStr} · Best streak: {best}🔥</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:32 }}>
          {[{l:"Correct",v:score,c:"#34d399"},{l:"Missed",v:t-score,c:"#fb7185"},{l:"Streak",v:best,c:"#fbbf24"}].map(s=>(
            <div key={s.l} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"16px 0" }}>
              <div style={{ fontFamily:"Syne,sans-serif", fontSize:28, fontWeight:900, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", marginTop:4 }}>{s.l}</div>
            </div>
          ))}
        </div>
        {missed.length > 0 && <div style={{ textAlign:"left", marginBottom:32 }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>🔁 Review these</p>
          {missed.map((r,i) => { const m=META[r.type]; let pv=r.type==="fill"?`[${r.data.a[0]}]`:r.type==="match"?r.data.term:r.type==="darwin"?r.data.stmt.slice(0,40)+"...":r.data.story?.slice(0,40)+"..."; return <div key={i} style={{ marginBottom:6, padding:"8px 12px", borderRadius:8, background:"rgba(251,113,133,0.06)", border:"1px solid rgba(251,113,133,0.12)", fontSize:12 }}><span style={{ color:"#fb7185", fontWeight:700 }}>{m.icon} {m.name}</span><span style={{ color:"rgba(255,255,255,0.4)", marginLeft:8 }}>{pv}</span></div>; })}
        </div>}
        <button onClick={startFresh} style={{ width:"100%", padding:"16px 0", borderRadius:16, fontFamily:"Syne,sans-serif", fontWeight:900, fontSize:17, color:BG, background:"linear-gradient(135deg,#22d3ee,#34d399)", border:"none", cursor:"pointer" }}>PLAY AGAIN</button>
      </div></Shell>
    );
  }
  return null;
}

// ── ROUND COMPONENTS ─────────────────────────────────────────

function RndTimeline({ d, onDone }) {
  const shuffled = useMemo(() => shuffle(d.items), [d]);
  const [picked, setPicked] = useState([]);
  const [locked, setLocked] = useState(false);
  function tap(item) {
    if (locked || picked.includes(item)) return;
    const nxt = [...picked, item]; setPicked(nxt);
    if (nxt.length === shuffled.length) { setLocked(true); const ok = nxt.every((v,i)=>v===d.items[i]); setTimeout(()=>onDone(ok, ok?"Perfect order!":"Correct order:\n"+d.items.join("  →  ")), ok?900:2400); }
  }
  return <div>
    <p style={{ color:"rgba(255,255,255,0.55)", fontSize:14, marginBottom:16 }}>{d.prompt}</p>
    <div style={{ minHeight:40, marginBottom:16, display:"flex", flexWrap:"wrap", gap:6, padding:12, borderRadius:12, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
      {picked.length===0&&<span style={{ color:"rgba(255,255,255,0.2)", fontSize:13, fontStyle:"italic" }}>Tap events in order...</span>}
      {picked.map((item,i)=>{const ok=locked&&item===d.items[i],bad=locked&&item!==d.items[i]; return <span key={i} style={{ padding:"4px 8px", borderRadius:6, fontSize:11, fontWeight:700, border:`1px solid ${ok?"rgba(52,211,153,0.35)":bad?"rgba(251,113,133,0.35)":"rgba(34,211,238,0.25)"}`, background:ok?"rgba(52,211,153,0.15)":bad?"rgba(251,113,133,0.15)":"rgba(34,211,238,0.1)", color:ok?"#6ee7b7":bad?"#fda4af":"#67e8f9" }}>{i+1}. {item.replace(/\s*\(.*?\)/,"")}</span>;})}
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {shuffled.map((item,i)=>{const used=picked.includes(item); return <button key={i} onClick={()=>tap(item)} disabled={used||locked} style={used?btnUsed:btnBase}>{item}{used&&<span style={{ float:"right", color:"rgba(255,255,255,0.15)" }}>#{picked.indexOf(item)+1}</span>}</button>;})}
    </div>
    {picked.length>0&&!locked&&<button onClick={()=>setPicked([])} style={{ marginTop:8, fontSize:11, color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer" }}>↺ Reset</button>}
  </div>;
}

function RndDarwin({ d, onDone }) {
  const [pick, setPick] = useState(null);
  function tap(w) { if (pick) return; setPick(w); const ok=w===d.ans; setTimeout(()=>onDone(ok,d.exp), ok?800:2400); }
  return <div>
    <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:16, padding:20, marginBottom:24 }}>
      <p style={{ color:"rgba(255,255,255,0.85)", lineHeight:1.6, margin:0, fontStyle:"italic", fontSize:15 }}>"{d.stmt}"</p>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
      {["LAMARCK","DARWIN"].map(w=>{const right=pick&&w===d.ans,wrong=pick===w&&w!==d.ans,fade=pick&&!right&&!wrong; return <button key={w} onClick={()=>tap(w)} disabled={!!pick} style={{ padding:"24px 0", borderRadius:16, textAlign:"center", fontFamily:"Syne,sans-serif", fontWeight:900, fontSize:16, cursor:pick?"default":"pointer", border:right?"2px solid #34d399":wrong?"2px solid #fb7185":"2px solid rgba(255,255,255,0.12)", background:right?"rgba(52,211,153,0.12)":wrong?"rgba(251,113,133,0.12)":fade?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.05)", color:right?"#6ee7b7":wrong?"#fda4af":fade?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.8)", transform:right?"scale(1.04)":wrong?"scale(0.96)":"scale(1)", transition:"all 0.2s" }}><span style={{ display:"block", fontSize:32, marginBottom:4 }}>{w==="LAMARCK"?"🦒":"🐢"}</span>{w}</button>;})}
    </div>
  </div>;
}

function RndMatch({ d, onDone }) {
  const opts = useMemo(() => shuffle([d.right, ...d.wrong]), [d]);
  const [pick, setPick] = useState(null);
  function tap(o) { if (pick) return; setPick(o); const ok=o===d.right; setTimeout(()=>onDone(ok, ok?`✓ ${d.term} = ${d.right}`:`Correct: ${d.right}`), ok?800:2400); }
  return <div>
    <div style={{ borderRadius:16, padding:20, marginBottom:20, border:"1px solid rgba(34,211,238,0.2)", background:"linear-gradient(135deg,rgba(34,211,238,0.08),rgba(52,211,153,0.04))" }}>
      <p style={{ color:"rgba(255,255,255,0.45)", fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", margin:"0 0 4px" }}>Define this term</p>
      <p style={{ fontFamily:"Syne,sans-serif", fontSize:22, fontWeight:900, margin:0, color:"white" }}>{d.term}</p>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {opts.map((o,i)=>{const right=pick&&o===d.right,wrong=pick===o&&o!==d.right,fade=pick&&!right&&!wrong; return <button key={i} onClick={()=>tap(o)} disabled={!!pick} style={right?btnRight:wrong?btnWrong:fade?btnFade:btnBase}><span style={{ fontFamily:"monospace", color:"rgba(255,255,255,0.25)", fontSize:12, marginRight:8 }}>{String.fromCharCode(65+i)}</span>{o}</button>;})}
    </div>
  </div>;
}

function RndFill({ d, onDone }) {
  const [val, setVal] = useState(""); const [done, setDone] = useState(false); const [hint, setHint] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const t = setTimeout(() => ref.current?.focus(), 300); return () => clearTimeout(t); }, []);
  function go() { if (!val.trim()||done) return; setDone(true); const ok=d.a.some(a=>norm(val)===norm(a)); setTimeout(()=>onDone(ok, ok?`Correct! "${d.a[0]}"`:`Answer: "${d.a[0]}"`), ok?800:2400); }
  const parts = d.q.split("_____"), ok = done && d.a.some(a => norm(val) === norm(a));
  return <div>
    <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:16, padding:20, marginBottom:20 }}>
      <p style={{ color:"rgba(255,255,255,0.85)", lineHeight:1.7, margin:0, fontSize:15 }}>{parts[0]}<span style={{ display:"inline-block", minWidth:70, borderBottom:done?(ok?"2px solid #34d399":"2px solid #fb7185"):"2px solid #22d3ee", margin:"0 4px", padding:"0 4px", fontWeight:700, color:done?(ok?"#6ee7b7":"#fda4af"):"#67e8f9" }}>{val||"?????"}</span>{parts[1]}</p>
    </div>
    <div style={{ display:"flex", gap:8, marginBottom:12 }}>
      <input ref={ref} type="text" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")go();}} disabled={done} placeholder="Type your answer..." style={{ flex:1, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:12, padding:"12px 16px", fontSize:14, color:"white", outline:"none" }} autoComplete="off" autoCapitalize="off" spellCheck="false" />
      <button onClick={go} disabled={!val.trim()||done} style={{ padding:"12px 20px", borderRadius:12, fontWeight:700, fontSize:14, border:"none", cursor:val.trim()&&!done?"pointer":"default", background:val.trim()&&!done?"linear-gradient(135deg,#22d3ee,#34d399)":"rgba(255,255,255,0.05)", color:val.trim()&&!done?BG:"rgba(255,255,255,0.2)" }}>GO</button>
    </div>
    {!done&&<button onClick={()=>setHint(true)} style={{ fontSize:11, color:hint?"#fbbf24":"rgba(255,255,255,0.25)", background:"none", border:"none", cursor:"pointer" }}>{hint?`💡 ${d.hint}`:"Need a hint?"}</button>}
  </div>;
}

function RndScenario({ d, onDone }) {
  const [pick, setPick] = useState(null);
  function tap(o) { if (pick) return; setPick(o); const ok=o===d.ans; setTimeout(()=>onDone(ok,d.exp), ok?800:2400); }
  return <div>
    <div style={{ borderRadius:16, padding:20, marginBottom:16, border:"1px solid rgba(251,113,133,0.15)", background:"linear-gradient(135deg,rgba(251,113,133,0.06),rgba(244,114,182,0.03))" }}>
      <p style={{ color:"rgba(255,255,255,0.8)", fontSize:14, lineHeight:1.6, margin:0 }}>{d.story}</p>
    </div>
    <p style={{ color:"rgba(255,255,255,0.6)", fontSize:14, fontWeight:700, marginBottom:12 }}>{d.q}</p>
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {d.opts.map((o,i)=>{const right=pick&&o===d.ans,wrong=pick===o&&o!==d.ans,fade=pick&&!right&&!wrong; return <button key={i} onClick={()=>tap(o)} disabled={!!pick} style={right?btnRight:wrong?btnWrong:fade?btnFade:btnBase}>{o}</button>;})}
    </div>
  </div>;
}
