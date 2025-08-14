import React, { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useProgramState } from "@/hooks/useProgramState";
import { useAppNotifications } from "@/hooks/useAppNotifications";
import { CalculatorScreen } from "@/components/screens/CalculatorScreen";
import { GoalScreen } from "@/components/screens/GoalScreen";
import { ProgramScreen } from "@/components/screens/ProgramScreen";
import { CombinedDistancesScreen } from "@/components/screens/CombinedDistancesScreen";
import { FavoritesScreen } from "@/components/screens/FavoritesScreen";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { AppInfoButton } from "@/components/layout/AppInfoButton";
import { RaceGoal } from "@/components/calculator/RaceGoalCalculator";


const Index = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const [favorites, setFavorites] = useLocalStorage<RaceGoal[]>("pace-calc-favorites", []);
  const { notifications } = useAppNotifications();
  
  const programState = useProgramState();
  const { 
    speedValue, setSpeedValue, 
    isMetric, setIsMetric, 
    vmaValue, setVmaValue,
    loadFromFavorite, 
    isLoading 
  } = programState;

  // Navigation event listeners
  useEffect(() => {
    const handleNavigateToFavorites = () => setActiveTab("favorites");
    const handleNavigateToProgram = () => setActiveTab("program");
    
    window.addEventListener('navigate-to-favorites', handleNavigateToFavorites);
    window.addEventListener('navigate-to-program', handleNavigateToProgram);
    
    return () => {
      window.removeEventListener('navigate-to-favorites', handleNavigateToFavorites);
      window.removeEventListener('navigate-to-program', handleNavigateToProgram);
    };
  }, []);

  const handleToggleUnits = React.useCallback(() => {
    const nextIsMetric = !isMetric;
    // Convert speed to the new unit to keep pace consistent across the app
    const convertedSpeed = nextIsMetric
      ? speedValue / 0.621371 // mph -> km/h
      : speedValue * 0.621371; // km/h -> mph

    setIsMetric(nextIsMetric);
    setSpeedValue(parseFloat(convertedSpeed.toFixed(2)));
  }, [isMetric, speedValue, setIsMetric, setSpeedValue]);

  const handleSaveGoal = (goal: RaceGoal) => {
    try {
      const goalWithId = { ...goal, id: Date.now().toString() };
      setFavorites([...favorites, goalWithId]);
      notifications.favoriteAdded(goal.distance);
    } catch (error) {
      notifications.saveError();
    }
  };

  const handleDeleteFavorite = (id: string) => {
    setFavorites(favorites.filter(goal => goal.id !== id));
  };

  const handleUseFavorite = async (goal: RaceGoal) => {
    try {
      await loadFromFavorite(goal);
      setActiveTab("program");
    } catch (error) {
      notifications.loadingError("charger l'objectif");
    }
  };

  const renderScreen = React.useCallback(() => {
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
      case "program":
        return (
          <ProgramScreen
            isMetric={isMetric}
            onToggleUnits={handleToggleUnits}
            speedValue={speedValue}
            vmaValue={vmaValue}
            isLoading={isLoading}
            onSaveGoal={handleSaveGoal}
          />
        );
      case "distances":
        return (
          <CombinedDistancesScreen
            isMetric={isMetric}
            speedValue={speedValue}
          />
        );
      default:
        return null;
    }
  }, [activeTab, isMetric, handleToggleUnits, handleSaveGoal, speedValue, setSpeedValue, favorites, handleDeleteFavorite, handleUseFavorite, vmaValue, isLoading]);

  return (
    <div className="min-h-screen bg-background">
      <AppInfoButton isMetric={isMetric} onToggleUnits={handleToggleUnits} />
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
