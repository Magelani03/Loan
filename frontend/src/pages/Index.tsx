import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StatsCard } from "@/components/StatsCard";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Award, Wrench, Headphones, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-villa.jpg";
import meetingImage from "@/assets/business-meeting.jpg";
import { Link } from "react-router-dom";



const Index = () => {
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatsCard value="18K" label="Happy Clients" />
              <StatsCard value="87%" label="Customer Satisfaction" />
              <StatsCard value="5 yrs" label="Experience" />
              <StatsCard value="80k" label="Total Loaned" />
            </div>
            
            <Button size="lg" className="text-lg px-8">
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
                src={meetingImage} 
                alt="Professional business meeting"
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
      <section className="py-20 bg-card">
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
                Find Office
              </h2>
              <p className="text-muted-foreground mb-6">
                Locate our nearest branch and visit us for personalized assistance.
              </p>
              <Button variant="outline" size="lg">Finder</Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
