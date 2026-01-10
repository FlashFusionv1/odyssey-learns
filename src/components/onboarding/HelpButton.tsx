/**
 * @fileoverview Help Button Component
 * Floating help button that provides access to tutorials, feature tours,
 * and documentation. Age-adaptive positioning and styling.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  HelpCircle, 
  BookOpen, 
  RefreshCw, 
  MessageCircle,
  Sparkles,
  Map,
  ExternalLink
} from 'lucide-react';

interface HelpButtonProps {
  onRestartTutorial: () => void;
  onStartFeatureTour: () => void;
  onOpenFeedback?: () => void;
  variant?: 'parent' | 'child';
  gradeLevel?: number;
}

/**
 * Floating help button with contextual menu
 */
export function HelpButton({
  onRestartTutorial,
  onStartFeatureTour,
  onOpenFeedback,
  variant = 'parent',
  gradeLevel = 5,
}: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Age-adaptive sizing
  const isYoungChild = variant === 'child' && gradeLevel <= 2;
  const buttonSize = isYoungChild ? 'w-14 h-14' : 'w-12 h-12';
  const iconSize = isYoungChild ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="secondary"
              size="icon"
              className={`${buttonSize} rounded-full shadow-lg border-2 hover:shadow-xl transition-shadow`}
              aria-label="Help and tutorials"
            >
              <HelpCircle className={iconSize} />
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        
        <AnimatePresence>
          {isOpen && (
            <DropdownMenuContent
              align="end"
              className="w-56"
              asChild
              forceMount
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <DropdownMenuItem 
                  onClick={onRestartTutorial}
                  className="cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span>Restart Tutorial</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={onStartFeatureTour}
                  className="cursor-pointer"
                >
                  <Map className="w-4 h-4 mr-2" />
                  <span>Feature Tour</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {variant === 'parent' && (
                  <DropdownMenuItem 
                    onClick={() => window.open('https://docs.innerodyssey.app', '_blank')}
                    className="cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>Help Center</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                  </DropdownMenuItem>
                )}
                
                {onOpenFeedback && (
                  <DropdownMenuItem 
                    onClick={onOpenFeedback}
                    className="cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span>Send Feedback</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => {}}
                  className="cursor-pointer text-primary"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>What's New</span>
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          )}
        </AnimatePresence>
      </DropdownMenu>
    </div>
  );
}

export default HelpButton;
