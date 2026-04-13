import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import brandLogo from "@/assets/aunty-d-logo.png";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return !!localStorage.getItem("token");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const updateAuth = () => {
      try {
        setIsLoggedIn(!!localStorage.getItem("token"));
      } catch {
        setIsLoggedIn(false);
      }
    };

    window.addEventListener("storage", updateAuth);
    window.addEventListener("auth-changed", updateAuth as EventListener);

    return () => {
      window.removeEventListener("storage", updateAuth);
      window.removeEventListener("auth-changed", updateAuth as EventListener);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleLogin = () => navigate("/login");
  const handleSignup = () => navigate("/signup");
  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-changed"));
    } catch {
      // ignore
    }
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group shrink-0">
            <img
              src={brandLogo}
              alt="AUNTY D — Your bridge to better finance"
              className="h-12 sm:h-14 w-auto max-h-[3.5rem] object-contain object-left"
            />
            <span className="sr-only">AUNTY D: Financial Health</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {!isLoggedIn ? (
              <>
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
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/") ? "text-primary" : "text-foreground"
                  }`}
                >
                  Home
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
                  to="/profile"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/profile") || isActive("/account-details") || isActive("/edit-profile")
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  My Account
                </Link>
                <Link
                  to="/loan-status"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/loan-status") ? "text-primary" : "text-foreground"
                  }`}
                >
                  Loan Status
                </Link>
                <Link
                  to="/history"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/history") ? "text-primary" : "text-foreground"
                  }`}
                >
                  History
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <>
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
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
