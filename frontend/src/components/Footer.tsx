import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Instagram, Facebook } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Write Us</h3>
            <div className="space-y-3">
              <Input 
                placeholder="Email" 
                type="email"
                className="bg-secondary border-border"
              />
              <Textarea 
                placeholder="Your message..."
                className="bg-secondary border-border min-h-[100px]"
              />
              <Button className="w-full">SEND</Button>
            </div>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          
          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Loans</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          {/* Help Centre Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Help Centre</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Email</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        {/* Social Media */}
        <div className="flex items-center justify-center gap-6 mt-12 pt-8 border-t border-border">
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            <Instagram className="h-6 w-6" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            <Facebook className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
};
