import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Lock, CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  label: string;
  completed: boolean;
  encrypted?: boolean;
}

interface ActivityCardProps {
  title: string;
  icon: React.ReactNode;
  activities: Activity[];
  onActivityToggle: (id: string) => void;
  addActivityButton?: React.ReactNode;
}

export const ActivityCard = ({ title, icon, activities, onActivityToggle, addActivityButton }: ActivityCardProps) => {
  return (
    <Card className="p-4 sm:p-6 shadow-medium hover:shadow-glow transition-all duration-300 border-primary/10 hover:border-primary/20 group/card">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-primary text-primary-foreground group-hover/card:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-semibold group-hover/card:text-primary transition-colors duration-300">{title}</h3>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start sm:items-center gap-3 group/item p-3 sm:p-2 rounded-lg hover:bg-accent/5 transition-all duration-200 hover:translate-x-1"
            style={{
              animationDelay: `${index * 50}ms`
            }}
          >
            <div className="relative">
              <Checkbox
                id={activity.id}
                checked={activity.completed}
                onCheckedChange={() => onActivityToggle(activity.id)}
                className={cn(
                  "data-[state=checked]:bg-success data-[state=checked]:border-success transition-all duration-300",
                  "group-hover/item:scale-110"
                )}
              />
              {activity.completed && (
                <CheckCircle className="absolute inset-0 w-4 h-4 text-success animate-in zoom-in-50 duration-300" />
              )}
            </div>
            <Label
              htmlFor={activity.id}
              className={cn(
                "flex-1 cursor-pointer transition-all duration-300 group-hover/item:text-foreground",
                activity.completed
                  ? 'line-through text-muted-foreground opacity-60'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="relative">
                {activity.label}
                {activity.completed && (
                  <span className="absolute inset-0 bg-gradient-primary bg-clip-text text-transparent animate-pulse">
                    {activity.label}
                  </span>
                )}
              </span>
            </Label>
            {activity.encrypted && (
              <Lock className="w-4 h-4 text-accent opacity-60 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all duration-300" />
            )}
          </div>
        ))}
      </div>

      {addActivityButton && (
        <div className="mt-4 pt-4 border-t border-border/50 group-hover/card:border-primary/20 transition-colors duration-300">
          {addActivityButton}
        </div>
      )}
    </Card>
  );
};
