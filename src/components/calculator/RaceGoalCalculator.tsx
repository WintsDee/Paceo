import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, HelpCircle } from "lucide-react";

export interface RaceGoalCalculatorProps {
  isMetric: boolean;
  speedValue: number; // global speed in current units (km/h or mph)
  onSpeedChange: (speed: number) => void; // update global speed when time changes
  onSaveGoal: (goal: RaceGoal) => void;
  showTimeSlider?: boolean; // show a slider to adjust target time directly
}

export interface RaceGoal {
  id: string;
  distance: string;
  selectedDistanceId: string;
  targetTime: string;
  pace: string;
  speed: string;
  isMetric: boolean;
  vmaKmh?: number;
  vmaCoherence?: {
    pct: number;
    status: "Sous-estimé" | "Ambitieux" | "Cohérent";
    expectedLow: number;
    expectedHigh: number;
  };
  distanceKm: number;
  distanceMiles: number;
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

export const RaceGoalCalculator = ({ isMetric, speedValue, onSpeedChange, onSaveGoal, showTimeSlider }: RaceGoalCalculatorProps) => {
  const [selectedDistance, setSelectedDistance] = useLocalStorage<string>("pace-calc-goal-distance", "10k");
  const [targetTime, setTargetTime] = useState("00:45:00");
  const { toast } = useToast();
  const lastUpdate = useRef<"speed" | "time" | null>(null);

  const [vmaKmh, setVmaKmh] = useLocalStorage<number>("pace-calc-vma", 0);

  const race = useMemo(() => raceDistances.find(d => d.id === selectedDistance)!, [selectedDistance]);
  const distanceUnits = isMetric ? race.distance : race.distanceMiles;
  const distanceKm = isMetric ? race.distance : race.distanceMiles * 1.60934;

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
    // Compute VMA coherence data if VMA provided
    let vmaData: RaceGoal["vmaCoherence"] | undefined = undefined;
    if (vmaKmh > 0) {
      const timeH = timeStringToHours(targetTime);
      const reqSpeedKmh = distanceKm / Math.max(0.0001, timeH);
      const pct = (reqSpeedKmh / vmaKmh) * 100;
      const getRange = (km: number) => {
        if (km <= 3) return { low: 100, high: 108 } as const;
        if (km <= 5) return { low: 92, high: 96 } as const;
        if (km <= 10) return { low: 88, high: 92 } as const;
        if (km <= 21.5) return { low: 80, high: 85 } as const;
        return { low: 76, high: 82 } as const; // marathon / ultra
      };
      const { low, high } = getRange(distanceKm);
      const margin = 2;
      const status = pct < low - margin ? "Sous-estimé" as const : pct > high + margin ? "Ambitieux" as const : "Cohérent" as const;
      vmaData = { pct: parseFloat(pct.toFixed(1)), status, expectedLow: low, expectedHigh: high };
    }

    const goal: RaceGoal = {
      id: Date.now().toString(),
      distance: race.label,
      selectedDistanceId: selectedDistance,
      targetTime,
      pace,
      speed: speedDisplay,
      isMetric,
      vmaKmh: vmaKmh > 0 ? vmaKmh : undefined,
      vmaCoherence: vmaData,
      distanceKm: parseFloat(distanceKm.toFixed(3)),
      distanceMiles: parseFloat((distanceKm * 0.621371).toFixed(3)),
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

        {/* Optional time slider */}
        {showTimeSlider && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Ajuster le temps objectif</Label>
            {(() => {
              const paceSecMin = 150; // 2:30
              const paceSecMax = 900; // 15:00
              const minHours = (distanceUnits * paceSecMin) / 3600;
              const maxHours = (distanceUnits * paceSecMax) / 3600;
              const currentH = timeStringToHours(targetTime);
              return (
                <Slider
                  min={minHours}
                  max={maxHours}
                  step={1 / 3600}
                  value={[Math.min(Math.max(currentH, minHours), maxHours)]}
                  className="touch-none select-none"
                  onValueChange={(v) => {
                    const h = Math.min(Math.max(v[0] ?? currentH, minHours), maxHours);
                    setTargetTime(hoursToHHMMSS(h));
                    const spd = distanceUnits / h;
                    lastUpdate.current = "time";
                    onSpeedChange(parseFloat(spd.toFixed(2)));
                  }}
                />
              );
            })()}
            <div className="text-xs text-muted-foreground text-right">{targetTime}</div>
          </div>
        )}

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

        {/* VMA repliable */}
        <div className="mb-6">
          <Collapsible defaultOpen={false}>
            <div className="glass-card p-4 rounded-lg">
              <CollapsibleTrigger className="flex w-full items-center gap-2 py-1.5 text-sm font-medium text-muted-foreground transition-all [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-2">
                  <span>VMA (km/h)</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-2 text-sm">
                          <p><strong>VMA (Vitesse Maximale Aérobie)</strong></p>
                          <p>Intensité maximale que vous pouvez maintenir pendant 6-8 minutes.</p>
                          <p><strong>Test demi-Cooper :</strong> Courez le plus loin possible en 6 minutes, puis VMA = distance(m) ÷ 100</p>
                          <p>Exemple : 1200m en 6min → VMA = 12 km/h</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="ml-auto text-sm font-medium mono-numbers">{(vmaKmh > 0 ? vmaKmh : 12).toFixed(1)} km/h</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out" />
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=open]:slide-down-1 data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:slide-up-1 data-[state=closed]:fade-out-0 duration-300 ease-out">
                <div className="space-y-4 pt-4 pb-2">
                  {/* Curseur VMA */}
                  <div className="px-2">
                    <Slider
                      min={8}
                      max={25}
                      step={0.1}
                      value={[vmaKmh > 0 ? vmaKmh : 12]}
                      className="touch-none select-none w-full"
                      onValueChange={(v) => setVmaKmh(parseFloat(((v[0] ?? 12)).toFixed(1)))}
                    />
                  </div>

                  {/* Conseil VMA (cohérence) */}
                  {vmaKmh > 0 && (
                    <div className="rounded-lg p-3 bg-background/40 mx-1">
                      {(() => {
                        const timeH = timeStringToHours(targetTime);
                        const reqSpeedKmh = distanceKm / Math.max(0.0001, timeH);
                        const pct = (reqSpeedKmh / vmaKmh) * 100;
                        const getRange = (km: number) => {
                          if (km <= 3) return { low: 100, high: 108 };
                          if (km <= 5) return { low: 92, high: 96 };
                          if (km <= 10) return { low: 88, high: 92 };
                          if (km <= 21.5) return { low: 80, high: 85 };
                          return { low: 76, high: 82 }; // marathon
                        };
                        const { low, high } = getRange(distanceKm);
                        const margin = 2;
                        const status = pct < low - margin ? "Sous-estimé" : pct > high + margin ? "Ambitieux" : "Cohérent";
                        const variant = status === "Cohérent" ? "secondary" : status === "Ambitieux" ? "default" : "outline";
                        return (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-muted-foreground mb-1">Cohérence vs VMA</div>
                              <div className="text-sm break-words">{pct.toFixed(1)}% de votre VMA — attendu {low}-{high}%</div>
                            </div>
                            <Badge variant={variant} className="shrink-0">{status}</Badge>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>


        {/* Save button */}
        <Button onClick={handleSaveGoal} className="w-full btn-primary-glass h-12 text-base font-medium">
          Enregistrer l’objectif
        </Button>
      </div>
    </Card>
  );
};