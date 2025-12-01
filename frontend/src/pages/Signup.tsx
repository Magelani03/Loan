import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Signup = () => {
  const [form, setForm] = useState({ name: "", surname: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Response was not JSON (e.g. HTML error page or empty body)
      }

      if (!res.ok) {
        const message = (data && data.error) || `Signup failed (${res.status} ${res.statusText})`;
        alert(message);
        return;
      }

      alert(
        (data && data.message) ||
          "Signup successful. Please check your email to verify your account.",
      );
      navigate("/login");
    } catch (err: any) {
      alert(err?.message || "Network error during signup");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Sign Up</h1>
        <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-muted/30 rounded-xl p-4 mb-4" />
        <input placeholder="Surname" onChange={(e) => setForm({ ...form, surname: e.target.value })} className="w-full bg-muted/30 rounded-xl p-4 mb-4" />
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-muted/30 rounded-xl p-4 mb-4" />
        <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-muted/30 rounded-xl p-4 mb-6" />
        <p className="text-sm text-center text-muted-foreground mb-6">Already have account</p>
        <Button onClick={handleSignup} className="w-full h-12">Create Account</Button>
      </div>
    </div>
  );
};

export default Signup;
