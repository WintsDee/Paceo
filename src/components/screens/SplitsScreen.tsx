import { Card } from "@/components/ui/card";

interface SplitsScreenProps {
  isMetric: boolean;
  speedValue: number; // km/h if metric, mph if imperial
}

function paceSecondsFromSpeed(speed: number) {
  // seconds per unit (km or mile)
  return Math.round((60 / Math.max(0.01, speed)) * 60);
}

function formatHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const hh = h > 0 ? `${h}:` : "";
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return `${hh}${mm}:${ss}`;
}

export const SplitsScreen = ({ isMetric, speedValue }: SplitsScreenProps) => {
  const unitLabel = isMetric ? 'km' : 'mi';
  const defaultDistance = isMetric ? 10 : 6; // simple sensible defaults
  const paceSec = paceSecondsFromSpeed(speedValue);

  // Build splits of 1 unit each
  const splits: { idx: number; length: number; splitSec: number; cumSec: number }[] = [];
  let cum = 0;
  for (let i = 1; i <= defaultDistance; i++) {
    cum += paceSec;
    splits.push({ idx: i, length: 1, splitSec: paceSec, cumSec: cum });
  }

  return (
    <div className="space-y-3 pb-20">
      <div className="text-center py-2">
        <h2 className="text-xl font-semibold">Splits simples</h2>
        <p className="text-muted-foreground text-sm">Basé sur votre allure actuelle</p>
      </div>
      <Card className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left px-4 py-2">#</th>
              <th className="text-left px-4 py-2">Longueur</th>
              <th className="text-right px-4 py-2">Split</th>
              <th className="text-right px-4 py-2">Cumul</th>
            </tr>
          </thead>
          <tbody>
            {splits.map((s) => (
              <tr key={s.idx}>
                <td className="px-4 py-2">{s.idx}</td>
                <td className="px-4 py-2">{s.length} {unitLabel}</td>
                <td className="px-4 py-2 text-right">{formatHMS(s.splitSec)}</td>
                <td className="px-4 py-2 text-right">{formatHMS(s.cumSec)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
