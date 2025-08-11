import { RaceGoalCalculator, RaceGoal } from "@/components/calculator/RaceGoalCalculator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Info } from "lucide-react";

const APP_VERSION = "v1.0.0";

interface GoalScreenProps {
  isMetric: boolean;
  speedValue: number;
  onSpeedChange: (speed: number) => void;
  onSaveGoal: (goal: RaceGoal) => void;
}

export const GoalScreen = ({ isMetric, speedValue, onSpeedChange, onSaveGoal }: GoalScreenProps) => {
  return (
    <div className="space-y-6 pb-20">
      <div className="relative text-center py-2">
        <h2 className="text-xl font-semibold">Objectif</h2>
        <p className="text-muted-foreground text-sm">Réglez finement votre temps cible</p>
        <div className="absolute right-4 top-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button aria-label="Informations" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Info className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>À propos</DialogTitle>
                <DialogDescription>
                  Produit par Aenean — Paceo {APP_VERSION}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
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