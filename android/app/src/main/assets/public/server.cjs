var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);

// src/server/crawler.ts
var import_node_cron = __toESM(require("node-cron"), 1);
var import_axios = __toESM(require("axios"), 1);
var cheerio = __toESM(require("cheerio"), 1);
var import_firestore2 = require("firebase/firestore");

// src/firebase.ts
var import_app = require("firebase/app");
var import_auth = require("firebase/auth");
var import_firestore = require("firebase/firestore");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "gen-lang-client-0681832794",
  appId: "1:1067794861975:web:c1991e8fac4b901679fed2",
  apiKey: "AIzaSyAIjHR1qZ_6ev2mqn618kmPVFABsMG9UFo",
  authDomain: "gen-lang-client-0681832794.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-6c0972d3-40ff-449d-96fd-046dcc269954",
  storageBucket: "gen-lang-client-0681832794.firebasestorage.app",
  messagingSenderId: "1067794861975",
  measurementId: ""
};

// src/firebase.ts
var app = (0, import_app.initializeApp)(firebase_applet_config_default);
var db = (0, import_firestore.getFirestore)(app, firebase_applet_config_default.firestoreDatabaseId);
var auth = (0, import_auth.getAuth)(app);
var googleProvider = new import_auth.GoogleAuthProvider();

// src/server/crawler.ts
var CRAWL_TARGETS = [
  { name: "FBRef", url: "https://fbref.com/en/comps/9/Premier-League-Stats", type: "past" },
  { name: "Understat", url: "https://understat.com/league/EPL", type: "live" },
  { name: "WhoScored", url: "https://1xbet.whoscored.com/Regions/252/Tournaments/2/England-Premier-League", type: "statistics" },
  { name: "FlashScore", url: "https://www.flashscore.com/", type: "upcoming" }
];
function startSilentBackgroundCrawler() {
  console.log("[CrawlerService] \u{1F577}\uFE0F Crawl4AI-style Node Background Crawler initialized. Mode: Silent.");
  import_node_cron.default.schedule("*/10 * * * *", async () => {
    console.log(`[CrawlerService] Starting background crawl cycle for past, live, and upcoming statistics...`);
    const timestamp = /* @__PURE__ */ new Date();
    const batchData = [];
    for (const target of CRAWL_TARGETS) {
      try {
        const res = await import_axios.default.get(target.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
          },
          timeout: 1e4
        });
        const $ = cheerio.load(res.data);
        const bodyText = $("body").text().replace(/\s+/g, " ").substring(0, 5e3);
        batchData.push({
          source: target.name,
          type: target.type,
          status: "success",
          dataLength: bodyText.length,
          timestamp
        });
      } catch (err) {
        batchData.push({
          source: target.name,
          type: target.type,
          status: "failed",
          error: err.message,
          timestamp
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 2e3));
    }
    try {
      await (0, import_firestore2.addDoc)((0, import_firestore2.collection)(db, "crawler_logs"), {
        cycleAt: timestamp,
        results: batchData
      });
    } catch (e) {
      console.error("[CrawlerService] Failed to index crawled data to database:", e);
    }
  });
}

// server.ts
import_dotenv.default.config();
startSilentBackgroundCrawler();
async function startServer() {
  const app2 = (0, import_express.default)();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  app2.use(import_express.default.json({ limit: "50mb" }));
  app2.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
  app2.get("/api/elo/:team", async (req, res) => {
    const { team } = req.params;
    try {
      const response = await fetch(`http://api.clubelo.com/${team}`);
      const text = await response.text();
      res.send(text);
    } catch (error) {
      console.error("Club ELO proxy error:", error);
      res.status(500).send("Failed to fetch ELO data");
    }
  });
  app2.get("/api/elo/:team/history", async (req, res) => {
    const { team } = req.params;
    try {
      const response = await fetch(`http://api.clubelo.com/${team}/history`);
      const text = await response.text();
      res.send(text);
    } catch (error) {
      console.error("Club ELO history proxy error:", error);
      res.status(500).send("Failed to fetch ELO history");
    }
  });
  app2.get("/api/search", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).send("Query required");
    try {
      const response = await fetch("https://lite.duckduckgo.com/lite/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ q: query })
      });
      const html = await response.text();
      const load2 = await import("cheerio");
      const $ = load2.load(html);
      const results = [];
      $(".result-snippet").each((i, el) => {
        if (i < 5) results.push($(el).text().trim());
      });
      res.json({ results });
    } catch (error) {
      console.error("Search proxy error:", error);
      res.status(500).send("Search failed");
    }
  });
  app2.post("/api/gemini/generate", async (req, res) => {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      let apiKey = process.env.GEMINI_API_KEY;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const clientKey = authHeader.substring(7).trim();
        if (clientKey.length > 5) apiKey = clientKey;
      }
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      const ai = new GoogleGenAI({ apiKey });
      const { model, contents, config } = req.body;
      const response = await ai.models.generateContent({
        model: model || "gemini-flash-latest",
        contents,
        config
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/gemini/stream", async (req, res) => {
    try {
      const GoogleGenAI = (await import("@google/genai")).GoogleGenAI;
      let apiKey = process.env.GEMINI_API_KEY;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const clientKey = authHeader.substring(7).trim();
        if (clientKey.length > 5) apiKey = clientKey;
      }
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      const ai = new GoogleGenAI({ apiKey });
      const { model, contents, config } = req.body;
      const responseStream = await ai.models.generateContentStream({
        model: model || "gemini-flash-latest",
        contents,
        config
      });
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}

`);
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Gemini stream proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  const distPath = import_path.default.join(process.cwd(), "dist");
  if (process.env.NODE_ENV !== "production" && !process.argv[1]?.endsWith("server.cjs")) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: false
        },
        appType: "spa"
      });
      app2.use(vite.middlewares);
    } catch (err) {
      console.warn("Vite not available, falling back to static serving");
      app2.use(import_express.default.static(distPath));
      app2.get("*", (req, res) => {
        res.sendFile(import_path.default.join(distPath, "index.html"));
      });
    }
  } else {
    app2.use(import_express.default.static(distPath));
    app2.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app2.use((err, req, res, next) => {
    console.error("Global express error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
      type: err.type || "UnknownError"
    });
  });
  console.log(`[Express] Attempting to listen on port ${PORT}...`);
  app2.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
