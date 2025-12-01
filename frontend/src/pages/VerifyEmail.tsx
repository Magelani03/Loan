import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState<string>("Verifying your email...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    api
      .get<{ ok: boolean; message?: string; error?: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (res.ok) {
          setStatus("success");
          setMessage(res.message || "Your email has been verified. You can now log in.");
        } else {
          setStatus("error");
          setMessage(res.error || "Verification failed.");
        }
      })
      .catch(async (err: any) => {
        setStatus("error");
        setMessage(err?.message || "Verification failed.");
      });
  }, [location.search]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-xl text-center">
        <h1 className="text-3xl font-bold mb-4">Email Verification</h1>
        <p className="mb-8">{message}</p>
        <Button onClick={() => navigate("/login")} disabled={status === "pending"}>
          Go to Login
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
