import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface LoanStatusResponse {
  reference_number?: string;
  status?: string;
}

type DocKey = "id" | "payslip" | "bankStatement" | "proofResidence";
type DocState = "idle" | "selected" | "uploaded";

const Apply = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasExistingLoan, setHasExistingLoan] = useState<boolean | null>(null);

  const [form, setForm] = useState({
    name: "",
    surname: "",
    idNumber: "",
    age: "",
    gender: "",
    physicalAddress: "",
    telephone: "",
    employmentStatus: "",
    employer: "",
    jobTitle: "",
    incomePerAnnum: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    accountType: "",
    branchCode: "",
    loanAmount: "",
    loanPeriod: "",
    guarantorName: "",
    guarantorContact: "",
  });

  const [documents, setDocuments] = useState<{
    id: File | null;
    payslip: File | null;
    bankStatement: File | null;
    proofResidence: File | null;
  }>({
    id: null,
    payslip: null,
    bankStatement: null,
    proofResidence: null,
  });

  const [docStatus, setDocStatus] = useState<Record<DocKey, DocState>>({
    id: "idle",
    payslip: "idle",
    bankStatement: "idle",
    proofResidence: "idle",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);

    api
      .get<LoanStatusResponse | Record<string, never>>("/loan/status")
      .then((loan) => {
        if (!loan || Object.keys(loan).length === 0) {
          setHasExistingLoan(false);
          return;
        }
        const status = (loan as LoanStatusResponse).status?.toLowerCase();
        // Only treat as "existing loan" if it is still active (not completed or rejected)
        if (!status || ["complete", "rejected"].includes(status)) {
          setHasExistingLoan(false);
        } else {
          setHasExistingLoan(true);
        }
      })
      .catch(() => {
        // If the status check fails, assume no loan so user can at least attempt to apply
        setHasExistingLoan(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Apply: handleSubmit called", form);

    if (!form.loanAmount || !form.loanPeriod) {
      console.log("Apply: missing loan details");
      toast({
        title: "Missing loan details",
        description: "Please enter a loan amount and repayment period.",
      });
      return;
    }

    const amount = Number(form.loanAmount);
    const periodMonths = Number(form.loanPeriod);

    if (Number.isNaN(amount) || Number.isNaN(periodMonths) || amount <= 0 || periodMonths <= 0) {
      console.log("Apply: invalid amount or period", { amount, periodMonths });
      toast({
        title: "Invalid values",
        description: "Please enter a valid loan amount and repayment period.",
      });
      return;
    }

    try {
      setSubmitting(true);
      console.log("Apply: submitting to backend", { amount, periodMonths });

      // 1) Update user profile details
      const userPayload: any = {
        name: form.name || undefined,
        surname: form.surname || undefined,
        idNumber: form.idNumber || undefined,
        age: form.age ? Number(form.age) : null,
        gender: form.gender || undefined,
        physicalAddress: form.physicalAddress || undefined,
        telephone: form.telephone || undefined,
        employmentStatus: form.employmentStatus || undefined,
        employer: form.employer || undefined,
        jobTitle: form.jobTitle || undefined,
        incomePerAnnum: form.incomePerAnnum ? Number(form.incomePerAnnum) : null,
        bankName: form.bankName || undefined,
        accountHolder: form.accountHolder || undefined,
        accountNumber: form.accountNumber || undefined,
        accountType: form.accountType || undefined,
        branchCode: form.branchCode || undefined,
      };

      await api.post("/user/update", userPayload);

      // 2) Create the loan
      await api.post("/loan/apply", {
        amount,
        periodMonths,
        guarantorName: form.guarantorName || undefined,
        guarantorContact: form.guarantorContact || undefined,
      });

      // 3) Upload documents if provided
      const uploads: Promise<unknown>[] = [];
      if (documents.id) {
        uploads.push(
          api.post("/upload/document", { type: "id" }, documents.id).then(() =>
            setDocStatus((prev) => ({ ...prev, id: "uploaded" })),
          ),
        );
      }
      if (documents.payslip) {
        uploads.push(
          api.post("/upload/document", { type: "payslip" }, documents.payslip).then(() =>
            setDocStatus((prev) => ({ ...prev, payslip: "uploaded" })),
          ),
        );
      }
      if (documents.bankStatement) {
        uploads.push(
          api.post("/upload/document", { type: "bank_statement" }, documents.bankStatement).then(() =>
            setDocStatus((prev) => ({ ...prev, bankStatement: "uploaded" })),
          ),
        );
      }
      if (documents.proofResidence) {
        uploads.push(
          api.post("/upload/document", { type: "proof_residence" }, documents.proofResidence).then(() =>
            setDocStatus((prev) => ({ ...prev, proofResidence: "uploaded" })),
          ),
        );
      }

      if (uploads.length > 0) {
        await Promise.all(uploads);
      }

      console.log("Apply: application submitted successfully");
      toast({
        title: "Application submitted",
        description: "Your loan application has been submitted successfully.",
      });

      navigate("/loan-status");
    } catch (error: any) {
      console.error("Apply: submit error", error);
      toast({
        title: "Something went wrong",
        description: error?.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-xl text-center space-y-6">
            <h1 className="text-3xl font-bold">Create an account to apply</h1>
            <p className="text-muted-foreground">
              To apply for a loan, you need to create an account so we can securely store your details and track your
              application.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/signup")}>Create Account</Button>
              <Button variant="outline" onClick={() => navigate("/login")}>
                I already have an account
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (hasExistingLoan) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-xl text-center space-y-6">
            <h1 className="text-3xl font-bold">You already have a loan application</h1>
            <p className="text-muted-foreground">
              You&apos;ve already applied for a loan. You can check the status of your current application or view your
              history.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/loan-status")}>View Loan Status</Button>
              <Button variant="outline" onClick={() => navigate("/history")}>
                View History
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground bg-secondary rounded-xl py-6 mb-8">
              Loan Application
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                  Personal Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your name"
                      required
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname">Surname</Label>
                    <Input
                      id="surname"
                      name="surname"
                      placeholder="Enter your surname"
                      required
                      value={form.surname}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      name="idNumber"
                      placeholder="Enter your ID number"
                      required
                      value={form.idNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      placeholder="Enter your age"
                      required
                      value={form.age}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={form.gender}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="telephone">Telephone</Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      placeholder="Enter your phone number"
                      required
                      value={form.telephone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Physical Address</Label>
                    <Input
                      id="address"
                      name="physicalAddress"
                      placeholder="Enter your address"
                      required
                      value={form.physicalAddress}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Employment */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                  Employment
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employmentStatus">Employment Status</Label>
                    <Select
                      value={form.employmentStatus}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, employmentStatus: value }))}
                    >
                      <SelectTrigger id="employmentStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="self-employed">Self-Employed</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="employer">Employer</Label>
                    <Input
                      id="employer"
                      name="employer"
                      placeholder="Enter employer name"
                      value={form.employer}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      placeholder="Enter your job title"
                      value={form.jobTitle}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="income">Income per Annum</Label>
                    <Input
                      id="income"
                      name="incomePerAnnum"
                      type="number"
                      placeholder="Enter annual income"
                      value={form.incomePerAnnum}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                  Loan Details
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="loanAmount">Loan Amount</Label>
                    <Input
                      id="loanAmount"
                      name="loanAmount"
                      type="number"
                      placeholder="Enter desired loan amount"
                      required
                      value={form.loanAmount}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="loanPeriod">Repayment Period (months)</Label>
                    <Input
                      id="loanPeriod"
                      name="loanPeriod"
                      type="number"
                      placeholder="e.g. 12"
                      required
                      value={form.loanPeriod}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Bank Information */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                  Bank Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      placeholder="Enter bank name"
                      required
                      value={form.bankName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      name="accountHolder"
                      placeholder="Enter account holder name"
                      required
                      value={form.accountHolder}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      name="accountNumber"
                      placeholder="Enter account number"
                      required
                      value={form.accountNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select
                      value={form.accountType}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, accountType: value }))}
                    >
                      <SelectTrigger id="accountType">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="branchCode">Branch Code</Label>
                    <Input
                      id="branchCode"
                      name="branchCode"
                      placeholder="Enter branch code"
                      required
                      value={form.branchCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Guarantors */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                  Guarantors
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guarantorName">Name</Label>
                    <Input
                      id="guarantorName"
                      name="guarantorName"
                      placeholder="Enter guarantor name"
                      value={form.guarantorName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guarantorContact">Contact Details</Label>
                    <Input
                      id="guarantorContact"
                      name="guarantorContact"
                      placeholder="Enter contact details"
                      value={form.guarantorContact}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                  Documents
                </h2>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Upload clear copies of your ID, payslip, bank statement and proof of residence.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <label
                    htmlFor="doc-id"
                    className="flex flex-col items-center justify-center bg-muted rounded-lg p-6 border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer"
                  >
                    <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground text-center">ID</span>
                    <span className="mt-1 text-[10px] text-muted-foreground text-center">
                      {docStatus.id === "uploaded"
                        ? "Uploaded"
                        : documents.id
                          ? `Selected: ${documents.id.name}`
                          : "No file selected"}
                    </span>
                    <input
                      id="doc-id"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setDocuments((prev) => ({ ...prev, id: file }));
                        setDocStatus((prev) => ({ ...prev, id: file ? "selected" : "idle" }));
                      }}
                    />
                  </label>
                  <label
                    htmlFor="doc-payslip"
                    className="flex flex-col items-center justify-center bg-muted rounded-lg p-6 border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer"
                  >
                    <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground text-center">PaySlip</span>
                    <span className="mt-1 text-[10px] text-muted-foreground text-center">
                      {docStatus.payslip === "uploaded"
                        ? "Uploaded"
                        : documents.payslip
                          ? `Selected: ${documents.payslip.name}`
                          : "No file selected"}
                    </span>
                    <input
                      id="doc-payslip"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setDocuments((prev) => ({ ...prev, payslip: file }));
                        setDocStatus((prev) => ({ ...prev, payslip: file ? "selected" : "idle" }));
                      }}
                    />
                  </label>
                  <label
                    htmlFor="doc-bank"
                    className="flex flex-col items-center justify-center bg-muted rounded-lg p-6 border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer"
                  >
                    <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground text-center">Bank Statement</span>
                    <span className="mt-1 text-[10px] text-muted-foreground text-center">
                      {docStatus.bankStatement === "uploaded"
                        ? "Uploaded"
                        : documents.bankStatement
                          ? `Selected: ${documents.bankStatement.name}`
                          : "No file selected"}
                    </span>
                    <input
                      id="doc-bank"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setDocuments((prev) => ({ ...prev, bankStatement: file }));
                        setDocStatus((prev) => ({ ...prev, bankStatement: file ? "selected" : "idle" }));
                      }}
                    />
                  </label>
                  <label
                    htmlFor="doc-proof"
                    className="flex flex-col items-center justify-center bg-muted rounded-lg p-6 border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer"
                  >
                    <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground text-center">Proof of Residence</span>
                    <span className="mt-1 text-[10px] text-muted-foreground text-center">
                      {docStatus.proofResidence === "uploaded"
                        ? "Uploaded"
                        : documents.proofResidence
                          ? `Selected: ${documents.proofResidence.name}`
                          : "No file selected"}
                    </span>
                    <input
                      id="doc-proof"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setDocuments((prev) => ({ ...prev, proofResidence: file }));
                        setDocStatus((prev) => ({ ...prev, proofResidence: file ? "selected" : "idle" }));
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button type="submit" size="lg" className="px-16" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Apply;
