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
import { CalendarIcon, ChevronDown, Plus, Minus, Copy, Share2, Target, HelpCircle, Printer } from "lucide-react";
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

const raceDistances = [
  { id: "10k", label: "10 km", distance: 10, distanceMiles: 6.21 },
  { id: "semi", label: "Semi", distance: 21.0975, distanceMiles: 13.1 },
  { id: "marathon", label: "Marathon", distance: 42.195, distanceMiles: 26.2 },
];

function paceFromSpeed(speed: number) {
  if (!speed || speed <= 0) return "0:00";
  const totalMinutes = 60 / speed;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function addSecondsToMmSs(mmss: string, seconds: number): string {
  const [m, s] = mmss.split(":").map(Number);
  const totalSeconds = m * 60 + s + seconds;
  const newMinutes = Math.floor(totalSeconds / 60);
  const newSeconds = totalSeconds % 60;
  return `${newMinutes}:${newSeconds.toString().padStart(2, "0")}`;
}

function formatPace(pace: string, isMetric: boolean): string {
  return `${pace}/${isMetric ? 'km' : 'mi'}`;
}

export const ProgramScreen = React.memo(({ isMetric, speedValue, vmaValue }: ProgramScreenProps) => {
  const { t, language } = useLanguage();
  const [sessionsPerWeek, setSessionsPerWeek] = useLocalStorage<number>("program-sessions-week", 3);
  const [weeksBeforeRace, setWeeksBeforeRace] = useLocalStorage<number>("program-weeks-before", 12);
  const [raceDate, setRaceDate] = useState<Date>();
  const [useRaceDate, setUseRaceDate] = useState(false);
  const [selectedDistanceId] = useLocalStorage<string>("pace-calc-goal-distance", "10k");
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [favorites] = useLocalStorage<any[]>("race-goals", []);

  const dateLocale = useMemo(() => {
    switch (language) {
      case 'fr': return fr;
      case 'es': return es;
      case 'de': return de;
      default: return enUS;
    }
  }, [language]);

  const race = useMemo(() => raceDistances.find(d => d.id === selectedDistanceId) || raceDistances[0], [selectedDistanceId]);
  const targetPace = useMemo(() => paceFromSpeed(speedValue), [speedValue]);
  
  const effectiveWeeks = useMemo(() => {
    if (useRaceDate && raceDate) {
      const weeks = differenceInWeeks(raceDate, new Date());
      return Math.max(2, Math.min(16, weeks));
    }
    return weeksBeforeRace;
  }, [useRaceDate, raceDate, weeksBeforeRace]);

  // Calculate runner level based on goal performance
  const getRunnerLevel = useCallback((speed: number, distance: string): 'beginner' | 'intermediate' | 'advanced' => {
    const pace = 60 / speed; // minutes per km
    
    if (distance === "10k") {
      if (pace > 7) return 'beginner';      // >42min for 10k
      if (pace > 5) return 'intermediate';  // 35-42min for 10k  
      return 'advanced';                    // <35min for 10k
    } else if (distance === "semi") {
      if (pace > 6.5) return 'beginner';    // >2h17 for semi
      if (pace > 4.8) return 'intermediate'; // 1h41-2h17 for semi
      return 'advanced';                    // <1h41 for semi
    } else { // marathon
      if (pace > 6.5) return 'beginner';    // >4h35 for marathon
      if (pace > 5) return 'intermediate';  // 3h30-4h35 for marathon
      return 'advanced';                    // <3h30 for marathon
    }
  }, []);

  const calculatePaces = useCallback((goalSpeed: number, distance: string, vma?: number) => {
    const goalPace = paceFromSpeed(goalSpeed);
    const level = getRunnerLevel(goalSpeed, distance);
    
    // Adjust zones based on runner level and VMA if available
    let easyOffset = 60, steadyOffset = 30;
    let thrOffset = distance === "10k" ? -5 : distance === "semi" ? -10 : -20;
    let intOffset = distance === "10k" ? -18 : distance === "semi" ? -25 : -35;
    
    if (level === 'beginner') {
      easyOffset = 90; // More conservative for beginners
      steadyOffset = 45;
      thrOffset = Math.max(thrOffset + 10, -5); // Closer to goal pace
      intOffset = Math.max(intOffset + 15, -10);
    } else if (level === 'advanced' && vma && vma > 16) {
      easyOffset = 45; // Faster recovery for advanced runners
      steadyOffset = 20;
      thrOffset -= 5; // More aggressive zones
      intOffset -= 5;
    }
    
    const paces = {
      EASY: addSecondsToMmSs(goalPace, easyOffset),
      STEADY: addSecondsToMmSs(goalPace, steadyOffset),
      THR: addSecondsToMmSs(goalPace, thrOffset),
      INT: addSecondsToMmSs(goalPace, intOffset),
      RP: goalPace
    };
    
    return paces;
  }, [getRunnerLevel]);

  const generateProgram = useCallback((): WeekProgram[] => {
    const weeks = effectiveWeeks;
    const baseWeeks = Math.floor(weeks * 0.5);
    const buildWeeks = Math.floor(weeks * 0.35);
    const peakWeeks = Math.max(1, Math.floor(weeks * 0.1));
    const taperWeeks = 1;
    
    const paces = calculatePaces(speedValue, selectedDistanceId, vmaValue);
    const level = getRunnerLevel(speedValue, selectedDistanceId);
    const program: WeekProgram[] = [];
    
    // Base volume per sessions/week adjusted by level
    const baseVolumes = {
      beginner: {
        2: isMetric ? 20 : 12,
        3: isMetric ? 25 : 16, 
        4: isMetric ? 30 : 19,
        5: isMetric ? 35 : 22,
        6: isMetric ? 40 : 25
      },
      intermediate: {
        2: isMetric ? 30 : 19,
        3: isMetric ? 40 : 25, 
        4: isMetric ? 50 : 31,
        5: isMetric ? 60 : 37,
        6: isMetric ? 70 : 43
      },
      advanced: {
        2: isMetric ? 40 : 25,
        3: isMetric ? 55 : 34, 
        4: isMetric ? 70 : 43,
        5: isMetric ? 85 : 53,
        6: isMetric ? 100 : 62
      }
    };
    
    let currentVolume = baseVolumes[level][sessionsPerWeek as keyof typeof baseVolumes.beginner] || 35;
    
    for (let week = 1; week <= weeks; week++) {
      let phase: WeekProgram['phase'];
      if (week <= baseWeeks) phase = "BASE";
      else if (week <= baseWeeks + buildWeeks) phase = "BUILD";
      else if (week <= weeks - taperWeeks) phase = "PEAK";
      else phase = "TAPER";
      
      // Volume progression adapted by level
      if (phase === "BASE" || phase === "BUILD") {
        if (week % 4 === 0) {
          currentVolume *= level === 'beginner' ? 0.8 : 0.85; // More recovery for beginners
        } else {
          const progression = level === 'beginner' ? 1.08 : level === 'intermediate' ? 1.1 : 1.12;
          currentVolume *= progression;
        }
      } else if (phase === "TAPER") {
        const taperReduction = level === 'beginner' ? 0.5 : level === 'intermediate' ? 0.6 : 0.65;
        currentVolume *= taperReduction;
      }
      
      const volume = Math.round(currentVolume);
      const sessions = generateWeekSessions(sessionsPerWeek, phase, paces, selectedDistanceId, volume, isMetric);
      
      program.push({ week, phase, volume, sessions });
    }
    
    return program;
  }, [effectiveWeeks, speedValue, selectedDistanceId, sessionsPerWeek, isMetric, calculatePaces, vmaValue, getRunnerLevel]);

  const generateWeekSessions = useCallback((
    sessions: number, 
    phase: WeekProgram['phase'], 
    paces: Record<string, string>,
    distance: string,
    volume: number,
    metric: boolean
  ): TrainingSession[] => {
    const sessionList: TrainingSession[] = [];
    
    // Session templates based on sessions per week
    const templates = {
      2: ["INT", "Longue"],
      3: ["INT", "THR", "Longue"],
      4: ["INT", "EASY", "THR", "Longue"], 
      5: ["INT", "EASY", "THR", "EASY", "Longue"],
      6: ["INT", "EASY", "THR", "EASY", "Longue", "EASY"]
    };
    
    const template = templates[sessions as keyof typeof templates] || templates[3];
    
    template.forEach((type, index) => {
      const session = createSession(type as TrainingSession['type'], phase, paces, distance, volume, metric, index === template.length - 1);
      sessionList.push(session);
    });
    
    return sessionList;
  }, []);

  const createSession = useCallback((
    type: TrainingSession['type'],
    phase: WeekProgram['phase'], 
    paces: Record<string, string>,
    distance: string,
    volume: number,
    metric: boolean,
    isLongRun: boolean
  ): TrainingSession => {
    
    switch (type) {
      case "INT":
        if (distance === "10k") {
          return {
            type: "INT",
            duration: "40-50 min",
            pace: formatPace(paces.INT, metric),
            description: phase === "PEAK" ? `8×400m @ ${formatPace(paces.INT, metric)}, récup 200m` : 
                        `6×400m @ ${formatPace(paces.INT, metric)}, récup 200m`
          };
        } else {
          return {
            type: "INT", 
            duration: "45-60 min",
            pace: formatPace(paces.INT, metric),
            description: phase === "PEAK" ? `5×1000m @ ${formatPace(paces.INT, metric)}, récup 2 min` :
                        `4×1000m @ ${formatPace(paces.INT, metric)}, récup 2 min`
          };
        }
        
      case "THR":
        return {
          type: "THR",
          duration: "50-70 min", 
          pace: formatPace(paces.THR, metric),
          description: distance === "marathon" ? `3×15 min @ ${formatPace(paces.THR, metric)}, récup 3 min` :
                      `3×10 min @ ${formatPace(paces.THR, metric)}, récup 2 min`
        };
        
      case "RP":
        return {
          type: "RP",
          duration: "60-80 min",
          pace: formatPace(paces.RP, metric),
          description: phase === "BUILD" || phase === "PEAK" ? 
                      `2×20 min @ ${formatPace(paces.RP, metric)}, récup 5 min` :
                      `15 min @ ${formatPace(paces.RP, metric)}`
        };
        
      case "Longue":
        const longDuration = Math.round(volume * 0.25); // Minutes based on volume
        const hasRPSegment = (phase === "BUILD" || phase === "PEAK") && distance !== "10k";
        return {
          type: "Longue",
          duration: `${longDuration}-${longDuration + 15} min`,
          pace: formatPace(paces.EASY, metric),
          description: hasRPSegment ? 
                      `${longDuration + 10}-${longDuration + 20} min @ ${formatPace(paces.EASY, metric)}, dont 20-30 min @ ${formatPace(paces.RP, metric)}` :
                      `${longDuration}-${longDuration + 10} min @ ${formatPace(paces.EASY, metric)}`
        };
        
      default: // EASY
        return {
          type: "EASY",
          duration: "30-50 min",
          pace: formatPace(paces.EASY, metric), 
          description: `40-50 min @ ${formatPace(paces.EASY, metric)}`
        };
    }
  }, []);

  const program = useMemo(() => generateProgram(), [generateProgram]);

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
    setSessionsPerWeek(Math.max(2, Math.min(6, sessionsPerWeek + delta)));
  }, [sessionsPerWeek, setSessionsPerWeek]);

  const adjustWeeks = useCallback((delta: number) => {
    setWeeksBeforeRace(Math.max(2, Math.min(16, weeksBeforeRace + delta)));
  }, [weeksBeforeRace, setWeeksBeforeRace]);

  const getSessionTypeColor = useCallback((type: TrainingSession['type']): string => {
    switch (type) {
      case 'EASY': return 'bg-green-600 text-white hover:bg-green-700';
      case 'STEADY': return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'THR': return 'bg-orange-600 text-white hover:bg-orange-700';
      case 'INT': return 'bg-red-600 text-white hover:bg-red-700';
      case 'RP': return 'bg-purple-600 text-white hover:bg-purple-700';
      case 'Longue': return 'bg-cyan-600 text-white hover:bg-cyan-700';
      default: return 'bg-gray-600 text-white hover:bg-gray-700';
    }
  }, []);

  const getSessionTypeExplanation = useCallback((type: TrainingSession['type']): string => {
    const explanations = {
      'EASY': "Course à allure tranquille pour récupérer et développer l'endurance de base",
      'STEADY': "Allure confortable et soutenue, légèrement plus rapide que l'allure facile",
      'THR': "Allure seuil/tempo - intensité modérée à élevée, proche du seuil lactique",
      'INT': "Intervalles courts à haute intensité pour améliorer VO2max",
      'RP': "Allure course - l'allure exacte de votre objectif de compétition",
      'Longue': "Sortie longue pour développer l'endurance et l'économie de course"
    };
    return explanations[type] || '';
  }, []);

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
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Programme d\'entraînement',
          text: fullText,
        });
      } catch (err) {
        try {
          await navigator.clipboard.writeText(fullText);
          toast.success('Programme copié dans le presse-papiers !');
        } catch (clipErr) {
          toast.error('Erreur lors du partage');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullText);
        toast.success('Programme copié dans le presse-papiers !');
      } catch (err) {
        toast.error('Erreur lors de la copie');
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
    
    const currentFavorites = favorites;
    const newFavorites = [...currentFavorites, currentGoal];
    localStorage.setItem("race-goals", JSON.stringify(newFavorites));
    
    toast.success('Programme enregistré dans les favoris !');
  }, [race, selectedDistanceId, speedValue, isMetric, vmaValue, sessionsPerWeek, effectiveWeeks, program, favorites]);

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
                <Button variant="outline" size="sm" className="btn-glass ml-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date de l'objectif
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

      {/* Global Actions */}
      <Card className="glass-card p-4">
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" className="btn-glass" onClick={shareFullProgram}>
            <Share2 className="h-4 w-4 mr-2" />
            {t("Partager")}
          </Button>
          <Button variant="outline" size="sm" className="btn-glass" onClick={printProgram}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
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
                    <div className="flex flex-wrap gap-2 mb-2">
                      {week.sessions.map((session, sessionIndex) => (
                        <TooltipProvider key={sessionIndex}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="secondary" 
                                className={`${getSessionTypeColor(session.type)} text-xs font-medium px-2 py-1 cursor-help transition-colors`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                {t(session.type)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">{getSessionTypeExplanation(session.type)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
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
                                  className={`${getSessionTypeColor(session.type)} text-xs font-medium cursor-help transition-colors`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  {t(session.type)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-sm">{getSessionTypeExplanation(session.type)}</p>
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
          <Target className="w-4 h-4 mr-2" />
          Enregistrer le programme
        </Button>
      </Card>
    </div>
  );
});

ProgramScreen.displayName = "ProgramScreen";