import { links, type Link, type InsertLink } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getLinks(userId: string): Promise<Link[]>;
  getLink(id: string, userId: string): Promise<Link | undefined>;
  createLink(link: InsertLink): Promise<Link>;
  updateLink(id: string, userId: string, data: Partial<InsertLink>): Promise<Link | undefined>;
  deleteLink(id: string, userId: string): Promise<boolean>;
}

class DatabaseStorage implements IStorage {
  async getLinks(userId: string): Promise<Link[]> {
    return db
      .select()
      .from(links)
      .where(eq(links.userId, userId))
      .orderBy(desc(links.createdAt));
  }

  async getLink(id: string, userId: string): Promise<Link | undefined> {
    const [link] = await db
      .select()
      .from(links)
      .where(and(eq(links.id, id), eq(links.userId, userId)));
    return link;
  }

  async createLink(link: InsertLink): Promise<Link> {
    const [created] = await db.insert(links).values(link).returning();
    return created;
  }

  async updateLink(id: string, userId: string, data: Partial<InsertLink>): Promise<Link | undefined> {
    const [updated] = await db
      .update(links)
      .set(data)
      .where(and(eq(links.id, id), eq(links.userId, userId)))
      .returning();
    return updated;
  }

  async deleteLink(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(links)
      .where(and(eq(links.id, id), eq(links.userId, userId)))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
