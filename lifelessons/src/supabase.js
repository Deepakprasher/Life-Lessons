// src/supabase.js
// Supabase database connection for Life Lessons companion
// Stores: private reader collections + communal library

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── Generic fetch helper ──────────────────────────────────────────────────────
async function supaFetch(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("Supabase not configured — storage disabled");
    return null;
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

// ── Private collection (uses browser localStorage as user identifier) ─────────
function getReaderId() {
  let id = localStorage.getItem("ll_reader_id");
  if (!id) {
    id = "reader_" + Math.random().toString(36).slice(2, 11);
    localStorage.setItem("ll_reader_id", id);
  }
  return id;
}

// ── My Collection — private ───────────────────────────────────────────────────
export async function saveToMyCollection(entry) {
  return supaFetch("my_collection", {
    method: "POST",
    body: JSON.stringify({ ...entry, reader_id: getReaderId() }),
  });
}

export async function loadMyCollection() {
  const readerId = getReaderId();
  const data = await supaFetch(
    `my_collection?reader_id=eq.${encodeURIComponent(readerId)}&order=date_added.desc`
  );
  return data || [];
}

// ── Communal Library — public ─────────────────────────────────────────────────
export async function saveToCommunalLibrary(entry) {
  return supaFetch("communal_library", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

export async function loadCommunalLibrary() {
  const data = await supaFetch("communal_library?order=date_added.desc&limit=100");
  return data || [];
}
