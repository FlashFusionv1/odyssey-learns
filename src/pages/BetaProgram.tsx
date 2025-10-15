import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Gift, Star, Users, Zap, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const BetaProgram = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    childAge: "",
    motivation: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Application submitted! We'll be in touch soon.");
    navigate("/login");
  };

  const benefits = [
    {
      icon: Gift,
      title: "Lifetime Benefits",
      description: "50% off forever when we launch, plus free access during beta",
    },
    {
      icon: Star,
      title: "Founding Family Badge",
      description: "Exclusive badge showing you helped shape Inner Odyssey",
    },
    {
      icon: Zap,
      title: "Early Access",
      description: "Be first to try new features, content, and improvements",
    },
    {
      icon: Users,
      title: "Direct Access to Team",
      description: "Priority support and direct line to product developers",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Parent of 2 (Ages 7, 10)",
      quote: "My kids actually look forward to learning! The emotional intelligence activities have helped my youngest manage her anxiety.",
      avatar: "SM",
    },
    {
      name: "David K.",
      role: "Parent of 1 (Age 12)",
      quote: "Finally, a platform that goes beyond academics. The life skills lessons are preparing my son for high school and beyond.",
      avatar: "DK",
    },
    {
      name: "Jennifer L.",
      role: "Parent of 3 (Ages 6, 8, 11)",
      quote: "The parent dashboard gives me insights I never had before. I can celebrate wins and catch struggles early.",
      avatar: "JL",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <BackButton to="/" />
        </div>
      </nav>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="secondary" className="text-sm px-4 py-1.5">
              🎉 Limited Spots Available
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Shape the Future of <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Learning</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join our beta program and help create the most comprehensive K-12 learning platform ever built
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* What You Get */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">What Beta Testers Get</CardTitle>
                <CardDescription>All the perks of being an early adopter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-medium">Free Lifetime Access Option</p>
                      <p className="text-sm text-muted-foreground">Or 50% off any paid plan forever</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-medium">Monthly Raffles & Rewards</p>
                      <p className="text-sm text-muted-foreground">Gift cards, swag, and special prizes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-medium">Feature Naming Rights</p>
                      <p className="text-sm text-muted-foreground">Top contributors can name quests after their family</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-medium">Thank You Gift Package</p>
                      <p className="text-sm text-muted-foreground">T-shirts, stickers, and personalized certificate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What We Ask */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">What We Ask From You</CardTitle>
                <CardDescription>Help us build the best learning platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Use Daily (15-30 minutes)</p>
                      <p className="text-sm text-muted-foreground">Consistent usage gives us better data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Submit Feedback</p>
                      <p className="text-sm text-muted-foreground">Use the in-app widget to report bugs and suggest features</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Complete Monthly Surveys</p>
                      <p className="text-sm text-muted-foreground">10-minute surveys help us understand what's working</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Be Honest</p>
                      <p className="text-sm text-muted-foreground">Constructive criticism helps more than praise</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">What Beta Families Are Saying</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{testimonial.avatar}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm italic">"{testimonial.quote}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Apply to Beta Program</CardTitle>
              <CardDescription>We'll review your application and get back to you within 48 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="parent@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childAge">Child's Age/Grade</Label>
                  <Input
                    id="childAge"
                    placeholder="e.g., 7 years old, 2nd grade"
                    value={formData.childAge}
                    onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivation">Why do you want to join the beta?</Label>
                  <Textarea
                    id="motivation"
                    placeholder="Tell us what excites you about Inner Odyssey..."
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default BetaProgram;
