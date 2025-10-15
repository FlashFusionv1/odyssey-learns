import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Star } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free (Beta)",
      price: "$0",
      period: "during beta",
      description: "Full access while we're in beta testing",
      features: [
        "1 child",
        "Unlimited lessons",
        "Basic parent dashboard",
        "Emotional intelligence activities",
        "Daily quests & rewards",
        "Beta tester badge",
      ],
      cta: "Join Beta Free",
      popular: true,
      badge: "Best Value",
    },
    {
      name: "Starter",
      price: "$9.99",
      period: "/month",
      description: "Perfect for small families",
      comingSoon: true,
      features: [
        "Up to 2 children",
        "Unlimited lessons",
        "Full parent dashboard",
        "Weekly progress reports",
        "Priority email support",
        "Early access to new features",
      ],
      cta: "Coming Soon",
      popular: false,
    },
    {
      name: "Pro",
      price: "$19.99",
      period: "/month",
      description: "Ideal for growing families",
      comingSoon: true,
      features: [
        "Up to 4 children",
        "Unlimited lessons",
        "Advanced analytics",
        "Custom rewards system",
        "Priority support",
        "1-on-1 coaching session (monthly)",
      ],
      cta: "Coming Soon",
      popular: false,
    },
    {
      name: "Family",
      price: "$49.99",
      period: "/month",
      description: "For larger families & homeschoolers",
      comingSoon: true,
      features: [
        "Unlimited children",
        "Everything in Pro",
        "Dedicated account manager",
        "Weekly coaching calls",
        "Custom curriculum planning",
        "API access for integrations",
      ],
      cta: "Coming Soon",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Is it really free during beta?",
      answer: "Yes! Beta testers get completely free access to all features. You'll also receive a lifetime 50% discount when we launch publicly.",
    },
    {
      question: "What happens after beta ends?",
      answer: "Beta testers will be grandfathered in with special pricing. You can choose to continue with a 50% lifetime discount on any paid plan, or continue with our free tier (limited features).",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely! There are no long-term contracts. Cancel anytime from your account settings.",
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, we'll refund your payment in full.",
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
          {/* Hero */}
          <div className="text-center space-y-4 mb-12">
            <Badge variant="secondary" className="mb-4">
              <Star className="h-3 w-3 mr-1 inline" />
              Free During Beta - Limited Time!
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Simple, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Transparent</span> Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join our beta program for free access now. Lock in special pricing before public launch.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? 'border-2 border-primary shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => !plan.comingSoon && navigate("/login")}
                    disabled={plan.comingSoon}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Early Adopter Benefits */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 mb-16">
            <CardHeader className="text-center">
              <Badge variant="outline" className="mx-auto mb-4">Beta Tester Benefits</Badge>
              <CardTitle className="text-3xl">Lock In Your Special Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <div className="text-5xl font-bold text-primary">50%</div>
                <p className="font-semibold">Lifetime Discount</p>
                <p className="text-sm text-muted-foreground">
                  Beta testers save 50% on any paid plan forever
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-5xl font-bold text-secondary">✓</div>
                <p className="font-semibold">Founding Family Badge</p>
                <p className="text-sm text-muted-foreground">
                  Exclusive badge showing you helped build this
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-5xl font-bold text-accent">∞</div>
                <p className="font-semibold">Early Access</p>
                <p className="text-sm text-muted-foreground">
                  Always first to try new features and content
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16 space-y-6">
            <h2 className="text-3xl font-bold">Ready to Join?</h2>
            <p className="text-muted-foreground">
              Don't miss your chance for lifetime early adopter pricing
            </p>
            <Button size="lg" onClick={() => navigate("/login")} className="shadow-xl">
              Start Free Beta Access
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
