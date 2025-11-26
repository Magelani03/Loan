import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Apply = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Application Submitted!",
      description: "We'll review your application and get back to you soon.",
    });
  };

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
                    <Input id="name" placeholder="Enter your name" required />
                  </div>
                  <div>
                    <Label htmlFor="surname">Surname</Label>
                    <Input id="surname" placeholder="Enter your surname" required />
                  </div>
                  <div>
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input id="idNumber" placeholder="Enter your ID number" required />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" placeholder="Enter your age" required />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select>
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
                    <Input id="telephone" type="tel" placeholder="Enter your phone number" required />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Physical Address</Label>
                    <Input id="address" placeholder="Enter your address" required />
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
                    <Select>
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
                    <Input id="employer" placeholder="Enter employer name" />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" placeholder="Enter your job title" />
                  </div>
                  <div>
                    <Label htmlFor="income">Income per Annum</Label>
                    <Input id="income" type="number" placeholder="Enter annual income" />
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
                    <Input id="bankName" placeholder="Enter bank name" required />
                  </div>
                  <div>
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input id="accountHolder" placeholder="Enter account holder name" required />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" placeholder="Enter account number" required />
                  </div>
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select>
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
                    <Input id="branchCode" placeholder="Enter branch code" required />
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
                    <Input id="guarantorName" placeholder="Enter guarantor name" />
                  </div>
                  <div>
                    <Label htmlFor="guarantorContact">Contact Details</Label>
                    <Input id="guarantorContact" placeholder="Enter contact details" />
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                  Documents
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {["ID", "PaySlip", "Bank Statement", "Proof of Residence"].map((doc) => (
                    <div key={doc} className="flex flex-col items-center justify-center bg-muted rounded-lg p-6 border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer">
                      <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground text-center">{doc}</span>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  UPLOAD
                </Button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button type="submit" size="lg" className="px-16">
                  Submit
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
