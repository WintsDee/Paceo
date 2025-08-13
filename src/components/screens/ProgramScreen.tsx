import React, { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CalendarIcon, ChevronDown, Plus, Minus, Copy, Share2, Target, Printer } from "lucide-react";
import { differenceInWeeks } from "date-fns";
import { fr, enUS, es, de } from "date-fns/locale";
import { toast } from "sonner";

interface ProgramScreenProps {
  isMetric: boolean;
  speedValue: number;
  vmaValue?: number;
}

interface TrainingSession {
  type: "EASY" | "STEADY" | "THR" | "INT" | "RP" | "Longue";
  duration: string;
  pace: string;
  description: string;
}

interface WeekProgram {
  week: number;
  phase: "BASE" | "BUILD" | "PEAK" | "TAPER";
  volume: number;
  sessions: TrainingSession[];
}

// Constantes pour éviter les recalculs
const RACE_DISTANCES = [
  { id: "10k", label: "10 km", distance: 10, distanceMiles: 6.21 },
  { id: "semi", label: "Semi", distance: 21.0975, distanceMiles: 13.1 },
  { id: "marathon", label: "Marathon", distance: 42.195, distanceMiles: 26.2 },
] as const;

const SESSION_TEMPLATES = {
  2: ["INT", "Longue"],
  3: ["INT", "THR", "Longue"],
  4: ["INT", "EASY", "THR", "Longue"], 
  5: ["INT", "EASY", "THR", "EASY", "Longue"],
  6: ["INT", "EASY", "THR", "EASY", "Longue", "EASY"]
} as const;

const SESSION_COLORS = {
  EASY: 'bg-green-500 text-white hover:bg-green-600',
  STEADY: 'bg-blue-500 text-white hover:bg-blue-600',
  THR: 'bg-orange-500 text-white hover:bg-orange-600',
  INT: 'bg-red-500 text-white hover:bg-red-600',
  RP: 'bg-purple-500 text-white hover:bg-purple-600',
  Longue: 'bg-cyan-500 text-white hover:bg-cyan-600',
} as const;

const SESSION_EXPLANATIONS = {
  EASY: "Course à allure tranquille pour récupérer et développer l'endurance de base",
  STEADY: "Allure confortable et soutenue, légèrement plus rapide que l'allure facile",
  THR: "Allure seuil/tempo - intensité modérée à élevée, proche du seuil lactique",
  INT: "Intervalles courts à haute intensité pour améliorer VO2max",
  RP: "Allure course - l'allure exacte de votre objectif de compétition",
  Longue: "Sortie longue pour développer l'endurance et l'économie de course"
} as const;

// Fonctions utilitaires memoized
const paceFromSpeed = (speed: number): string => {
  if (!speed || speed <= 0) return "0:00";
  const totalMinutes = 60 / speed;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const addSecondsToMmSs = (mmss: string, seconds: number): string => {
  const [m, s] = mmss.split(":").map(Number);
  const totalSeconds = m * 60 + s + seconds;
  const newMinutes = Math.floor(totalSeconds / 60);
  const newSeconds = totalSeconds % 60;
  return `${newMinutes}:${newSeconds.toString().padStart(2, "0")}`;
};

const formatPace = (pace: string, isMetric: boolean): string => {
  return `${pace}/${isMetric ? 'km' : 'mi'}`;
};

// Hook personnalisé pour éviter les recalculs
const useRunnerLevel = (speed: number, distance: string) => {
  return useMemo(() => {
    const pace = 60 / speed; // minutes per km
    
    if (distance === "10k") {
      if (pace > 7) return 'beginner';
      if (pace > 5) return 'intermediate';
      return 'advanced';
    } else if (distance === "semi") {
      if (pace > 6.5) return 'beginner';
      if (pace > 4.8) return 'intermediate';
      return 'advanced';
    } else { // marathon
      if (pace > 6.5) return 'beginner';
      if (pace > 5) return 'intermediate';
      return 'advanced';
    }
  }, [speed, distance]);
};

// Hook pour les zones d'allure
const usePaceZones = (goalSpeed: number, distance: string, level: string, vma?: number) => {
  return useMemo(() => {
    const goalPace = paceFromSpeed(goalSpeed);
    
    let easyOffset = 60, steadyOffset = 30;
    let thrOffset = distance === "10k" ? -5 : distance === "semi" ? -10 : -20;
    let intOffset = distance === "10k" ? -18 : distance === "semi" ? -25 : -35;
    
    if (level === 'beginner') {
      easyOffset = 75;
      steadyOffset = 45;
      thrOffset = Math.max(thrOffset + 15, 0);
      intOffset = Math.max(intOffset + 20, -5);
    } else if (level === 'advanced' && vma && vma > 16) {
      easyOffset = 45;
      steadyOffset = 20;
      thrOffset -= 5;
      intOffset -= 10;
    }
    
    return {
      EASY: addSecondsToMmSs(goalPace, easyOffset),
      STEADY: addSecondsToMmSs(goalPace, steadyOffset),
      THR: addSecondsToMmSs(goalPace, thrOffset),
      INT: addSecondsToMmSs(goalPace, intOffset),
      RP: goalPace
    };
  }, [goalSpeed, distance, level, vma]);
};

export const ProgramScreen = React.memo(({ isMetric, speedValue, vmaValue }: ProgramScreenProps) => {
  const { t, language } = useLanguage();
  const [sessionsPerWeek, setSessionsPerWeek] = useLocalStorage<number>("program-sessions-week", 3);
  const [weeksBeforeRace, setWeeksBeforeRace] = useLocalStorage<number>("program-weeks-before", 12);
  const [raceDate, setRaceDate] = useState<Date>();
  const [useRaceDate, setUseRaceDate] = useState(false);
  const [selectedDistanceId] = useLocalStorage<string>("pace-calc-goal-distance", "10k");
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [favorites, setFavorites] = useLocalStorage<any[]>("pace-calc-favorites", []);

  // Mémorisation des données de base
  const dateLocale = useMemo(() => {
    switch (language) {
      case 'fr': return fr;
      case 'es': return es;
      case 'de': return de;
      default: return enUS;
    }
  }, [language]);

  const race = useMemo(() => 
    RACE_DISTANCES.find(d => d.id === selectedDistanceId) || RACE_DISTANCES[0], 
    [selectedDistanceId]
  );
  
  const effectiveWeeks = useMemo(() => {
    if (useRaceDate && raceDate) {
      const weeks = differenceInWeeks(raceDate, new Date());
      return Math.max(2, Math.min(16, weeks));
    }
    return weeksBeforeRace;
  }, [useRaceDate, raceDate, weeksBeforeRace]);

  // Utilisation des hooks personnalisés
  const runnerLevel = useRunnerLevel(speedValue, selectedDistanceId);
  const paceZones = usePaceZones(speedValue, selectedDistanceId, runnerLevel, vmaValue);

  // Volume de base optimisé
  const baseVolume = useMemo(() => {
    const volumes = {
      beginner: {
        "10k": { 2: isMetric ? 15 : 9, 3: isMetric ? 20 : 12, 4: isMetric ? 25 : 16, 5: isMetric ? 30 : 19, 6: isMetric ? 35 : 22 },
        "semi": { 2: isMetric ? 25 : 16, 3: isMetric ? 35 : 22, 4: isMetric ? 45 : 28, 5: isMetric ? 55 : 34, 6: isMetric ? 65 : 40 },
        "marathon": { 2: isMetric ? 35 : 22, 3: isMetric ? 50 : 31, 4: isMetric ? 65 : 40, 5: isMetric ? 80 : 50, 6: isMetric ? 95 : 59 }
      },
      intermediate: {
        "10k": { 2: isMetric ? 25 : 16, 3: isMetric ? 35 : 22, 4: isMetric ? 45 : 28, 5: isMetric ? 55 : 34, 6: isMetric ? 65 : 40 },
        "semi": { 2: isMetric ? 40 : 25, 3: isMetric ? 55 : 34, 4: isMetric ? 70 : 43, 5: isMetric ? 85 : 53, 6: isMetric ? 100 : 62 },
        "marathon": { 2: isMetric ? 55 : 34, 3: isMetric ? 75 : 47, 4: isMetric ? 95 : 59, 5: isMetric ? 115 : 71, 6: isMetric ? 135 : 84 }
      },
      advanced: {
        "10k": { 2: isMetric ? 35 : 22, 3: isMetric ? 50 : 31, 4: isMetric ? 65 : 40, 5: isMetric ? 80 : 50, 6: isMetric ? 95 : 59 },
        "semi": { 2: isMetric ? 55 : 34, 3: isMetric ? 75 : 47, 4: isMetric ? 95 : 59, 5: isMetric ? 115 : 71, 6: isMetric ? 135 : 84 },
        "marathon": { 2: isMetric ? 75 : 47, 3: isMetric ? 105 : 65, 4: isMetric ? 135 : 84, 5: isMetric ? 165 : 102, 6: isMetric ? 195 : 121 }
      }
    };
    
    return volumes[runnerLevel as keyof typeof volumes][selectedDistanceId as keyof typeof volumes.beginner][sessionsPerWeek as keyof typeof volumes.beginner["10k"]] || 35;
  }, [runnerLevel, selectedDistanceId, sessionsPerWeek, isMetric]);

  // Génération de session optimisée
  const createSession = useCallback((
    type: TrainingSession['type'],
    phase: WeekProgram['phase'],
    distance: string,
    volume: number
  ): TrainingSession => {
    switch (type) {
      case "INT":
        if (distance === "10k") {
          return {
            type: "INT",
            duration: "40-50 min",
            pace: formatPace(paceZones.INT, isMetric),
            description: phase === "PEAK" ? `8×400m @ ${formatPace(paceZones.INT, isMetric)}, récup 200m` : 
                        `6×400m @ ${formatPace(paceZones.INT, isMetric)}, récup 200m`
          };
        } else {
          return {
            type: "INT", 
            duration: "45-60 min",
            pace: formatPace(paceZones.INT, isMetric),
            description: phase === "PEAK" ? `5×1000m @ ${formatPace(paceZones.INT, isMetric)}, récup 2 min` :
                        `4×1000m @ ${formatPace(paceZones.INT, isMetric)}, récup 2 min`
          };
        }
        
      case "THR":
        return {
          type: "THR",
          duration: "50-70 min", 
          pace: formatPace(paceZones.THR, isMetric),
          description: distance === "marathon" ? `3×15 min @ ${formatPace(paceZones.THR, isMetric)}, récup 3 min` :
                      `3×10 min @ ${formatPace(paceZones.THR, isMetric)}, récup 2 min`
        };
        
      case "RP":
        return {
          type: "RP",
          duration: "60-80 min",
          pace: formatPace(paceZones.RP, isMetric),
          description: phase === "BUILD" || phase === "PEAK" ? 
                      `2×20 min @ ${formatPace(paceZones.RP, isMetric)}, récup 5 min` :
                      `15 min @ ${formatPace(paceZones.RP, isMetric)}`
        };
        
      case "Longue":
        const volumeRatio = distance === "10k" ? 0.35 : distance === "semi" ? 0.4 : 0.45;
        const longDistance = Math.round(volume * volumeRatio);
        const longDuration = Math.round(longDistance * (isMetric ? 6 : 9.5));
        const hasRPSegment = (phase === "BUILD" || phase === "PEAK") && distance !== "10k";
        return {
          type: "Longue",
          duration: `${longDuration}-${longDuration + 15} min`,
          pace: formatPace(paceZones.EASY, isMetric),
          description: hasRPSegment ? 
                      `${longDistance}${isMetric ? 'km' : 'mi'} @ ${formatPace(paceZones.EASY, isMetric)}, dont ${Math.round(longDistance * 0.3)}${isMetric ? 'km' : 'mi'} @ ${formatPace(paceZones.RP, isMetric)}` :
                      `${longDistance}${isMetric ? 'km' : 'mi'} @ ${formatPace(paceZones.EASY, isMetric)}`
        };
        
      default: // EASY
        return {
          type: "EASY",
          duration: "30-50 min",
          pace: formatPace(paceZones.EASY, isMetric), 
          description: `40-50 min @ ${formatPace(paceZones.EASY, isMetric)}`
        };
    }
  }, [paceZones, isMetric]);

  // Programme optimisé avec mémorisation
  const program = useMemo((): WeekProgram[] => {
    const weeks = effectiveWeeks;
    const baseWeeks = Math.floor(weeks * 0.5);
    const buildWeeks = Math.floor(weeks * 0.35);
    const taperWeeks = 1;
    
    const program: WeekProgram[] = [];
    let currentVolume = baseVolume;
    
    for (let week = 1; week <= weeks; week++) {
      let phase: WeekProgram['phase'];
      if (week <= baseWeeks) phase = "BASE";
      else if (week <= baseWeeks + buildWeeks) phase = "BUILD";
      else if (week <= weeks - taperWeeks) phase = "PEAK";
      else phase = "TAPER";
      
      // Volume progression
      if (phase === "BASE" || phase === "BUILD") {
        if (week % 4 === 0) {
          currentVolume *= runnerLevel === 'beginner' ? 0.8 : 0.85;
        } else {
          const progression = runnerLevel === 'beginner' ? 1.08 : runnerLevel === 'intermediate' ? 1.1 : 1.12;
          currentVolume *= progression;
        }
      } else if (phase === "TAPER") {
        const taperReduction = runnerLevel === 'beginner' ? 0.5 : runnerLevel === 'intermediate' ? 0.6 : 0.65;
        currentVolume *= taperReduction;
      }
      
      const volume = Math.round(currentVolume);
      const template = SESSION_TEMPLATES[sessionsPerWeek as keyof typeof SESSION_TEMPLATES] || SESSION_TEMPLATES[3];
      
      const sessions = template.map(type => 
        createSession(type as TrainingSession['type'], phase, selectedDistanceId, volume)
      );
      
      program.push({ week, phase, volume, sessions });
    }
    
    return program;
  }, [effectiveWeeks, baseVolume, runnerLevel, sessionsPerWeek, selectedDistanceId, createSession]);

  // Callbacks optimisés
  const toggleWeekExpansion = useCallback((week: number) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(week)) {
        newSet.delete(week);
      } else {
        newSet.add(week);
      }
      return newSet;
    });
  }, []);

  const adjustSessions = useCallback((delta: number) => {
    const newValue = Math.max(2, Math.min(6, sessionsPerWeek + delta));
    setSessionsPerWeek(newValue);
  }, [sessionsPerWeek, setSessionsPerWeek]);

  const adjustWeeks = useCallback((delta: number) => {
    const newValue = Math.max(2, Math.min(16, weeksBeforeRace + delta));
    setWeeksBeforeRace(newValue);
  }, [weeksBeforeRace, setWeeksBeforeRace]);

  const copyWeekToClipboard = useCallback(async (week: WeekProgram) => {
    const weekText = `${t("Semaine")} ${week.week} - ${t(week.phase)}\n${t("Volume")}: ${week.volume}${isMetric ? 'km' : 'mi'}\n\n${week.sessions.map((session, index) => 
      `${index + 1}. ${t(session.type)} - ${session.duration}\n${session.description}`
    ).join('\n\n')}`;
    
    try {
      await navigator.clipboard.writeText(weekText);
      toast.success(`${t("Semaine")} ${week.week} copiée !`);
    } catch (err) {
      toast.error('Erreur lors de la copie');
    }
  }, [t, isMetric]);

  const shareWeek = useCallback(async (week: WeekProgram) => {
    const weekText = `Programme ${t("Semaine")} ${week.week} - Paceo\n\n${t(week.phase)} • ${week.volume}${isMetric ? 'km' : 'mi'}\n\n${week.sessions.map((session, index) => 
      `${index + 1}. ${t(session.type)} - ${session.duration}\n${session.description}`
    ).join('\n\n')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Programme ${t("Semaine")} ${week.week}`,
          text: weekText,
        });
      } catch (err) {
        copyWeekToClipboard(week);
      }
    } else {
      copyWeekToClipboard(week);
    }
  }, [t, isMetric, copyWeekToClipboard]);

  const shareFullProgram = useCallback(async () => {
    const fullText = `Programme d'entraînement - Paceo\n\n${t("Objectif")}: ${race.label} — ${paceFromSpeed(speedValue)} (${formatPace(paceFromSpeed(speedValue), isMetric)})\n${t("Sessions/sem.")}: ${sessionsPerWeek} • ${t("Avant objectif")}: ${effectiveWeeks} semaines\n\n${program.map(week => 
      `${t("Semaine")} ${week.week} - ${t(week.phase)} (${week.volume}${isMetric ? 'km' : 'mi'})\n${week.sessions.map((session, index) => 
        `  ${index + 1}. ${t(session.type)} - ${session.duration} - ${session.description}`
      ).join('\n')}`
    ).join('\n\n')}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Programme d\'entraînement',
          text: fullText,
        });
      } else {
        await navigator.clipboard.writeText(fullText);
        toast.success('Programme copié dans le presse-papiers !');
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(fullText);
        toast.success('Programme copié dans le presse-papiers !');
      } catch (clipErr) {
        toast.error('Erreur lors du partage');
      }
    }
  }, [program, t, race.label, speedValue, isMetric, sessionsPerWeek, effectiveWeeks]);

  const printProgram = useCallback(() => {
    const printContent = `
      <html>
        <head>
          <title>Programme d'entraînement - Paceo</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; }
            h2 { color: #666; margin-top: 20px; }
            .week { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; }
            .session { margin: 5px 0; padding: 8px; background: #f5f5f5; }
            .header { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Programme d'entraînement</h1>
            <p><strong>${t("Objectif")}:</strong> ${race.label} — ${paceFromSpeed(speedValue)} (${formatPace(paceFromSpeed(speedValue), isMetric)})</p>
            <p><strong>${t("Sessions/sem.")}:</strong> ${sessionsPerWeek} • <strong>${t("Avant objectif")}:</strong> ${effectiveWeeks} semaines</p>
          </div>
          ${program.map(week => `
            <div class="week">
              <h2>${t("Semaine")} ${week.week} - ${t(week.phase)} (${week.volume}${isMetric ? 'km' : 'mi'})</h2>
              ${week.sessions.map((session, index) => `
                <div class="session">
                  <strong>${index + 1}. ${t(session.type)}</strong> - ${session.duration}<br>
                  ${session.description}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }, [program, t, race.label, speedValue, isMetric, sessionsPerWeek, effectiveWeeks]);

  const saveProgramToFavorites = useCallback(() => {
    const currentGoal = {
      id: Date.now().toString(),
      distance: race.label,
      selectedDistanceId: selectedDistanceId,
      targetTime: paceFromSpeed(speedValue),
      pace: paceFromSpeed(speedValue),
      speed: speedValue.toFixed(2),
      isMetric,
      vmaKmh: vmaValue,
      distanceKm: isMetric ? race.distance : race.distanceMiles * 1.60934,
      distanceMiles: isMetric ? race.distance * 0.621371 : race.distanceMiles,
      savedAt: new Date(),
      program: {
        sessionsPerWeek,
        weeksBeforeRace: effectiveWeeks,
        weeks: program
      }
    };
    
    setFavorites([currentGoal, ...favorites]);
    toast.success('Programme enregistré dans les favoris !');
  }, [race, selectedDistanceId, speedValue, isMetric, vmaValue, sessionsPerWeek, effectiveWeeks, program, setFavorites]);

  if (!speedValue || speedValue <= 0) {
    return (
      <div className="space-y-6 pb-20 animate-fade-in">
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            {t("Définis ton objectif pour générer ton programme.")}
          </div>
          <Button variant="outline" className="btn-glass">
            <Target className="w-4 h-4 mr-2" />
            {t("Définir l'objectif")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="relative text-center py-2">
        <h2 className="text-xl font-semibold">{t("Programme")}</h2>
        <p className="text-muted-foreground text-sm">{t("Plan d'entraînement automatique")}</p>
      </div>

      {/* Sticky Controls Header */}
      <Card className="glass-card p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4">
          {/* Sessions per week */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 btn-glass"
              onClick={() => adjustSessions(-1)}
              disabled={sessionsPerWeek <= 2}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[80px]">
              <div className="text-sm font-medium">{sessionsPerWeek}</div>
              <div className="text-xs text-muted-foreground">{t("Sessions/sem.")}</div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 btn-glass"
              onClick={() => adjustSessions(1)}
              disabled={sessionsPerWeek >= 6}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Weeks before race / Date picker */}
          <div className="flex items-center gap-2">
            {!useRaceDate ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 btn-glass"
                  onClick={() => adjustWeeks(-1)}
                  disabled={weeksBeforeRace <= 2}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="text-center min-w-[80px]">
                  <div className="text-sm font-medium">{effectiveWeeks}</div>
                  <div className="text-xs text-muted-foreground">{t("Avant objectif")} (sem.)</div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 btn-glass"
                  onClick={() => adjustWeeks(1)}
                  disabled={weeksBeforeRace >= 16}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="text-center min-w-[80px]">
                <div className="text-sm font-medium">{effectiveWeeks}</div>
                <div className="text-xs text-muted-foreground">sem. calculées</div>
              </div>
            )}
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="btn-glass ml-2 px-2">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={raceDate}
                  onSelect={(date) => {
                    setRaceDate(date);
                    if (date) {
                      setUseRaceDate(true);
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={dateLocale}
                  className="pointer-events-auto"
                />
                {useRaceDate && (
                  <div className="p-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setUseRaceDate(false);
                        setRaceDate(undefined);
                      }}
                    >
                      Utiliser nombre de semaines
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Card>

      {/* Context Banner */}
      <Card className="glass-card p-4">
        <div className="text-center text-sm">
          <span className="text-muted-foreground">{t("Objectif")}: </span>
          <span className="font-medium">{race.label} — {paceFromSpeed(speedValue)}</span>
          <span className="text-muted-foreground"> • {t("Allure cible")} </span>
          <span className="font-medium mono-numbers">{formatPace(paceFromSpeed(speedValue), isMetric)}</span>
          <span className="text-muted-foreground"> • {t("Vitesse")} </span>
          <span className="font-medium mono-numbers">{speedValue.toFixed(2)} {isMetric ? 'km/h' : 'mph'}</span>
        </div>
      </Card>

      {/* Weekly Program */}
      <div className="space-y-3">
        {program.map((week) => (
          <Collapsible
            key={week.week}
            open={expandedWeeks.has(week.week)}
            onOpenChange={() => toggleWeekExpansion(week.week)}
          >
            <Card className="glass-card">
              <CollapsibleTrigger className="w-full p-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">
                      {t("Semaine")} {week.week}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {t(week.phase)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                      {week.sessions.length} séances
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{week.volume}{isMetric ? 'km' : 'mi'}</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-3 pt-4">
                {week.sessions.map((session, sessionIndex) => (
                  <div key={sessionIndex} className="glass-card p-3 rounded-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant="secondary" 
                                  className={`${SESSION_COLORS[session.type]} text-xs font-medium cursor-help transition-colors`}
                                >
                                  {t(session.type)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-sm">{SESSION_EXPLANATIONS[session.type]}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span className="text-sm text-muted-foreground">{session.duration}</span>
                          <span className="text-sm font-medium mono-numbers">{session.pace}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{session.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="btn-glass"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyWeekToClipboard(week);
                    }}
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    {t("Copier")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="btn-glass"
                    onClick={(e) => {
                      e.stopPropagation();
                      shareWeek(week);
                    }}
                  >
                    <Share2 className="h-3 w-3 mr-2" />
                    {t("Partager")}
                  </Button>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
      
      {/* Save Program Button */}
      <Card className="glass-card p-4 mt-6">
        <Button onClick={saveProgramToFavorites} className="w-full btn-primary-glass h-12 text-base font-medium">
          Enregistrer le programme
        </Button>
        
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={shareFullProgram}
            className="flex-1 btn-glass h-10"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
          <Button
            variant="outline"
            onClick={printProgram}
            className="flex-1 btn-glass h-10"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
        </div>
      </Card>
    </div>
  );
});

ProgramScreen.displayName = "ProgramScreen";