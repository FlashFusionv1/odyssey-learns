import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";
import { AITutorChat } from "./AITutorChat";

interface AITutorButtonProps {
  childId: string;
  childName: string;
  gradeLevel: number;
  subject?: string;
}

export function AITutorButton({
  childId,
  childName,
  gradeLevel,
  subject,
}: AITutorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button when chat is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-4 right-4 z-40"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-full w-14 h-14 p-0 shadow-lg bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <div className="relative">
                <Bot className="w-6 h-6" />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </motion.div>
              </div>
            </Button>
            
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute right-16 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-3 py-1.5 rounded-lg shadow-md text-sm whitespace-nowrap"
            >
              Need help? Ask me! 💬
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AITutorChat
        childId={childId}
        childName={childName}
        gradeLevel={gradeLevel}
        subject={subject}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
