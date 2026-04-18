import { Link, useNavigate } from "react-router-dom";
import { LogOut, UserRound, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";

export function Header() {
  const { user, clear } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-brand">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
            <BedDouble className="h-4 w-4" />
          </div>
          <span className="text-lg">
            Broke<span className="text-brand-accent">Booker</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/my-bookings">
                  <UserRound className="mr-1 h-4 w-4" /> {user.name.split(" ")[0]}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clear();
                  nav("/");
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button variant="accent" size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
