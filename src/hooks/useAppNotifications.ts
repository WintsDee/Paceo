import { toast } from "sonner";
import { CheckCircle, XCircle, Info, AlertTriangle, Copy, Share2, Printer, Heart, Play, Target } from "lucide-react";

interface NotificationOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useAppNotifications = () => {
  const showSuccess = (title: string, options?: NotificationOptions) => {
    toast.success(title, {
      description: options?.description,
      duration: options?.duration || 2000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      className: "glass-card border-green-500/20 bg-green-50/10",
    });
  };

  const showError = (title: string, options?: NotificationOptions) => {
    toast.error(title, {
      description: options?.description,
      duration: options?.duration || 3000,
      className: "glass-card border-destructive/20 bg-destructive/10",
    });
  };

  const showInfo = (title: string, options?: NotificationOptions) => {
    toast.info(title, {
      description: options?.description,
      duration: options?.duration || 2000,
      className: "glass-card border-blue-500/20 bg-blue-50/10",
    });
  };

  const showWarning = (title: string, options?: NotificationOptions) => {
    toast.warning(title, {
      description: options?.description,
      duration: options?.duration || 3000,
      className: "glass-card border-orange-500/20 bg-orange-50/10",
    });
  };

  // Notifications spécialisées pour l'app de course
  const notifications = {
    favoriteAdded: (distance: string) => {
      showSuccess("Objectif sauvegardé", {
        description: `Objectif ${distance} ajouté à vos favoris`,
        action: {
          label: "Voir favoris",
          onClick: () => {
            // This will be handled by the parent component
            window.dispatchEvent(new CustomEvent('navigate-to-favorites'));
          }
        }
      });
    },

    favoriteDeleted: (distance: string) => {
      showSuccess("Favori supprimé", {
        description: `Objectif ${distance} retiré de vos favoris`,
        duration: 2000
      });
    },

    favoriteLoaded: (distance: string) => {
      showSuccess("Objectif chargé", {
        description: `Objectif ${distance} et son programme sont maintenant actifs`,
        action: {
          label: "Voir programme",
          onClick: () => {
            window.dispatchEvent(new CustomEvent('navigate-to-program'));
          }
        }
      });
    },

    programCopied: () => {
      showSuccess("Programme copié", {
        description: "Le programme a été copié dans le presse-papiers",
        duration: 2000
      });
    },

    programShared: () => {
      showSuccess("Programme partagé", {
        description: "Le lien de partage a été généré",
        duration: 2000
      });
    },

    programPrinted: () => {
      showInfo("Impression lancée", {
        description: "Le programme va s'ouvrir pour impression",
        duration: 2000
      });
    },

    loadingError: (action: string) => {
      showError("Erreur de chargement", {
        description: `Impossible de ${action}. Veuillez réessayer.`,
        duration: 4000
      });
    },

    saveError: () => {
      showError("Erreur de sauvegarde", {
        description: "Impossible de sauvegarder l'objectif. Vérifiez vos données.",
        duration: 4000
      });
    }
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    notifications
  };
};