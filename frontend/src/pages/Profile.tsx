import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileText, ArrowRight, Edit3 } from "lucide-react";
import { api } from "@/lib/api";

interface ProfileData {
  name?: string;
  surname?: string;
  email?: string;
  id?: string;
  payslip?: string;
  bank_statement?: string;
  proof_residence?: string;
}

const Profile = () => {
  const [data, setData] = useState<ProfileData>({});

  useEffect(() => {
    api.get<ProfileData>("/user").then(setData).catch(console.error);
  }, []);

  const docs = [
    { label: "Id", url: data.id },
    { label: "PaySlip", url: data.payslip },
    { label: "Bank Statement", url: data.bank_statement },
    { label: "Proof of Residence", url: data.proof_residence },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Avatar & Name */}
        <div className="bg-card rounded-2xl p-8 text-center mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-5xl font-bold text-white mb-4">
            {data.name?.[0] ?? "?"}
          </div>
          <h1 className="text-3xl font-bold">{data.name} {data.surname}</h1>
          <p className="text-muted-foreground">{data.email}</p>
        </div>

        {/* Documents */}
        <div className="bg-card rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Documents</h2>
            <Edit3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {docs.map((doc) => (
              <a
                key={doc.label}
                href={doc.url ?? "#"}
                className="bg-muted/50 rounded-xl p-6 flex flex-col items-center gap-2 hover:bg-muted transition"
              >
                <FileText className="w-10 h-10 text-primary" />
                <span className="text-sm font-medium">{doc.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* General Links */}
        <div className="bg-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">General</h2>
          <div className="space-y-3">
            {[
              { to: "/edit-profile", label: "Edit profile" },
              { to: "/loan-status", label: "Loan Status" },
              { to: "/account-details", label: "Account Details" },
              { to: "/history", label: "History" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between bg-muted/30 rounded-xl p-5 hover:bg-muted/50 transition"
              >
                <span className="font-medium">{item.label}</span>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;