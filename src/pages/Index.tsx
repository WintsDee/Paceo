import { useState } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CalculatorScreen } from "@/components/screens/CalculatorScreen";
import { FavoritesScreen } from "@/components/screens/FavoritesScreen";
import { QuickDistancesScreen } from "@/components/screens/QuickDistancesScreen";
import { SplitsScreen } from "@/components/screens/SplitsScreen";
import { RaceGoal } from "@/components/calculator/RaceGoalCalculator";
import { GoalScreen } from "@/components/screens/GoalScreen";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const [isMetric, setIsMetric] = useLocalStorage("pace-calc-metric", true);
  const [favorites, setFavorites] = useLocalStorage<RaceGoal[]>("pace-calc-favorites", []);
  const [speedValue, setSpeedValue] = useLocalStorage<number>("pace-calc-speed", 13.33); // default km/h

  const handleToggleUnits = () => {
    const nextIsMetric = !isMetric;
    // Convert speed to the new unit to keep pace consistent across the app
    const convertedSpeed = nextIsMetric
      ? speedValue / 0.621371 // mph -> km/h
      : speedValue * 0.621371; // km/h -> mph

    setIsMetric(nextIsMetric);
    setSpeedValue(parseFloat(convertedSpeed.toFixed(2)));
  };

  const handleSaveGoal = (goal: RaceGoal) => {
    setFavorites([goal, ...favorites]);
  };

  const handleDeleteFavorite = (id: string) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  const handleUseFavorite = (goal: RaceGoal) => {
    // Load units and speed + persist goal-specific settings for global sync
    setIsMetric(goal.isMetric);
    const s = parseFloat(goal.speed);
    if (!Number.isNaN(s)) setSpeedValue(s);
    try {
      if (goal.selectedDistanceId) {
        window.localStorage.setItem("pace-calc-goal-distance", JSON.stringify(goal.selectedDistanceId));
      }
      if (goal.vmaKmh != null) {
        window.localStorage.setItem("pace-calc-vma", JSON.stringify(goal.vmaKmh));
      }
    } catch {}
    setActiveTab("goal");
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "calculator":
        return (
          <CalculatorScreen
            isMetric={isMetric}
            onToggleUnits={handleToggleUnits}
            onSaveGoal={handleSaveGoal}
            speedValue={speedValue}
            onSpeedChange={setSpeedValue}
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
      case "goal":
        return (
          <GoalScreen
            isMetric={isMetric}
            speedValue={speedValue}
            onSpeedChange={setSpeedValue}
            onSaveGoal={handleSaveGoal}
          />
        );
      case "distances":
        return (
          <QuickDistancesScreen
            isMetric={isMetric}
            speedValue={speedValue}
          />
        );
      case "splits":
        return (
          <SplitsScreen
            isMetric={isMetric}
            speedValue={speedValue}
          />
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
