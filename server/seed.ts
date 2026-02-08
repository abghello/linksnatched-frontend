import { db } from "./db";
import { links } from "@shared/schema";
import { sql } from "drizzle-orm";

const sampleLinks = [
  {
    userId: "__seed__",
    resolvedTitle: "React Documentation - Getting Started",
    givenTitle: "React Docs",
    tags: "react, javascript, frontend",
    displayUrl: "react.dev/learn",
    topImageUrl: null,
    givenUrl: "https://react.dev/learn",
    resolvedUrl: "https://react.dev/learn",
    domain: "react.dev",
    favorite: true,
  },
  {
    userId: "__seed__",
    resolvedTitle: "TypeScript Handbook - The Basics",
    givenTitle: "TS Handbook",
    tags: "typescript, programming, docs",
    displayUrl: "typescriptlang.org/docs/handbook/2/basic-types.html",
    topImageUrl: null,
    givenUrl: "https://www.typescriptlang.org/docs/handbook/2/basic-types.html",
    resolvedUrl: "https://www.typescriptlang.org/docs/handbook/2/basic-types.html",
    domain: "typescriptlang.org",
    favorite: false,
  },
  {
    userId: "__seed__",
    resolvedTitle: "Tailwind CSS - Utility-First CSS Framework",
    givenTitle: "Tailwind CSS",
    tags: "css, design, frontend",
    displayUrl: "tailwindcss.com/docs",
    topImageUrl: null,
    givenUrl: "https://tailwindcss.com/docs",
    resolvedUrl: "https://tailwindcss.com/docs",
    domain: "tailwindcss.com",
    favorite: true,
  },
  {
    userId: "__seed__",
    resolvedTitle: "PostgreSQL Tutorial - Learn SQL",
    givenTitle: "PostgreSQL Tutorial",
    tags: "database, sql, backend",
    displayUrl: "postgresqltutorial.com",
    topImageUrl: null,
    givenUrl: "https://www.postgresqltutorial.com/",
    resolvedUrl: "https://www.postgresqltutorial.com/",
    domain: "postgresqltutorial.com",
    favorite: false,
  },
  {
    userId: "__seed__",
    resolvedTitle: "MDN Web Docs - Web APIs Reference",
    givenTitle: "MDN Web APIs",
    tags: "web, api, reference, mdn",
    displayUrl: "developer.mozilla.org/en-US/docs/Web/API",
    topImageUrl: null,
    givenUrl: "https://developer.mozilla.org/en-US/docs/Web/API",
    resolvedUrl: "https://developer.mozilla.org/en-US/docs/Web/API",
    domain: "developer.mozilla.org",
    favorite: false,
  },
];

export async function seedDatabase() {
  // Seed data is only inserted for demo; actual users will have their own links
  // We don't insert seed data with userId "__seed__" since they won't be visible
  // to any real user. The seed function is kept as a placeholder.
  console.log("Database ready - no seed data needed for this app.");
}
