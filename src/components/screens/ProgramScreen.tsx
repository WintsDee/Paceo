import React, { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useProgramProgress } from "@/hooks/useProgramProgress";
import { ProgramState } from "@/types/program";
import { CalendarIcon, ChevronDown, Plus, Minus, Copy, Printer, Target } from "lucide-react";
import { differenceInWeeks } from "date-fns";
import { fr, enUS, es, de, ptBR, ja, zhCN } from "date-fns/locale";
import { useAppNotifications } from "@/hooks/useAppNotifications";
interface ProgramScreenProps {
  isMetric: boolean;
  onToggleUnits: () => void;
  speedValue: number;
  vmaValue?: number;
  isLoading?: boolean;
  onSaveGoal?: (goal: any) => void;
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
const RACE_DISTANCES = [{
  id: "10k",
  label: "10 km",
  distance: 10,
  distanceMiles: 6.21
}, {
  id: "semi",
  label: "Semi",
  distance: 21.0975,
  distanceMiles: 13.1
}, {
  id: "marathon",
  label: "Marathon",
  distance: 42.195,
  distanceMiles: 26.2
}] as const;
const SESSION_TEMPLATES = {
  2: ["INT", "Longue"] as const,
  3: ["INT", "THR", "Longue"] as const,
  4: ["INT", "EASY", "THR", "Longue"] as const,
  5: ["INT", "EASY", "THR", "STEADY", "Longue"] as const,
  6: ["INT", "EASY", "THR", "STEADY", "Longue", "EASY"] as const
};
const SESSION_COLORS = {
  EASY: 'bg-green-500/80 text-white hover:bg-green-500/90 border-green-400/30',
  STEADY: 'bg-blue-500/80 text-white hover:bg-blue-500/90 border-blue-400/30',
  THR: 'bg-orange-500/80 text-white hover:bg-orange-500/90 border-orange-400/30',
  INT: 'bg-red-500/80 text-white hover:bg-red-500/90 border-red-400/30',
  RP: 'bg-purple-500/80 text-white hover:bg-purple-500/90 border-purple-400/30',
  Longue: 'bg-cyan-500/80 text-white hover:bg-cyan-500/90 border-cyan-400/30'
} as const;
const SESSION_EXPLANATIONS = {
  fr: {
    EASY: "Course à allure tranquille pour récupérer et développer l'endurance de base",
    STEADY: "Allure confortable et soutenue, légèrement plus rapide que l'allure facile",
    THR: "Allure seuil/tempo - intensité modérée à élevée, proche du seuil lactique",
    INT: "Intervalles courts à haute intensité pour améliorer VO2max",
    RP: "Allure course - l'allure exacte de votre objectif de compétition",
    Longue: "Sortie longue pour développer l'endurance et l'économie de course"
  },
  en: {
    EASY: "Easy pace for recovery and building aerobic base",
    STEADY: "Comfortable steady pace, slightly faster than easy pace",
    THR: "Threshold/tempo pace - moderate to high intensity, near lactate threshold",
    INT: "High intensity intervals to improve VO2max",
    RP: "Race pace - the exact pace of your competition goal",
    Longue: "Long run to develop endurance and running economy"
  },
  es: {
    EASY: "Ritmo fácil para recuperación y desarrollo de base aeróbica",
    STEADY: "Ritmo constante cómodo, ligeramente más rápido que el ritmo fácil",
    THR: "Ritmo umbral/tempo - intensidad moderada a alta, cerca del umbral láctico",
    INT: "Intervalos de alta intensidad para mejorar VO2max",
    RP: "Ritmo de carrera - el ritmo exacto de tu objetivo de competición",
    Longue: "Carrera larga para desarrollar resistencia y economía de carrera"
  },
  de: {
    EASY: "Lockeres Tempo zur Erholung und Aufbau der aeroben Basis",
    STEADY: "Komfortables, gleichmäßiges Tempo, etwas schneller als lockeres Tempo",
    THR: "Schwellen-/Tempo-Pace - moderate bis hohe Intensität, nahe der Laktatschwelle",
    INT: "Hochintensive Intervalle zur Verbesserung der VO2max",
    RP: "Wettkampftempo - das exakte Tempo deines Wettkampfziels",
    Longue: "Langer Lauf zur Entwicklung von Ausdauer und Laufökonomie"
  },
  pt: {
    EASY: "Ritmo fácil para recuperação e construção da base aeróbica",
    STEADY: "Ritmo constante confortável, ligeiramente mais rápido que o ritmo fácil",
    THR: "Ritmo limiar/tempo - intensidade moderada a alta, próximo ao limiar láctico",
    INT: "Intervalos de alta intensidade para melhorar o VO2max",
    RP: "Ritmo de prova - o ritmo exato do seu objetivo de competição",
    Longue: "Corrida longa para desenvolver resistência e economia de corrida"
  },
  ja: {
    EASY: "回復と有酸素ベース構築のためのイージーペース",
    STEADY: "快適で持続可能なペース、イージーペースより少し速い",
    THR: "閾値/テンポペース - 中程度から高強度、乳酸閾値付近",
    INT: "VO2maxを向上させる高強度インターバル", 
    RP: "レースペース - 競技目標の正確なペース",
    Longue: "持久力とランニングエコノミーを向上させるロング走"
  },
  zh: {
    EASY: "轻松配速，用于恢复和建立有氧基础",
    STEADY: "舒适稳定配速，比轻松配速稍快",
    THR: "门槛/节奏配速 - 中等到高强度，接近乳酸阈值",
    INT: "高强度间歇训练以提高最大摄氧量",
    RP: "比赛配速 - 你的竞赛目标的准确配速",
    Longue: "长跑训练以发展耐力和跑步经济性"
  }
} as const;

// Moteur de programme d'entraînement selon spécifications exactes 2025
const calculateVMAPaces = (vma: number) => {
  const vmaAllure = 60 / vma; // min/km selon spec: Allure_VMA = 60 / VMA
  return {
    EASY: vmaAllure * 1.15,
    // 60-70% VMA selon spec: EASY = 1,15 × Allure_VMA
    STEADY: vmaAllure * 1.08,
    // 70-75% VMA selon spec: STEADY = 1,08 × Allure_VMA  
    THR: vmaAllure * 0.95,
    // 80-85% VMA selon spec: THR = 0,95 × Allure_VMA
    INT: vmaAllure * 0.90,
    // 95-105% VMA selon spec: INT = 0,90 × Allure_VMA
    VMA: vmaAllure // 100-110% VMA pur
  };
};
const calculateWeeklyVolume = (sessionsPerWeek: number, vma: number): number => {
  // Volume S1 selon spec exacte: Base sur Sessions/semaine + VMA
  const multipliers = {
    2: {
      min: 1.8,
      max: 2.2
    },
    // 2 séances : (VMA × 1,8) à (VMA × 2,2)
    3: {
      min: 2.2,
      max: 2.8
    },
    // 3 séances : (VMA × 2,2) à (VMA × 2,8)
    4: {
      min: 2.8,
      max: 3.5
    },
    // 4 séances : (VMA × 2,8) à (VMA × 3,5)
    5: {
      min: 3.5,
      max: 4.2
    },
    // 5 séances : (VMA × 3,5) à (VMA × 4,2)
    6: {
      min: 4.2,
      max: 5.0
    } // 6 séances : (VMA × 4,2) à (VMA × 5)
  };
  const mult = multipliers[sessionsPerWeek as keyof typeof multipliers] || multipliers[3];
  return Math.round(vma * ((mult.min + mult.max) / 2)); // arrondir au km le plus proche
};
const assessObjectiveRealism = (goalSpeed: number, vma: number, distance: string): number => {
  const goalPercent = goalSpeed / vma * 100;

  // Exigence réaliste selon objectif - spec exacte
  // Plus l'objectif est ambitieux (% VMA élevé), plus on réduit le volume pour éviter la blessure
  // Si allure cible > 80 % VMA → objectif très ambitieux, volume réduit
  if (goalPercent > 80) return 0.6; // max 1 séance intense/semaine
  // Si allure cible < 75 % VMA → objectif réaliste, volume complet
  if (goalPercent < 75) return 1.0;
  return 0.85; // Entre 75-80% VMA
};

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
    } else {
      // marathon
      if (pace > 6.5) return 'beginner';
      if (pace > 5) return 'intermediate';
      return 'advanced';
    }
  }, [speed, distance]);
};

// Hook pour les zones d'allure basées VMA (spécifications 2025)
const usePaceZones = (goalSpeed: number, distance: string, level: string, vma?: number) => {
  return useMemo(() => {
    if (!vma || vma <= 8) {
      // Fallback ancien système si pas de VMA
      const goalPace = paceFromSpeed(goalSpeed);
      let easyOffset = 60,
        steadyOffset = 30;
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
        RP: paceFromSpeed(goalSpeed)
      };
    }

    // Nouveau système basé sur l'objectif de course (2025)
    const goalPace = paceFromSpeed(goalSpeed);
    const goalPaceSeconds = parseFloat(goalPace.split(':')[0]) * 60 + parseFloat(goalPace.split(':')[1]);
    
    // Calcul des allures basées sur l'objectif de course, pas la VMA pure
    // Les zones d'entraînement doivent être cohérentes avec l'objectif
    const easyPaceSeconds = goalPaceSeconds + 60; // +1min/km par rapport à l'objectif
    const steadyPaceSeconds = goalPaceSeconds + 30; // +30s/km par rapport à l'objectif  
    const thrPaceSeconds = goalPaceSeconds - 5; // -5s/km par rapport à l'objectif
    const intPaceSeconds = goalPaceSeconds - 15; // -15s/km par rapport à l'objectif
    
    const formatPaceFromSeconds = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
      EASY: formatPaceFromSeconds(easyPaceSeconds),
      STEADY: formatPaceFromSeconds(steadyPaceSeconds), 
      THR: formatPaceFromSeconds(thrPaceSeconds),
      INT: formatPaceFromSeconds(intPaceSeconds),
      RP: goalPace // Allure de l'objectif de course
    };
  }, [goalSpeed, distance, level, vma]);
};
export const ProgramScreen = React.memo(({
  isMetric,
  onToggleUnits,
  speedValue,
  vmaValue,
  isLoading = false,
  onSaveGoal
}: ProgramScreenProps) => {
  const { t, language } = useLanguage();
  const { notifications } = useAppNotifications();
  const [sessionsPerWeek, setSessionsPerWeek] = useLocalStorage<number>("program-sessions-week", 3);
  const [weeksBeforeRace, setWeeksBeforeRace] = useLocalStorage<number>("program-weeks-before", 12);
  const [raceDate, setRaceDate] = useState<Date>();
  const [useRaceDate, setUseRaceDate] = useState(false);
  const [selectedDistanceId] = useLocalStorage<string>("pace-calc-goal-distance", "10k");
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  

  // Mémorisation des données de base
  const dateLocale = useMemo(() => {
    switch (language) {
      case 'fr':
        return fr;
      case 'es':
        return es;
      case 'de':
        return de;
      case 'pt':
        return ptBR;
      case 'ja':
        return ja;
      case 'zh':
        return zhCN;
      default:
        return enUS;
    }
  }, [language]);
  const race = useMemo(() => RACE_DISTANCES.find(d => d.id === selectedDistanceId) || RACE_DISTANCES[0], [selectedDistanceId]);
  const effectiveWeeks = useMemo(() => {
    if (useRaceDate && raceDate) {
      const weeks = differenceInWeeks(raceDate, new Date());
      return Math.max(2, Math.min(16, weeks));
    }
    return weeksBeforeRace;
  }, [useRaceDate, raceDate, weeksBeforeRace]);

  // Progress tracking
  const programState: ProgramState = useMemo(() => ({
    selectedDistanceId,
    sessionsPerWeek,
    effectiveWeeks,
    speedValue,
    isMetric,
    vmaValue
  }), [selectedDistanceId, sessionsPerWeek, effectiveWeeks, speedValue, isMetric, vmaValue]);

  const { progress, toggleSession, toggleWeek, getWeekProgress, getOverallProgress } = useProgramProgress(programState);

  // Utilisation des hooks personnalisés
  const runnerLevel = useRunnerLevel(speedValue, selectedDistanceId);
  const paceZones = usePaceZones(speedValue, selectedDistanceId, runnerLevel, vmaValue);

  // Volume de base selon spécifications 2025 (basé VMA)
  const baseVolume = useMemo(() => {
    if (!vmaValue || vmaValue <= 8) {
      // Fallback ancien système
      const volumes = {
        beginner: {
          "10k": {
            2: isMetric ? 15 : 9,
            3: isMetric ? 20 : 12,
            4: isMetric ? 25 : 16,
            5: isMetric ? 30 : 19,
            6: isMetric ? 35 : 22
          },
          "semi": {
            2: isMetric ? 25 : 16,
            3: isMetric ? 35 : 22,
            4: isMetric ? 45 : 28,
            5: isMetric ? 55 : 34,
            6: isMetric ? 65 : 40
          },
          "marathon": {
            2: isMetric ? 35 : 22,
            3: isMetric ? 50 : 31,
            4: isMetric ? 65 : 40,
            5: isMetric ? 80 : 50,
            6: isMetric ? 95 : 59
          }
        },
        intermediate: {
          "10k": {
            2: isMetric ? 25 : 16,
            3: isMetric ? 35 : 22,
            4: isMetric ? 45 : 28,
            5: isMetric ? 55 : 34,
            6: isMetric ? 65 : 40
          },
          "semi": {
            2: isMetric ? 40 : 25,
            3: isMetric ? 55 : 34,
            4: isMetric ? 70 : 43,
            5: isMetric ? 85 : 53,
            6: isMetric ? 100 : 62
          },
          "marathon": {
            2: isMetric ? 55 : 34,
            3: isMetric ? 75 : 47,
            4: isMetric ? 95 : 59,
            5: isMetric ? 115 : 71,
            6: isMetric ? 135 : 84
          }
        },
        advanced: {
          "10k": {
            2: isMetric ? 35 : 22,
            3: isMetric ? 50 : 31,
            4: isMetric ? 65 : 40,
            5: isMetric ? 80 : 50,
            6: isMetric ? 95 : 59
          },
          "semi": {
            2: isMetric ? 55 : 34,
            3: isMetric ? 75 : 47,
            4: isMetric ? 95 : 59,
            5: isMetric ? 115 : 71,
            6: isMetric ? 135 : 84
          },
          "marathon": {
            2: isMetric ? 75 : 47,
            3: isMetric ? 105 : 65,
            4: isMetric ? 135 : 84,
            5: isMetric ? 165 : 102,
            6: isMetric ? 195 : 121
          }
        }
      };
      return volumes[runnerLevel as keyof typeof volumes][selectedDistanceId as keyof typeof volumes.beginner][sessionsPerWeek as keyof typeof volumes.beginner["10k"]] || 35;
    }

    // Nouveau système basé VMA (2025) - spec exacte
    let baseVolumeKm = calculateWeeklyVolume(sessionsPerWeek, vmaValue);

    // Facteur de réalisme selon l'objectif - spec exacte
    const realismFactor = assessObjectiveRealism(speedValue, vmaValue, selectedDistanceId);
    baseVolumeKm = Math.round(baseVolumeKm * realismFactor);

    // Conversion unités si nécessaire - convertir en mi si besoin selon spec
    return isMetric ? baseVolumeKm : Math.round(baseVolumeKm * 0.621371);
  }, [runnerLevel, selectedDistanceId, sessionsPerWeek, isMetric, vmaValue, speedValue]);

  // Génération gabarits sessions selon spécifications 2025
  const createSession = useCallback((type: TrainingSession['type'], phase: WeekProgram['phase'], distance: string, volume: number, weekNumber: number): TrainingSession => {
    const isHighIntensityWeek = weekNumber % 4 !== 0; // Deload chaque 4ème semaine

    switch (type) {
      case "INT":
        // Séances intensité 95-105% VMA
        if (distance === "10k") {
          const reps = phase === "PEAK" ? isHighIntensityWeek ? 8 : 6 : 6;
          return {
            type: "INT",
            duration: "40-50 min",
            pace: formatPace(paceZones.INT, isMetric),
            description: `${reps}×400m @ ${formatPace(paceZones.INT, isMetric)}, récup 200m trot`
          };
        } else if (distance === "semi") {
          const reps = phase === "PEAK" ? isHighIntensityWeek ? 6 : 4 : 4;
          return {
            type: "INT",
            duration: "45-55 min",
            pace: formatPace(paceZones.INT, isMetric),
            description: `${reps}×800m @ ${formatPace(paceZones.INT, isMetric)}, récup 400m trot`
          };
        } else {
          // marathon
          const reps = phase === "PEAK" ? isHighIntensityWeek ? 5 : 4 : 3;
          return {
            type: "INT",
            duration: "50-65 min",
            pace: formatPace(paceZones.INT, isMetric),
            description: `${reps}×1000m @ ${formatPace(paceZones.INT, isMetric)}, récup 2min trot`
          };
        }
      case "THR":
        // Séances seuil 80-85% VMA
        const thrDuration = distance === "marathon" ? 15 : 10;
        const thrReps = phase === "PEAK" ? 3 : distance === "marathon" ? 2 : 3;
        return {
          type: "THR",
          duration: "50-70 min",
          pace: formatPace(paceZones.THR, isMetric),
          description: `${thrReps}×${thrDuration}min @ ${formatPace(paceZones.THR, isMetric)}, récup 3min`
        };
      case "RP":
        // Allure course spécifique
        const rpDuration = phase === "BUILD" || phase === "PEAK" ? 20 : 15;
        const rpReps = (phase === "BUILD" || phase === "PEAK") && distance !== "10k" ? 2 : 1;
        return {
          type: "RP",
          duration: "60-80 min",
          pace: formatPace(paceZones.RP, isMetric),
          description: rpReps > 1 ? `${rpReps}×${rpDuration}min @ ${formatPace(paceZones.RP, isMetric)}, récup 5min` : `${rpDuration}min @ ${formatPace(paceZones.RP, isMetric)}`
        };
      case "Longue":
        // Sortie longue adaptée selon phase et distance - spec exacte
        let volumeRatio: number;
        // BASE : 25–30 % du volume hebdo, BUILD : 30–35 %, PEAK : 35–40 %
        if (phase === "BASE") volumeRatio = 0.275; // 25-30% moyenne = 27.5%
        else if (phase === "BUILD") volumeRatio = 0.325; // 30-35% moyenne = 32.5%
        else if (phase === "PEAK") volumeRatio = 0.375; // 35-40% moyenne = 37.5%
        else volumeRatio = 0.25; // TAPER réduit

        // Marathon haut niveau : pic à 42–45 % selon spec
        if (distance === "marathon" && vmaValue && vmaValue > 18 && sessionsPerWeek >= 5 && phase === "PEAK") {
          volumeRatio = 0.435; // 42-45% moyenne = 43.5%
        }
        const longDistance = Math.round(volume * volumeRatio);
        const longDuration = Math.round(longDistance * (isMetric ? 6.5 : 10));

        // Blocs RP intégrés selon phase - BUILD : avec blocs RP intégrés
        const hasRPSegment = (phase === "BUILD" || phase === "PEAK") && distance !== "10k";
        const rpSegmentDistance = hasRPSegment ? Math.round(longDistance * 0.25) : 0;
        return {
          type: "Longue",
          duration: `${longDuration}-${longDuration + 15} min`,
          pace: formatPace(paceZones.EASY, isMetric),
          description: hasRPSegment ? `${longDistance}${isMetric ? 'km' : 'mi'} EASY @ ${formatPace(paceZones.EASY, isMetric)}, inclus ${rpSegmentDistance}${isMetric ? 'km' : 'mi'} @ ${formatPace(paceZones.RP, isMetric)}` : `${longDistance}${isMetric ? 'km' : 'mi'} @ ${formatPace(paceZones.EASY, isMetric)}`
        };
      case "STEADY":
        // Allure confortable 70-75% VMA
        return {
          type: "STEADY",
          duration: "40-60 min",
          pace: formatPace(paceZones.STEADY, isMetric),
          description: `45-55min @ ${formatPace(paceZones.STEADY, isMetric)} (tempo confortable)`
        };
      default:
        // EASY
        // Course facile 60-70% VMA + strides optionnelles
        const hasStrides = type === "EASY" && (phase === "BUILD" || phase === "PEAK") && Math.random() > 0.5;
        return {
          type: "EASY",
          duration: "30-50 min",
          pace: formatPace(paceZones.EASY, isMetric),
          description: hasStrides ? `40-50min @ ${formatPace(paceZones.EASY, isMetric)} + 4×100m strides` : `40-50min @ ${formatPace(paceZones.EASY, isMetric)}`
        };
    }
  }, [paceZones, isMetric]);

  // Moteur programme selon spécifications 2025
  const program = useMemo((): WeekProgram[] => {
    const weeks = effectiveWeeks;

    // Périodisation moderne
    const baseWeeks = Math.floor(weeks * 0.45); // BASE: 45%
    const buildWeeks = Math.floor(weeks * 0.35); // BUILD: 35% 
    const peakWeeks = Math.floor(weeks * 0.15); // PEAK: 15%
    const taperWeeks = Math.max(1, weeks - baseWeeks - buildWeeks - peakWeeks); // TAPER: 5%

    const program: WeekProgram[] = [];
    let currentVolume = baseVolume;
    for (let week = 1; week <= weeks; week++) {
      let phase: WeekProgram['phase'];
      if (week <= baseWeeks) phase = "BASE";else if (week <= baseWeeks + buildWeeks) phase = "BUILD";else if (week <= baseWeeks + buildWeeks + peakWeeks) phase = "PEAK";else phase = "TAPER";

      // Progression volumique selon coaching moderne 2025
      if (phase === "BASE") {
        if (week % 4 === 0) {
          // Deload week -15%
          currentVolume *= 0.85;
        } else {
          // Progression +5-10%/semaine selon niveau
          const progression = vmaValue && vmaValue > 16 ? 1.10 : vmaValue && vmaValue > 14 ? 1.08 : 1.06;
          currentVolume = Math.min(currentVolume * progression, baseVolume * 1.6); // Cap à +60%
        }
      } else if (phase === "BUILD") {
        if (week % 3 === 0) {
          // Deload week -15%
          currentVolume *= 0.85;
        } else {
          // Progression modérée +5%
          currentVolume = Math.min(currentVolume * 1.05, baseVolume * 1.8); // Cap à +80%
        }
      } else if (phase === "PEAK") {
        // Maintenir volume max
        currentVolume = baseVolume * 1.7;
      } else if (phase === "TAPER") {
        // Réduction taper -30 à -50%
        const realismFactor = vmaValue ? assessObjectiveRealism(speedValue, vmaValue, selectedDistanceId) : 0.8;
        const taperReduction = realismFactor > 0.9 ? 0.4 : realismFactor > 0.7 ? 0.5 : 0.6;
        currentVolume *= taperReduction;
      }
      const volume = Math.round(currentVolume);

      // Gabarits sessions modernes adaptés au nb de séances
      const sessionTemplate = SESSION_TEMPLATES[sessionsPerWeek as keyof typeof SESSION_TEMPLATES] || SESSION_TEMPLATES[3];

      // Utiliser directement le gabarit sans modification complexe
      const sessions = sessionTemplate.map(type => createSession(type as TrainingSession['type'], phase, selectedDistanceId, volume, week));
      program.push({
        week,
        phase,
        volume,
        sessions
      });
    }
    return program;
  }, [effectiveWeeks, baseVolume, sessionsPerWeek, selectedDistanceId, createSession, vmaValue, speedValue]);

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
    const weekText = `${t("Semaine")} ${week.week} - ${t(week.phase)}\n\n${week.sessions.map((session, index) => `${index + 1}. ${t(session.type)} - ${session.duration}\n${session.description}`).join('\n\n')}`;
    try {
      await navigator.clipboard.writeText(weekText);
      notifications.programCopied();
    } catch (err) {
      notifications.loadingError('copier la semaine');
    }
  }, [t, isMetric]);
  const goalTime = useMemo(() => {
    if (!speedValue || speedValue <= 0) return "0:00:00";
    const distanceKm = isMetric ? race.distance : race.distanceMiles;
    const hours = distanceKm / speedValue;
    const totalMinutes = hours * 60;
    const h = Math.floor(totalMinutes / 60);
    const m = Math.floor(totalMinutes % 60);
    const s = Math.round(totalMinutes % 1 * 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [speedValue, race, isMetric]);

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
              <h2>${t("Semaine")} ${week.week} - ${t(week.phase)}</h2>
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
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    }
  }, [program, t, race.label, speedValue, isMetric, sessionsPerWeek, effectiveWeeks]);
  const goalPace = useMemo(() => paceFromSpeed(speedValue), [speedValue]);
  const saveProgramToFavorites = useCallback(() => {
    if (!onSaveGoal) return;
    
    const currentGoal = {
      id: Date.now().toString(),
      distance: race.label,
      selectedDistanceId: selectedDistanceId,
      targetTime: goalTime,
      pace: goalPace,
      speed: speedValue.toFixed(2),
      isMetric,
      vmaKmh: vmaValue,
      distanceKm: isMetric ? race.distance : race.distanceMiles * 1.60934,
      distanceMiles: isMetric ? race.distance * 0.621371 : race.distanceMiles,
      savedAt: new Date(),
      program: {
        sessionsPerWeek,
        weeksBeforeRace: effectiveWeeks,
        weeks: program,
        progress
      }
    };
    onSaveGoal(currentGoal);
  }, [race, selectedDistanceId, goalTime, goalPace, speedValue, isMetric, vmaValue, sessionsPerWeek, effectiveWeeks, program, onSaveGoal]);
  if (!speedValue || speedValue <= 0) {
    return <div className="space-y-6 pb-20 animate-fade-in-up">
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            {t("Définis ton objectif pour générer ton programme.")}
          </div>
          <Button variant="outline" className="btn-glass">
            <Target className="w-4 h-4 mr-2" />
            {t("Définir l'objectif")}
          </Button>
        </div>
      </div>;
  }
  // Calculate overall progress
  const overallProgress = useMemo(() => 
    getOverallProgress(effectiveWeeks, sessionsPerWeek), 
    [getOverallProgress, effectiveWeeks, sessionsPerWeek]
  );

  return <div className="space-y-6 pb-20 animate-fade-in-up">
      {/* Header */}
      <div className="relative text-center py-2">
        <h2 className="text-xl font-semibold">{t("Programme")}</h2>
        <p className="text-muted-foreground text-sm">{t("Plan d'entraînement automatique")}</p>
      </div>

      {/* 1. Objectif de Course - First */}
      <Card className="glass-card p-4">
        <div className="text-center space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Objectif de Course</h3>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <div className="text-base font-bold text-foreground">{race.label}</div>
              <div className="text-xs text-muted-foreground">Distance</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mono-numbers">{goalTime}</div>
              <div className="text-xs text-muted-foreground">Temps</div>
            </div>
            
            <div className="text-center">
              <div className="text-base font-bold text-foreground mono-numbers">{formatPace(goalPace, isMetric)}</div>
              <div className="text-xs text-muted-foreground">Allure</div>
            </div>
          </div>
          
          {vmaValue && (
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/50">
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mono-numbers">{vmaValue.toFixed(1)} km/h</div>
                <div className="text-xs text-muted-foreground/70">VMA</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mono-numbers">{speedValue.toFixed(1)} {isMetric ? 'km/h' : 'mph'}</div>
                <div className="text-xs text-muted-foreground/70">Vitesse</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 2. Paramétrage du Programme - Second */}
      <Card className="glass-card p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">{t("Sessions/sem.")}</Label>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-muted/50 hover:bg-muted rounded-full" onClick={() => setSessionsPerWeek(Math.max(2, sessionsPerWeek - 1))}>
                <Minus className="h-3 w-3" />
              </Button>
              <div className="flex-1 text-center font-medium">{sessionsPerWeek}</div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-muted/50 hover:bg-muted rounded-full" onClick={() => setSessionsPerWeek(Math.min(6, sessionsPerWeek + 1))}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              {useRaceDate ? t("Date") : `${t("Avant objectif")} (${t("sem.")})`}
            </Label>
            {useRaceDate ? <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="glass-card border-0 w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {raceDate ? raceDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : language === 'de' ? 'de-DE' : language === 'pt' ? 'pt-BR' : language === 'ja' ? 'ja-JP' : 'zh-CN') : <span>{t("Date")}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={raceDate} onSelect={setRaceDate} locale={dateLocale} initialFocus />
                </PopoverContent>
              </Popover> : <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-muted/50 hover:bg-muted rounded-full" onClick={() => setWeeksBeforeRace(Math.max(2, weeksBeforeRace - 1))}>
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="flex-1 text-center font-medium">{weeksBeforeRace}</div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-muted/50 hover:bg-muted rounded-full" onClick={() => setWeeksBeforeRace(Math.min(16, weeksBeforeRace + 1))}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>}
          </div>
        </div>
      </Card>

      {/* 3. Barre de Progression Minimaliste - Third */}
      <div className="glass-card p-3 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{t("Progression")}</span>
          <span className="text-sm font-medium mono-numbers text-muted-foreground">
            {overallProgress.completedSessions}/{overallProgress.totalSessions} • {overallProgress.percentage}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div 
            className="bg-primary h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${overallProgress.percentage}%` }}
          />
        </div>
      </div>

      {/* Weekly Program */}
      <div className="space-y-3">
        {program.map((week, index) => {
          const weekProgress = getWeekProgress(week.week);
          return (
            <Collapsible key={index} open={expandedWeeks.has(week.week)} onOpenChange={() => toggleWeekExpansion(week.week)}>
              <Card className="glass-card">
                <CollapsibleTrigger className="w-full p-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={weekProgress.done}
                        onCheckedChange={(checked) => {
                          checked !== "indeterminate" && toggleWeek(week.week, week.sessions.length);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-5 w-5"
                        aria-label={t("Marquer la semaine comme terminée")}
                      />
                      <div className={`font-semibold ${weekProgress.done ? 'text-muted-foreground line-through' : ''}`}>
                        {t("Semaine")} {week.week}
                      </div>
                      <Badge variant="outline" className={`text-xs ${weekProgress.done ? 'opacity-50' : ''}`}>
                        {t(week.phase)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-sm font-medium mono-numbers ${weekProgress.done ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {weekProgress.sessions.filter(done => done).length}/{week.sessions.length}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
              
                <CollapsibleContent className="space-y-3 px-4 pb-4">
                  {week.sessions.map((session, sessionIndex) => {
                    const isSessionDone = weekProgress.sessions[sessionIndex] || false;
                    return (
                      <div key={sessionIndex} className={`glass-card p-3 rounded-lg ${isSessionDone ? 'opacity-60 bg-muted/30' : ''}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={isSessionDone}
                              onCheckedChange={(checked) => {
                                checked !== "indeterminate" && toggleSession(week.week, sessionIndex);
                              }}
                              className="h-5 w-5 mt-1"
                              aria-label={t("Séance effectuée")}
                            />
                            <div className={`flex-1 ${isSessionDone ? 'text-muted-foreground' : ''}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="secondary" className={`${SESSION_COLORS[session.type]} text-xs font-medium cursor-help transition-colors ${isSessionDone ? 'opacity-60' : ''}`}>
                                        {t(session.type)}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs text-sm">
                                        {SESSION_EXPLANATIONS[language as keyof typeof SESSION_EXPLANATIONS]?.[session.type] || SESSION_EXPLANATIONS.fr[session.type]}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <span className={`text-sm font-medium ${isSessionDone ? 'text-muted-foreground' : 'text-foreground'}`}>{session.duration}</span>
                                <span className="text-sm font-medium mono-numbers">{session.pace}</span>
                              </div>
                              <div className={`text-sm leading-relaxed ${isSessionDone ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{session.description}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="btn-glass" onClick={e => {
                e.stopPropagation();
                copyWeekToClipboard(week);
              }}>
                    <Copy className="h-3 w-3 mr-2" />
                    {t("Copier")}
                  </Button>
                </div>
              </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
      
      {/* Save Program Button */}
      <Card className="glass-card p-4 mt-6">
        <Button onClick={saveProgramToFavorites} className="w-full btn-primary-glass h-12 text-base font-medium">
          {t("Enregistrer le programme")}
        </Button>
        
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={printProgram} className="w-full btn-glass h-10">
            <Printer className="h-4 w-4 mr-2" />
            {t("Imprimer")}
          </Button>
        </div>
      </Card>
    </div>;
});
ProgramScreen.displayName = "ProgramScreen";