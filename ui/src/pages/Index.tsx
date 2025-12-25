import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Logo } from '@/components/Logo';
import { WalletButton } from '@/components/WalletButton';
import { CompletionCelebration } from '@/components/CompletionCelebration';
import { ScrollReveal } from '@/components/ScrollReveal';
import { ActivityCard } from '@/components/ActivityCard';
import { ProgressBar } from '@/components/ProgressBar';
import { AddActivityDialog } from '@/components/AddActivityDialog';
import { CheckSquare, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTodoList } from '@/hooks/useTodoList';

// Get contract address from environment variable or use default localhost address
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

// Debug: Log environment variables (remove in production)
if (import.meta.env.DEV) {
  console.log('Environment variables:', {
    VITE_CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS,
    CONTRACT_ADDRESS_USED: CONTRACT_ADDRESS,
    MODE: import.meta.env.MODE,
  });
}

const Index = () => {
  const { address, isConnected } = useAccount();
  const { todos, isLoading, isDecrypting, message, createTodo, toggleTodo, loadTodos, decryptTodos } = useTodoList(CONTRACT_ADDRESS);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleAddTodo = async (category: 'sleep' | 'exercise' | 'tasks', text: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      await createTodo(text);
      toast.success('Todo created successfully!');
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Failed to create todo'}`);
    }
  };

  const handleToggleTodo = async (index: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const todo = todos.find(t => t.index === index);
    const wasCompleted = todo?.completed;

    try {
      await toggleTodo(index);
      // Show celebration animation when task is completed (not when uncompleted)
      if (!wasCompleted) {
        setShowCelebration(true);
      }
      toast.success(wasCompleted ? 'Todo marked as incomplete' : 'Todo completed! 🎉');
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Failed to toggle todo'}`);
    }
  };

  // Check if todos are decrypted
  // A todo is decrypted if it has isDecrypted flag set to true
  // Or if text doesn't start with "Encrypted Todo" (from local storage)
  const isDecrypted = todos.length > 0 && todos.every(t => {
    // Check if explicitly marked as decrypted
    if (t.isDecrypted) return true;
    // Or if text doesn't start with "Encrypted Todo" (means it's from local storage)
    return t.text && !t.text.startsWith('Encrypted Todo');
  });

  // Convert todos to Activity format for ActivityCard
  const todosAsActivities = todos.map(todo => ({
    id: todo.id,
    label: todo.text,
    completed: todo.completed,
    encrypted: !isDecrypted,
  }));

  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Completion Celebration */}
      <CompletionCelebration
        show={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <ScrollReveal>
          <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            End-to-End Encrypted
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-pulse">
            Private To-do List
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Secure encrypted to-do list with blockchain-verified encryption. Your tasks are encrypted on-chain and only you can decrypt them.
          </p>
        </div>
        </ScrollReveal>

        {!CONTRACT_ADDRESS && (
          <ScrollReveal delay={200}>
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="p-8 bg-card rounded-2xl shadow-medium border border-destructive/20 hover:shadow-glow transition-shadow duration-300">
                <Shield className="w-16 h-16 mx-auto mb-4 text-destructive animate-bounce" />
                <h2 className="text-2xl font-bold mb-2">Contract Not Configured</h2>
                <p className="text-muted-foreground mb-6">
                  Please set VITE_CONTRACT_ADDRESS in your .env.local file with the deployed PrivateTodoList contract address.
                </p>
              </div>
            </div>
          </ScrollReveal>
        )}

        {CONTRACT_ADDRESS && isConnected ? (
          <ScrollReveal delay={400}>
            <div className="space-y-8 max-w-4xl mx-auto">
            {/* Status Message */}
            {message && (
              <div className="p-4 bg-card rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
            )}

            {/* Add Todo Button */}
            <div className="flex justify-center sm:justify-end mb-4">
              <AddActivityDialog
                onAddActivity={(category, text) => handleAddTodo(category, text)}
              />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading todos...</span>
              </div>
            )}

            {/* Todos List */}
            {!isLoading && (
              <>
                {/* Decrypt Button */}
                {!isDecrypted && todos.length > 0 && (
                  <div className="mb-4 flex justify-center">
                    <button
                      onClick={async () => {
                        if (!isConnected) {
                          toast.error('Please connect your wallet first');
                          return;
                        }
                        try {
                          await decryptTodos();
                          toast.success('Todos decrypted successfully!');
                        } catch (error: any) {
                          toast.error(`Error: ${error.message || 'Failed to decrypt todos'}`);
                        }
                      }}
                      disabled={isDecrypting || !isConnected}
                      className="px-6 py-3 bg-gradient-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isDecrypting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Decrypting...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          Decrypt with Wallet
                        </>
                      )}
                    </button>
                  </div>
                )}

                <ActivityCard
                  title="My Todos"
                  icon={<CheckSquare className="w-5 h-5" />}
                  activities={todosAsActivities}
                  onActivityToggle={(id) => {
                    const todo = todos.find(t => t.id === id);
                    if (todo) {
                      handleToggleTodo(todo.index);
                    }
                  }}
                />

                {/* Progress Section */}
                {totalTodos > 0 && (
                  <ScrollReveal delay={600}>
                    <div className="bg-card rounded-xl p-4 sm:p-8 shadow-medium border border-primary/10 hover:shadow-glow transition-shadow duration-300">
                      <ProgressBar value={completedTodos} total={totalTodos} />
                    </div>
                  </ScrollReveal>
                )}

                {/* Empty State */}
                {totalTodos === 0 && !isLoading && (
                  <ScrollReveal delay={500}>
                    <div className="text-center py-12">
                      <CheckSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50 animate-pulse" />
                      <h3 className="text-xl font-semibold mb-2">No todos yet</h3>
                      <p className="text-muted-foreground">
                        Create your first encrypted todo item to get started!
                      </p>
                    </div>
                  </ScrollReveal>
                )}
              </>
            )}
          </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={300}>
            <div className="max-w-md mx-auto text-center space-y-6 px-4">
              <div className="p-6 sm:p-8 bg-card rounded-2xl shadow-medium border border-primary/10 hover:shadow-glow transition-all duration-300 hover:scale-105">
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-primary animate-pulse" />
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Connect to Start</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-6">
                  Connect your Rainbow Wallet to access your encrypted to-do list. Your data is stored securely on-chain and only you can decrypt it.
                </p>
                <WalletButton />
              </div>
            </div>
          </ScrollReveal>
        )}
      </main>

      {/* Footer */}
      <ScrollReveal delay={800}>
        <footer className="border-t border-border/50 mt-8 sm:mt-16 py-6 sm:py-8 bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-2">
              <p className="text-xs sm:text-sm text-muted-foreground px-4">
                Your todos are encrypted and stored on-chain. Only accessible with your connected wallet.
              </p>
              <p className="text-xs text-muted-foreground">
                Built with privacy-first technology • Powered by Rainbow Wallet & FHEVM
              </p>
            </div>
          </div>
        </footer>
      </ScrollReveal>
    </div>
  );
};

export default Index;
