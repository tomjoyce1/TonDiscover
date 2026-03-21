import { Link, useLocation } from "react-router-dom";
import { Compass, Plus, User } from "lucide-react";
import { cx } from "@/helpers/class-name.ts";

export const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-12 items-center justify-center gap-12 border-t border-border bg-background/95 backdrop-blur-md">
      <Link
        to="/explore"
        className={cx(
          "flex items-center justify-center transition-colors",
          pathname === "/explore" || pathname === "/" ? "text-white" : "text-muted-foreground"
        )}
      >
        <Compass className="h-6 w-6" strokeWidth={pathname === "/explore" || pathname === "/" ? 3 : 1.5} />
      </Link>

      <Link to="/create" className="flex items-center justify-center" aria-label="Create">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-transform active:scale-95">
          <Plus className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
        </div>
      </Link>

      <Link
        to="/profile"
        className={cx(
          "flex items-center justify-center transition-colors",
          pathname.startsWith("/profile") ? "text-white" : "text-muted-foreground"
        )}
      >
        <User className="h-6 w-6" strokeWidth={pathname.startsWith("/profile") ? 3 : 1.5} />
      </Link>
    </nav>
  );
};
