import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { login } from "@/api/auth";
import { useAuth } from "@/store/auth";
import type { AxiosError } from "axios";

export function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const setAuth = useAuth((s) => s.setAuth);
  const nav = useNavigate();
  const loc = useLocation();
  const { push } = useToast();

  const mutation = useMutation({
    mutationFn: () => login({ email, password }),
    onSuccess: (r) => {
      setAuth(r.token, r.user);
      const redirect = (loc.state as { from?: { pathname: string } } | null)?.from?.pathname;
      nav(redirect ?? "/");
    },
    onError: (err) => {
      push({
        title: "Login failed",
        description:
          (err as AxiosError<{ message?: string }>).response?.data?.message ??
          "Check your credentials.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to continue booking.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <Input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="accent"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Log in
          </Button>
          <p className="text-center text-sm text-slate-500">
            New here?{" "}
            <Link to="/signup" className="font-medium text-brand-accent">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
