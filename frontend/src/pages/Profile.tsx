import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileText, ArrowRight, Edit3 } from "lucide-react";
import { api } from "@/lib/api";

type DocType = "id" | "payslip" | "bank_statement" | "proof_residence";

interface ProfileData {
  name?: string;
  surname?: string;
  email?: string;
  avatar?: string | null;
  id?: string;
  payslip?: string;
  bank_statement?: string;
  proof_residence?: string;
}

const Profile = () => {
  const [data, setData] = useState<ProfileData>({});
  const [editingDocs, setEditingDocs] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploading, setUploading] = useState<Record<DocType, boolean>>({
    id: false,
    payslip: false,
    bank_statement: false,
    proof_residence: false,
  });

  useEffect(() => {
    api.get<ProfileData>("/user").then(setData).catch(console.error);
  }, []);

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true);
      const res = await api.post<{ url: string }>("/upload/document", { type: "avatar" }, file);
      setData((prev) => ({ ...prev, avatar: res.url }));
    } catch (e) {
      console.error(e);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpload = async (type: DocType, file: File) => {
    try {
      setUploading((prev) => ({ ...prev, [type]: true }));
      const res = await api.post<{ url: string }>("/upload/document", { type }, file);

      setData((prev) => ({
        ...prev,
        ...(type === "id"
          ? { id: res.url }
          : type === "payslip"
          ? { payslip: res.url }
          : type === "bank_statement"
          ? { bank_statement: res.url }
          : { proof_residence: res.url }),
      }));
    } catch (e) {
      console.error(e);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const docs: { key: DocType; label: string; url?: string }[] = [
    { key: "id", label: "Id", url: data.id },
    { key: "payslip", label: "PaySlip", url: data.payslip },
    { key: "bank_statement", label: "Bank Statement", url: data.bank_statement },
    { key: "proof_residence", label: "Proof of Residence", url: data.proof_residence },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Avatar & Name */}
        <div className="bg-card rounded-2xl p-8 text-center mb-8">
          <label className="inline-block cursor-pointer">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-5xl font-bold text-white mb-2 overflow-hidden">
              {data.avatar ? (
                <img src={data.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{data.name?.[0] ?? "?"}</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleAvatarUpload(file);
                }
                e.target.value = "";
              }}
            />
            <p className="text-xs text-primary mt-1">
              {uploadingAvatar ? "Uploading photo..." : "Click to change profile picture"}
            </p>
          </label>
          <h1 className="text-3xl font-bold mt-4">{data.name} {data.surname}</h1>
          <p className="text-muted-foreground">{data.email}</p>
        </div>

        {/* Documents */}
        <div className="bg-card rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Documents</h2>
            <button
              type="button"
              onClick={() => setEditingDocs((v) => !v)}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <Edit3 className="w-5 h-5" />
              <span>{editingDocs ? "Done" : "Edit"}</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {docs.map((doc) => (
              <div
                key={doc.key}
                className="bg-muted/50 rounded-xl p-6 flex flex-col items-center gap-2 hover:bg-muted transition"
              >
                <a
                  href={doc.url ?? "#"}
                  target={doc.url ? "_blank" : undefined}
                  rel={doc.url ? "noopener noreferrer" : undefined}
                  className="flex flex-col items-center gap-2"
                >
                  <FileText className="w-10 h-10 text-primary" />
                  <span className="text-sm font-medium">{doc.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {doc.url ? "View document" : "No document uploaded"}
                  </span>
                </a>

                {editingDocs && (
                  <label className="mt-2 text-xs text-primary cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void handleUpload(doc.key, file);
                        }
                        // reset input so selecting the same file again still triggers onChange
                        e.target.value = "";
                      }}
                    />
                    {uploading[doc.key]
                      ? "Uploading..."
                      : doc.url
                      ? "Replace document"
                      : "Upload document"}
                  </label>
                )}
              </div>
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