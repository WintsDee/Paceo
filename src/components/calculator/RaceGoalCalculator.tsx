import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export interface RaceGoalCalculatorProps {
  isMetric: boolean;
  speedValue: number; // global speed in current units (km/h or mph)
  onSpeedChange: (speed: number) => void; // update global speed when time changes
  onSaveGoal: (goal: RaceGoal) => void;
}

export interface RaceGoal {
  id: string;
  distance: string;
  targetTime: string;
  pace: string;
  speed: string;
  isMetric: boolean;
  savedAt: Date;
}

const raceDistances = [
  { id: "10k", label: "10 km", distance: 10, distanceMiles: 6.21 },
  { id: "semi", label: "Semi", distance: 21.0975, distanceMiles: 13.1 },
  { id: "marathon", label: "Marathon", distance: 42.195, distanceMiles: 26.2 },
];

function timeStringToHours(str: string) {
  const parts = str.split(":").map(Number);
  const [h = 0, m = 0, s = 0] = parts;
  return h + m / 60 + s / 3600;
}

function hoursToHHMMSS(hours: number) {
  const totalSeconds = Math.max(0, Math.round(hours * 3600));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

function paceFromSpeed(speed: number) {
  if (!speed || speed <= 0) return "0:00";
  const totalMinutes = 60 / speed;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export const RaceGoalCalculator = ({ isMetric, speedValue, onSpeedChange, onSaveGoal }: RaceGoalCalculatorProps) => {
  const [selectedDistance, setSelectedDistance] = useState("10k");
  const [targetTime, setTargetTime] = useState("00:45:00");
  const { toast } = useToast();
  const lastUpdate = useRef<"speed" | "time" | null>(null);

  const race = useMemo(() => raceDistances.find(d => d.id === selectedDistance)!, [selectedDistance]);
  const distanceUnits = isMetric ? race.distance : race.distanceMiles;

  // Update target time whenever global speed or selection changes (unless we just set speed from time)
  useEffect(() => {
    if (lastUpdate.current === "time") {
      lastUpdate.current = null;
      return;
    }
    if (speedValue > 0 && distanceUnits > 0) {
      const hours = distanceUnits / speedValue;
      setTargetTime(hoursToHHMMSS(hours));
      lastUpdate.current = "speed";
    }
  }, [speedValue, distanceUnits]);

  // When user changes target time, push speed to global so everything syncs
  const handleTimeChange = (value: string) => {
    setTargetTime(value);
    const hours = timeStringToHours(value);
    if (hours > 0 && distanceUnits > 0) {
      const speed = distanceUnits / hours; // in current units
      lastUpdate.current = "time";
      onSpeedChange(parseFloat(speed.toFixed(2)));
    }
  };

  const pace = paceFromSpeed(speedValue);
  const speedDisplay = speedValue.toFixed(2);

  const handleSaveGoal = () => {
    const goal: RaceGoal = {
      id: Date.now().toString(),
      distance: race.label,
      targetTime,
      pace,
      speed: speedDisplay,
      isMetric,
      savedAt: new Date(),
    };

    onSaveGoal(goal);
    toast({
      title: "Objectif enregistré",
      description: `${race.label} en ${targetTime} sauvegardé dans vos favoris`,
    });
  };

  return (
    <Card className="glass-card p-6 animate-fade-in-up">
      <h2 className="text-xl font-semibold mb-6">Objectif de course</h2>
      
      <div className="space-y-6">
        {/* Distance selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">Distance</Label>
          <div className="flex gap-2">
            {raceDistances.map((r) => (
              <Button
                key={r.id}
                variant={selectedDistance === r.id ? "default" : "outline"}
                onClick={() => setSelectedDistance(r.id)}
                className={
                  selectedDistance === r.id ? "btn-primary-glass flex-1" : "btn-glass flex-1"
                }
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Target time input (syncs with global speed) */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Temps objectif (hh:mm:ss)
          </Label>
          <Input
            value={targetTime}
            onChange={(e) => handleTimeChange(e.target.value)}
            placeholder="00:45:00"
            className="glass-card border-0 text-lg mono-numbers text-center h-14 text-foreground focus:glow-effect transition-smooth"
          />
        </div>

        {/* Results display - always derived from global speed */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Allure cible</div>
            <div className="text-xl font-semibold mono-numbers text-primary">{pace}</div>
            <div className="text-xs text-muted-foreground">{isMetric ? 'min/km' : 'min/mi'}</div>
          </div>
          
          <div className="glass-card p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Vitesse</div>
            <div className="text-xl font-semibold mono-numbers text-primary">{speedDisplay}</div>
            <div className="text-xs text-muted-foreground">{isMetric ? 'km/h' : 'mph'}</div>
          </div>
        </div>

        {/* Save button */}
        <Button onClick={handleSaveGoal} className="w-full btn-primary-glass h-12 text-base font-medium">
          Enregistrer la cible
        </Button>
      </div>
    </Card>
  );
};