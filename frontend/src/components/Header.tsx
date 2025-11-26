import { Link, useLocation, useNavigate } from "react-router-dom";
import { HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogin = () => navigate("/login");
  const handleSignup = () => navigate("/signup");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <HandCoins className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground">LOAN</span>
              <span className="text-xs text-muted-foreground">financially Health</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/loan-types"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/loan-types") ? "text-primary" : "text-foreground"
              }`}
            >
              Loan Types
            </Link>
            <Link
              to="/apply"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/apply") ? "text-primary" : "text-foreground"
              }`}
            >
              Apply
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/contact") ? "text-primary" : "text-foreground"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={handleLogin}
            >
              Login
            </Button>
            <Button size="sm" onClick={handleSignup}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
