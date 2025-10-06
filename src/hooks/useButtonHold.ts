import { useRef, useCallback, useEffect } from 'react';

interface UseButtonHoldOptions {
  onAction: () => void;
  initialDelay?: number;
  repeatDelay?: number;
}

export const useButtonHold = ({ 
  onAction, 
  initialDelay = 400,  // Délai avant le début de la répétition
  repeatDelay = 80     // Délai entre chaque répétition
}: UseButtonHoldOptions) => {
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const isHoldingRef = useRef(false);
  const actionRef = useRef(onAction);

  // Garder la référence à jour
  useEffect(() => {
    actionRef.current = onAction;
  }, [onAction]);

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
    e.stopPropagation();
    
    // Action immédiate au premier clic
    actionRef.current();
    isHoldingRef.current = true;

    // Attendre un peu avant de commencer la répétition
    timeoutRef.current = window.setTimeout(() => {
      if (isHoldingRef.current) {
        // Commencer la répétition
        intervalRef.current = window.setInterval(() => {
          if (isHoldingRef.current) {
            actionRef.current();
          }
        }, repeatDelay);
      }
    }, initialDelay);
  }, [initialDelay, repeatDelay]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clear();
  }, [clear]);

  const onPointerLeave = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    clear();
  }, [clear]);

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    clear();
  }, [clear]);

  // Nettoyer au démontage
  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return {
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onPointerCancel
  };
};
