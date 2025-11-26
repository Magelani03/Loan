import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Clock, RefreshCw, CheckCircle, Send } from "lucide-react";
import { api } from "@/lib/api";

interface Loan {
  reference_number?: string;
  name?: string;
  amount?: number;
  date_applied?: string;
  status?: string;
  interest_rate?: number;
  repayment_period?: number;
  installment_amount?: number;
  next_payment_due?: string;
  messages?: string[];
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  Rejected: { icon: <ThumbsDown />, color: "text-red-400" },
  Approved: { icon: <ThumbsUp />, color: "text-green-400" },
  Pending: { icon: <Clock />, color: "text-yellow-400" },
  "Payback Ongoing": { icon: <RefreshCw />, color: "text-blue-400" },
  Complete: { icon: <CheckCircle />, color: "text-green-500" },
  "Money Sent": { icon: <Send />, color: "text-purple-400" },
};

const LoanStatus = () => {
  const [loan, setLoan] = useState<Loan>({});

  useEffect(() => {
    api.get<Loan>("/loan/status").then(setLoan).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8">Loan Status</h1>

        {/* Details */}
        <div className="bg-card rounded-2xl p-6 mb-6 space-y-3">
          <h3 className="text-xl font-semibold">Details</h3>
          <p>Reference Number: <span className="font-mono">{loan.reference_number}</span></p>
          <p>Name: {loan.name}</p>
          <p>Amount: R{loan.amount}</p>
          <p>Date Applied: {loan.date_applied}</p>
        </div>

        {/* Application Status */}
        <div className="bg-card rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Application Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(statusConfig).map(([status, { icon, color }]) => (
              <div
                key={status}
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  loan.status === status ? "bg-primary/10 border border-primary" : "bg-muted/30"
                }`}
              >
                <div className={color}>{icon}</div>
                <span className="font-medium">{status}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center">Current: <strong>{loan.status}</strong></p>
        </div>

        {/* Loan Details */}
        <div className="bg-card rounded-2xl p-6 mb-6 space-y-2">
          <h3 className="text-xl font-semibold">Loan Details</h3>
          <p>Interest Rate: {loan.interest_rate}%</p>
          <p>Repayment Period: {loan.repayment_period} months</p>
          <p>Installment Amount: R{loan.installment_amount}</p>
          <p>Next Payment Due: {loan.next_payment_due}</p>
        </div>

        {/* Messages */}
        <div className="bg-card rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-3">Messages</h3>
          <div className="space-y-2">
            {(loan.messages ?? []).map((msg, i) => (
              <p key={i} className="bg-muted/30 rounded-xl p-3 text-sm">{msg}</p>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoanStatus;