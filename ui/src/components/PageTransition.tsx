import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-primary">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Page content with transition */}
      <div
        key={location.pathname}
        className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
        style={{
          animationFillMode: 'both',
        }}
      >
        {children}
      </div>
    </div>
  );
};
