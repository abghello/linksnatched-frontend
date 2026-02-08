import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = userData.email
      ? await this.getUserByEmail(userData.email)
      : undefined;

    if (existingUser) {
      const [updated] = await db
        .update(users)
        .set({ name: userData.name })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updated;
    }

    const [user] = await db
      .insert(users)
      .values({
        email: userData.email!,
        name: userData.name,
        status: false,
        role: "user",
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
