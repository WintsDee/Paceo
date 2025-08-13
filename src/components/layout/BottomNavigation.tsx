import React from "react";
import { Calculator, Zap, Route, Heart, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}


export const BottomNavigation = React.memo(({ activeTab, onTabChange }: BottomNavigationProps) => {
  const { t } = useLanguage();
  
  const navigationItems = React.useMemo(() => [
    { id: "calculator", label: t("Allure & Vitesse"), icon: Calculator },
    { id: "goal", label: t("Objectif"), icon: Flag },
    { id: "program", label: t("Programme"), icon: Zap },
    { id: "distances", label: t("Splits"), icon: Route },
    { id: "favorites", label: t("Favoris"), icon: Heart },
  ], [t]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card border-t z-50">
      <div className="flex items-center justify-around px-2 py-3 max-w-md mx-auto">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-smooth min-w-[60px]",
                isActive 
                  ? "text-primary scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 transition-smooth",
                  isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                )} 
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
BottomNavigation.displayName = "BottomNavigation";