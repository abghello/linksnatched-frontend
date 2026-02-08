import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { supabase } from "../../supabaseClient";

export function registerAuthRoutes(app: Express): void {
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || null },
        },
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      if (!data.user) {
        return res.status(400).json({ message: "Signup failed" });
      }

      const dbUser = await authStorage.upsertUser({
        email,
        name: name || null,
      });

      (req.session as any).user = {
        dbUserId: dbUser.id,
        email: dbUser.email,
        supabaseUserId: data.user.id,
      };

      res.json(dbUser);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ message: error.message });
      }

      if (!data.user) {
        return res.status(401).json({ message: "Login failed" });
      }

      const dbUser = await authStorage.upsertUser({
        email: data.user.email!,
        name: data.user.user_metadata?.name || null,
      });

      (req.session as any).user = {
        dbUserId: dbUser.id,
        email: dbUser.email,
        supabaseUserId: data.user.id,
      };

      res.json(dbUser);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const dbUserId = req.user.dbUserId;
      const user = await authStorage.getUser(dbUserId);
      if (user) {
        return res.json(user);
      }
      res.status(404).json({ message: "User not found" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
