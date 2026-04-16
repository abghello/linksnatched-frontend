import express, { type Request, Response, NextFunction } from "express";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.set("trust proxy", 1);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

let routesRegistered = false;

async function ensureRoutes() {
  if (routesRegistered) return;
  const { createServer } = await import("http");
  const { registerRoutes } = await import("../server/routes");
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);
  routesRegistered = true;
}

const routesPromise = ensureRoutes();

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("Internal Server Error:", err);
  if (!res.headersSent) {
    res.status(status).json({ message });
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await routesPromise;
  return app(req as any, res as any);
}
