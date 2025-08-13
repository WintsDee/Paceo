import React from "react";
import { PaceSpeedConverter } from "@/components/calculator/PaceSpeedConverter";
import { RaceGoal } from "@/components/calculator/RaceGoalCalculator";
import { useLanguage } from "@/contexts/LanguageContext";

interface CalculatorScreenProps {
  isMetric: boolean;
  onToggleUnits: () => void;
  onSaveGoal: (goal: RaceGoal) => void;
  speedValue: number;
  onSpeedChange: (speed: number) => void;
}

export const CalculatorScreen = React.memo(({ isMetric, onToggleUnits, onSaveGoal, speedValue, onSpeedChange }: CalculatorScreenProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6 pb-20">
      <div className="text-center py-2">
        <h2 className="text-xl font-semibold">{t("Allure & Vitesse")}</h2>
        <p className="text-muted-foreground text-sm">{t("Convertissez entre allure et vitesse")}</p>
      </div>
      
      <PaceSpeedConverter 
        isMetric={isMetric} 
        onToggleUnits={onToggleUnits}
        speedValue={speedValue}
        onSpeedChange={onSpeedChange}
      />
    </div>
  );
});
CalculatorScreen.displayName = "CalculatorScreen";
