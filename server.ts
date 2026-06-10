import express from "express";
import path from "path";
import dotenv from "dotenv";
import { startSilentBackgroundCrawler } from './src/server/crawler';

dotenv.config();

// Initialize background statistics crawler (silent updates)
startSilentBackgroundCrawler();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Proxy for Club ELO
  app.get("/api/elo/:team", async (req, res) => {
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

  app.get("/api/elo/:team/history", async (req, res) => {
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

  app.get("/api/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.status(400).send("Query required");
    try {
      const response = await fetch('https://lite.duckduckgo.com/lite/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ q: query })
      });
      const html = await response.text();
      const load = await import('cheerio');
      const $ = load.load(html);
      const results: string[] = [];
      $('.result-snippet').each((i, el) => {
        if (i < 5) results.push($(el).text().trim());
      });
      res.json({ results });
    } catch (error) {
      console.error("Search proxy error:", error);
      res.status(500).send("Search failed");
    }
  });

  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      let apiKey = process.env.GEMINI_API_KEY;
      
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
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
          contents: contents,
          config: config
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/stream", async (req, res) => {
    try {
      const GoogleGenAI = (await import('@google/genai')).GoogleGenAI;
      let apiKey = process.env.GEMINI_API_KEY;
      
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
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
          contents: contents,
          config: config
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of responseStream) {
          if (chunk.text) {
              res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error("Gemini stream proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development vs Static serving for production
  const distPath = path.join(process.cwd(), 'dist');
  
  // If we are strictly not in production and we're not running the bundled server.cjs
  if (process.env.NODE_ENV !== "production" && !process.argv[1]?.endsWith('server.cjs')) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: false
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn("Vite not available, falling back to static serving");
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    // Production Mode
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler to prevent Express from sending HTML errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global express error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
      type: err.type || "UnknownError"
    });
  });

  console.log(`[Express] Attempting to listen on port ${PORT}...`);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
