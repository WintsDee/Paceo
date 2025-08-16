import { toast } from "sonner";
import { CheckCircle, XCircle, Info, AlertTriangle, Copy, Share2, Printer, Heart, Play, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useAppNotifications = () => {
  const { t } = useLanguage();
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
      showSuccess(t("Objectif sauvegardé"), {
        description: t("Objectif % ajouté à vos favoris").replace('%s', distance),
        action: {
          label: t("Voir favoris"),
          onClick: () => {
            // This will be handled by the parent component
            window.dispatchEvent(new CustomEvent('navigate-to-favorites'));
          }
        }
      });
    },

    favoriteDeleted: (distance: string) => {
      showSuccess(t("Favori supprimé"), {
        description: t("Objectif % retiré de vos favoris").replace('%s', distance),
        duration: 2000
      });
    },

    favoriteLoaded: (distance: string) => {
      showSuccess(t("Objectif chargé"), {
        description: t("Objectif % et son programme sont maintenant actifs").replace('%s', distance),
        action: {
          label: t("Voir programme"),
          onClick: () => {
            window.dispatchEvent(new CustomEvent('navigate-to-program'));
          }
        }
      });
    },

    programCopied: () => {
      showSuccess(t("Programme copié"), {
        description: t("Le programme a été copié dans le presse-papiers"),
        duration: 2000
      });
    },

    programShared: () => {
      showSuccess(t("Programme partagé"), {
        description: t("Le lien de partage a été généré"),
        duration: 2000
      });
    },

    programPrinted: () => {
      showInfo(t("Impression lancée"), {
        description: t("Le programme va s'ouvrir pour impression"),
        duration: 2000
      });
    },

    loadingError: (action: string) => {
      showError(t("Erreur de chargement"), {
        description: t("Impossible de %. Veuillez réessayer.").replace('%s', action),
        duration: 4000
      });
    },

    saveError: () => {
      showError(t("Erreur de sauvegarde"), {
        description: t("Impossible de sauvegarder l'objectif. Vérifiez vos données."),
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