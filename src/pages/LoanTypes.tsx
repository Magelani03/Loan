import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import house1 from "@/assets/house-1.jpg";
import house2 from "@/assets/house-2.jpg";
import house3 from "@/assets/house-3.jpg";

const LoanTypes = () => {
  const loanTypes = [
    {
      id: 1,
      image: house1,
      period: "1 Month Period",
      description: "Perfect for short-term needs, our 1-month loan provides quick access to funds with flexible repayment options. Ideal for immediate expenses or bridging financial gaps."
    },
    {
      id: 2,
      image: house2,
      period: "3 Month Period",
      description: "Our 3-month loan option offers a balanced approach with manageable monthly payments. Great for medium-term projects, home improvements, or consolidating smaller debts."
    },
    {
      id: 3,
      image: house3,
      period: "5 Month Period",
      description: "Extended 5-month loans provide lower monthly payments and more breathing room. Perfect for larger expenses, vacation planning, or major purchases."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground bg-secondary rounded-xl py-6 mb-8">
              Loan Type
            </h1>
          </div>
          
          <div className="space-y-8 max-w-5xl mx-auto">
            {loanTypes.map((loan) => (
              <div 
                key={loan.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  <div className="relative h-64 md:h-full rounded-lg overflow-hidden">
                    <img 
                      src={loan.image} 
                      alt={loan.period}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      {loan.period}
                    </h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {loan.description}
                    </p>
                    <Link to="/apply">
                      <Button size="lg" className="w-full md:w-auto">
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoanTypes;
