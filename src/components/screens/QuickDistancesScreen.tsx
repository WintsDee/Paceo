import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickDistancesScreenProps {
  isMetric: boolean;
  speedValue: number; // km/h if metric, mph if imperial
  onSpeedChange: (speed: number) => void;
  onNavigateToCalculator: () => void;
}

const KM_TO_MI = 0.621371;

const races = [
  { id: "1k", labelKm: "1 km", km: 1 },
  { id: "5k", labelKm: "5 km", km: 5 },
  { id: "10k", labelKm: "10 km", km: 10 },
  { id: "hm", labelKm: "Semi-marathon", km: 21.0975 },
  { id: "m", labelKm: "Marathon", km: 42.195 },
];

function hoursToHHMMSS(hours: number) {
  const totalSeconds = Math.max(0, Math.round(hours * 3600));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const hh = h > 0 ? `${h}:` : "";
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return `${hh}${mm}:${ss}`;
}

function timeForDistanceHours(km: number, isMetric: boolean, speedValue: number) {
  // speedValue is in km/h if metric else mph
  if (isMetric) return km / Math.max(0.01, speedValue);
  const miles = km * KM_TO_MI;
  return miles / Math.max(0.01, speedValue);
}

export const QuickDistancesScreen = ({ isMetric, speedValue, onSpeedChange, onNavigateToCalculator }: QuickDistancesScreenProps) => {
  return (
    <div className="space-y-4 pb-20">
      <div className="text-center py-2">
        <h2 className="text-xl font-semibold">Distances rapides</h2>
        <p className="text-muted-foreground text-sm">Basé sur votre allure actuelle</p>
      </div>

      <div className="grid gap-3">
        {races.map((r) => {
          const t = timeForDistanceHours(r.km, isMetric, speedValue);
          return (
            <Card key={r.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.labelKm}</div>
                <div className="text-sm text-muted-foreground">Temps estimé: {hoursToHHMMSS(t)}</div>
              </div>
              <Button
                variant="secondary"
                onClick={onNavigateToCalculator}
                className={cn("min-w-[100px]")}
                aria-label={`Utiliser ${r.labelKm}`}
              >
                Utiliser
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
