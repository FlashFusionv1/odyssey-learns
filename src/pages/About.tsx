import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Heart, Target, Users, Lightbulb } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Pioneering new ways to make learning engaging and effective",
    },
    {
      icon: Heart,
      title: "Empathy",
      description: "Putting emotional intelligence at the heart of education",
    },
    {
      icon: Target,
      title: "Excellence",
      description: "Committed to the highest standards in educational content",
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Making quality education accessible to every child",
    },
  ];

  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former educator with 15 years experience in K-12 curriculum development. Ph.D. in Educational Psychology.",
    },
    {
      name: "Marcus Johnson",
      role: "CTO & Co-Founder",
      bio: "Tech entrepreneur passionate about EdTech. Built scalable platforms serving millions of students.",
    },
    {
      name: "Dr. Aisha Patel",
      role: "Head of Curriculum",
      bio: "Licensed psychologist specializing in child development and emotional intelligence training.",
    },
  ];

  const milestones = [
    { year: "2024 Q1", event: "Flashfusion founded" },
    { year: "2024 Q2", event: "Inner Odyssey platform development begins" },
    { year: "2024 Q3", event: "Beta testing with 50 families" },
    { year: "2024 Q4", event: "Expanded to 200+ beta families" },
    { year: "2025 Q1", event: "Public launch planned" },
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
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">About Flashfusion</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Building the Future of <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">K-12 Education</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Inner Odyssey by Flashfusion was born from a simple frustration: existing educational platforms focus only on academics, ignoring the emotional and practical skills kids need to thrive.
            </p>
          </div>

          {/* Mission */}
          <Card className="mb-16 bg-gradient-to-br from-primary/10 to-secondary/10 border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-center max-w-3xl mx-auto">
              <p className="text-lg leading-relaxed">
                Empower every child to become emotionally intelligent, academically confident, and life-ready through personalized learning journeys that adapt to their unique needs, celebrate their growth, and involve parents as active partners in their success.
              </p>
            </CardContent>
          </Card>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <value.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Meet Our Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <CardTitle className="text-center text-xl">{member.name}</CardTitle>
                    <p className="text-center text-sm text-muted-foreground">{member.role}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-center">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Our Journey</h2>
            <div className="max-w-3xl mx-auto">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-4 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-primary" />
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 h-full bg-primary/30 my-1" />
                    )}
                  </div>
                  <div className="pb-8">
                    <Badge variant="outline" className="mb-2">{milestone.year}</Badge>
                    <p className="text-sm">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Join Our Mission</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Help us build the most comprehensive K-12 learning platform. Your feedback shapes the future.
            </p>
            <Button size="lg" onClick={() => navigate("/beta-program")} className="shadow-xl">
              Apply to Beta Program
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
