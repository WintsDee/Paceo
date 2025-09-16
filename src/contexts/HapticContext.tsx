import React, { createContext, useContext, ReactNode } from 'react';
import { useHaptics, HapticType } from '../hooks/useHaptics';

interface HapticContextType {
  triggerHaptic: (type: HapticType) => Promise<void>;
  hapticFeedback: {
    light: () => Promise<void>;
    medium: () => Promise<void>;
    heavy: () => Promise<void>;
    buttonPress: () => Promise<void>;
    toggle: () => Promise<void>;
    selection: () => Promise<void>;
    programSaved: () => Promise<void>;
    programDeleted: () => Promise<void>;
    timeIncreased: () => Promise<void>;
    timeDecreased: () => Promise<void>;
    distanceChanged: () => Promise<void>;
    paceChanged: () => Promise<void>;
    calculationComplete: () => Promise<void>;
    conversionComplete: () => Promise<void>;
    error: () => Promise<void>;
    warning: () => Promise<void>;
    tabSwitch: () => Promise<void>;
    screenChange: () => Promise<void>;
  };
  isNative: boolean;
}

const HapticContext = createContext<HapticContextType | undefined>(undefined);

export const useHapticContext = () => {
  const context = useContext(HapticContext);
  if (context === undefined) {
    throw new Error('useHapticContext must be used within a HapticProvider');
  }
  return context;
};

interface HapticProviderProps {
  children: ReactNode;
}

export const HapticProvider: React.FC<HapticProviderProps> = ({ children }) => {
  const haptic = useHaptics();

  return (
    <HapticContext.Provider value={haptic}>
      {children}
    </HapticContext.Provider>
  );
};
