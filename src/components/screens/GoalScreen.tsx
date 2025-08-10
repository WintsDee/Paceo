import { RaceGoalCalculator, RaceGoal } from "@/components/calculator/RaceGoalCalculator";

interface GoalScreenProps {
  isMetric: boolean;
  speedValue: number;
  onSpeedChange: (speed: number) => void;
  onSaveGoal: (goal: RaceGoal) => void;
}

export const GoalScreen = ({ isMetric, speedValue, onSpeedChange, onSaveGoal }: GoalScreenProps) => {
  return (
    <div className="space-y-6 pb-20">
      <div className="text-center py-2">
        <h2 className="text-xl font-semibold">Objectif</h2>
        <p className="text-muted-foreground text-sm">Réglez finement votre temps cible</p>
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
};