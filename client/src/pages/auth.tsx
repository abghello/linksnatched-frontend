import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2, ArrowRight, Loader2, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

function parseHashParams(): Record<string, string> {
  const hash = window.location.hash.substring(1);
  if (!hash) return {};
  const params: Record<string, string> = {};
  hash.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key && value) params[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return params;
}

type AuthMode = "login" | "signup" | "reset" | "recovery";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [recoveryToken, setRecoveryToken] = useState<{ access_token: string; refresh_token: string } | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const params = parseHashParams();
    if (params.type === "recovery" && params.access_token) {
      setMode("recovery");
      setRecoveryToken({
        access_token: params.access_token,
        refresh_token: params.refresh_token || "",
      });
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/signup", { email, password, name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Signup failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/reset-password", { email });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reset email sent",
        description: data.message || "Check your inbox for a password reset link.",
      });
      setMode("login");
    },
    onError: (error: Error) => {
      toast({
        title: "Reset failed",
        description: error.message || "Could not send reset email",
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!recoveryToken) throw new Error("No recovery token");
      const res = await apiRequest("POST", "/api/auth/update-password", {
        access_token: recoveryToken.access_token,
        refresh_token: recoveryToken.refresh_token,
        new_password: password,
      });
      return res.json();
    },
    onSuccess: () => {
      setRecoverySuccess(true);
      setPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Password update failed",
        description: error.message || "Could not update password",
        variant: "destructive",
      });
    },
  });

  const isPending =
    loginMutation.isPending ||
    signupMutation.isPending ||
    resetMutation.isPending ||
    updatePasswordMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "recovery") {
      if (password !== confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure both passwords are the same.",
          variant: "destructive",
        });
        return;
      }
      updatePasswordMutation.mutate();
    } else if (mode === "reset") {
      resetMutation.mutate();
    } else if (mode === "login") {
      loginMutation.mutate();
    } else {
      signupMutation.mutate();
    }
  };

  const heading = {
    login: "Welcome back",
    signup: "Create your account",
    reset: "Reset your password",
    recovery: "Set a new password",
  }[mode];

  const subheading = {
    login: "Sign in to access your saved links",
    signup: "Start organizing your links today",
    reset: "Enter your email and we'll send you a reset link",
    recovery: "Choose a new password for your account",
  }[mode];

  const submitLabel = {
    login: "Sign in",
    signup: "Create account",
    reset: "Send reset link",
    recovery: "Update password",
  }[mode];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#667EEA] to-[#764BA2]">
              <Link2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Linksnatched</span>
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-[#667EEA] to-[#764BA2]">
              <Link2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              {recoverySuccess ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <p className="text-center font-medium">Password updated successfully!</p>
                  <p className="text-center text-sm text-muted-foreground">
                    You can now sign in with your new password.
                  </p>
                  <Button
                    onClick={() => {
                      setMode("login");
                      setRecoverySuccess(false);
                      setRecoveryToken(null);
                    }}
                    className="w-full bg-gradient-to-r from-[#667EEA] to-[#764BA2] border-[#764BA2] text-white"
                    data-testid="button-go-to-login"
                  >
                    Go to sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10"
                            data-testid="input-name"
                          />
                        </div>
                      </div>
                    )}
                    {mode !== "recovery" && (
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10"
                            data-testid="input-email"
                          />
                        </div>
                      </div>
                    )}
                    {(mode === "login" || mode === "signup" || mode === "recovery") && (
                      <div className="space-y-2">
                        <Label htmlFor="password">
                          {mode === "recovery" ? "New password" : "Password"}
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder={mode === "recovery" ? "Enter new password" : "Enter your password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="pl-10"
                            data-testid="input-password"
                          />
                        </div>
                      </div>
                    )}
                    {mode === "recovery" && (
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm new password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="pl-10"
                            data-testid="input-confirm-password"
                          />
                        </div>
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#667EEA] to-[#764BA2] border-[#764BA2] text-white"
                      disabled={isPending}
                      data-testid="button-submit-auth"
                    >
                      {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {submitLabel}
                      {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>

                  {mode === "login" && (
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setMode("reset")}
                        className="text-sm font-medium text-[#667EEA] hover:underline"
                        data-testid="button-cant-login"
                      >
                        Can't login?
                      </button>
                    </div>
                  )}

                  <div className="mt-4 text-center text-sm">
                    {mode === "reset" || mode === "recovery" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          setRecoveryToken(null);
                        }}
                        className="font-medium text-[#667EEA] hover:underline"
                        data-testid="button-back-to-login"
                      >
                        Back to sign in
                      </button>
                    ) : (
                      <>
                        <span className="text-muted-foreground">
                          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMode(mode === "login" ? "signup" : "login")}
                          className="font-medium text-[#667EEA] hover:underline"
                          data-testid="button-toggle-auth-mode"
                        >
                          {mode === "login" ? "Sign up" : "Sign in"}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
