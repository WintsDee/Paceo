import { useRef, useCallback } from 'react';

interface UseButtonHoldOptions {
  onAction: () => void;
  initialDelay?: number;
  repeatDelay?: number;
}

export const useButtonHold = ({ 
  onAction, 
  initialDelay = 500,  // Délai avant le début de la répétition
  repeatDelay = 100     // Délai entre chaque répétition
}: UseButtonHoldOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isHoldingRef.current = false;
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    
    // Action immédiate au premier clic
    onAction();
    isHoldingRef.current = true;

    // Attendre un peu avant de commencer la répétition
    timeoutRef.current = setTimeout(() => {
      if (isHoldingRef.current) {
        // Commencer la répétition
        intervalRef.current = setInterval(() => {
          if (isHoldingRef.current) {
            onAction();
          }
        }, repeatDelay);
      }
    }, initialDelay);
  }, [onAction, initialDelay, repeatDelay]);

  const onPointerUp = useCallback(() => {
    clear();
  }, [clear]);

  const onPointerLeave = useCallback(() => {
    clear();
  }, [clear]);

  return {
    onPointerDown,
    onPointerUp,
    onPointerLeave
  };
};
