import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface FormData {
  name: string;
  surname: string;
  idNumber: string;
  age: string;
  gender: string;
  physicalAddress: string;
  telephone: string;
  employmentStatus: string;
  employer: string;
  jobTitle: string;
  incomePerAnnum: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  accountType: string;
  branchCode: string;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    name: "", surname: "", idNumber: "", age: "", gender: "",
    physicalAddress: "", telephone: "",
    employmentStatus: "", employer: "", jobTitle: "", incomePerAnnum: "",
    bankName: "", accountHolder: "", accountNumber: "", accountType: "", branchCode: ""
  });

  useEffect(() => {
    api.get<any>("/user/details").then((d) => {
      setForm({
        name: d.name ?? "", surname: d.surname ?? "", idNumber: d.idNumber ?? "", age: d.age ?? "",
        gender: d.gender ?? "", physicalAddress: d.physicalAddress ?? "", telephone: d.telephone ?? "",
        employmentStatus: d.employmentStatus ?? "", employer: d.employer ?? "", jobTitle: d.jobTitle ?? "",
        incomePerAnnum: d.incomePerAnnum ?? "", bankName: d.bankName ?? "",
        accountHolder: d.accountHolder ?? "", accountNumber: d.accountNumber ?? "",
        accountType: d.accountType ?? "", branchCode: d.branchCode ?? ""
      });
    }).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/user/update", form);
    alert("Profile updated!");
    navigate("/profile");
  };

  const sections = [
    { title: "Personal Information", fields: ["name", "surname", "idNumber", "age", "gender", "physicalAddress", "telephone"] },
    { title: "Employment", fields: ["employmentStatus", "employer", "jobTitle", "incomePerAnnum"] },
    { title: "Bank Information", fields: ["bankName", "accountHolder", "accountNumber", "accountType", "branchCode"] },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-card rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
              <div className="space-y-3">
                {section.fields.map((field) => (
                  <input
                    key={field}
                    name={field}
                    placeholder={field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                    value={(form as any)[field]}
                    onChange={handleChange}
                    className="w-full bg-muted/30 rounded-xl p-4 text-foreground placeholder:text-muted-foreground/70"
                  />
                ))}
              </div>
            </div>
          ))}

          <Button type="submit" className="w-full h-12 text-lg">Save Changes</Button>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default EditProfile;