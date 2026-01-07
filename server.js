const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const DATA_DIR = path.join(__dirname, "data");
const SUBMISSIONS_PATH = path.join(DATA_DIR, "submissions.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(SUBMISSIONS_PATH)) {
    fs.writeFileSync(
      SUBMISSIONS_PATH,
      JSON.stringify({ submissions: [] }, null, 2)
    );
  }
}

ensureDataFile();

app.post("/api/submit", (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !payload.answers || !payload.result) {
      return res.status(400).json({ error: "Missing answers or result." });
    }

    const db = JSON.parse(fs.readFileSync(SUBMISSIONS_PATH, "utf8"));
    db.submissions.push({
      id: Math.random().toString(16).slice(2),
      createdAt: new Date().toISOString(),
      ...payload
    });

    fs.writeFileSync(SUBMISSIONS_PATH, JSON.stringify(db, null, 2));
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save submission." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
