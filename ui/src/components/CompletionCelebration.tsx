import { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, Trophy } from 'lucide-react';

interface CompletionCelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

export const CompletionCelebration = ({ show, onComplete }: CompletionCelebrationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" />

      {/* Celebration Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 animate-in zoom-in-50 slide-in-from-bottom-4 duration-500">
          {/* Main Icon */}
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-glow animate-bounce">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary animate-pulse">Task Completed! 🎉</h2>
            <p className="text-muted-foreground">Great job! Keep up the momentum!</p>
          </div>

          {/* Floating icons */}
          <div className="flex justify-center space-x-4">
            <Sparkles className="w-6 h-6 text-accent animate-bounce" style={{ animationDelay: '0.2s' }} />
            <Trophy className="w-6 h-6 text-success animate-bounce" style={{ animationDelay: '0.4s' }} />
            <Sparkles className="w-6 h-6 text-primary animate-bounce" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>
      </div>

      {/* Confetti effect */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-primary rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 bg-accent rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random()}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
