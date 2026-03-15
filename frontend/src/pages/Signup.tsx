import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const Signup = () => {
  const [form, setForm] = useState({ name: "", surname: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.email?.trim() || !form.password?.trim()) {
      setError("Email and password are required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await api.post<{ message?: string; error?: string }>("/auth/signup", form);
      setSuccessMessage(
        data.message || "Account created. Please check your email to verify your account.",
      );
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Network error during signup");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl p-8 w-full max-w-md text-center">
          <div className="rounded-full bg-green-500/20 text-green-600 dark:text-green-400 w-14 h-14 flex items-center justify-center mx-auto mb-6 text-2xl">
            ✓
          </div>
          <h1 className="text-2xl font-bold mb-3">Check your email</h1>
          <p className="text-muted-foreground mb-6">{successMessage}</p>
          <p className="text-sm text-muted-foreground mb-6">
            Click the link in the email to verify your account, then come back here to log in.
          </p>
          <Button asChild className="w-full h-12">
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form onSubmit={handleSignup} className="bg-card rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Sign Up</h1>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-muted/30 rounded-xl p-4 mb-4 border border-border"
        />
        <input
          placeholder="Surname"
          value={form.surname}
          onChange={(e) => setForm({ ...form, surname: e.target.value })}
          className="w-full bg-muted/30 rounded-xl p-4 mb-4 border border-border"
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-muted/30 rounded-xl p-4 mb-4 border border-border"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full bg-muted/30 rounded-xl p-4 mb-6 border border-border"
        />
        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? "Creating account…" : "Create Account"}
        </Button>
        <p className="text-sm text-center text-muted-foreground mt-6">
          <Link
            to="/login"
            className="text-primary font-medium hover:underline focus:outline-none focus:underline"
          >
            Already have an account? Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
