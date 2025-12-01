import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThumbsUp, ThumbsDown, Clock, RefreshCw, CheckCircle, Send } from "lucide-react";
import { api } from "@/lib/api";

interface LoanMessage {
  at: string;
  by: string;
  status: string;
  message?: string;
}

interface Loan {
  reference_number?: string;
  name?: string;
  amount?: number;
  date_applied?: string;
  status?: string; // raw status from backend: 'pending' | 'approved' | 'rejected' | ...
  interest_rate?: number;
  repayment_period?: number;
  installment_amount?: number;
  next_payment_due?: string;
  messages?: LoanMessage[];
}

type StatusKey = 'rejected' | 'approved' | 'pending' | 'payback_ongoing' | 'complete' | 'money_sent';

const statusConfig: Record<StatusKey, { label: string; icon: React.ReactNode; color: string }> = {
  rejected: { label: 'Rejected', icon: <ThumbsDown />, color: "text-red-400" },
  approved: { label: 'Approved', icon: <ThumbsUp />, color: "text-green-400" },
  pending: { label: 'Pending', icon: <Clock />, color: "text-yellow-400" },
  payback_ongoing: { label: 'Payback Ongoing', icon: <RefreshCw />, color: "text-blue-400" },
  complete: { label: 'Complete', icon: <CheckCircle />, color: "text-green-500" },
  money_sent: { label: 'Money Sent', icon: <Send />, color: "text-purple-400" },
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
          <p>Amount: N${loan.amount}</p>
          <p>Date Applied: {loan.date_applied}</p>
        </div>

        {/* Application Status */}
        <div className="bg-card rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Application Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(statusConfig).map(([key, { icon, color, label }]) => {
              const typedKey = key as StatusKey;
              const isActive = (loan.status ?? '').toLowerCase() === typedKey;

              return (
                <div
                  key={typedKey}
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    isActive ? "bg-primary/10 border border-primary" : "bg-muted/30"
                  }`}
                >
                  <div className={color}>{icon}</div>
                  <span className="font-medium">{label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center">
            Current:{" "}
            <strong>
              {loan.status
                ? statusConfig[(loan.status.toLowerCase() as StatusKey)]?.label ?? loan.status
                : 'Pending'}
            </strong>
          </p>
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
              <div key={i} className="bg-muted/30 rounded-xl p-3 text-sm space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{new Date(msg.at).toLocaleString()}</span>
                  <span>By: {msg.by}</span>
                </div>
                <p className="font-medium">Status: {msg.status}</p>
                {msg.message && <p>{msg.message}</p>}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoanStatus;