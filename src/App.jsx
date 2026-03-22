import { saveToMyCollection, loadMyCollection, saveToCommunalLibrary, loadCommunalLibrary } from "./supabase.js";

import { useState, useEffect, useRef } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  ink: "#1A1208", inkMid: "#2E1F0A", inkLight: "#6B4E2A", inkFaint: "#A08060",
  cream: "#FAF4E8", creamDark: "#F0E4C8", creamDeep: "#D8C090",
  gold: "#9B6B0A", goldMid: "#C49020", goldLight: "#F0D080", goldXL: "#FDF6E0",
  rust: "#8B3A1A", rustMid: "#B85030", rustLight: "#F5E0D8",
  forest: "#1A3A1A", forestMid: "#2A5A2A", forestLight: "#D0E8C8",
  indigo: "#1A1A4A", indigoMid: "#2A3A8A", indigoLight: "#D0D8F0",
  teal: "#0A3A3A", tealMid: "#1A6060", tealLight: "#C8E4E4",
  maroon: "#4A0A0A", maroonMid: "#8A1A1A", maroonLight: "#F0D0D0",
  white: "#FFFEF8",
};

// ── Eight Life Themes ─────────────────────────────────────────────────────────
const THEMES = [
  { id:"duty",      label:"Duty & Moral Choice",          icon:"⊟", color:C.rust },
  { id:"love",      label:"Love & Devotion",              icon:"✦", color:C.maroon },
  { id:"power",     label:"Power & Society",              icon:"⬡", color:C.indigo },
  { id:"identity",  label:"Identity & Belonging",         icon:"◎", color:C.teal },
  { id:"suffering", label:"Suffering & Endurance",        icon:"〰", color:C.forest },
  { id:"justice",   label:"Justice & Moral Order",        icon:"△", color:C.gold },
  { id:"meaning",   label:"Meaning & Spiritual Insight",  icon:"◈", color:C.rust },
  { id:"freedom",   label:"Freedom & Self-Understanding", icon:"◉", color:C.indigoMid },
];

// ── Era colours ────────────────────────────────────────────────────────────────
const ERA = {
  "Ancient":      { bg:C.rust,      light:C.rustLight },
  "Classical":    { bg:C.gold,      light:C.goldXL },
  "Medieval":     { bg:C.forest,    light:C.forestLight },
  "Modern":       { bg:C.indigo,    light:C.indigoLight },
  "Contemporary": { bg:C.teal,      light:C.tealLight },
};

// ── The 42 Works ──────────────────────────────────────────────────────────────
const WORKS = [
  { id:1,  num:1,  title:"Rig Veda",                     author:"Anonymous",                   lang:"Sanskrit",   period:"c.1500–1200 BCE", era:"Ancient",      themes:["meaning","duty","power"],           country:"India" },
  { id:2,  num:2,  title:"Upanishads",                   author:"Anonymous",                   lang:"Sanskrit",   period:"c.800–200 BCE",   era:"Ancient",      themes:["meaning","freedom","identity"],     country:"India" },
  { id:3,  num:3,  title:"Ramayana",                     author:"Valmiki",                     lang:"Sanskrit",   period:"c.500–300 BCE",   era:"Ancient",      themes:["duty","love","justice"],            country:"India" },
  { id:4,  num:4,  title:"Mahabharata",                  author:"Anonymous (Vyasa school)",    lang:"Sanskrit",   period:"c.400 BCE–400 CE",era:"Ancient",      themes:["duty","power","justice","suffering"],country:"India" },
  { id:5,  num:5,  title:"Bhagavad Gita",                author:"Anonymous (Vyasa school)",    lang:"Sanskrit",   period:"c.400 BCE–200 CE",era:"Ancient",      themes:["duty","meaning","freedom"],         country:"India", extended:true },
  { id:6,  num:6,  title:"Arthashastra",                 author:"Kautilya",                    lang:"Sanskrit",   period:"c.300 BCE–300 CE",era:"Ancient",      themes:["power","duty","justice"],           country:"India" },
  { id:7,  num:7,  title:"Abhijnanasakuntalam",           author:"Kalidasa",                    lang:"Sanskrit",   period:"c.4th–5th CE",    era:"Classical",    themes:["love","duty","suffering"],          country:"India" },
  { id:8,  num:8,  title:"Panchatantra",                 author:"Vishnu Sharma (attrib.)",     lang:"Sanskrit",   period:"c.300 BCE–500 CE",era:"Classical",    themes:["power","duty","freedom"],           country:"India" },
  { id:9,  num:9,  title:"Sangam Poetry",                author:"Anthology",                   lang:"Tamil",      period:"3rd BCE–3rd CE",  era:"Classical",    themes:["love","suffering","identity"],      country:"India" },
  { id:10, num:10, title:"Tirukkural",                   author:"Thiruvalluvar",               lang:"Tamil",      period:"c.1st–5th CE",    era:"Classical",    themes:["duty","love","justice","meaning"],  country:"India", extended:true },
  { id:11, num:11, title:"Silappatikaram",               author:"Ilango Adigal",               lang:"Tamil",      period:"c.5th CE",        era:"Classical",    themes:["justice","love","suffering"],       country:"India" },
  { id:12, num:12, title:"Selected Poems",               author:"Subramania Bharati",          lang:"Tamil",      period:"1882–1921",       era:"Modern",       themes:["freedom","identity","love"],        country:"India" },
  { id:13, num:13, title:"Ponniyin Selvan",              author:"Kalki Krishnamurthy",         lang:"Tamil",      period:"1950–1954",       era:"Contemporary", themes:["power","duty","love"],              country:"India" },
  { id:14, num:14, title:"Selected Poetry",              author:"Kabir",                       lang:"Hindi/Awadhi",period:"1440–1518",      era:"Medieval",     themes:["meaning","identity","freedom"],     country:"India" },
  { id:15, num:15, title:"Ramcharitmanas",               author:"Tulsidas",                    lang:"Awadhi",     period:"1574–1576",       era:"Medieval",     themes:["duty","love","meaning"],            country:"India" },
  { id:16, num:16, title:"Devotional Songs",             author:"Mirabai",                     lang:"Braj Bhasha",period:"c.1498–1547",     era:"Medieval",     themes:["love","freedom","identity"],        country:"India" },
  { id:17, num:17, title:"Godaan",                       author:"Premchand",                   lang:"Hindi",      period:"1936",            era:"Modern",       themes:["suffering","justice","power"],      country:"India" },
  { id:18, num:18, title:"Tamas",                        author:"Bhisham Sahni",               lang:"Hindi",      period:"1974",            era:"Contemporary", themes:["suffering","power","identity"],     country:"India" },
  { id:19, num:19, title:"Joothan",                      author:"Om Prakash Valmiki",          lang:"Hindi",      period:"1997",            era:"Contemporary", themes:["justice","identity","suffering"],   country:"India" },
  { id:20, num:20, title:"Gitanjali",                    author:"Rabindranath Tagore",         lang:"Bengali",    period:"1910",            era:"Modern",       themes:["meaning","love","freedom"],         country:"India" },
  { id:21, num:21, title:"Devdas",                       author:"Sarat Chandra Chattopadhyay", lang:"Bengali",    period:"1917",            era:"Modern",       themes:["love","suffering","identity"],      country:"India" },
  { id:22, num:22, title:"Pather Panchali",              author:"Bibhutibhushan Bandyopadhyay",lang:"Bengali",    period:"1929",            era:"Modern",       themes:["suffering","identity","meaning"],   country:"India" },
  { id:23, num:23, title:"Chemmeen",                     author:"Thakazhi Sivasankara Pillai", lang:"Malayalam",  period:"1956",            era:"Contemporary", themes:["love","duty","suffering"],          country:"India" },
  { id:24, num:24, title:"Randamoozham",                 author:"M.T. Vasudevan Nair",         lang:"Malayalam",  period:"1984",            era:"Contemporary", themes:["duty","suffering","identity"],      country:"India" },
  { id:25, num:25, title:"Khasakkinte Itihasam",         author:"O.V. Vijayan",                lang:"Malayalam",  period:"1969",            era:"Contemporary", themes:["meaning","identity","freedom"],     country:"India" },
  { id:26, num:26, title:"Ghazals",                      author:"Mirza Ghalib",                lang:"Urdu",       period:"1797–1869",       era:"Modern",       themes:["love","suffering","meaning"],       country:"India" },
  { id:27, num:27, title:"Selected Stories",             author:"Saadat Hasan Manto",          lang:"Urdu",       period:"1912–1955",       era:"Modern",       themes:["suffering","justice","identity"],   country:"India/Pakistan" },
  { id:28, num:28, title:"Hymns from Guru Granth Sahib", author:"Guru Nanak",                  lang:"Punjabi",    period:"1469–1539",       era:"Medieval",     themes:["meaning","identity","justice"],     country:"India" },
  { id:29, num:29, title:"Heer",                         author:"Waris Shah",                  lang:"Punjabi",    period:"1766",            era:"Medieval",     themes:["love","suffering","freedom"],       country:"India/Pakistan" },
  { id:30, num:30, title:"Sri Ramayana Darshanam",       author:"Kuvempu",                     lang:"Kannada",    period:"1949",            era:"Contemporary", themes:["duty","meaning","identity"],        country:"India" },
  { id:31, num:31, title:"Samskara",                     author:"U.R. Ananthamurthy",          lang:"Kannada",    period:"1965",            era:"Contemporary", themes:["duty","identity","freedom"],        country:"India" },
  { id:32, num:32, title:"Kanyasulkam",                  author:"Gurajada Apparao",            lang:"Telugu",     period:"1892",            era:"Modern",       themes:["justice","power","identity"],       country:"India" },
  { id:33, num:33, title:"Andhra Maha Bhagavatam",       author:"Pothana",                     lang:"Telugu",     period:"c.15th CE",       era:"Medieval",     themes:["meaning","love","duty"],            country:"India" },
  { id:34, num:34, title:"Vakhs",                        author:"Lal Ded",                     lang:"Kashmiri",   period:"c.1320–1392",     era:"Medieval",     themes:["meaning","freedom","identity"],     country:"India" },
  { id:35, num:35, title:"Selected Padavalis",           author:"Vidyapati",                   lang:"Maithili",   period:"c.1352–1448",     era:"Medieval",     themes:["love","meaning","suffering"],       country:"India" },
  { id:36, num:36, title:"Borgeets and Kirtan Ghosha",   author:"Sankardeva",                  lang:"Assamese",   period:"1449–1568",       era:"Medieval",     themes:["meaning","identity","power"],       country:"India" },
  { id:37, num:37, title:"Yayati",                       author:"V.S. Khandekar",              lang:"Marathi",    period:"1959",            era:"Contemporary", themes:["freedom","suffering","duty"],       country:"India" },
  { id:38, num:38, title:"Selected Bhajans",             author:"Narsinh Mehta",               lang:"Gujarati",   period:"c.1414–1481",     era:"Medieval",     themes:["meaning","identity","love"],        country:"India" },
  { id:39, num:39, title:"Chha Mana Atha Guntha",        author:"Fakir Mohan Senapati",        lang:"Odia",       period:"1897–1899",       era:"Modern",       themes:["justice","power","suffering"],      country:"India" },
  { id:40, num:40, title:"The Guide",                    author:"R.K. Narayan",                lang:"English",    period:"1958",            era:"Contemporary", themes:["freedom","identity","meaning"],     country:"India" },
  { id:41, num:41, title:"The God of Small Things",      author:"Arundhati Roy",               lang:"English",    period:"1997",            era:"Contemporary", themes:["justice","love","identity","power"],country:"India" },
  { id:42, num:42, title:"The Legends of Pensam",       author:"Mamang Dai",                  lang:"English",    period:"2006",            era:"Contemporary", themes:["identity","meaning","suffering"],   country:"India" },
];

const ERAS = ["Ancient","Classical","Medieval","Modern","Contemporary"];

// ── Daily work ─────────────────────────────────────────────────────────────────
function getDailyWork() {
  const d = new Date();
  const day = Math.floor((d - new Date(d.getFullYear(),0,0)) / 86400000);
  return WORKS[day % WORKS.length];
}

// ── Prompts ────────────────────────────────────────────────────────────────────
const FRAMEWORK = `The book "Life Lessons from Indian Literature" uses five interpretive dimensions:
- Ethical: What is the right course of action?
- Psychological: What emotions or motivations drive the characters?
- Social: How do societal expectations shape behaviour?
- Political: How does power and governance influence events?
- Spiritual: What deeper questions about meaning or faith arise?
Eight life themes: Duty & Moral Choice · Love & Devotion · Power & Society · Identity & Belonging · Suffering & Endurance · Justice & Moral Order · Meaning & Spiritual Insight · Freedom & Self-Understanding.
Write with intellectual seriousness and literary depth. Lessons are offered as one considered reading — never as final truths. Readers are invited to dissent and derive their own insights. Your response adds to the book's treatment — it does not replicate it.`;

const SYNOPSIS_INSTRUCTION = `Write a synopsis of approximately 250 words. If the work has a complex narrative structure, requires substantial historical context to be meaningful, is in a non-narrative poetic or philosophical form, or treats subject matter deeply embedded in a specific cultural moment, extend to up to 500 words. The length is determined by what the work requires — not by assumptions about what the reader already knows. Write as if the reader is intelligent, curious, and coming to this work for the first time.`;

const FIVE_LESSONS_FORMAT = `Write exactly five lessons. Each lesson MUST follow this exact format with a blank line between each:

**Lesson Title Here**
One sentence grounded in a specific moment, character, or line from the text. A second sentence that deepens or extends the first.
→ One question this lesson poses to the reader.

Do not number the lessons. Do not use bullet points. Each lesson begins on a new line with **bold title**. The → question is on its own line at the end of each lesson.`;

function workPrompt(work) {
  return `${FRAMEWORK}

You are generating a companion reading for Work ${work.num} of 42: "${work.title}" by ${work.author} (${work.lang}, ${work.period}).

Use these exact section headers:

## SYNOPSIS
${SYNOPSIS_INSTRUCTION}

## THE FIVE DIMENSIONS
Apply each of the five interpretive dimensions to this specific work. One substantial paragraph per dimension (60–80 words). Show how each lens opens a distinct route into the text's wisdom. Label each paragraph with its dimension name in bold.

## FIVE LESSONS
${FIVE_LESSONS_FORMAT}

## IN CONVERSATION
One paragraph (50–60 words) connecting this work to one or two other works from the 42. Name the specific works, the specific theme that connects them, and what reading them together reveals that reading either alone cannot.`;
}

function workDeepPrompt(work) {
  return `${FRAMEWORK}

Write a deeper companion reading for Work ${work.num}: "${work.title}" by ${work.author}.

## WHY THIS WORK NOW
One paragraph (80–100 words) on why this work speaks with particular force to contemporary life — what in the modern world makes its lessons more urgent, not less.

## THE LESSON MOST OFTEN MISSED
One paragraph identifying the lesson most frequently overlooked or misread — and what the correct reading reveals.

## THE TENSIONS WITHIN
One paragraph on where this work's own lessons pull against each other — internal contradictions the text holds open rather than resolves.

## A QUESTION TO SIT WITH
One penetrating question this work asks of the reader — genuinely open, rewarding sustained reflection. Not rhetorical. No answer implied.`;
}

function dailyPrompt(work) {
  return `${FRAMEWORK}

Today's daily lesson from Work ${work.num}: "${work.title}" by ${work.author} (${work.lang}, ${work.period}).

Write in three short paragraphs — readable in two minutes:

First paragraph: State today's lesson with a bold title on its own line. Then 40–50 words — one clear, specific insight from this work about how to live.

Second paragraph: 50–60 words grounding the lesson in the specific text — a character, moment, line, or situation that makes it concrete.

Third paragraph: 40–50 words on how to carry this into today. Close with one short sentence the reader might remember through the day.

No headers beyond the lesson title. Plain, warm, direct.`;
}

function themePrompt(theme, works) {
  const list = works.map(w=>`Work ${w.num}: "${w.title}" (${w.author}, ${w.lang}, ${w.period})`).join("\n");
  return `${FRAMEWORK}

Write a thematic essay on "${theme.label}" running through these works:
${list}

## THE THREAD
One paragraph (80–100 words) on the deeper pattern or argument these works collectively make about ${theme.label}. Not a list — a genuine thesis.

## THE CONVERSATION ACROSS CENTURIES
Two paragraphs (80–100 words each) showing how different traditions, periods, and forms produce genuinely different teachings on this theme. Name specific works, characters, or moments.

## WHERE THE TRADITION DISAGREES
One paragraph (60–80 words) identifying where these works pull in opposite directions on this theme. What does the tradition not resolve?

## WHAT READING THEM TOGETHER REVEALS
One paragraph (60–80 words) on what only emerges from the full thread — the collective wisdom no single work contains alone.`;
}

function situationPrompt(q) {
  return `${FRAMEWORK}

A reader brings this situation: "${q}"

From the 42 works in "Life Lessons from Indian Literature", identify the three works that speak most directly and usefully to this situation. Choose works offering genuinely different perspectives — span different traditions and periods where possible.

For each work use this header format:
## [Title] — [Author]
First paragraph: why this work speaks to this specific situation — precisely, not generically.
Second paragraph: the specific lesson most useful here, and how to carry it.

Close with one sentence connecting all three: the deeper pattern they collectively reveal about this human situation.`;
}

function worthinessPrompt(title, author, year) {
  return `A reader wants to add "${title}" by ${author}${year ? ` (${year})` : ""} to a communal library of literary works that teach life lessons.

Assess this work on three criteria:
1. Is it known beyond its country of origin?
2. Has it received recognition from a literary prize, institution, or curriculum — in any country, any language? (Include non-Western prizes: Sahitya Akademi, NLNG Prize, Noma Award, Jnanpith, Prix des Cinq Continents, Man Asian Literary Prize, and equivalent regional prizes.)
3. Do you have sufficient knowledge of this work to generate five substantive lessons grounded in the actual text?

Respond in this exact format:
VERDICT: [INCLUDE / PENDING / DECLINE]
REASON: [One sentence explaining the verdict]
CONFIDENCE: [HIGH / MEDIUM / LOW — your knowledge of this work]

INCLUDE = all three criteria clearly met
PENDING = two criteria met, or third uncertain — needs second reader nomination
DECLINE = fewer than two criteria met, or insufficient knowledge to generate reliable lessons`;
}

function anyBookPrompt(title, author, year, resonance) {
  const resonanceLine = resonance?.trim() ? `The reader notes: "${resonance}"` : "";
  return `${FRAMEWORK}

A reader has added "${title}" by ${author}${year ? ` (${year})` : ""} to their personal collection. ${resonanceLine}

Apply the book's methodology to this work. Use these exact headers:

## SYNOPSIS
${SYNOPSIS_INSTRUCTION}

## THE FIVE DIMENSIONS
One substantial paragraph per dimension (60–80 words), labelled in bold. Show how each dimension opens a distinct route into this work's wisdom.

## FIVE LESSONS
${FIVE_LESSONS_FORMAT}

## CONNECTION TO THE COLLECTION
One paragraph (50–60 words) connecting this work to one or two of the 42 works in "Life Lessons from Indian Literature" — a specific thematic conversation across traditions.

Be transparent if your knowledge of this work is limited. Note the confidence level naturally within the text if relevant.`;
}

// ── API ─────────────────────────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch("/api/claude", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// Storage handled by supabase.js

// ── Parse sections ────────────────────────────────────────────────────────────
function parseSections(text) {
  const parts = text.split(/^##\s+/m).filter(Boolean);
  if (parts.length > 1) return parts.map(p => { const lines = p.trim().split("\n"); return { title:lines[0].trim(), content:lines.slice(1).join("\n").trim() }; });
  return [{ title:"", content:text.trim() }];
}

// ── Small components ──────────────────────────────────────────────────────────
function Ornament({ op=0.28 }) {
  return (
    <svg width="130" height="16" viewBox="0 0 130 16" style={{opacity:op}}>
      <line x1="0" y1="8" x2="48" y2="8" stroke={C.goldMid} strokeWidth="0.9"/>
      <polygon points="60,4 65,8 60,12 55,8" fill={C.goldMid}/>
      <polygon points="69,4 74,8 69,12 64,8" fill={C.goldMid} opacity="0.5"/>
      <line x1="82" y1="8" x2="130" y2="8" stroke={C.goldMid} strokeWidth="0.9"/>
    </svg>
  );
}

function BackBtn({ onClick, label="← Back" }) {
  return <button onClick={onClick} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"Georgia, serif",fontSize:13,color:C.inkFaint,padding:"0 0 18px",display:"block"}}>{label}</button>;
}

function EraTag({ era }) {
  const e = ERA[era] || {bg:C.gold,light:C.goldXL};
  return <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:e.bg,color:C.white,fontFamily:"Georgia, serif",fontWeight:700}}>{era}</span>;
}

function SectionRule({ label }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"0 0 14px"}}>
      <div style={{flex:1,height:1,background:C.creamDark}}/>
      <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:C.goldMid,fontStyle:"italic",margin:0,whiteSpace:"nowrap"}}>{label}</p>
      <div style={{flex:1,height:1,background:C.creamDark}}/>
    </div>
  );
}

function LoadingPulse({ label }) {
  return (
    <div style={{padding:"32px 20px",textAlign:"center"}}>
      <Ornament op={0.5}/>
      <p style={{fontFamily:"Georgia, serif",fontSize:13,fontStyle:"italic",color:C.inkFaint,margin:"14px 0 20px"}}>{label}</p>
      <style>{`@keyframes sh{0%{background-position:-300% 0}100%{background-position:300% 0}}`}</style>
      <div style={{maxWidth:280,margin:"0 auto"}}>
        {[100,70,86,55,76,44].map((w,i)=>(
          <div key={i} style={{width:`${w}%`,height:9,borderRadius:5,marginBottom:8,background:`linear-gradient(90deg,transparent,rgba(155,107,10,0.2),transparent)`,backgroundSize:"300% 100%",animation:`sh 1.7s infinite ${i*0.13}s`}}/>
        ))}
      </div>
    </div>
  );
}

// Render a single text block — handles bold lesson titles, → questions, plain paragraphs
function renderBlock(text, key) {
  const lines = text.split("\n").filter(l => l.trim());
  if (!lines.length) return null;

  // Detect if this block starts with a bold lesson title **...**
  const firstLine = lines[0].trim();
  const boldMatch = firstLine.match(/^\*\*(.+?)\*\*\s*(.*)$/);
  if (boldMatch) {
    const lessonTitle = boldMatch[1];
    const afterTitle = boldMatch[2];
    const bodyLines = afterTitle ? [afterTitle, ...lines.slice(1)] : lines.slice(1);
    return (
      <div key={key} style={{marginBottom:20,paddingLeft:14,borderLeft:`3px solid ${C.gold}`}}>
        <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,fontWeight:700,color:C.ink,marginBottom:7}}>{lessonTitle}</div>
        {bodyLines.filter(l=>l.trim()).map((line,k)=>{
          const clean = line.replace(/^[-•]\s*/,"").trim();
          const isArrow = clean.startsWith("→");
          return (
            <p key={k} style={{fontFamily:"Georgia, serif",fontSize:14,lineHeight:1.82,color:isArrow?C.gold:C.ink,margin:"0 0 6px",fontStyle:isArrow?"italic":"normal"}}>
              {clean}
            </p>
          );
        })}
      </div>
    );
  }

  // Arrow question standalone
  const clean = firstLine.replace(/^[-•]\s*/,"").trim();
  if (clean.startsWith("→")) {
    return (
      <p key={key} style={{fontFamily:"Georgia, serif",fontSize:14,lineHeight:1.82,color:C.gold,fontStyle:"italic",margin:"0 0 10px"}}>
        {clean}
      </p>
    );
  }

  // Dimension label: **Ethical** · or **Psychological** · etc — bold inline heading
  const dimMatch = clean.match(/^\*\*(.+?)\*\*\s*[·•\-–]?\s*(.*)$/);
  if (dimMatch) {
    return (
      <div key={key} style={{marginBottom:14}}>
        <span style={{fontFamily:"Georgia, serif",fontSize:13,fontWeight:700,color:C.inkMid}}>{dimMatch[1]}</span>
        {dimMatch[2] && <span style={{fontFamily:"Georgia, serif",fontSize:14,lineHeight:1.85,color:C.ink}}> {dimMatch[2]}</span>}
        {lines.slice(1).filter(l=>l.trim()).map((l,k)=>(
          <p key={k} style={{fontFamily:"Georgia, serif",fontSize:14,lineHeight:1.85,color:C.ink,margin:"4px 0 0"}}>{l.replace(/^[-•]\s*/,"").trim()}</p>
        ))}
      </div>
    );
  }

  // Plain paragraph — join all lines
  return (
    <p key={key} style={{fontFamily:"Georgia, serif",fontSize:14.5,lineHeight:1.9,color:C.ink,margin:"0 0 13px"}}>
      {lines.map(l=>l.replace(/^[-•]\s*/,"").trim()).join(" ")}
    </p>
  );
}

function NarrativeView({ sections }) {
  return (
    <div>
      {sections.map((sec,i)=>{
        // Split content — respect both double-newline and single-newline-before-bold
        const rawBlocks = sec.content
          .split(/\n\n+/)
          .flatMap(block => {
            // If a block contains multiple **bold** lesson entries separated by single newlines, split them
            const parts = block.split(/\n(?=\*\*)/);
            return parts.length > 1 ? parts : [block];
          })
          .filter(b => b.trim());

        return (
          <div key={i} style={{marginBottom:26}}>
            {sec.title && (
              <div style={{fontFamily:"Georgia, serif",fontSize:10,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:C.gold,marginBottom:12,paddingBottom:8,borderBottom:`1px solid ${C.creamDark}`}}>
                {sec.title}
              </div>
            )}
            {rawBlocks.map((block, j) => renderBlock(block, j))}
          </div>
        );
      })}
    </div>
  );
}

function ContinueOptions({ showDeeper, onDeeper, onChoose, chooseLabel="Choose another", onStart }) {
  return (
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:20,paddingTop:16,borderTop:`1px solid ${C.creamDark}`}}>
      {showDeeper && (
        <button onClick={onDeeper} style={{padding:"9px 18px",borderRadius:7,cursor:"pointer",background:C.gold,color:C.white,border:"none",fontFamily:"Georgia, serif",fontSize:13,fontWeight:600,boxShadow:`0 2px 10px ${C.gold}33`}}>
          Read deeper →
        </button>
      )}
      <button onClick={onChoose} style={{padding:"9px 18px",borderRadius:7,cursor:"pointer",background:C.cream,color:C.inkMid,border:`1.5px solid ${C.creamDeep}`,fontFamily:"Georgia, serif",fontSize:13}}>
        {chooseLabel}
      </button>
      <button onClick={onStart} style={{padding:"9px 18px",borderRadius:7,cursor:"pointer",background:"transparent",color:C.inkFaint,border:`1px solid ${C.creamDark}`,fontFamily:"Georgia, serif",fontSize:13}}>
        Start again
      </button>
    </div>
  );
}

function WorkCard({ work, onClick }) {
  const e = ERA[work.era]||{bg:C.gold,light:C.goldXL};
  return (
    <button onClick={()=>onClick(work)} style={{textAlign:"left",padding:"14px 16px",background:C.white,border:`1px solid ${C.creamDark}`,borderRadius:10,cursor:"pointer",transition:"all 0.16s",width:"100%",display:"block"}}
      onMouseEnter={e2=>{e2.currentTarget.style.borderColor=e.bg;e2.currentTarget.style.boxShadow=`0 3px 14px ${e.bg}22`;}}
      onMouseLeave={e2=>{e2.currentTarget.style.borderColor=C.creamDark;e2.currentTarget.style.boxShadow="none";}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:e.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:11,fontWeight:700,color:C.white}}>{work.num}</span>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:14,fontWeight:700,color:C.ink,marginBottom:2}}>{work.title}</div>
          <div style={{fontFamily:"Georgia, serif",fontSize:12,color:C.inkFaint,marginBottom:6}}>{work.author} · {work.lang} · {work.period}</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <EraTag era={work.era}/>
            <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:C.creamDark,color:C.inkLight,fontFamily:"Georgia, serif"}}>{work.lang}</span>
            {work.extended && <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:C.goldXL,color:C.gold,fontFamily:"Georgia, serif"}}>Extended</span>}
          </div>
        </div>
      </div>
    </button>
  );
}

function WorkHeader({ work, label }) {
  const e = ERA[work.era]||{bg:C.gold};
  return (
    <div style={{background:C.ink,borderRadius:"12px 12px 0 0",padding:"20px 26px",position:"relative",overflow:"hidden"}}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.04}} preserveAspectRatio="none" viewBox="0 0 720 100">
        {[0,20,40,60,80,100].map(y=><line key={y} x1="0" y1={y} x2="720" y2={y} stroke="#C49020" strokeWidth="0.6"/>)}
        {[0,60,120,180,240,300,360,420,480,540,600,660,720].map(x=><line key={x} x1={x} y1="0" x2={x} y2="100" stroke="#C49020" strokeWidth="0.4"/>)}
      </svg>
      <div style={{position:"relative"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
          {label && <span style={{fontFamily:"Georgia, serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(255,255,255,0.5)"}}>{label}</span>}
          <EraTag era={work.era}/>
        </div>
        <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:22,fontWeight:700,color:C.white,marginBottom:4}}>{work.title}</div>
        <div style={{fontFamily:"Georgia, serif",fontSize:13,color:"rgba(255,255,255,0.6)"}}>{work.author} · {work.lang} · {work.period}</div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]           = useState("home");
  const [selWork, setSelWork]         = useState(null);
  const [selTheme, setSelTheme]       = useState(null);
  const [sections, setSections]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [loadLabel, setLoadLabel]     = useState("");
  const [isDeep, setIsDeep]           = useState(false);
  const [situation, setSituation]     = useState("");
  const [filterEra, setFilterEra]     = useState(null);
  const [filterTheme, setFilterTheme] = useState(null);
  const [searchQ, setSearchQ]         = useState(null);
  const [dailyWork]                   = useState(getDailyWork);
  const [dailySections, setDailySecs] = useState([]);
  const [dailyLoaded, setDailyLoaded] = useState(false);
  // Any book
  const [abTitle, setAbTitle]   = useState("");
  const [abAuthor, setAbAuthor] = useState("");
  const [abYear, setAbYear]     = useState("");
  const [abNote, setAbNote]     = useState("");
  const [abChecking, setAbChecking]   = useState(false);
  const [abVerdict, setAbVerdict]     = useState(null);
  const [abNomReason, setAbNomReason] = useState("");
  // Reader's collection (private)
  const [myCollection, setMyCollection] = useState([]);
  // Communal library (shared)
  const [communalLib, setCommunalLib]   = useState([]);
  const [libFilter, setLibFilter]       = useState({ country:"", genre:"", theme:"" });
  const bottomRef = useRef();

  // ── Load daily lesson ──────────────────────────────────────────────────────
  useEffect(()=>{
    async function load() {
      try { const t = await callClaude(dailyPrompt(dailyWork)); setDailySecs(parseSections(t)); } catch {}
      setDailyLoaded(true);
    }
    load();
  },[]);

  // ── Load collections ───────────────────────────────────────────────────────
  useEffect(()=>{
    async function loadCollections() {
      const [mine, communal] = await Promise.all([
        loadMyCollection(),
        loadCommunalLibrary(),
      ]);
      setMyCollection(mine);
      setCommunalLib(communal);
    }
    loadCollections();
  },[]);

  // ── Generate ───────────────────────────────────────────────────────────────
  async function generate(prompt, label, deep=false) {
    setLoading(true); setLoadLabel(label); setSections([]); setIsDeep(deep);
    try {
      const t = await callClaude(prompt);
      setSections(parseSections(t));
      setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth",block:"end"}),80);
    } catch { setSections([{title:"",content:"Could not generate at this moment. Please try again."}]); }
    finally { setLoading(false); }
  }

  function openWork(work) {
    setSelWork(work); setIsDeep(false);
    setScreen("work-reading");
    generate(workPrompt(work), `Opening ${work.title}…`);
  }

  function deepenWork() {
    generate(workDeepPrompt(selWork), `Going deeper into ${selWork.title}…`, true);
  }

  function openTheme(theme) {
    setSelTheme(theme);
    const tw = WORKS.filter(w=>w.themes.includes(theme.id));
    setScreen("theme-reading");
    generate(themePrompt(theme,tw), `Reading the thread: ${theme.label}…`);
  }

  function openSituation() {
    if (!situation.trim()) return;
    setScreen("situation-reading");
    generate(situationPrompt(situation), "Finding the works that speak to your situation…");
  }

  // ── Any book — worthiness check ────────────────────────────────────────────
  async function checkWorthiness() {
    if (!abTitle.trim()||!abAuthor.trim()) return;
    setAbChecking(true); setAbVerdict(null);
    try {
      const t = await callClaude(worthinessPrompt(abTitle, abAuthor, abYear));
      const verdict = t.match(/VERDICT:\s*(INCLUDE|PENDING|DECLINE)/i)?.[1]?.toUpperCase() || "PENDING";
      const reason  = t.match(/REASON:\s*(.+)/i)?.[1]?.trim() || "";
      const conf    = t.match(/CONFIDENCE:\s*(HIGH|MEDIUM|LOW)/i)?.[1]?.toUpperCase() || "MEDIUM";
      setAbVerdict({ verdict, reason, conf });
    } catch { setAbVerdict({ verdict:"PENDING", reason:"Could not assess at this time.", conf:"LOW" }); }
    setAbChecking(false);
  }

  async function generateAnyBook() {
    setScreen("anybook-reading");
    await generate(anyBookPrompt(abTitle, abAuthor, abYear, abNote), `Opening ${abTitle}…`);
    // Save to private collection
    const entry = { title:abTitle, author:abAuthor, year:abYear, note:abNote, date_added:new Date().toISOString().slice(0,10), type:"anybook" };
    await saveToMyCollection(entry);
    setMyCollection(prev=>[...prev, entry]);
    // If INCLUDE verdict — save to communal library
    if (abVerdict?.verdict==="INCLUDE") {
      const communalEntry = { title:abTitle, author:abAuthor, year:abYear, nomination_reason:abNomReason.trim()||"", date_added:new Date().toISOString().slice(0,10), type:"communal" };
      await saveToCommunalLibrary(communalEntry);
      setCommunalLib(prev=>[...prev, communalEntry]);
    }
  }

  function reset() {
    setScreen("home"); setSelWork(null); setSelTheme(null); setSections([]);
    setIsDeep(false); setSituation(""); setFilterEra(null); setFilterTheme(null); setSearchQ("");
    setAbTitle(""); setAbAuthor(""); setAbYear(""); setAbNote(""); setAbVerdict(null); setAbNomReason("");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  const filtered = WORKS.filter(w=>{
    if (filterEra && w.era!==filterEra) return false;
    if (filterTheme && !w.themes.includes(filterTheme)) return false;
    if (searchQ && !w.title.toLowerCase().includes(searchQ.toLowerCase()) && !w.author.toLowerCase().includes(searchQ.toLowerCase()) && !w.lang.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const inp = { style:{ width:"100%", background:C.white, border:`1.5px solid ${C.creamDark}`, borderRadius:7, padding:"11px 14px", fontFamily:"Georgia, serif", fontSize:15, color:C.ink, outline:"none" } };

  // ── Masthead ───────────────────────────────────────────────────────────────
  const Masthead = ()=>(
    <div style={{textAlign:"center",padding:"36px 0 22px",borderBottom:`1px solid ${C.creamDeep}`,marginBottom:26}}>
      <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",color:C.goldMid,margin:"0 0 8px",fontStyle:"italic"}}>Companion to</p>
      <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:28,fontWeight:700,color:C.ink,margin:"0 0 6px",lineHeight:1.2}}>Life Lessons from Indian Literature</h1>
      <p style={{fontFamily:"Georgia, serif",fontSize:13,color:C.inkFaint,fontStyle:"italic",margin:0,lineHeight:1.6}}>Ancient Wisdom and Modern Thought · 42 works · 16 languages · 3,000 years</p>
      <div style={{marginTop:12,display:"flex",justifyContent:"center"}}><Ornament/></div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:C.cream}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        * { box-sizing: border-box; }
        input:focus,textarea:focus { border-color: #9B6B0A !important; box-shadow: 0 0 0 3px rgba(155,107,10,0.10); outline:none; }
        input::placeholder,textarea::placeholder { color: #A08060; font-style: italic; }
      `}</style>

      <div style={{maxWidth:720,margin:"0 auto",padding:"0 18px 80px"}}>
        <Masthead/>

        {/* ════════════════════════════════════ HOME */}
        {screen==="home" && (
          <div>
            {/* Intro */}
            <div style={{marginBottom:32}}>
              <p style={{fontFamily:"Georgia, serif",fontSize:15,lineHeight:1.95,color:C.inkMid,margin:"0 0 14px"}}>
                We all tell stories about life — to make sense of what happened, to share what we learned, to pass something on. Literature is simply those stories told with the greatest care and craft, by people who had seen something clearly and wanted others to see it too.
              </p>
              <p style={{fontFamily:"Georgia, serif",fontSize:15,lineHeight:1.95,color:C.inkMid,margin:"0 0 14px"}}>
                This companion draws on 42 works from India's literary tradition — from the Rig Veda to Arundhati Roy — to bring you what those stories teach. A life lesson here is not a rule. It is a moment in someone else's story that illuminates something in your own.
              </p>
              <div style={{display:"flex",justifyContent:"center",marginTop:20}}>
                <Ornament op={0.5}/>
              </div>
            </div>

            {/* Three questions */}
            <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:32}}>
              {/* Q1 — Indian collection */}
              <button onClick={()=>setScreen("collection")}
                style={{textAlign:"left",padding:"22px 24px",background:C.white,border:`1.5px solid ${C.creamDark}`,borderRadius:14,cursor:"pointer",transition:"all 0.18s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.boxShadow=`0 4px 20px ${C.gold}22`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.creamDark;e.currentTarget.style.boxShadow="none";}}>
                <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700,color:C.ink,marginBottom:6,lineHeight:1.3}}>
                  Would you like a lesson from India's literary collection?
                </div>
                <p style={{fontFamily:"Georgia, serif",fontSize:13,color:C.inkFaint,fontStyle:"italic",margin:0}}>
                  42 works · 3,000 years · 16 languages
                </p>
              </button>

              {/* Q2 — Any book */}
              <button onClick={()=>setScreen("anybook")}
                style={{textAlign:"left",padding:"22px 24px",background:C.white,border:`1.5px solid ${C.creamDark}`,borderRadius:14,cursor:"pointer",transition:"all 0.18s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.tealMid;e.currentTarget.style.boxShadow=`0 4px 20px ${C.tealMid}22`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.creamDark;e.currentTarget.style.boxShadow="none";}}>
                <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700,color:C.ink,marginBottom:6,lineHeight:1.3}}>
                  Have a book of your own you'd like lessons from?
                </div>
                <p style={{fontFamily:"Georgia, serif",fontSize:13,color:C.inkFaint,fontStyle:"italic",margin:0}}>
                  Any work from world literature
                </p>
              </button>

              {/* Q3 — Situation */}
              <button onClick={()=>setScreen("situation")}
                style={{textAlign:"left",padding:"22px 24px",background:C.white,border:`1.5px solid ${C.creamDark}`,borderRadius:14,cursor:"pointer",transition:"all 0.18s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.indigoMid;e.currentTarget.style.boxShadow=`0 4px 20px ${C.indigoMid}22`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.creamDark;e.currentTarget.style.boxShadow="none";}}>
                <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700,color:C.ink,marginBottom:6,lineHeight:1.3}}>
                  Facing something in life and looking for guidance?
                </div>
                <p style={{fontFamily:"Georgia, serif",fontSize:13,color:C.inkFaint,fontStyle:"italic",margin:0}}>
                  Describe your situation — find the works that speak to it
                </p>
              </button>
            </div>

            <div style={{textAlign:"center",opacity:0.32}}>
              <p style={{fontFamily:"Georgia, serif",fontSize:12,color:C.inkFaint,fontStyle:"italic",margin:0}}>
                "A life lesson is a moment in someone else's story that illuminates something in your own."
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════ COLLECTION (was browse/themes/daily/communal) */}
        {screen==="collection" && (
          <div>
            <BackBtn onClick={reset}/>

            {/* Daily lesson */}
            <div style={{background:C.ink,borderRadius:12,padding:"20px 24px",marginBottom:22}}>
              <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:10,flexWrap:"wrap"}}>
                <span style={{fontFamily:"Georgia, serif",fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:C.goldLight,opacity:0.8}}>Today's Lesson</span>
                <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:13,color:"rgba(255,255,255,0.45)",fontStyle:"italic"}}>{dailyWork.title} — {dailyWork.author}</span>
              </div>
              {!dailyLoaded ? (
                <p style={{fontFamily:"Georgia, serif",fontSize:13,color:"rgba(255,255,255,0.35)",fontStyle:"italic",margin:0}}>Loading…</p>
              ) : dailySections.length > 0 ? (
                <>
                  {dailySections[0].content.split(/\n\n+/).slice(0,2).map((para,i)=>(
                    <p key={i} style={{fontFamily:"Georgia, serif",fontSize:14,lineHeight:1.8,color:"rgba(255,255,255,0.82)",margin:"0 0 8px"}}>
                      {para.replace(/^\*\*.*?\*\*\n?/,"")}
                    </p>
                  ))}
                  <button onClick={()=>setScreen("daily")} style={{marginTop:4,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontFamily:"Georgia, serif",fontSize:12,color:"rgba(255,255,255,0.6)"}}>
                    Full lesson →
                  </button>
                </>
              ) : null}
            </div>

            {/* Three sub-options */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:22}}>
              {[
                {id:"browse",   icon:"◈", label:"Browse the 42",    color:C.gold},
                {id:"themes",   icon:"✦", label:"Thematic Threads", color:C.rust},
                {id:"communal", icon:"⬡", label:"Reader's Library", color:C.maroonMid},
              ].map(opt=>(
                <button key={opt.id} onClick={()=>setScreen(opt.id)}
                  style={{padding:"14px 12px",background:C.white,border:`1.5px solid ${C.creamDark}`,borderRadius:10,cursor:"pointer",textAlign:"center",transition:"all 0.16s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=opt.color;e.currentTarget.style.boxShadow=`0 3px 12px ${opt.color}22`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.creamDark;e.currentTarget.style.boxShadow="none";}}>
                  <div style={{fontSize:18,color:opt.color,marginBottom:6}}>{opt.icon}</div>
                  <div style={{fontFamily:"Georgia, serif",fontSize:12,fontWeight:700,color:C.ink}}>{opt.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════ BROWSE 42 */}
        {screen==="browse" && (
          <div>
            <BackBtn onClick={()=>setScreen("collection")}/>
            <div style={{background:C.white,border:`1px solid ${C.creamDark}`,borderRadius:12,padding:"16px 18px",marginBottom:18}}>
              <input {...inp} placeholder="Search title, author, language…" value={searchQ||""} onChange={e=>setSearchQ(e.target.value)} style={{...inp.style,marginBottom:12}}/>
              <div style={{marginBottom:10}}>
                <p style={{fontFamily:"Georgia, serif",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:C.inkFaint,margin:"0 0 7px"}}>Period</p>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {ERAS.map(era=>{
                    const e=ERA[era];
                    return <button key={era} onClick={()=>setFilterEra(filterEra===era?null:era)} style={{padding:"5px 12px",borderRadius:20,cursor:"pointer",fontFamily:"Georgia, serif",fontSize:11,border:"none",background:filterEra===era?e.bg:C.creamDark,color:filterEra===era?C.white:C.inkLight,transition:"all 0.14s"}}>{era}</button>;
                  })}
                </div>
              </div>
              <div>
                <p style={{fontFamily:"Georgia, serif",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:C.inkFaint,margin:"0 0 7px"}}>Theme</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {THEMES.map(t=>(
                    <button key={t.id} onClick={()=>setFilterTheme(filterTheme===t.id?null:t.id)} style={{padding:"4px 10px",borderRadius:20,cursor:"pointer",fontFamily:"Georgia, serif",fontSize:11,border:"none",background:filterTheme===t.id?t.color:C.creamDark,color:filterTheme===t.id?C.white:C.inkLight,transition:"all 0.14s"}}>{t.icon} {t.label.split(" ")[0]}</button>
                  ))}
                </div>
              </div>
            </div>
            <p style={{fontFamily:"Georgia, serif",fontSize:12,color:C.inkFaint,fontStyle:"italic",margin:"0 0 12px"}}>{filtered.length} of 42 works</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filtered.map(w=><WorkCard key={w.id} work={w} onClick={openWork}/>)}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════ THEMES */}
        {screen==="themes" && (
          <div>
            <BackBtn onClick={()=>setScreen("collection")}/>
            <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:14,color:C.inkMid,fontStyle:"italic",margin:"0 0 20px"}}>Follow a life theme through the collection</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {THEMES.map(t=>{
                const count=WORKS.filter(w=>w.themes.includes(t.id)).length;
                const eras=[...new Set(WORKS.filter(w=>w.themes.includes(t.id)).map(w=>w.era))];
                return (
                  <button key={t.id} onClick={()=>openTheme(t)}
                    style={{textAlign:"left",padding:"16px 18px",background:C.white,border:`1.5px solid ${C.creamDark}`,borderRadius:12,cursor:"pointer",transition:"all 0.17s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=t.color;e.currentTarget.style.boxShadow=`0 3px 14px ${t.color}22`;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.creamDark;e.currentTarget.style.boxShadow="none";}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <span style={{fontSize:17,color:t.color}}>{t.icon}</span>
                      <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:14,fontWeight:700,color:C.ink}}>{t.label}</span>
                    </div>
                    <p style={{fontFamily:"Georgia, serif",fontSize:11,color:C.inkFaint,fontStyle:"italic",margin:0}}>{count} works · {eras.join(", ")}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════ SITUATION */}
        {screen==="situation" && (
          <div>
            <BackBtn onClick={reset}/>
            <div style={{background:C.white,border:`1px solid ${C.creamDark}`,borderRadius:14,padding:"24px 24px",boxShadow:"0 3px 18px rgba(26,18,8,0.05)",marginBottom:20}}>
              <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,color:C.inkMid,fontStyle:"italic",margin:"0 0 6px",lineHeight:1.6}}>Describe a situation, question, or feeling</p>
              <p style={{fontFamily:"Georgia, serif",fontSize:12,color:C.inkFaint,margin:"0 0 14px",lineHeight:1.5}}>The companion finds the three works from the 42 that speak most directly to it</p>
              <textarea value={situation} onChange={e=>setSituation(e.target.value)}
                placeholder="e.g. I am facing a decision between duty to my family and my own path…"
                style={{width:"100%",minHeight:100,border:`1.5px solid ${C.creamDark}`,borderRadius:7,padding:"12px 14px",fontFamily:"Georgia, serif",fontSize:14,color:C.ink,background:C.cream,resize:"vertical",lineHeight:1.65}}/>
              <button onClick={openSituation} disabled={!situation.trim()}
                style={{width:"100%",marginTop:14,padding:"13px 20px",background:situation.trim()?`linear-gradient(135deg,${C.gold},${C.goldMid})`:C.creamDark,color:situation.trim()?C.white:C.inkFaint,border:"none",borderRadius:8,cursor:situation.trim()?"pointer":"not-allowed",fontFamily:"'Playfair Display',Georgia,serif",fontSize:14,fontWeight:600,transition:"all 0.2s"}}>
                Find the works that speak to this →
              </button>
            </div>
            <SectionRule label="Examples"/>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {["I am caught between duty and what I truly want","I am trying to act with integrity in an unjust system","I am grieving a loss and looking for how others have endured","I want to understand what devotion means","I am facing a moral decision with no clear right answer"].map(ex=>(
                <button key={ex} onClick={()=>setSituation(ex)}
                  style={{textAlign:"left",padding:"10px 14px",background:C.white,border:`1px solid ${C.creamDark}`,borderRadius:8,cursor:"pointer",fontFamily:"Georgia, serif",fontSize:13,color:C.inkLight,fontStyle:"italic",transition:"all 0.14s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.gold}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.creamDark}>
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════ ANY BOOK */}
        {screen==="anybook" && (
          <div>
            <BackBtn onClick={reset}/>
            <div style={{background:C.white,border:`1px solid ${C.creamDark}`,borderRadius:14,padding:"24px 24px",boxShadow:"0 3px 18px rgba(26,18,8,0.05)",marginBottom:20}}>
              <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,color:C.inkMid,fontStyle:"italic",margin:"0 0 6px",lineHeight:1.6}}>Apply the book's method to any work you have read</p>
              <p style={{fontFamily:"Georgia, serif",fontSize:12,color:C.inkFaint,margin:"0 0 18px",lineHeight:1.5}}>The companion checks the work's recognition, then generates a synopsis, five dimensions, and five lessons using the same framework as the 42</p>
              <div style={{display:"grid",gap:12,marginBottom:14}}>
                <div>
                  <label style={{display:"block",fontFamily:"Georgia, serif",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:C.gold,marginBottom:6}}>Title</label>
                  <input {...inp} placeholder="e.g. To Kill a Mockingbird" value={abTitle} onChange={e=>setAbTitle(e.target.value)}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <label style={{display:"block",fontFamily:"Georgia, serif",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:C.gold,marginBottom:6}}>Author</label>
                    <input {...inp} placeholder="e.g. Harper Lee" value={abAuthor} onChange={e=>setAbAuthor(e.target.value)}/>
                  </div>
                  <div>
                    <label style={{display:"block",fontFamily:"Georgia, serif",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:C.inkFaint,marginBottom:6}}>Year <span style={{fontStyle:"italic",textTransform:"none",letterSpacing:0,color:C.inkFaint,fontSize:11}}>(optional)</span></label>
                    <input {...inp} placeholder="e.g. 1960" value={abYear} onChange={e=>setAbYear(e.target.value)}/>
                  </div>
                </div>
                <div>
                  <label style={{display:"block",fontFamily:"Georgia, serif",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:C.inkFaint,marginBottom:6}}>What draws you to this book? <span style={{fontStyle:"italic",textTransform:"none",letterSpacing:0,fontSize:11}}>(optional — shapes the lessons)</span></label>
                  <textarea value={abNote} onChange={e=>setAbNote(e.target.value)}
                    placeholder="e.g. Reading it because I am thinking about justice and moral courage…"
                    style={{width:"100%",minHeight:70,border:`1.5px solid ${C.creamDark}`,borderRadius:7,padding:"10px 14px",fontFamily:"Georgia, serif",fontSize:14,color:C.ink,background:C.cream,resize:"none",lineHeight:1.6}}/>
                </div>
              </div>

              {/* Worthiness verdict */}
              {abVerdict && (
                <div style={{padding:"12px 16px",borderRadius:8,marginBottom:14,
                  background: abVerdict.verdict==="INCLUDE"?C.forestLight : abVerdict.verdict==="PENDING"?C.goldXL : C.rustLight,
                  border:`1px solid ${abVerdict.verdict==="INCLUDE"?C.forestMid:abVerdict.verdict==="PENDING"?C.goldMid:C.rustMid}33`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:14}}>{abVerdict.verdict==="INCLUDE"?"✓":abVerdict.verdict==="PENDING"?"◎":"✗"}</span>
                    <span style={{fontFamily:"Georgia, serif",fontSize:13,fontWeight:700,color:abVerdict.verdict==="INCLUDE"?C.forestMid:abVerdict.verdict==="PENDING"?C.gold:C.rust}}>
                      {abVerdict.verdict==="INCLUDE"?"Recognised work — proceeding":abVerdict.verdict==="PENDING"?"Needs a second reader nomination to enter the communal library":"Cannot reliably generate lessons for this work"}
                    </span>
                  </div>
                  <p style={{fontFamily:"Georgia, serif",fontSize:12,color:C.ink,margin:0,fontStyle:"italic"}}>{abVerdict.reason}</p>
                </div>
              )}

              {/* Nomination reason — shown only after passing verdict */}
              {abVerdict && abVerdict.verdict!=="DECLINE" && (
                <div style={{marginBottom:14}}>
                  <label style={{display:"block",fontFamily:"Georgia, serif",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:C.gold,marginBottom:6}}>
                    Why does this work deserve a place in the library?
                    <span style={{fontStyle:"italic",textTransform:"none",letterSpacing:0,color:C.inkFaint,fontSize:11,marginLeft:6}}>(optional — your reason will appear in the library entry for other readers)</span>
                  </label>
                  <textarea value={abNomReason} onChange={e=>setAbNomReason(e.target.value)}
                    placeholder="Optional — leave blank to proceed without a note"
                    style={{width:"100%",minHeight:70,border:`1.5px solid ${C.creamDark}`,borderRadius:7,padding:"10px 14px",fontFamily:"Georgia, serif",fontSize:14,color:C.ink,background:C.cream,resize:"none",lineHeight:1.6}}/>
                  <p style={{fontFamily:"Georgia, serif",fontSize:11,color:C.inkFaint,fontStyle:"italic",margin:"6px 0 0"}}>Leave blank to proceed without a note</p>
                </div>
              )}

              {/* Action buttons */}
              {!abVerdict && (
                <button onClick={checkWorthiness} disabled={!abTitle.trim()||!abAuthor.trim()||abChecking}
                  style={{width:"100%",padding:"13px 20px",background:abTitle.trim()&&abAuthor.trim()?`linear-gradient(135deg,${C.gold},${C.goldMid})`:C.creamDark,color:abTitle.trim()&&abAuthor.trim()?C.white:C.inkFaint,border:"none",borderRadius:8,cursor:abTitle.trim()&&abAuthor.trim()?"pointer":"not-allowed",fontFamily:"'Playfair Display',Georgia,serif",fontSize:14,fontWeight:600,transition:"all 0.2s"}}>
                  {abChecking?"Checking recognition…":"Check this work →"}
                </button>
              )}
              {abVerdict && abVerdict.verdict!=="DECLINE" && (
                <button onClick={generateAnyBook}
                  style={{width:"100%",padding:"13px 20px",background:`linear-gradient(135deg,${C.gold},${C.goldMid})`,color:C.white,border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'Playfair Display',Georgia,serif",fontSize:14,fontWeight:600}}>
                  Generate lessons for this work →
                </button>
              )}
              {abVerdict && abVerdict.verdict==="DECLINE" && (
                <button onClick={()=>setAbVerdict(null)}
                  style={{width:"100%",padding:"13px 20px",background:C.creamDark,color:C.inkFaint,border:"none",borderRadius:8,cursor:"pointer",fontFamily:"Georgia, serif",fontSize:14}}>
                  Try a different work
                </button>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════ MY COLLECTION */}
        {screen==="mycollection" && (
          <div>
            <BackBtn onClick={reset}/>
            <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,color:C.inkMid,fontStyle:"italic",margin:"0 0 6px"}}>Your Reading Collection</p>
            <p style={{fontFamily:"Georgia, serif",fontSize:12,color:C.inkFaint,margin:"0 0 20px",lineHeight:1.5}}>Private — visible only to you. Works you have added using the "Any Book" feature.</p>
            {myCollection.length===0 ? (
              <div style={{textAlign:"center",padding:"32px 20px",background:C.white,border:`1px solid ${C.creamDark}`,borderRadius:12}}>
                <p style={{fontFamily:"Georgia, serif",fontSize:14,color:C.inkFaint,fontStyle:"italic",margin:"0 0 16px"}}>Your collection is empty</p>
                <button onClick={()=>setScreen("anybook")} style={{padding:"10px 20px",background:C.gold,color:C.white,border:"none",borderRadius:8,cursor:"pointer",fontFamily:"Georgia, serif",fontSize:13}}>Add your first book →</button>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {myCollection.map((item,i)=>(
                  <div key={i} style={{background:C.white,border:`1px solid ${C.creamDark}`,borderRadius:10,padding:"14px 16px"}}>
                    <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,fontWeight:700,color:C.ink,marginBottom:3}}>{item.title}</div>
                    <div style={{fontFamily:"Georgia, serif",fontSize:12,color:C.inkFaint,marginBottom:6}}>{item.author}{item.year?` · ${item.year}`:""} · Added {item.date}</div>
                    {item.note && <p style={{fontFamily:"Georgia, serif",fontSize:13,color:C.inkLight,fontStyle:"italic",margin:0,padding:"8px 12px",background:C.creamDark,borderRadius:6}}>"{item.note}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════ COMMUNAL LIBRARY */}
        {screen==="communal" && (
          <div>
            <BackBtn onClick={()=>setScreen("collection")}/>
            <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,color:C.inkMid,fontStyle:"italic",margin:"0 0 6px"}}>The Reader's Library</p>
            <p style={{fontFamily:"Georgia, serif",fontSize:12,color:C.inkFaint,margin:"0 0 20px",lineHeight:1.5}}>Works added by readers worldwide — extending the book's methodology beyond the original 42. Personal notes are never shared.</p>
            {communalLib.length===0 ? (
              <div style={{textAlign:"center",padding:"32px 20px",background:C.white,border:`1px solid ${C.creamDark}`,borderRadius:12}}>
                <p style={{fontFamily:"Georgia, serif",fontSize:14,color:C.inkFaint,fontStyle:"italic",margin:"0 0 16px"}}>The communal library grows as readers add works</p>
                <button onClick={()=>setScreen("anybook")} style={{padding:"10px 20px",background:C.gold,color:C.white,border:"none",borderRadius:8,cursor:"pointer",fontFamily:"Georgia, serif",fontSize:13}}>Add the first work →</button>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {communalLib.map((item,i)=>(
                  <div key={i} style={{background:C.white,border:`1px solid ${C.creamDark}`,borderRadius:10,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                    <div>
                      <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,fontWeight:700,color:C.ink,marginBottom:2}}>{item.title}</div>
                      <div style={{fontFamily:"Georgia, serif",fontSize:12,color:C.inkFaint,marginBottom: item.nomination_reason?6:0}}>{item.author}{item.year?` · ${item.year}`:""}</div>
                      {item.nomination_reason && (
                        <p style={{fontFamily:"Georgia, serif",fontSize:12,color:C.inkLight,fontStyle:"italic",margin:0,lineHeight:1.5}}>"{item.nomination_reason}"</p>
                      )}
                    </div>
                    <button onClick={()=>{setAbTitle(item.title);setAbAuthor(item.author);setAbYear(item.year||"");setAbVerdict({verdict:"INCLUDE",reason:"Previously verified.",conf:"HIGH"});setScreen("anybook");}}
                      style={{padding:"7px 14px",background:C.goldXL,border:`1px solid ${C.goldMid}44`,borderRadius:7,cursor:"pointer",fontFamily:"Georgia, serif",fontSize:12,color:C.gold}}>
                      Read lessons →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════ DAILY FULL */}
        {screen==="daily" && (
          <div>
            <BackBtn onClick={reset}/>
            <div style={{background:C.ink,borderRadius:"12px 12px 0 0",padding:"20px 24px"}}>
              <p style={{fontFamily:"Georgia, serif",fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:C.goldLight,opacity:0.8,margin:"0 0 6px"}}>
                Today · {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}
              </p>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:20,fontWeight:700,color:C.white}}>{dailyWork.title}</div>
              <div style={{fontFamily:"Georgia, serif",fontSize:13,color:"rgba(255,255,255,0.55)",marginTop:4}}>{dailyWork.author} · {dailyWork.lang} · {dailyWork.period}</div>
            </div>
            <div style={{background:C.white,border:`1px solid ${C.creamDark}`,borderTop:"none",padding:"22px 24px"}}>
              {!dailyLoaded?<LoadingPulse label="Loading…"/>:<NarrativeView sections={dailySections}/>}
            </div>
            <div style={{background:C.white,border:`1px solid ${C.creamDark}`,borderTop:`1px solid ${C.creamDark}`,borderRadius:"0 0 12px 12px",padding:"14px 24px",display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={()=>openWork(dailyWork)} style={{padding:"9px 18px",borderRadius:7,cursor:"pointer",background:C.gold,color:C.white,border:"none",fontFamily:"Georgia, serif",fontSize:13,fontWeight:600}}>Read the full work →</button>
              <button onClick={reset} style={{padding:"9px 18px",borderRadius:7,cursor:"pointer",background:"transparent",color:C.inkFaint,border:`1px solid ${C.creamDark}`,fontFamily:"Georgia, serif",fontSize:13}}>Back to home</button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════ WORK READING */}
        {screen==="work-reading" && selWork && (
          <div>
            <BackBtn onClick={()=>{setScreen("browse");setSections([]);}}/>
            <WorkHeader work={selWork} label={`Work ${selWork.num} of 42`}/>
            <div style={{background:C.white,border:`1px solid ${C.creamDark}`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:"24px 26px"}}>
              {loading?<LoadingPulse label={loadLabel}/>:(
                <>
                  <NarrativeView sections={sections}/>
                  <ContinueOptions showDeeper={!isDeep} onDeeper={deepenWork} onChoose={()=>setScreen("collection")} chooseLabel="Choose another work" onStart={reset}/>
                </>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════ THEME READING */}
        {screen==="theme-reading" && selTheme && (
          <div>
            <BackBtn onClick={()=>{setScreen("themes");setSections([]);}}/>
            <div style={{background:C.ink,borderRadius:"12px 12px 0 0",padding:"20px 26px"}}>
              <p style={{fontFamily:"Georgia, serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:C.goldLight,opacity:0.8,margin:"0 0 6px"}}>Thematic Thread</p>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22,color:selTheme.color}}>{selTheme.icon}</span>
                <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:21,fontWeight:700,color:C.white}}>{selTheme.label}</div>
              </div>
              <p style={{fontFamily:"Georgia, serif",fontSize:11,color:"rgba(255,255,255,0.4)",margin:"8px 0 0",fontStyle:"italic",lineHeight:1.5}}>
                {WORKS.filter(w=>w.themes.includes(selTheme.id)).map(w=>w.title).join(" · ")}
              </p>
            </div>
            <div style={{background:C.white,border:`1px solid ${C.creamDark}`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:"24px 26px"}}>
              {loading?<LoadingPulse label={loadLabel}/>:(
                <>
                  <NarrativeView sections={sections}/>
                  <ContinueOptions showDeeper={false} onChoose={()=>setScreen("collection")} chooseLabel="Choose another theme" onStart={reset}/>
                </>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════ SITUATION READING */}
        {screen==="situation-reading" && (
          <div>
            <BackBtn onClick={()=>{setScreen("situation");setSections([]);}}/>
            <div style={{background:C.ink,borderRadius:"12px 12px 0 0",padding:"20px 26px"}}>
              <p style={{fontFamily:"Georgia, serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:C.goldLight,opacity:0.8,margin:"0 0 8px"}}>Works that speak to your situation</p>
              <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,fontStyle:"italic",color:"rgba(255,255,255,0.8)",margin:0,lineHeight:1.5}}>"{situation}"</p>
            </div>
            <div style={{background:C.white,border:`1px solid ${C.creamDark}`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:"24px 26px"}}>
              {loading?<LoadingPulse label={loadLabel}/>:(
                <>
                  <NarrativeView sections={sections}/>
                  <ContinueOptions showDeeper={false} onChoose={()=>setScreen("situation")} chooseLabel="Ask another question" onStart={reset}/>
                </>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════ ANY BOOK READING */}
        {screen==="anybook-reading" && (
          <div>
            <BackBtn onClick={()=>{setScreen("anybook");setSections([]);}}/>
            <div style={{background:C.ink,borderRadius:"12px 12px 0 0",padding:"20px 26px"}}>
              <p style={{fontFamily:"Georgia, serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:C.goldLight,opacity:0.8,margin:"0 0 6px"}}>Reader's Addition</p>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:22,fontWeight:700,color:C.white,marginBottom:4}}>{abTitle}</div>
              <div style={{fontFamily:"Georgia, serif",fontSize:13,color:"rgba(255,255,255,0.55)"}}>{abAuthor}{abYear?` · ${abYear}`:""}</div>
              {abNomReason?.trim() && (
                <p style={{fontFamily:"Georgia, serif",fontSize:12,color:"rgba(255,255,255,0.4)",fontStyle:"italic",margin:"8px 0 0",lineHeight:1.5}}>
                  "{abNomReason}"
                </p>
              )}
            </div>
            <div style={{background:C.white,border:`1px solid ${C.creamDark}`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:"24px 26px"}}>
              {loading?<LoadingPulse label={loadLabel}/>:(
                <>
                  <NarrativeView sections={sections}/>
                  <ContinueOptions showDeeper={false} onChoose={()=>setScreen("anybook")} chooseLabel="Add another book" onStart={reset}/>
                </>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef}/>
      </div>
    </div>
  );
}
