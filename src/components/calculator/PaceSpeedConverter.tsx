import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PaceSpeedConverterProps {
  isMetric: boolean;
  onToggleUnits: () => void;
}

export const PaceSpeedConverter = ({ isMetric, onToggleUnits }: PaceSpeedConverterProps) => {
  const [pace, setPace] = useState("4:30");
  const [speed, setSpeed] = useState("13.33");

  // Convert pace (mm:ss) to speed
  const paceToSpeed = (paceString: string): number => {
    const [minutes, seconds] = paceString.split(":").map(Number);
    const totalMinutes = minutes + (seconds || 0) / 60;
    if (totalMinutes === 0) return 0;
    
    const speedKmh = 60 / totalMinutes;
    return isMetric ? speedKmh : speedKmh * 0.621371; // Convert to mph if needed
  };

  // Convert speed to pace (mm:ss)
  const speedToPace = (speedValue: number): string => {
    if (speedValue === 0) return "0:00";
    
    const speedKmh = isMetric ? speedValue : speedValue / 0.621371; // Convert from mph if needed
    const totalMinutes = 60 / speedKmh;
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.round((totalMinutes - minutes) * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePaceChange = (value: string) => {
    setPace(value);
    if (value.includes(":")) {
      const newSpeed = paceToSpeed(value);
      setSpeed(newSpeed.toFixed(2));
    }
  };

  const handleSpeedChange = (value: string) => {
    setSpeed(value);
    const speedValue = parseFloat(value);
    if (!isNaN(speedValue) && speedValue > 0) {
      const newPace = speedToPace(speedValue);
      setPace(newPace);
    }
  };

  // Update conversions when units change
  useEffect(() => {
    if (speed) {
      const speedValue = parseFloat(speed);
      if (!isNaN(speedValue) && speedValue > 0) {
        const newPace = speedToPace(speedValue);
        setPace(newPace);
      }
    }
  }, [isMetric]);

  return (
    <Card className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Convertisseur</h2>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${isMetric ? 'text-foreground' : 'text-muted-foreground'}`}>
            km/km/h
          </span>
          <Switch
            checked={!isMetric}
            onCheckedChange={onToggleUnits}
            className="data-[state=checked]:bg-primary"
          />
          <span className={`text-sm ${!isMetric ? 'text-foreground' : 'text-muted-foreground'}`}>
            mi/mph
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Allure ({isMetric ? 'min/km' : 'min/mi'})
          </Label>
          <Input
            value={pace}
            onChange={(e) => handlePaceChange(e.target.value)}
            placeholder="4:30"
            className="glass-card border-0 text-lg mono-numbers text-center h-14 text-foreground placeholder:text-muted-foreground focus:glow-effect transition-smooth"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Vitesse ({isMetric ? 'km/h' : 'mph'})
          </Label>
          <Input
            value={speed}
            onChange={(e) => handleSpeedChange(e.target.value)}
            placeholder="13.33"
            className="glass-card border-0 text-lg mono-numbers text-center h-14 text-foreground placeholder:text-muted-foreground focus:glow-effect transition-smooth"
          />
        </div>
      </div>
    </Card>
  );
};