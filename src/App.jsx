
import { useState, useRef, useEffect } from "react";

const C = {
  ink: "#1A1208", inkMid: "#3D2E18", inkLight: "#7A6248", inkFaint: "#B09878",
  parchment: "#F5EDD8", parchmentDark: "#E8D8B0", parchmentDeep: "#C8A870",
  ochre: "#B8720A", ochreMid: "#D4921E", ochreLight: "#F0D090", ochreXL: "#FDF5E4",
  forest: "#2D4A2A", forestMid: "#4A7A46", forestLight: "#D0E8CC",
  river: "#1A3A5C", riverMid: "#2A5A8C", riverLight: "#C8DCEE",
  sacred: "#7A2A2A", sacredMid: "#A84040", sacredLight: "#F0D8D8",
  sand: "#C4924A", sandLight: "#F0E0C0",
  white: "#FFFEF8",
};

// ── Dimensions ───────────────────────────────────────────────────────────────
const DIMENSIONS = [
  { id: "landscape", label: "Landscape & Climate", icon: "△", color: C.ochre,     bg: C.ochreXL,       desc: "Terrain, geology, rivers, monsoon, seasons" },
  { id: "pilgrimage",label: "Pilgrimage",           icon: "✦", color: C.sacred,    bg: C.sacredLight,   desc: "Sacred routes, tirthas, temples, dargahs" },
  { id: "history",   label: "Language & History",   icon: "◎", color: C.river,     bg: C.riverLight,    desc: "Kingdoms, languages, historical territories" },
  { id: "food",      label: "Food, Craft & GI",     icon: "❧", color: C.forest,    bg: C.forestLight,   desc: "Local cuisine, GI products, crafts" },
  { id: "art",       label: "Art & Architecture",   icon: "⬡", color: C.inkMid,    bg: C.parchmentDark, desc: "Temple styles, forts, vernacular building" },
  { id: "wildlife",  label: "Forests & Wildlife",   icon: "◈", color: C.forestMid, bg: C.forestLight,   desc: "Forest zones, fauna, sacred groves" },
];

// ── Relational framing ────────────────────────────────────────────────────────
const RELATIONAL = `Important framing: treat the relationship between landscape and culture as one of conditioning and conversation — never causation or determinism. The landscape sets material conditions and shapes possibilities; it does not mechanically produce cultural outcomes. Different cultures have responded differently to identical terrain. Acknowledge agency, contingency, and historical specificity. The relationship also runs both ways — culture has shaped landscape just as landscape has shaped culture. Avoid any language implying the landscape caused or determined the culture.`;

// ── Brief prompts (one paragraph, ~130 words) ─────────────────────────────────
const BRIEF = {
  landscape:  (s) => `Write a single focused paragraph of 130–150 words on the landscape and climate of ${s}. Cover the physical terrain (geology, landforms, rivers), the climatic character (monsoon, aridity, altitude, seasonal rhythms), and one specific observation about how this physical world has shaped — not determined — the conditions of human habitation here. Precise and vivid. Flowing prose, no lists.`,
  pilgrimage: (s) => `Write a single focused paragraph of 130–150 words on the pilgrimage significance of ${s}. Name specific sacred sites, tirthas, routes, or shrines; identify which traditions — Hindu, Buddhist, Jain, Sufi, tribal — have found this terrain sacred and why; and note what the landscape itself contributes to the sacred meaning. Specific, no generalisations. Flowing prose only.`,
  history:    (s) => `Write a single focused paragraph of 130–150 words on the language and history of ${s}. Name the historical kingdoms and cultural formations whose territory this covers; describe the languages spoken and where they change; and offer one insight into how terrain shaped the conditions — not the outcomes — for these historical formations. Specific, precise. Flowing prose only.`,
  food:       (s) => `Write a single focused paragraph of 130–150 words on the food, craft, and GI products of ${s}. Name the most significant local dishes and connect each to its terrain origin — soil, climate, water, agricultural tradition. Name GI products and craft traditions with their landscape roots. Every item grounded in the specific geography that produces it. Flowing prose only.`,
  art:        (s) => `Write a single focused paragraph of 130–150 words on the art and architecture of ${s}. Name the dominant architectural traditions and styles; describe how local geology and building materials have shaped the aesthetic; and offer one observation about how the landscape has conditioned — not determined — the architectural choices here. Specific: name actual styles, dynasties, buildings. Flowing prose only.`,
  wildlife:   (s) => `Write a single focused paragraph of 130–150 words on the forests and wildlife of ${s}. Name the forest types and vegetation zones; identify significant or characteristic fauna and their cultural meanings; describe sacred groves or ecologically significant landscapes; and note the relationship between the natural world and the cultural landscape here. Treat wildlife as cultural text, not natural history. Flowing prose only.`,
};

// ── Deep prompts (three paragraphs) ───────────────────────────────────────────
const DEEP = {
  landscape:  (s) => `Write three substantial paragraphs on the landscape and climate of ${s}. First: the physical geography in detail — geology, geomorphology, hydrology, soil types, elevation. Second: the climatic character and its cultural consequences — how the monsoon, aridity, altitude, or seasonal rhythms have shaped agricultural systems, architectural responses, festivals, and patterns of movement. Third: the most important and least obvious insight about how this landscape has conditioned — not determined — the cultural world within it. Precise, analytical, literary. No lists.`,
  pilgrimage: (s) => `Write three substantial paragraphs on the pilgrimage traditions of ${s}. First: the principal sacred sites and their landscape significance — why these specific places became sacred. Second: the pilgrimage routes, their history, and the communities of practice across different traditions. Third: what the terrain itself contributes to the sacred experience — how the landscape is not merely setting but part of the meaning. Specific, culturally serious.`,
  history:    (s) => `Write three substantial paragraphs on the language and history of ${s}. First: the historical sequence of kingdoms, empires, and cultural formations that shaped this terrain. Second: the linguistic landscape — which languages, where they change, what the language boundaries reveal about cultural geography. Third: the most important insight about how terrain shaped the conditions — not the outcomes — for the specific historical formations here. Analytical, avoiding determinism.`,
  food:       (s) => `Write three substantial paragraphs on the food, craft, and GI products of ${s}. First: the defining dishes and their terrain origins — soil, climate, water, agricultural tradition. Second: the GI products and craft traditions, each explained through landscape and cultural roots. Third: what the food and craft of this region reveal about the larger cultural landscape — how what people make and eat is an expression of where they live. Vivid, specific, analytically grounded.`,
  art:        (s) => `Write three substantial paragraphs on the art and architecture of ${s}. First: the dominant architectural traditions and their historical development. Second: the relationship between building materials and local geology — how available stone, timber, or earth shaped the aesthetic. Third: the most important insight about how this architectural landscape expresses the cultural geography of the region. Specific, precise.`,
  wildlife:   (s) => `Write three substantial paragraphs on the forests and wildlife of ${s}. First: the forest types, vegetation zones, and ecological character. Second: the significant fauna and their cultural meanings — sacred, hunted, protected by community tradition, defining the landscape experience. Third: the relationship between the natural world and the cultural landscape — sacred groves, wildlife corridors, communities whose culture is inseparable from the forest. Treat ecology as cultural geography.`,
};

function buildPrompt(dimId, subject, deep) {
  const fn = deep ? DEEP[dimId] : BRIEF[dimId];
  return `${RELATIONAL}\n\n${fn(subject)}`;
}

function buildSubject(data, mode) {
  if (mode === "hub") return data.place;
  const via = data.via?.trim();
  return via
    ? `the journey from ${data.from} via ${via} to ${data.to}`
    : `the journey from ${data.from} to ${data.to}`;
}

// ── Example content ───────────────────────────────────────────────────────────
const HUB_EXAMPLES = [
  { place: "Varanasi",   label: "The sacred city on the Ganga" },
  { place: "Hampi",      label: "Vijayanagara on the Tungabhadra" },
  { place: "Madurai",    label: "Temple city of the Pandyas" },
  { place: "Jaisalmer",  label: "The golden city of the Thar" },
  { place: "Kohima",     label: "Naga highlands, Northeast" },
  { place: "Kochi",      label: "Spice port of the Malabar" },
];

const JOURNEY_EXAMPLES = [
  { from: "Mumbai",    via: "Lonavala, Pune",    to: "Hyderabad",    label: "Konkan coast to the Deccan" },
  { from: "Varanasi",  via: "Allahabad",         to: "Amritsar",     label: "Sacred Ganga to the Punjab" },
  { from: "Chennai",   via: "Kumbakonam",        to: "Kanyakumari",  label: "Coromandel to Land's End" },
  { from: "Delhi",     via: "Jaipur, Jodhpur",   to: "Jaisalmer",    label: "Gangetic plain to the Thar" },
  { from: "Kochi",     via: "Palakkad",          to: "Bengaluru",    label: "Malabar coast to Mysore plateau" },
  { from: "Manali",    via: "Rohtang Pass",      to: "Leh",          label: "Himalayan valley to Ladakh" },
];

// ── API ───────────────────────────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ── Small components ──────────────────────────────────────────────────────────

function CompassRose({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="20" fill="none" stroke={C.ochreLight} strokeWidth="0.7" opacity="0.45"/>
      <circle cx="22" cy="22" r="13" fill="none" stroke={C.ochreLight} strokeWidth="0.4" opacity="0.25"/>
      <polygon points="22,3 19.5,19 22,17 24.5,19" fill={C.ochreMid} opacity="0.9"/>
      <polygon points="22,41 19.5,25 22,27 24.5,25" fill={C.inkFaint} opacity="0.55"/>
      <polygon points="41,22 25,19.5 27,22 25,24.5" fill={C.inkFaint} opacity="0.5"/>
      <polygon points="3,22 19,19.5 17,22 19,24.5"  fill={C.inkFaint} opacity="0.5"/>
      <circle cx="22" cy="22" r="2.5" fill={C.ochreMid}/>
      <text x="22" y="14" textAnchor="middle" fontSize="5" fill={C.ochreMid} fontFamily="Georgia" fontWeight="bold">N</text>
    </svg>
  );
}

function Ornament() {
  return (
    <svg width="140" height="18" viewBox="0 0 140 18" style={{ opacity: 0.28 }}>
      <line x1="0" y1="9" x2="52" y2="9" stroke={C.ochreMid} strokeWidth="0.9"/>
      <polygon points="65,5 70,9 65,13 60,9" fill={C.ochreMid}/>
      <polygon points="74,5 79,9 74,13 69,9" fill={C.ochreMid} opacity="0.5"/>
      <line x1="86" y1="9" x2="140" y2="9" stroke={C.ochreMid} strokeWidth="0.9"/>
    </svg>
  );
}

const inp = {
  style: {
    width: "100%", background: C.white,
    border: `1.5px solid ${C.parchmentDark}`,
    borderRadius: 7, padding: "11px 14px",
    fontFamily: "Georgia, serif", fontSize: 15,
    color: C.ink, outline: "none",
    transition: "border 0.18s",
  }
};

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 13, color: C.inkFaint, padding: 0, marginBottom: 20 }}>
      ← Back
    </button>
  );
}

function SectionRule({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 14px" }}>
      <div style={{ flex: 1, height: 1, background: C.parchmentDark }} />
      <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: C.ochreMid, fontStyle: "italic", margin: 0, whiteSpace: "nowrap" }}>{label}</p>
      <div style={{ flex: 1, height: 1, background: C.parchmentDark }} />
    </div>
  );
}

function ExampleHubBtn({ ex, onClick }) {
  return (
    <button onClick={() => onClick(ex.place)}
      style={{ padding: "10px 12px", background: C.white, border: `1px solid ${C.parchmentDark}`, borderRadius: 8, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.ochre}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.parchmentDark}>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 2 }}>{ex.place}</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 11, color: C.inkFaint, fontStyle: "italic" }}>{ex.label}</div>
    </button>
  );
}

function ExampleJourneyBtn({ ex, onClick }) {
  return (
    <button onClick={() => onClick(ex)}
      style={{ padding: "11px 13px", background: C.white, border: `1px solid ${C.parchmentDark}`, borderRadius: 8, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.ochreMid}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.parchmentDark}>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 2 }}>
        {ex.from} → {ex.to}
      </div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 11, color: C.inkFaint, fontStyle: "italic" }}>{ex.label}</div>
    </button>
  );
}

function TopicTile({ dim, done, onSelect }) {
  return (
    <button
      onClick={() => !done && onSelect(dim.id)}
      style={{
        textAlign: "left", padding: "14px 16px",
        background: done ? C.parchmentDark : C.white,
        border: `1.5px solid ${done ? C.parchmentDeep : C.parchmentDark}`,
        borderRadius: 10,
        cursor: done ? "default" : "pointer",
        opacity: done ? 0.45 : 1,
        transition: "all 0.17s",
      }}
      onMouseEnter={e => { if (!done) { e.currentTarget.style.borderColor = dim.color; e.currentTarget.style.boxShadow = `0 3px 14px ${dim.color}22`; }}}
      onMouseLeave={e => { if (!done) { e.currentTarget.style.borderColor = C.parchmentDark; e.currentTarget.style.boxShadow = "none"; }}}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
        <span style={{ fontSize: 17, color: dim.color, lineHeight: 1 }}>{dim.icon}</span>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: done ? C.inkFaint : C.ink }}>
          {dim.label}
        </span>
        {done && <span style={{ fontSize: 10, color: C.inkFaint, fontFamily: "Georgia, serif", marginLeft: 2 }}>✓</span>}
      </div>
      <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: C.inkFaint, fontStyle: "italic", margin: 0, lineHeight: 1.4 }}>
        {dim.desc}
      </p>
    </button>
  );
}

function ResponseCard({ dim, text, isDeep, isLast, onDeepen, onChooseTopic, onStartAgain }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (visible && isLast) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [visible, isLast]);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "all 0.45s ease",
      marginBottom: 20,
    }}>
      {/* Dimension label bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: dim.bg, borderRadius: "8px 8px 0 0",
        padding: "9px 16px",
        borderLeft: `3px solid ${dim.color}`,
      }}>
        <span style={{ fontSize: 15, color: dim.color }}>{dim.icon}</span>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: dim.color }}>
          {dim.label}{isDeep ? " — Full Reading" : ""}
        </span>
      </div>

      {/* Response text */}
      <div style={{
        background: C.white, padding: "18px 20px",
        borderLeft: `3px solid ${dim.color}`,
        borderRight: `1px solid ${C.parchmentDark}`,
        borderBottom: isLast ? "none" : `1px solid ${C.parchmentDark}`,
        borderRadius: isLast ? 0 : "0 0 8px 8px",
      }}>
        {text.split(/\n\n+/).filter(p => p.trim()).map((para, i) => (
          <p key={i} style={{ fontFamily: "Georgia, serif", fontSize: 14.5, lineHeight: 1.9, color: C.ink, margin: "0 0 13px" }}>
            {para.replace(/^[-•*]\s*/, "")}
          </p>
        ))}
      </div>

      {/* Three options — only on the last card */}
      {isLast && (
        <div style={{
          background: C.white,
          borderLeft: `3px solid ${dim.color}`,
          borderRight: `1px solid ${C.parchmentDark}`,
          borderBottom: `1px solid ${C.parchmentDark}`,
          borderRadius: "0 0 8px 8px",
          padding: "14px 20px",
          display: "flex", gap: 8, flexWrap: "wrap",
          borderTop: `1px solid ${C.parchmentDark}`,
        }}>
          {/* More depth — only if brief reading */}
          {!isDeep && (
            <button onClick={onDeepen} style={{
              padding: "9px 18px", borderRadius: 7, cursor: "pointer",
              background: dim.color, color: C.white, border: "none",
              fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 600,
              boxShadow: `0 2px 10px ${dim.color}33`,
              transition: "all 0.17s",
            }}>
              More depth →
            </button>
          )}

          {/* Choose another topic */}
          <button onClick={onChooseTopic} style={{
            padding: "9px 18px", borderRadius: 7, cursor: "pointer",
            background: C.parchment, color: C.inkMid,
            border: `1.5px solid ${C.parchmentDeep}`,
            fontFamily: "Georgia, serif", fontSize: 13,
            transition: "all 0.17s",
          }}>
            Choose another topic
          </button>

          {/* Start again */}
          <button onClick={onStartAgain} style={{
            padding: "9px 18px", borderRadius: 7, cursor: "pointer",
            background: "transparent", color: C.inkFaint,
            border: `1px solid ${C.parchmentDark}`,
            fontFamily: "Georgia, serif", fontSize: 13,
            transition: "all 0.17s",
          }}>
            Start again
          </button>
        </div>
      )}
    </div>
  );
}

function LoadingPulse({ label }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.parchmentDark}`, borderRadius: 12, padding: "28px 20px", textAlign: "center" }}>
      <CompassRose size={36} />
      <p style={{ fontFamily: "Georgia, serif", fontSize: 13, fontStyle: "italic", color: C.inkLight, margin: "12px 0 18px" }}>{label}</p>
      <style>{`@keyframes sh{0%{background-position:-300% 0}100%{background-position:300% 0}}`}</style>
      <div style={{ maxWidth: 280, margin: "0 auto" }}>
        {[100, 70, 85, 55, 75].map((w, i) => (
          <div key={i} style={{
            width: `${w}%`, height: 9, borderRadius: 5, marginBottom: 8,
            background: `linear-gradient(90deg,transparent,rgba(184,114,10,0.22),transparent)`,
            backgroundSize: "300% 100%",
            animation: `sh 1.7s infinite ${i * 0.13}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

function ContinueBtn({ onClick, label }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "13px 20px",
      background: `linear-gradient(135deg,${C.ochre},${C.ochreMid})`,
      color: C.white, border: "none", borderRadius: 8,
      cursor: "pointer",
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 14, fontWeight: 600,
      transition: "all 0.2s",
      boxShadow: `0 4px 18px ${C.ochre}33`,
    }}>
      {label}
    </button>
  );
}

// ── Subject header pill ───────────────────────────────────────────────────────
function SubjectPill({ label, mode }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.ink, borderRadius: 20, padding: "6px 16px", marginBottom: 20 }}>
      <span style={{ fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: C.ochreLight, opacity: 0.75 }}>
        {mode === "hub" ? "Place" : "Journey"}
      </span>
      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>·</span>
      <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 13, color: C.white, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {

  const [screen, setScreen]           = useState("entry");
  const [entryMode, setEntryMode]     = useState(null);
  const [journeyData, setJourneyData] = useState({ place: "", from: "", via: "", to: "" });
  const [responses, setResponses]     = useState([]);
  const [doneDims, setDoneDims]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const bottomRef = useRef();

  function reset() {
    setScreen("entry"); setEntryMode(null);
    setJourneyData({ place: "", from: "", via: "", to: "" });
    setResponses([]); setDoneDims([]); setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToTopics() { setScreen("topics"); }

  function beginHub(place) {
    setJourneyData(d => ({ ...d, place }));
    setEntryMode("hub");
    setScreen("topics");
  }

  function beginJourney(from, via, to) {
    setJourneyData(d => ({ ...d, from, via, to }));
    setEntryMode("journey");
    setScreen("topics");
  }

  async function selectTopic(dimId, deep = false) {
    const subject = buildSubject(journeyData, entryMode);
    const dim = DIMENSIONS.find(d => d.id === dimId);
    setLoadingLabel(`Reading ${dim.label}…`);
    setLoading(true);
    setScreen("reading");

    try {
      const text = await callClaude(buildPrompt(dimId, subject, deep));
      setResponses(prev => [...prev, { dimId, text, isDeep: deep }]);
      if (!deep) setDoneDims(prev => [...prev, dimId]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
    } catch {
      setResponses(prev => [...prev, { dimId, text: "The landscape could not be read at this moment. Please try again.", isDeep: deep }]);
    } finally {
      setLoading(false); }
  }

  const subjectLabel = entryMode === "hub"
    ? journeyData.place
    : journeyData.via?.trim()
      ? `${journeyData.from} → ${journeyData.via} → ${journeyData.to}`
      : `${journeyData.from} → ${journeyData.to}`;

  // ── Shared masthead ───────────────────────────────────────────────────────
  const Masthead = () => (
    <div style={{ textAlign: "center", padding: "40px 0 24px", borderBottom: `1px solid ${C.parchmentDeep}`, marginBottom: 28, position: "relative" }}>
      <div style={{ position: "absolute", top: 36, right: 0, opacity: 0.4 }}><CompassRose size={50} /></div>

      {/* Book title line */}
      <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: C.ochreMid, margin: "0 0 8px", fontStyle: "italic" }}>
        India's Cultural Landscapes
      </p>

      {/* App tagline — mirrors the book */}
      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 700, color: C.ink, margin: "0 0 8px", lineHeight: 1.25 }}>
        How to Read India's Cultural Landscapes
      </h1>
      <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: C.inkLight, fontStyle: "italic", margin: 0, lineHeight: 1.6 }}>
        City by city. Journey by journey.
      </p>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}><Ornament /></div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.parchment, fontFamily: "Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        * { box-sizing: border-box; }
        input:focus { border-color: #B8720A !important; box-shadow: 0 0 0 3px rgba(184,114,10,0.10); }
        input::placeholder { color: #B09878; font-style: italic; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 18px 80px" }}>
        <Masthead />

        {/* ══════════════════════════════════════════════════
            SCREEN 1 — ENTRY
        ══════════════════════════════════════════════════ */}
        {screen === "entry" && (
          <div>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, color: C.inkMid, fontStyle: "italic", textAlign: "center", margin: "0 0 24px", lineHeight: 1.6 }}>
              Are you exploring a place or travelling a route?
            </p>

            {/* Two entry tiles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 32 }}>
              <button
                onClick={() => { setEntryMode("hub"); setScreen("hub-input"); }}
                style={{ padding: "28px 22px", background: C.white, border: `1.5px solid ${C.parchmentDark}`, borderRadius: 14, cursor: "pointer", textAlign: "left", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.ochre; e.currentTarget.style.boxShadow = `0 4px 20px ${C.ochre}22`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.parchmentDark; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>⊟</div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 6 }}>A Place</div>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: C.inkLight, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
                  Enter one city, town, or sacred site and explore its cultural landscape
                </p>
              </button>

              <button
                onClick={() => { setEntryMode("journey"); setScreen("journey-input"); }}
                style={{ padding: "28px 22px", background: C.white, border: `1.5px solid ${C.parchmentDark}`, borderRadius: 14, cursor: "pointer", textAlign: "left", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.ochreMid; e.currentTarget.style.boxShadow = `0 4px 20px ${C.ochreMid}22`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.parchmentDark; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>⟶</div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 6 }}>A Journey</div>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: C.inkLight, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
                  Travel from one place to another and discover how the landscape transforms
                </p>
              </button>
            </div>

            {/* Example places */}
            <SectionRule label="Places from the book" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
              {HUB_EXAMPLES.map(ex => (
                <ExampleHubBtn key={ex.place} ex={ex} onClick={beginHub} />
              ))}
            </div>

            {/* Example journeys */}
            <SectionRule label="Journeys from the book" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {JOURNEY_EXAMPLES.map(ex => (
                <ExampleJourneyBtn key={ex.from + ex.to} ex={ex} onClick={e => beginJourney(e.from, e.via, e.to)} />
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 40, opacity: 0.35 }}>
              <CompassRose size={26} />
              <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: C.inkLight, fontStyle: "italic", marginTop: 8 }}>
                "The land is not merely scenery. It is the first text."
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            SCREEN 2a — HUB INPUT
        ══════════════════════════════════════════════════ */}
        {screen === "hub-input" && (
          <div>
            <BackBtn onClick={() => setScreen("entry")} />
            <div style={{ background: C.white, border: `1px solid ${C.parchmentDark}`, borderRadius: 14, padding: "26px 26px", boxShadow: "0 3px 18px rgba(26,18,8,0.05)", marginBottom: 22 }}>
              <label style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ochreMid, marginBottom: 8 }}>
                Enter a place
              </label>
              <input
                {...inp}
                placeholder="City, town, sacred site, or landscape…"
                value={journeyData.place}
                onChange={e => setJourneyData(d => ({ ...d, place: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && journeyData.place.trim() && beginHub(journeyData.place.trim())}
                autoFocus
              />
              <div style={{ marginTop: 14 }}>
                <ContinueBtn
                  onClick={() => journeyData.place.trim() && beginHub(journeyData.place.trim())}
                  label="Continue →"
                />
              </div>
            </div>
            <SectionRule label="Places from the book" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {HUB_EXAMPLES.map(ex => (
                <ExampleHubBtn key={ex.place} ex={ex} onClick={beginHub} />
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            SCREEN 2b — JOURNEY INPUT
        ══════════════════════════════════════════════════ */}
        {screen === "journey-input" && (
          <div>
            <BackBtn onClick={() => setScreen("entry")} />
            <div style={{ background: C.white, border: `1px solid ${C.parchmentDark}`, borderRadius: 14, padding: "26px 26px", boxShadow: "0 3px 18px rgba(26,18,8,0.05)", marginBottom: 22 }}>
              <div style={{ display: "grid", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ochreMid, marginBottom: 7 }}>From</label>
                  <input {...inp} placeholder="Departure — e.g. Mumbai, Varanasi…" value={journeyData.from} onChange={e => setJourneyData(d => ({ ...d, from: e.target.value }))} autoFocus />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.forest, marginBottom: 7 }}>
                    Via <span style={{ fontStyle: "italic", textTransform: "none", letterSpacing: 0, color: C.inkFaint, fontSize: 11 }}>(optional)</span>
                  </label>
                  <input {...inp} placeholder="Waypoints — e.g. Lonavala, Pune…" value={journeyData.via} onChange={e => setJourneyData(d => ({ ...d, via: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ochreMid, marginBottom: 7 }}>To</label>
                  <input {...inp} placeholder="Arrival — e.g. Hyderabad, Shimla…" value={journeyData.to} onChange={e => setJourneyData(d => ({ ...d, to: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && journeyData.from.trim() && journeyData.to.trim() && beginJourney(journeyData.from.trim(), journeyData.via.trim(), journeyData.to.trim())} />
                </div>
              </div>
              <ContinueBtn
                onClick={() => journeyData.from.trim() && journeyData.to.trim() && beginJourney(journeyData.from.trim(), journeyData.via.trim(), journeyData.to.trim())}
                label="Continue →"
              />
            </div>
            <SectionRule label="Journeys from the book" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {JOURNEY_EXAMPLES.map(ex => (
                <ExampleJourneyBtn key={ex.from + ex.to} ex={ex} onClick={e => beginJourney(e.from, e.via, e.to)} />
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            SCREEN 3 — CHOOSE TOPIC
        ══════════════════════════════════════════════════ */}
        {screen === "topics" && (
          <div>
            <SubjectPill label={subjectLabel} mode={entryMode} />

            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 14, color: C.inkMid, fontStyle: "italic", margin: "0 0 18px" }}>
              Choose a topic to read about
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
              {DIMENSIONS.map(dim => (
                <TopicTile
                  key={dim.id}
                  dim={dim}
                  done={doneDims.includes(dim.id)}
                  onSelect={selectTopic}
                />
              ))}
            </div>

            <button onClick={reset} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 13, color: C.inkFaint, padding: 0 }}>
              ← Start again
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            SCREEN 4 — READING
        ══════════════════════════════════════════════════ */}
        {screen === "reading" && (
          <div>
            <SubjectPill label={subjectLabel} mode={entryMode} />

            {/* All responses */}
            {responses.map((r, i) => {
              const dim = DIMENSIONS.find(d => d.id === r.dimId);
              const isLast = i === responses.length - 1 && !loading;
              return (
                <ResponseCard
                  key={i}
                  dim={dim}
                  text={r.text}
                  isDeep={r.isDeep}
                  isLast={isLast}
                  onDeepen={() => selectTopic(r.dimId, true)}
                  onChooseTopic={goToTopics}
                  onStartAgain={reset}
                />
              );
            })}

            {/* Loading */}
            {loading && <LoadingPulse label={loadingLabel} />}

            <div ref={bottomRef} />
          </div>
        )}

      </div>
    </div>
  );
}
