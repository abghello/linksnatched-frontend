import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const candidates = [
    path.resolve(__dirname, "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(__dirname, "..", "dist", "public"),
  ];

  let distPath: string | null = null;
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      distPath = candidate;
      break;
    }
  }

  if (!distPath) {
    console.error(
      `Could not find the build directory. Tried: ${candidates.join(", ")}. ` +
      `__dirname=${__dirname}, cwd=${process.cwd()}`
    );
    app.use("/{*path}", (_req, res) => {
      res.status(503).send("Application is starting up. Please try again shortly.");
    });
    return;
  }

  console.log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath!, "index.html"));
  });
}
