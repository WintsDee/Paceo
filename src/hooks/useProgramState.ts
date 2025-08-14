import { useState, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RaceGoal } from "@/components/calculator/RaceGoalCalculator";

interface ProgramState {
  sessionsPerWeek: number;
  weeksBeforeRace: number;
  selectedDistanceId: string;
  speedValue: number;
  isMetric: boolean;
  vmaValue?: number;
}

export const useProgramState = () => {
  const [sessionsPerWeek, setSessionsPerWeek] = useLocalStorage<number>("program-sessions-week", 3);
  const [weeksBeforeRace, setWeeksBeforeRace] = useLocalStorage<number>("program-weeks-before", 12);
  const [selectedDistanceId, setSelectedDistanceId] = useLocalStorage<string>("pace-calc-goal-distance", "10k");
  const [speedValue, setSpeedValue] = useLocalStorage<number>("pace-calc-speed", 10);
  const [isMetric, setIsMetric] = useLocalStorage<boolean>("pace-calc-metric", true);
  const [vmaValue, setVmaValue] = useLocalStorage<number | undefined>("pace-calc-vma", undefined);
  
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentState = useCallback((): ProgramState => ({
    sessionsPerWeek,
    weeksBeforeRace,
    selectedDistanceId,
    speedValue,
    isMetric,
    vmaValue
  }), [sessionsPerWeek, weeksBeforeRace, selectedDistanceId, speedValue, isMetric, vmaValue]);

  const loadFromFavorite = useCallback(async (goal: RaceGoal) => {
    setIsLoading(true);
    
    try {
      // Clear current state first
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Load all goal parameters
      const speed = parseFloat(goal.speed);
      if (!isNaN(speed)) {
        setSpeedValue(speed);
      }
      setSelectedDistanceId(goal.distance.toLowerCase().replace(' ', '').replace('marathon', 'marathon').replace('semi', 'semi').replace('10km', '10k'));
      setIsMetric(goal.isMetric);
      
      if (goal.vmaKmh) {
        setVmaValue(goal.vmaKmh);
      }

      // Load program parameters if available
      if (goal.program) {
        setSessionsPerWeek(goal.program.sessionsPerWeek);
        setWeeksBeforeRace(goal.program.weeksBeforeRace);
      }

      // Force component updates
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error('Error loading favorite:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setSpeedValue, setSelectedDistanceId, setIsMetric, setVmaValue, setSessionsPerWeek, setWeeksBeforeRace]);

  const resetState = useCallback(() => {
    setSessionsPerWeek(3);
    setWeeksBeforeRace(12);
    setSelectedDistanceId("10k");
    setSpeedValue(10);
    setIsMetric(true);
    setVmaValue(undefined);
  }, [setSessionsPerWeek, setWeeksBeforeRace, setSelectedDistanceId, setSpeedValue, setIsMetric, setVmaValue]);

  return {
    // State values
    sessionsPerWeek,
    weeksBeforeRace,
    selectedDistanceId,
    speedValue,
    isMetric,
    vmaValue,
    isLoading,
    
    // Setters
    setSessionsPerWeek,
    setWeeksBeforeRace,
    setSelectedDistanceId,
    setSpeedValue,
    setIsMetric,
    setVmaValue,
    
    // Actions
    getCurrentState,
    loadFromFavorite,
    resetState
  };
};