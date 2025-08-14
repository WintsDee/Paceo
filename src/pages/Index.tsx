import React from "react";
import { useState } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CalculatorScreen } from "@/components/screens/CalculatorScreen";
import { FavoritesScreen } from "@/components/screens/FavoritesScreen";
import { CombinedDistancesScreen } from "@/components/screens/CombinedDistancesScreen";
import { RaceGoal } from "@/components/calculator/RaceGoalCalculator";
import { GoalScreen } from "@/components/screens/GoalScreen";
import { ProgramScreen } from "@/components/screens/ProgramScreen";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AppInfoButton } from "@/components/layout/AppInfoButton";

const Index = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const [isMetric, setIsMetric] = useLocalStorage("pace-calc-metric", true);
  const [favorites, setFavorites] = useLocalStorage<RaceGoal[]>("pace-calc-favorites", []);
  const [speedValue, setSpeedValue] = useLocalStorage<number>("pace-calc-speed", 13.33); // default km/h

  const handleToggleUnits = React.useCallback(() => {
    const nextIsMetric = !isMetric;
    // Convert speed to the new unit to keep pace consistent across the app
    const convertedSpeed = nextIsMetric
      ? speedValue / 0.621371 // mph -> km/h
      : speedValue * 0.621371; // km/h -> mph

    setIsMetric(nextIsMetric);
    setSpeedValue(parseFloat(convertedSpeed.toFixed(2)));
  }, [isMetric, speedValue, setIsMetric, setSpeedValue]);

  const handleSaveGoal = React.useCallback((goal: RaceGoal) => {
    setFavorites([goal, ...favorites]);
  }, [favorites, setFavorites]);

  const handleDeleteFavorite = React.useCallback((id: string) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  }, [favorites, setFavorites]);

  const handleUseFavorite = React.useCallback((goal: RaceGoal) => {
    // Clear current state completely
    setSpeedValue(0);
    
    // Force a state refresh by clearing localStorage temporarily
    try {
      const keysToPreserve = ["pace-calc-favorites"];
      const preservedData: Record<string, string> = {};
      keysToPreserve.forEach(key => {
        const value = window.localStorage.getItem(key);
        if (value) preservedData[key] = value;
      });
      
      // Clear all pace-calc related localStorage
      Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith("pace-calc") || key.startsWith("program-")) {
          window.localStorage.removeItem(key);
        }
      });
      
      // Restore preserved data
      Object.entries(preservedData).forEach(([key, value]) => {
        window.localStorage.setItem(key, value);
      });
    } catch {}
    
    // Load the favorite goal with a slight delay to ensure clean state
    setTimeout(() => {
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
        // Load program parameters if they exist
        if (goal.program) {
          window.localStorage.setItem("program-sessions-week", JSON.stringify(goal.program.sessionsPerWeek));
          window.localStorage.setItem("program-weeks-before", JSON.stringify(goal.program.weeksBeforeRace));
        }
      } catch {}
      
      setActiveTab("program");
      
      // Force a full page refresh to ensure all components reload with new data
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }, 50);
  }, [setIsMetric, setSpeedValue, setActiveTab]);

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
            speedValue={speedValue}
            vmaValue={(() => {
              try {
                const vma = window.localStorage.getItem("pace-calc-vma");
                return vma ? JSON.parse(vma) : undefined;
              } catch {
                return undefined;
              }
            })()}
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
  }, [activeTab, isMetric, handleToggleUnits, handleSaveGoal, speedValue, setSpeedValue, favorites, handleDeleteFavorite, handleUseFavorite]);

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
