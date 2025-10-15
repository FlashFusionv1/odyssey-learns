import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { HelpCircle, MessageSquare, FileText, Video } from "lucide-react";

const Support = () => {
  const navigate = useNavigate();

  const categories = [
    { icon: HelpCircle, title: "Getting Started", count: 5 },
    { icon: FileText, title: "Account & Settings", count: 4 },
    { icon: Video, title: "Using Features", count: 6 },
    { icon: MessageSquare, title: "Troubleshooting", count: 5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <BackButton to="/" />
        </div>
      </nav>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="secondary">Help Center</Badge>
            <h1 className="text-4xl font-bold">How Can We Help?</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <category.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription>{category.count} articles</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Still Need Help?</CardTitle>
              <CardDescription className="text-center">Get in touch with our support team</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate("/contact")} size="lg">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Support;
