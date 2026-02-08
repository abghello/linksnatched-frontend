import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Link } from "@shared/schema";
import {
  Link2,
  Search,
  Plus,
  ExternalLink,
  Trash2,
  ArrowUpDown,
  Globe,
  Calendar,
  Loader2,
  LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

type SortField = "resolvedTitle" | "domain" | "createdAt";
type SortDir = "asc" | "desc";

function AddLinkDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");

  const addLink = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/links", {
        givenUrl: url,
        givenTitle: title || undefined,
        tags: tags || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({ title: "Link saved", description: "Your link has been added." });
      setUrl("");
      setTitle("");
      setTags("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Link</DialogTitle>
          <DialogDescription>Save a link to your collection.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              data-testid="input-link-url"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="My awesome article"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-link-title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              placeholder="tech, reading, tutorial"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              data-testid="input-link-tags"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => addLink.mutate()}
            disabled={!url.trim() || addLink.isPending}
            data-testid="button-save-link"
          >
            {addLink.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LinkTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { data: links = [], isLoading } = useQuery<Link[]>({
    queryKey: ["/api/links"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({ title: "Link deleted" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = links
    .filter((link) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        link.resolvedTitle?.toLowerCase().includes(q) ||
        link.givenTitle?.toLowerCase().includes(q) ||
        link.givenUrl?.toLowerCase().includes(q) ||
        link.domain?.toLowerCase().includes(q) ||
        link.tags?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "resolvedTitle") {
        cmp = (a.resolvedTitle || "").localeCompare(b.resolvedTitle || "");
      } else if (sortField === "domain") {
        cmp = (a.domain || "").localeCompare(b.domain || "");
      } else {
        cmp =
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  const displayName = user?.name?.split(" ")[0] || "";

  const stats = {
    total: links.length,
    domains: new Set(links.map((l) => l.domain).filter(Boolean)).size,
    tags: new Set(
      links
        .flatMap((l) => l.tags?.split(",").map((t) => t.trim()) || [])
        .filter(Boolean)
    ).size,
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="border-b bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight" data-testid="text-dashboard-title">
              Welcome back{displayName ? `, ${displayName}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your saved links
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} data-testid="button-add-link">
            <Plus className="mr-2 h-4 w-4" />
            Add Link
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <span className="text-sm text-muted-foreground">Total Links</span>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-links">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <span className="text-sm text-muted-foreground">Domains</span>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-domains">{stats.domains}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <span className="text-sm text-muted-foreground">Tags</span>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-tags">{stats.tags}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 pb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-links"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <LinkTableSkeleton />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-muted">
                  <Link2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mb-1 font-semibold">No links yet</h3>
                <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                  {search
                    ? "No links match your search. Try different keywords."
                    : "Get started by adding your first link."}
                </p>
                {!search && (
                  <Button variant="outline" onClick={() => setAddOpen(true)} data-testid="button-add-first-link">
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first link
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("resolvedTitle")}
                          className="no-default-hover-elevate no-default-active-elevate -ml-3"
                          data-testid="button-sort-title"
                        >
                          Title
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("domain")}
                          className="no-default-hover-elevate no-default-active-elevate -ml-3"
                          data-testid="button-sort-domain"
                        >
                          Domain
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("createdAt")}
                          className="no-default-hover-elevate no-default-active-elevate -ml-3"
                          data-testid="button-sort-date"
                        >
                          Added
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((link) => (
                      <TableRow key={link.id} data-testid={`row-link-${link.id}`}>
                        <TableCell>
                          <div className="max-w-[280px]">
                            <a
                              href={link.resolvedUrl || link.givenUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 font-medium hover:underline"
                              data-testid={`link-url-${link.id}`}
                            >
                              <span className="truncate">
                                {link.resolvedTitle || link.givenTitle || link.givenUrl || "Untitled"}
                              </span>
                              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                            </a>
                            <span className="block truncate text-xs text-muted-foreground mt-0.5">
                              {link.displayUrl || link.givenUrl}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {link.tags
                              ?.split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                              .slice(0, 3)
                              .map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{link.domain || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
                            <Calendar className="h-3 w-3" />
                            {link.createdAt
                              ? format(new Date(link.createdAt), "MMM d, yyyy")
                              : "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(link.id)}
                            data-testid={`button-delete-${link.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-3 text-sm text-muted-foreground" data-testid="text-link-count">
          {filtered.length} link{filtered.length !== 1 ? "s" : ""} found
        </div>
      </div>

      <AddLinkDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
