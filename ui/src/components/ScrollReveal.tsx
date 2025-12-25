import { ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  threshold?: number;
  once?: boolean;
}

export const ScrollReveal = ({
  children,
  className,
  delay = 0,
  direction = 'up',
  threshold = 0.1,
  once = true
}: ScrollRevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [delay, threshold, once]);

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-700 ease-out";

    if (!isVisible) {
      switch (direction) {
        case 'up':
          return `${baseClasses} opacity-0 translate-y-8`;
        case 'down':
          return `${baseClasses} opacity-0 -translate-y-8`;
        case 'left':
          return `${baseClasses} opacity-0 translate-x-8`;
        case 'right':
          return `${baseClasses} opacity-0 -translate-x-8`;
        case 'fade':
        default:
          return `${baseClasses} opacity-0`;
      }
    }

    return `${baseClasses} opacity-100 translate-x-0 translate-y-0`;
  };

  return (
    <div
      ref={elementRef}
      className={cn(getAnimationClasses(), className)}
    >
      {children}
    </div>
  );
};
