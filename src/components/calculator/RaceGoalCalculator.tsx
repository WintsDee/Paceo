import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface RaceGoalCalculatorProps {
  isMetric: boolean;
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

export const RaceGoalCalculator = ({ isMetric, onSaveGoal }: RaceGoalCalculatorProps) => {
  const [selectedDistance, setSelectedDistance] = useState("10k");
  const [targetTime, setTargetTime] = useState("00:45:00");
  const { toast } = useToast();

  const calculatePaceAndSpeed = (timeString: string, distanceId: string) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    
    const race = raceDistances.find(d => d.id === distanceId);
    if (!race) return { pace: "0:00", speed: "0.00" };
    
    const distance = isMetric ? race.distance : race.distanceMiles;
    const paceMinutes = totalMinutes / distance;
    const paceMin = Math.floor(paceMinutes);
    const paceSec = Math.round((paceMinutes - paceMin) * 60);
    const pace = `${paceMin}:${paceSec.toString().padStart(2, "0")}`;
    
    const speedKmh = distance / (totalMinutes / 60);
    const speed = speedKmh.toFixed(2);
    
    return { pace, speed };
  };

  const { pace, speed } = calculatePaceAndSpeed(targetTime, selectedDistance);

  const handleSaveGoal = () => {
    const race = raceDistances.find(d => d.id === selectedDistance);
    if (!race) return;

    const goal: RaceGoal = {
      id: Date.now().toString(),
      distance: race.label,
      targetTime,
      pace,
      speed,
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
            {raceDistances.map((race) => (
              <Button
                key={race.id}
                variant={selectedDistance === race.id ? "default" : "outline"}
                onClick={() => setSelectedDistance(race.id)}
                className={
                  selectedDistance === race.id
                    ? "btn-primary-glass flex-1"
                    : "btn-glass flex-1"
                }
              >
                {race.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Target time input */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Temps objectif (hh:mm:ss)
          </Label>
          <Input
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            placeholder="00:45:00"
            className="glass-card border-0 text-lg mono-numbers text-center h-14 text-foreground focus:glow-effect transition-smooth"
          />
        </div>

        {/* Results display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Allure cible
            </div>
            <div className="text-xl font-semibold mono-numbers text-primary">
              {pace}
            </div>
            <div className="text-xs text-muted-foreground">
              {isMetric ? 'min/km' : 'min/mi'}
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Vitesse
            </div>
            <div className="text-xl font-semibold mono-numbers text-primary">
              {speed}
            </div>
            <div className="text-xs text-muted-foreground">
              {isMetric ? 'km/h' : 'mph'}
            </div>
          </div>
        </div>

        {/* Save button */}
        <Button 
          onClick={handleSaveGoal}
          className="w-full btn-primary-glass h-12 text-base font-medium"
        >
          Enregistrer la cible
        </Button>
      </div>
    </Card>
  );
};