export interface ProgramProgress {
  weeks: Record<number, {
    done: boolean;
    sessions: boolean[];
  }>;
}

export interface ProgramState {
  selectedDistanceId: string;
  sessionsPerWeek: number;
  effectiveWeeks: number;
  speedValue: number;
  isMetric: boolean;
  vmaValue?: number;
}

export function generateProgramKey(state: ProgramState): string {
  return `progress:${state.selectedDistanceId}:${state.sessionsPerWeek}:${state.effectiveWeeks}:${state.speedValue.toFixed(2)}:${state.isMetric ? 'M' : 'I'}:${state.vmaValue ?? 'nv'}`;
}