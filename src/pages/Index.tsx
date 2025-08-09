import { useState } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CalculatorScreen } from "@/components/screens/CalculatorScreen";
import { FavoritesScreen } from "@/components/screens/FavoritesScreen";
import { RaceGoal } from "@/components/calculator/RaceGoalCalculator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const [isMetric, setIsMetric] = useLocalStorage("pace-calc-metric", true);
  const [favorites, setFavorites] = useLocalStorage<RaceGoal[]>("pace-calc-favorites", []);

  const handleToggleUnits = () => {
    setIsMetric(!isMetric);
  };

  const handleSaveGoal = (goal: RaceGoal) => {
    setFavorites([goal, ...favorites]);
  };

  const handleDeleteFavorite = (id: string) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  const handleUseFavorite = (goal: RaceGoal) => {
    // Switch to calculator tab when using a favorite
    setActiveTab("calculator");
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "calculator":
        return (
          <CalculatorScreen
            isMetric={isMetric}
            onToggleUnits={handleToggleUnits}
            onSaveGoal={handleSaveGoal}
          />
        );
      case "favorites":
        return (
          <FavoritesScreen
            favorites={favorites}
            onDeleteFavorite={handleDeleteFavorite}
            onUseFavorite={handleUseFavorite}
          />
        );
      case "distances":
      case "table":
      case "splits":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center pb-20">
            <Card className="glass-card p-8 max-w-sm mx-auto">
              <h2 className="text-xl font-semibold mb-4">Bientôt disponible</h2>
              <p className="text-muted-foreground">
                Cette fonctionnalité sera ajoutée dans une prochaine version.
              </p>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-md">
        {renderScreen()}
      </main>
      
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default Index;
