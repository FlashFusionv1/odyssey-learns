import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Heart, Brain, BookOpen, Users, TrendingUp, Sparkles, Target, Zap } from "lucide-react";

const Features = () => {
  const navigate = useNavigate();

  const pillars = [
    {
      icon: Heart,
      title: "Emotional Intelligence",
      description: "Build self-awareness, empathy, and resilience through engaging activities",
      features: [
        "Emotion identification and regulation",
        "Empathy development through scenarios",
        "Coping strategies and mindfulness",
        "Social skills and conflict resolution",
      ],
      color: "from-primary/20 to-primary/5",
    },
    {
      icon: BookOpen,
      title: "Academic Excellence",
      description: "Standards-aligned curriculum that adapts to your child's pace",
      features: [
        "Math, Reading, Science, and more",
        "Adaptive difficulty levels",
        "Common Core aligned content",
        "Interactive quizzes and assessments",
      ],
      color: "from-secondary/20 to-secondary/5",
    },
    {
      icon: Brain,
      title: "Real-World Life Skills",
      description: "Practical skills for success in school and beyond",
      features: [
        "Financial literacy basics",
        "Time management strategies",
        "Digital citizenship",
        "Problem-solving techniques",
      ],
      color: "from-accent/20 to-accent/5",
    },
  ];

  const ageTiers = [
    {
      name: "K-2 (Ages 5-7)",
      description: "Playful and engaging with large visuals",
      features: ["Simple daily quests", "Sticker rewards", "Voice narration", "Parent-guided"],
    },
    {
      name: "3-5 (Ages 8-10)",
      description: "Balanced exploration with independence",
      features: ["Multi-activity quests", "Badge system", "Progress tracking", "Peer collaboration"],
    },
    {
      name: "6-8 (Ages 11-13)",
      description: "Self-directed with deeper challenges",
      features: ["Complex projects", "Skill trees", "Team challenges", "Advanced analytics"],
    },
    {
      name: "9-12 (Ages 14-18)",
      description: "College prep and career readiness",
      features: ["Portfolio building", "Real-world projects", "Mentorship roles", "Credentials"],
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
            <Badge variant="secondary">Features Overview</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              A Complete Learning <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Experience</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Inner Odyssey by Flashfusion combines emotional intelligence, academics, and life skills in one engaging platform
            </p>
          </div>

          {/* Three Pillars */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {pillars.map((pillar, index) => (
              <Card key={index} className="elevated-card">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-4`}>
                    <pillar.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{pillar.title}</CardTitle>
                  <CardDescription>{pillar.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pillar.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Age-Adaptive Section */}
          <div className="mb-16">
            <div className="text-center space-y-4 mb-12">
              <Badge variant="outline">Age-Adaptive Design</Badge>
              <h2 className="text-3xl font-bold">Grows With Your Child</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform adapts to each age group, ensuring age-appropriate content and engagement
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ageTiers.map((tier, index) => (
                <Card key={index} className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Zap className="h-3 w-3 text-accent flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Gamification Features */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2">
            <CardHeader className="text-center">
              <Badge variant="outline" className="mx-auto mb-4">Engagement Features</Badge>
              <CardTitle className="text-3xl">Learning Made Fun</CardTitle>
              <CardDescription className="text-base">
                Gamification elements that motivate without distraction
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold">Daily Quests</h3>
                <p className="text-sm text-muted-foreground">
                  Personalized learning missions that adapt to progress
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="font-semibold">Points & Badges</h3>
                <p className="text-sm text-muted-foreground">
                  Earn rewards for achievements and consistent effort
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
                  <Users className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-semibold">Parent Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time insights and progress tracking
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mt-16 space-y-6">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-muted-foreground">
              Join our beta program and experience the future of K-12 learning
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

export default Features;
