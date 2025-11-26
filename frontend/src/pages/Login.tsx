import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    localStorage.setItem("token", data.token);
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-muted/30 rounded-xl p-4 mb-4" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-muted/30 rounded-xl p-4 mb-6" />
        <p className="text-sm text-center text-muted-foreground mb-6">Don't have Account?</p>
        <Button onClick={handleLogin} className="w-full h-12">Create Account</Button>
      </div>
    </div>
  );
};

export default Login;