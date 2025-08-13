import React from "react";
import { RaceGoalCalculator, RaceGoal } from "@/components/calculator/RaceGoalCalculator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const APP_VERSION = "v1.0.0";

interface GoalScreenProps {
  isMetric: boolean;
  speedValue: number;
  onSpeedChange: (speed: number) => void;
  onSaveGoal: (goal: RaceGoal) => void;
}

export const GoalScreen = React.memo(({ isMetric, speedValue, onSpeedChange, onSaveGoal }: GoalScreenProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6 pb-20">
      <div className="relative text-center py-2">
        <h2 className="text-xl font-semibold">{t("Objectif")}</h2>
        <p className="text-muted-foreground text-sm">{t("Réglez finement votre temps cible")}</p>
      </div>
      <RaceGoalCalculator
        isMetric={isMetric}
        speedValue={speedValue}
        onSpeedChange={onSpeedChange}
        onSaveGoal={onSaveGoal}
        showTimeSlider
      />
    </div>
  );
});
GoalScreen.displayName = "GoalScreen";