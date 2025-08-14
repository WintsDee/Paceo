import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConversionTableScreenProps {
  isMetric: boolean;
  onSpeedChange: (speed: number) => void;
}

// Convert pace minutes (e.g., 4.5 -> 4:30) to speed
function speedFromPaceMinutes(paceMinPerUnit: number) {
  // speed = 60 / pace (unit per hour)
  return 60 / Math.max(0.01, paceMinPerUnit);
}

function formatPace(mins: number) {
  const totalSeconds = Math.round(mins * 60);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const ConversionTableScreen = ({ isMetric, onSpeedChange }: ConversionTableScreenProps) => {
  const { t } = useLanguage();
  const rows: { pace: string; speed: string; speedValue: number }[] = [];
  // 3:00 to 8:00 with 5s steps
  for (let sec = 180; sec <= 480; sec += 5) {
    const paceMin = sec / 60;
    const speed = speedFromPaceMinutes(paceMin);
    rows.push({
      pace: formatPace(paceMin),
      speed: `${speed.toFixed(2)} ${isMetric ? 'km/h' : 'mph'}`,
      speedValue: speed,
    });
  }

  return (
    <div className="space-y-3 pb-20">
      <div className="text-center py-2">
        <h2 className="text-xl font-semibold">{t("Table de conversion")}</h2>
        <p className="text-muted-foreground text-sm">{t("Cliquez une ligne pour régler la vitesse")}</p>
      </div>
      <Card className="p-0">
        <ScrollArea className="max-h-[60vh]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left px-4 py-2">{t("Allure")} ({isMetric ? t('min/km') : t('min/mi')})</th>
                <th className="text-right px-4 py-2">{t("Vitesse")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.pace}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => onSpeedChange(r.speedValue)}
                >
                  <td className="px-4 py-2">{r.pace}</td>
                  <td className="px-4 py-2 text-right">{r.speed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </Card>
    </div>
  );
};
