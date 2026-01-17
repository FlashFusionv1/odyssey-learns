/**
 * @fileoverview Onboarding Path Selector
 * Entry point for choosing between Full Wizard and Quick Start.
 */

import { motion } from 'framer-motion';
import { 
  Zap, 
  Compass, 
  Clock, 
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface OnboardingPathSelectorProps {
  onSelectFull: () => void;
  onSelectQuickStart: () => void;
}

export function OnboardingPathSelector({
  onSelectFull,
  onSelectQuickStart,
}: OnboardingPathSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome to Inner Odyssey!
          </h1>
          <p className="text-muted-foreground text-lg">
            How would you like to get started?
          </p>
        </motion.div>

        {/* Path Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Start Option */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
              onClick={onSelectQuickStart}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Quick Start</h2>
                    <p className="text-sm text-muted-foreground">~2 minutes</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Jump right into learning with just a few essential questions. 
                  Perfect for eager learners!
                </p>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    3 quick questions
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Immediate app access
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Complete setup anytime
                  </li>
                </ul>

                <Button 
                  className="w-full group-hover:bg-primary/90" 
                  variant="default"
                >
                  Quick Start
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Full Wizard Option */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
              onClick={onSelectFull}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                    <Compass className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Guided Setup</h2>
                    <p className="text-sm text-muted-foreground">~9 minutes</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Take a complete tour and personalize every aspect of your 
                  learning experience.
                </p>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Full personalization
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Set learning goals
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Community preferences
                  </li>
                </ul>

                <Button 
                  className="w-full" 
                  variant="outline"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Take the Full Tour
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground"
        >
          You can switch between paths or complete setup later at any time.
        </motion.p>
      </div>
    </div>
  );
}

export default OnboardingPathSelector;
