// Minimal backend: serves the site and stores enquiries in server/data/enquiries.json
const express = require("express"),
  fs = require("fs"),
  path = require("path");
const app = express(),
  FILE = path.join(__dirname, "data", "enquiries.json");
const ADMIN = process.env.ADMIN_TOKEN || "";
app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "..")));
// ---- AI assistant: POST /api/chat uses the Claude API. Needs ANTHROPIC_API_KEY (Node 18+ for built-in fetch). ----
const KEY = process.env.ANTHROPIC_API_KEY || "",
  MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001";
let SITE = {};
try {
  const ctx = { window: {} };
  require("vm").runInNewContext(
    fs.readFileSync(path.join(__dirname, "..", "js", "data.js"), "utf8"),
    ctx
  );
  SITE = ctx.window.OLT || {};
} catch (e) {}
const J = (o) => JSON.stringify(o || []);
const SYSTEM = `You are the website assistant for Oltera Language Studio, which offers IELTS coaching and study abroad guidance (UK, US, Canada, Australia, New Zealand, Ireland, Germany).
Answer visitors' questions using only the information below. Be warm, clear and brief: plain text only, no markdown, under 90 words.
Never invent prices, scores, dates, guarantees or university names. Figures marked "sample" are placeholders, so do not quote them as facts. Typical IELTS scores vary by university and course, and the studio confirms them for each student.
If the answer is not covered, say you are not sure and invite the visitor to book the free counselling session using the form at the bottom of the page. Do not give legal or immigration advice beyond the checklist below.
IELTS plans (prices are placeholders): Self-study Rs 999 (module drills, two mock tests a month, progress record); Studio Rs 3,499 (adds teacher-marked writing and a weekly speaking session); Intensive Rs 7,999 (daily live classes, speaking twice a week, help booking the test date).
Countries (name, typical IELTS, intakes, note): ${J(SITE.countries)}
FAQ: ${J(SITE.faqs)}
About Oltera (story and goal): ${J(SITE.about)}
Why Oltera: ${J(SITE.why)}
IELTS modules: ${J(SITE.mods && Object.entries(SITE.mods))}
Application steps: ${J(SITE.steps)}
Visa documents for everyone: ${J(SITE.visaBase)}
Extra visa documents by country: ${J(SITE.visaExtra)}`;
const hits = new Map();
app.post("/api/chat", async (req, res) => {
  if (!KEY) return res.status(503).json({ error: "AI not configured" });
  const now = Date.now(),
    h = (hits.get(req.ip) || []).filter((t) => now - t < 60000);
  h.push(now);
  hits.set(req.ip, h);
  if (h.length > 15)
    return res
      .status(429)
      .json({ error: "Too many questions, please wait a minute." });
  let msgs = (Array.isArray(req.body && req.body.messages)
    ? req.body.messages
    : []
  )
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim()
    )
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  const out = [];
  for (const m of msgs) {
    const l = out[out.length - 1];
    if (l && l.role === m.role) l.content += "\n" + m.content;
    else out.push(m);
  }
  if (!out.length || out[out.length - 1].role !== "user")
    return res.status(400).json({ error: "Send a question." });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: SYSTEM,
        messages: out,
      }),
    });
    if (!r.ok) throw new Error("API " + r.status);
    const j = await r.json(),
      reply = (j.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
    if (!reply) throw new Error("empty");
    res.json({ reply });
  } catch (e) {
    console.error("chat:", e.message);
    res.status(502).json({ error: "AI unavailable" });
  }
});
const read = () => {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch (e) {
    return [];
  }
};
app.post("/api/enquiry", (req, res) => {
  const { name, email, country } = req.body || {};
  if (!name || !/^\S+@\S+\.\S+$/.test(email || ""))
    return res
      .status(400)
      .json({ error: "Name and a valid email are required." });
  const all = read();
  all.push({
    name: String(name).slice(0, 100),
    email: String(email).slice(0, 200),
    country: String(country || "").slice(0, 60),
    at: new Date().toISOString(),
  });
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(all, null, 2));
  res.json({ ok: true });
});
// View enquiries: GET /api/enquiries with header "x-admin-token: <ADMIN_TOKEN>"
app.get("/api/enquiries", (req, res) => {
  if (!ADMIN || req.get("x-admin-token") !== ADMIN)
    return res.status(401).json({ error: "Unauthorised" });
  res.json(read());
});
app.listen(process.env.PORT || 3000, () =>
  console.log(
    "Oltera running on http://localhost:" + (process.env.PORT || 3000)
  )
);
