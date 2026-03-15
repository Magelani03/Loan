import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { api } from "@/lib/api";

const VERIFY_MESSAGE = "Please verify your email address before logging in.";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setResendMessage(null);
    setLoading(true);
    try {
      const data = await api.post<{ token: string; error?: string }>("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/profile");
    } catch (err: any) {
      const msg = err?.message || "Network error during login";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email?.trim()) {
      setError("Enter your email above, then click Resend verification email.");
      return;
    }
    setResendMessage(null);
    setError(null);
    setResendLoading(true);
    try {
      const data = await api.post<{ message?: string; error?: string }>("/auth/resend-verification", { email: email.trim() });
      setResendMessage(data.message || "If an account exists, a new verification link was sent. Check your inbox and spam.");
    } catch (err: any) {
      setError(err?.message || "Failed to resend email.");
    } finally {
      setResendLoading(false);
    }
  };

  const needsVerification = error === VERIFY_MESSAGE;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="bg-card rounded-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        {resendMessage && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
            {resendMessage}
          </div>
        )}
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-muted/30 rounded-xl p-4 mb-4 border border-border"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-muted/30 rounded-xl p-4 mb-4 border border-border"
        />
        {needsVerification && (
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 mb-4"
            onClick={handleResendVerification}
            disabled={resendLoading}
          >
            {resendLoading ? "Sending…" : "Resend verification email"}
          </Button>
        )}
        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </Button>
        <p className="text-sm text-center text-muted-foreground mt-6">
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Don&apos;t have an account? Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
