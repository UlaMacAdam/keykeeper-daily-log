import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  value: number;
  total: number;
}

export const ProgressBar = ({ value, total }: ProgressBarProps) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
        <span className="text-muted-foreground font-medium">Daily Progress</span>
        <span className="font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full text-xs sm:text-sm">
          {value} of {total} completed
        </span>
      </div>

      <div className="relative">
        <Progress
          value={percentage}
          className="h-4 bg-secondary/50 rounded-full overflow-hidden shadow-inner"
        />
        {/* Animated progress indicator */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-primary rounded-full transition-all duration-1000 ease-out shadow-lg"
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full" />
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="text-xs sm:text-sm text-muted-foreground">
          {percentage}% of your daily goals achieved
        </span>
        {percentage === 100 && (
          <span className="text-success text-lg animate-bounce">🎉</span>
        )}
      </div>

      {/* Motivation message */}
      {percentage > 0 && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground italic">
            {percentage < 30 && "Every small step counts! Keep going! 💪"}
            {percentage >= 30 && percentage < 70 && "You're making great progress! 🚀"}
            {percentage >= 70 && percentage < 100 && "Almost there! You're crushing it! 🔥"}
            {percentage === 100 && "Perfect! You've completed all tasks! 🏆"}
          </p>
        </div>
      )}
    </div>
  );
};
