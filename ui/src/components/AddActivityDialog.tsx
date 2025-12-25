import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Sparkles } from 'lucide-react';

interface AddActivityDialogProps {
  onAddActivity: (category: 'sleep' | 'exercise' | 'tasks', label: string) => void;
}

export const AddActivityDialog = ({ onAddActivity }: AddActivityDialogProps) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim()) {
      onAddActivity('tasks', label.trim());
      setLabel('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="group relative overflow-hidden hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:border-primary/50"
        >
          <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          <Plus className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
          <span className="relative z-10">Add Todo</span>
          <Sparkles className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Todo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="todo-label">Todo Text</Label>
            <Input
              id="todo-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Buy medicine, Interview preparation"
              maxLength={100}
            />
          </div>
          <Button type="submit" className="w-full" disabled={!label.trim()}>
            Create Todo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
