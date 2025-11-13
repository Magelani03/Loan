import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api";

interface HistoryItem {
  date_applied: string;
  amount: number;
  status: string;
  reference_number: string;
}

const History = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    api.get<HistoryItem[]>("/loan/history").then(setItems).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Loan History</h1>

        <div className="bg-card rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-5 text-left font-semibold">Date</th>
                <th className="p-5 text-left font-semibold">Amount</th>
                <th className="p-5 text-left font-semibold">Status</th>
                <th className="p-5 text-left font-semibold">Reference</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-t border-muted/20">
                  <td className="p-5">{item.date_applied}</td>
                  <td className="p-5 font-mono">R{item.amount}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "Approved" ? "bg-green-500/20 text-green-400" :
                      item.status === "Rejected" ? "bg-red-500/20 text-red-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-5 font-mono text-sm">{item.reference_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default History;