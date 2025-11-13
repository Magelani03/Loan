import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api";

interface Details {
  name?: string;
  surname?: string;
  idNumber?: string;
  age?: number;
  gender?: string;
  physicalAddress?: string;
  telephone?: string;
  employmentStatus?: string;
  employer?: string;
  jobTitle?: string;
  incomePerAnnum?: number;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  accountType?: string;
  branchCode?: string;
}

const AccountDetails = () => {
  const [data, setData] = useState<Details>({});

  useEffect(() => {
    api.get<Details>("/user/details").then(setData).catch(console.error);
  }, []);

  const sections = [
    {
      title: "Personal Information",
      fields: ["name", "surname", "idNumber", "age", "gender", "physicalAddress", "telephone"],
    },
    {
      title: "Employment",
      fields: ["employmentStatus", "employer", "jobTitle", "incomePerAnnum"],
    },
    {
      title: "Bank Information",
      fields: ["bankName", "accountHolder", "accountNumber", "accountType", "branchCode"],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Account Details</h1>

        {sections.map((section) => (
          <div key={section.title} className="bg-card rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
            <div className="space-y-3">
              {section.fields.map((field) => (
                <div key={field} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                  </span>
                  <span className="font-medium">{(data as any)[field] ?? "-"}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
};

export default AccountDetails;