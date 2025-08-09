import { PaceSpeedConverter } from "@/components/calculator/PaceSpeedConverter";
import { RaceGoalCalculator, RaceGoal } from "@/components/calculator/RaceGoalCalculator";

interface CalculatorScreenProps {
  isMetric: boolean;
  onToggleUnits: () => void;
  onSaveGoal: (goal: RaceGoal) => void;
  speedValue: number;
  onSpeedChange: (speed: number) => void;
}

export const CalculatorScreen = ({ isMetric, onToggleUnits, onSaveGoal, speedValue, onSpeedChange }: CalculatorScreenProps) => {
  return (
    <div className="space-y-6 pb-20">
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Paceo
        </h1>
        <p className="text-muted-foreground mt-2">
          Convertisseur et calculateur d'objectifs
        </p>
      </div>
      
      <PaceSpeedConverter 
        isMetric={isMetric} 
        onToggleUnits={onToggleUnits}
        speedValue={speedValue}
        onSpeedChange={onSpeedChange}
      />
      
      <RaceGoalCalculator 
        isMetric={isMetric} 
        speedValue={speedValue}
        onSpeedChange={onSpeedChange}
        onSaveGoal={onSaveGoal} 
      />
    </div>
  );
};