import { Calculator, Zap, Table, Route, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const navigationItems: NavigationItem[] = [
  { id: "calculator", label: "Calculateur", icon: Calculator },
  { id: "distances", label: "Distances", icon: Zap },
  { id: "table", label: "Table", icon: Table },
  { id: "splits", label: "Splits", icon: Route },
  { id: "favorites", label: "Favoris", icon: Heart },
];

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
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
};