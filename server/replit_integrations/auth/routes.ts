import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const dbUserId = req.user.dbUserId;
      if (dbUserId) {
        const user = await authStorage.getUser(dbUserId);
        if (user) {
          return res.json(user);
        }
      }

      const email = req.user.claims?.email;
      if (email) {
        const user = await authStorage.getUserByEmail(email);
        if (user) {
          return res.json(user);
        }
      }

      res.status(404).json({ message: "User not found" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
