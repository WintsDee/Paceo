import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Minus, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface PaceSpeedConverterProps {
  isMetric: boolean;
  onToggleUnits: () => void;
  speedValue: number; // current speed in selected units (km/h or mph)
  onSpeedChange: (speed: number) => void;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function formatPaceFromSpeed(speed: number) {
  if (!speed || speed <= 0) return "0:00";
  const totalMinutes = 60 / speed;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function paceSecondsFromSpeed(speed: number) {
  if (!speed || speed <= 0) return 0;
  return Math.round((60 / speed) * 60); // minutes to seconds
}

export const PaceSpeedConverter = ({ isMetric, onToggleUnits, speedValue, onSpeedChange }: PaceSpeedConverterProps) => {
  const { t } = useLanguage();
  const paceString = useMemo(() => formatPaceFromSpeed(speedValue), [speedValue]);
  const paceSeconds = useMemo(() => paceSecondsFromSpeed(speedValue), [speedValue]);

  const speedMin = isMetric ? 6 : 4; // realistic ranges
  const speedMax = isMetric ? 24 : 15;
  const paceSecMin = 150; // 2:30
  const paceSecMax = 900; // 15:00

  const stepPace = (deltaSec: number) => {
    const newPaceSec = clamp(paceSeconds + deltaSec, paceSecMin, paceSecMax);
    const newSpeed = 3600 / newPaceSec; // 60 minutes/hour * 60 sec/min / sec per unit
    onSpeedChange(parseFloat(newSpeed.toFixed(2)));
  };

  const stepSpeed = (delta: number) => {
    // Step by 1 second equivalent in speed units
    const currentPaceSeconds = paceSecondsFromSpeed(speedValue);
    const targetPaceSeconds = clamp(currentPaceSeconds + (delta > 0 ? 1 : -1), paceSecMin, paceSecMax);
    const newSpeed = 3600 / targetPaceSeconds;
    onSpeedChange(parseFloat(newSpeed.toFixed(2)));
  };

  return (
    <Card className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("Convertisseur")}</h2>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${isMetric ? 'text-foreground' : 'text-muted-foreground'}`}>
            {t("km/km/h")}
          </span>
          <Switch
            checked={!isMetric}
            onCheckedChange={onToggleUnits}
            className="data-[state=checked]:bg-primary"
          />
          <span className={`text-sm ${!isMetric ? 'text-foreground' : 'text-muted-foreground'}`}>
            {t("mi/mph")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pace control */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            {t("Allure")} ({isMetric ? t('min/km') : t('min/mi')})
          </Label>
          <div className="glass-card rounded-lg p-4 flex items-center justify-between">
            <Button onClick={() => stepPace(-1)} variant="ghost" className="bg-muted/50 hover:bg-muted h-8 w-8 rounded-full p-0">
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-3xl font-semibold mono-numbers select-none">
              {paceString}
            </div>
            <Button onClick={() => stepPace(+1)} variant="ghost" className="bg-muted/50 hover:bg-muted h-8 w-8 rounded-full p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Speed control */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            {t("Vitesse")} ({isMetric ? t('km/h') : t('mph')})
          </Label>
          <div className="glass-card rounded-lg p-4 flex items-center justify-between">
            <Button onClick={() => stepSpeed(-1)} variant="ghost" className="bg-muted/50 hover:bg-muted h-8 w-8 rounded-full p-0">
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-3xl font-semibold mono-numbers select-none">
              {speedValue.toFixed(2)}
            </div>
            <Button onClick={() => stepSpeed(+1)} variant="ghost" className="bg-muted/50 hover:bg-muted h-8 w-8 rounded-full p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="mt-6 grid gap-5">
        {/* Pace slider */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">{t("Ajuster finement l'allure")}</Label>
          <Slider
            min={paceSecMin}
            max={paceSecMax}
            step={1}
            value={[clamp(paceSeconds, paceSecMin, paceSecMax)]}
            onValueChange={(v) => {
              const sec = clamp(v[0] ?? paceSeconds, paceSecMin, paceSecMax);
              const newSpeed = 3600 / sec;
              onSpeedChange(parseFloat(newSpeed.toFixed(2)));
            }}
            className="cursor-pointer"
          />
        </div>
        {/* Speed slider */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">{t("Ajuster finement la vitesse")}</Label>
          <Slider
            min={speedMin}
            max={speedMax}
            step={0.01}
            value={[clamp(speedValue, speedMin, speedMax)]}
            onValueChange={(v) => onSpeedChange(clamp(v[0] ?? speedValue, speedMin, speedMax))}
            className="cursor-pointer"
          />
        </div>
      </div>
    </Card>
  );
};