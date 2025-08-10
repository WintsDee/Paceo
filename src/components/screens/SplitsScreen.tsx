import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const paceSec = paceSecondsFromSpeed(speedValue);
  const [profile, setProfile] = useState<'10k' | 'semi' | 'marathon'>('10k');

  const profiles = [
    { id: '10k', label: '10K', km: 10, mi: 6 },
    { id: 'semi', label: 'Semi', km: 21, mi: 13 },
    { id: 'marathon', label: 'Marathon', km: 42, mi: 26 },
  ] as const;
  const current = profiles.find(p => p.id === profile)!;
  const totalUnits = isMetric ? current.km : current.mi;

  // Build splits of 1 unit each
  const splits: { idx: number; length: number; splitSec: number; cumSec: number }[] = [];
  let cum = 0;
  for (let i = 1; i <= totalUnits; i++) {
    cum += paceSec;
    splits.push({ idx: i, length: 1, splitSec: paceSec, cumSec: cum });
  }

  return (
    <div className="space-y-3 pb-20">
      <div className="text-center py-2">
        <h2 className="text-xl font-semibold">Splits simples</h2>
        <p className="text-muted-foreground text-sm">Basé sur votre allure actuelle</p>
      </div>

      <Tabs value={profile} onValueChange={(v) => setProfile(v as '10k' | 'semi' | 'marathon')}>
        <TabsList className="mx-auto">
          {profiles.map(p => (
            <TabsTrigger key={p.id} value={p.id}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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
