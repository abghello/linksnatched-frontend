import { Link2, Bookmark, Shield, Zap, ArrowRight, Globe, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: Bookmark,
    title: "Save Any Link",
    description: "Capture links from anywhere on the web instantly. Titles, URLs, and metadata are automatically resolved.",
  },
  {
    icon: Tag,
    title: "Organize with Tags",
    description: "Tag and categorize your links for quick retrieval. Find what you need in seconds, not minutes.",
  },
  {
    icon: Globe,
    title: "Access Everywhere",
    description: "Your links are synced across all your devices. Access your collection from any browser, anytime.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#667EEA] to-[#764BA2]">
              <Link2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Linksnatched</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="/auth">
              <Button data-testid="button-login">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#667EEA]/20 to-[#764BA2]/20 blur-3xl" />
            <div className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#764BA2]/10 to-[#667EEA]/10 blur-3xl" />
          </div>
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-[#667EEA]" />
                Smart link management for everyone
              </div>
              <h1 className="mb-6 font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Snatch, Save &{" "}
                <span className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                  Organize
                </span>{" "}
                Your Links
              </h1>
              <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
                Never lose an important link again. Linksnatched automatically captures, categorizes, and organizes all your web links in one beautiful dashboard.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a href="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] border-[#764BA2] text-white" data-testid="button-hero-login">
                    Start Snatching Links
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Free forever plan
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" />
                  No credit card required
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t py-20 sm:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to{" "}
                <span className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
                  manage links
                </span>
              </h2>
              <p className="text-muted-foreground">
                A powerful yet simple toolkit for organizing your digital bookmarks.
              </p>
            </div>
            <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="hover-elevate">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-[#667EEA]/10 to-[#764BA2]/10">
                      <feature.icon className="h-5 w-5 text-[#667EEA]" />
                    </div>
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Linksnatched. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
