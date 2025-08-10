import { PaceSpeedConverter } from "@/components/calculator/PaceSpeedConverter";
import { RaceGoal } from "@/components/calculator/RaceGoalCalculator";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";

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
      <div className="text-center py-2">
        <h2 className="text-xl font-semibold">Allure & Vitesse</h2>
        <p className="text-muted-foreground text-sm">Contrôlez votre allure et vitesse</p>
      </div>
      
      <PaceSpeedConverter 
        isMetric={isMetric} 
        onToggleUnits={onToggleUnits}
        speedValue={speedValue}
        onSpeedChange={onSpeedChange}
      />

      {/* VMA card */}
      <VmaCard isMetric={isMetric} />
      
    </div>
  );
};

// VMA component (local to this screen)
const VmaCard = ({ isMetric }: { isMetric: boolean }) => {
  const [vmaKmh, setVmaKmh] = useLocalStorage<number>("pace-calc-vma", 0);
  const min = 8; // km/h
  const max = 25;
  const step = 0.1;
  const mph = vmaKmh * 0.621371;
  return (
    <Card className="glass-card p-6 animate-fade-in-up">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">VMA</Label>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-semibold mono-numbers text-primary">{vmaKmh.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">{isMetric ? 'km/h' : `${mph.toFixed(1)} mph (≈ ${vmaKmh.toFixed(1)} km/h)`}</div>
        </div>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[Math.min(Math.max(vmaKmh, min), max)]}
          onValueChange={(v) => setVmaKmh(parseFloat((v[0] ?? vmaKmh).toFixed(1)))}
        />
      </div>
    </Card>
  );
};