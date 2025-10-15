import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
  config: {
    hair?: string;
    color?: string;
    accessory?: string;
  };
  name?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeClasses = {
  small: 'w-10 h-10',
  medium: 'w-16 h-16',
  large: 'w-32 h-32',
};

export const AvatarDisplay = ({ config, name, size = 'medium', className }: AvatarDisplayProps) => {
  const { hair = 'short', color = 'brown', accessory = 'none' } = config;

  // Simple SVG-based avatar (can be enhanced later)
  const avatarSvg = (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      {/* Face circle */}
      <circle cx="12" cy="12" r="9" fill="#FFE4C4" />
      
      {/* Hair (simplified path based on hair style) */}
      <path
        d={
          hair === 'short' ? 'M12,4 Q12,2 14,2 L16,2 Q18,2 18,4 L18,8 Q18,10 16,10 L14,10 Q12,10 12,8 Z' :
          hair === 'long' ? 'M12,4 Q12,2 14,2 L16,2 Q18,2 18,4 L18,12 Q18,14 16,14 L14,14 Q12,14 12,12 Z' :
          hair === 'curly' ? 'M12,4 Q12,2 14,2 Q15,2 15,3 Q15,2 16,2 Q18,2 18,4 Q18,5 17,5 Q18,5 18,8 L18,10 Q16,10 14,10 Q12,10 12,8 Z' :
          hair === 'wavy' ? 'M12,4 Q12,2 14,2 L16,2 Q18,2 18,4 Q18,6 17,7 Q18,8 18,10 L12,10 Q12,8 13,7 Q12,6 12,4 Z' :
          'M12,4 Q12,2 14,2 L16,2 Q18,2 18,4 L18,6 Q20,6 20,8 Q20,10 18,10 L18,8 L12,8 Z'
        }
        fill={
          color === 'brown' ? '#8B4513' :
          color === 'blonde' ? '#FFD700' :
          color === 'black' ? '#000000' :
          color === 'red' ? '#DC143C' :
          color === 'blue' ? '#4169E1' :
          '#9370DB'
        }
      />
      
      {/* Eyes */}
      <circle cx="10" cy="11" r="1" fill="#000000" />
      <circle cx="14" cy="11" r="1" fill="#000000" />
      
      {/* Smile */}
      <path d="M9,14 Q12,16 15,14" stroke="#000000" strokeWidth="0.5" fill="none" />
      
      {/* Accessory */}
      {accessory === 'glasses' && (
        <path
          d="M8,12 L10,12 M10,12 Q11,11 12,11 Q13,11 14,12 M14,12 L16,12 M10,12 Q10,13 10,14 M14,12 Q14,13 14,14"
          stroke="#333333"
          strokeWidth="0.5"
          fill="none"
        />
      )}
      {accessory === 'hat' && (
        <path
          d="M10,6 L14,6 L15,4 Q15,2 12,2 Q9,2 9,4 L10,6 Z"
          fill="#FF6B6B"
        />
      )}
      {accessory === 'crown' && (
        <path
          d="M10,4 L11,2 L12,4 L13,2 L14,4 L14,6 L10,6 Z"
          fill="#FFD700"
        />
      )}
    </svg>
  );

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <div className="w-full h-full">{avatarSvg}</div>
      {name && (
        <AvatarFallback className="text-xs">
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      )}
    </Avatar>
  );
};
