import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StatsCard } from "@/components/StatsCard";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Award, Wrench, Headphones, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-villa.jpg";
import whyChooseImage from "@/assets/finance-savings.png";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Set VITE_OFFICE_ADDRESS in .env to your office address (used for "Get directions").
const OFFICE_ADDRESS =
  (import.meta as any).env?.VITE_OFFICE_ADDRESS as string | undefined ||
  "123 Financial Street, Suite 100, New York, NY 10001";

interface HomeStats {
  totalLoans: number;
  activeLoans: number;
  totalBorrowers: number;
  totalLoaned: number;
  statusCounts?: Record<string, number>;
  last30Days?: {
    newLoans: number;
    totalLoaned: number;
  };
}

const Index = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<HomeStats | null>(null);

  useEffect(() => {
    api
      .get<HomeStats>("/loan/stats")
      .then(setStats)
      .catch(() => {
        // ignore errors and keep fallback values
      });
  }, []);

  const formatNumber = (value: number | undefined) => {
    if (value == null) return "0";
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const handleHeroLearnMore = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFinderClick = () => {
    const destination = encodeURIComponent(OFFICE_ADDRESS);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast({
      title: "Directions opened",
      description: "Google Maps opened. Choose your starting point or use “My location” there.",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden pt-16">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/95" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight">
              Let's Pay for<br />that Vacation
            </h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <StatsCard value={formatNumber(stats?.totalBorrowers)} label="Clients" />
              <StatsCard value={formatNumber(stats?.activeLoans)} label="Active Loans" />
              <StatsCard value={formatNumber(stats?.totalLoans)} label="Total Applications" />
              <StatsCard value={`N$${formatNumber(Math.round(stats?.totalLoaned ?? 0))}`} label="Total Loaned" />
            </div>

            {/* Removed extra stats line (Completed / Rejected / Last 30 days) per design request */}
            
            <Button size="lg" className="text-lg px-8" onClick={handleHeroLearnMore}>
              Learn more
            </Button>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <img 
                src={whyChooseImage} 
                alt="Finance, savings and planning"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Why choose Us
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                We provide tailored financial solutions with certified expertise, 
                ensuring personalized loan options that fit your needs. Our team 
                is dedicated to your financial success all year round.
              </p>
              
              <div className="space-y-4">
                <FeatureCard 
                  icon={Award}
                  title="Certified experts"
                  description="Our team consists of certified financial professionals with years of experience"
                />
                <FeatureCard 
                  icon={Wrench}
                  title="Personalised Loan Solutions"
                  description="Custom-tailored loan packages designed specifically for your unique situation"
                />
                <FeatureCard 
                  icon={Headphones}
                  title="Active All Year"
                  description="24/7 support and assistance whenever you need us"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How it Works / Find Office Section */}
      <section id="how-it-works" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-secondary rounded-2xl p-12 flex flex-col justify-center">
              <h2 className="text-4xl font-bold text-foreground mb-6">
                How it Works
              </h2>
              <p className="text-muted-foreground mb-6">
                Apply online, get approved quickly, and receive your funds. 
                Our streamlined process makes getting a loan simple and stress-free.
              </p>
              <Link to="/apply">
                <Button size="lg">Learn more</Button>
              </Link>
            </div>
            
            <div className="bg-muted rounded-2xl p-12 flex flex-col justify-center items-center text-center">
              <MapPin className="h-16 w-16 text-primary mb-4" />
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Find our office
              </h2>
              <p className="text-muted-foreground mb-6">
                Visit us for personalized assistance. Get directions to our office.
              </p>
              <Button variant="outline" size="lg" onClick={handleFinderClick}>
                Get directions
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
