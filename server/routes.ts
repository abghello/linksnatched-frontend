import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { insertLinkSchema } from "@shared/schema";
import { z } from "zod";

const createLinkSchema = z.object({
  givenUrl: z.string().url("Must be a valid URL"),
  givenTitle: z.string().optional(),
  tags: z.string().optional(),
});

const updateLinkSchema = z.object({
  givenTitle: z.string().optional(),
  tags: z.string().optional(),
});

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get("/api/links", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId;
      const links = await storage.getLinks(userId);
      res.json(links);
    } catch (error) {
      console.error("Error fetching links:", error);
      res.status(500).json({ message: "Failed to fetch links" });
    }
  });

  app.post("/api/links", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId;

      const parsed = createLinkSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const { givenUrl, givenTitle, tags } = parsed.data;
      const domain = extractDomain(givenUrl);
      let displayUrl = givenUrl;
      try {
        const urlObj = new URL(givenUrl);
        displayUrl = urlObj.hostname + urlObj.pathname;
      } catch {}

      const linkData = {
        userId,
        givenUrl,
        givenTitle: givenTitle || null,
        resolvedTitle: givenTitle || null,
        tags: tags || null,
        displayUrl,
        topImageUrl: null,
        resolvedUrl: givenUrl,
        domain,
      };

      const link = await storage.createLink(linkData);
      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating link:", error);
      res.status(500).json({ message: "Failed to create link" });
    }
  });

  app.patch("/api/links/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId;
      const { id } = req.params;

      const parsed = updateLinkSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const updates: Record<string, any> = {};
      if (parsed.data.givenTitle !== undefined) updates.givenTitle = parsed.data.givenTitle;
      if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const link = await storage.updateLink(id, userId, updates);
      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }
      res.json(link);
    } catch (error) {
      console.error("Error updating link:", error);
      res.status(500).json({ message: "Failed to update link" });
    }
  });

  app.delete("/api/links/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.dbUserId;
      const { id } = req.params;
      const deleted = await storage.deleteLink(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Link not found" });
      }
      res.json({ message: "Link deleted" });
    } catch (error) {
      console.error("Error deleting link:", error);
      res.status(500).json({ message: "Failed to delete link" });
    }
  });

  return httpServer;
}
