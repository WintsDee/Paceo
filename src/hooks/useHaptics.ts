import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export type HapticType = 
  | 'light'      // Action légère (bouton, toggle)
  | 'medium'     // Action moyenne (sélection, validation)
  | 'heavy'      // Action importante (sauvegarde, confirmation)
  | 'success'    // Succès (sauvegarde réussie)
  | 'warning'    // Avertissement (action non autorisée)
  | 'error'      // Erreur (échec d'action)
  | 'selection'  // Sélection d'élément
  | 'notification'; // Notification

export const useHaptics = () => {
  const isNative = Capacitor.isNativePlatform();

  const triggerHaptic = async (type: HapticType) => {
    if (!isNative) {
      // Sur web, on peut simuler un retour visuel ou sonore
      console.log(`Haptic feedback: ${type}`);
      return;
    }

    try {
      switch (type) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          // Combinaison de vibrations pour le succès
          await Haptics.impact({ style: ImpactStyle.Medium });
          setTimeout(async () => {
            await Haptics.impact({ style: ImpactStyle.Light });
          }, 100);
          break;
        case 'warning':
          // Vibration d'avertissement
          await Haptics.impact({ style: ImpactStyle.Heavy });
          setTimeout(async () => {
            await Haptics.impact({ style: ImpactStyle.Heavy });
          }, 150);
          break;
        case 'error':
          // Vibration d'erreur
          await Haptics.impact({ style: ImpactStyle.Heavy });
          setTimeout(async () => {
            await Haptics.impact({ style: ImpactStyle.Medium });
            setTimeout(async () => {
              await Haptics.impact({ style: ImpactStyle.Heavy });
            }, 100);
          }, 100);
          break;
        case 'selection':
          await Haptics.selectionStart();
          break;
        case 'notification':
          await Haptics.notification();
          break;
        default:
          await Haptics.impact({ style: ImpactStyle.Medium });
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  };

  const hapticFeedback = {
    // Actions de base
    light: () => triggerHaptic('light'),
    medium: () => triggerHaptic('medium'),
    heavy: () => triggerHaptic('heavy'),
    
    // Actions contextuelles
    buttonPress: () => triggerHaptic('light'),
    toggle: () => triggerHaptic('light'),
    selection: () => triggerHaptic('selection'),
    
    // Actions de programme
    programSaved: () => triggerHaptic('success'),
    programDeleted: () => triggerHaptic('warning'),
    timeIncreased: () => triggerHaptic('light'),
    timeDecreased: () => triggerHaptic('light'),
    distanceChanged: () => triggerHaptic('medium'),
    paceChanged: () => triggerHaptic('medium'),
    
    // Actions de calcul
    calculationComplete: () => triggerHaptic('success'),
    conversionComplete: () => triggerHaptic('medium'),
    
    // Actions d'erreur
    error: () => triggerHaptic('error'),
    warning: () => triggerHaptic('warning'),
    
    // Actions de navigation
    tabSwitch: () => triggerHaptic('light'),
    screenChange: () => triggerHaptic('light'),
  };

  return {
    triggerHaptic,
    hapticFeedback,
    isNative,
  };
};
