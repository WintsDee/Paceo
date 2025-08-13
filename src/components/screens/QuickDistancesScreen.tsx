import React from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuickDistancesScreenProps {
  isMetric: boolean;
  speedValue: number; // km/h if metric, mph if imperial
}

const KM_TO_MI = 0.621371;


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
function paceFromSpeed(isMetric: boolean, speed: number) {
  if (!speed || speed <= 0) return isMetric ? "— min/km" : "— min/mi";
  const totalMinutes = 60 / speed;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, "0")} ${isMetric ? "min/km" : "min/mi"}`;
}

function timeForDistanceHours(km: number, isMetric: boolean, speedValue: number) {
  // speedValue is in km/h if metric else mph
  if (isMetric) return km / Math.max(0.01, speedValue);
  const miles = km * KM_TO_MI;
  return miles / Math.max(0.01, speedValue);
}

export const QuickDistancesScreen = React.memo(({ isMetric, speedValue }: QuickDistancesScreenProps) => {
  const { t } = useLanguage();
  
  const races = React.useMemo(() => [
    { id: "1k", labelKm: "1 km", km: 1 },
    { id: "5k", labelKm: "5 km", km: 5 },
    { id: "10k", labelKm: "10 km", km: 10 },
    { id: "hm", labelKm: t("Semi-marathon"), km: 21.0975 },
    { id: "m", labelKm: t("Marathon"), km: 42.195 },
    { id: "50k", labelKm: `50 km (${t("Ultra")})`, km: 50 },
    { id: "80k", labelKm: `80 km (${t("Trail")})`, km: 80 },
    { id: "100k", labelKm: `100 km (${t("Ultra")})`, km: 100 },
    { id: "100mi", labelKm: `100 miles (${t("Ultra")})`, km: 160.934 },
    { id: "utmb", labelKm: "UTMB ~171 km", km: 171 },
  ], [t]);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center py-2">
        <h3 className="text-lg font-semibold">{t("Distances rapides")}</h3>
        <p className="text-muted-foreground text-sm">{t("Basé sur votre allure actuelle")}</p>
      </div>

      <div className="grid gap-3">
        {races.map((r) => {
          const t = timeForDistanceHours(r.km, isMetric, speedValue);
          return (
            <Card key={r.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.labelKm}</div>
                <div className="text-xs text-muted-foreground">
                  {paceFromSpeed(isMetric, speedValue)} • {isMetric ? `${speedValue.toFixed(2)} km/h` : `${speedValue.toFixed(2)} mph`}
                </div>
              </div>
              <div className="text-sm font-medium mono-numbers">{hoursToHHMMSS(t)}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
});
QuickDistancesScreen.displayName = "QuickDistancesScreen";
