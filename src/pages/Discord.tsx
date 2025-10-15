import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

const Discord = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "https://discord.gg/innerodyssey";
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <Badge variant="secondary" className="mx-auto mb-2">Join Our Community</Badge>
          <CardTitle className="text-2xl">Redirecting to Discord...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">You'll be redirected in 3 seconds</p>
          <a href="https://discord.gg/innerodyssey" className="text-primary hover:underline block">
            Click here if not redirected automatically
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default Discord;
