import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ProgramProgress, ProgramState, generateProgramKey } from "@/types/program";

export const useProgramProgress = (programState: ProgramState) => {
  const programKey = generateProgramKey(programState);
  const [progress, setProgress] = useLocalStorage<ProgramProgress>(programKey, { weeks: {} });

  const toggleSession = (weekNumber: number, sessionIndex: number) => {
    const newProgress = { ...progress };
    if (!newProgress.weeks[weekNumber]) {
      newProgress.weeks[weekNumber] = { done: false, sessions: [] };
    }
    const weekData = { ...newProgress.weeks[weekNumber] };
    weekData.sessions = [...(weekData.sessions || [])];
    weekData.sessions[sessionIndex] = !weekData.sessions[sessionIndex];
    
    // Auto-check week if all sessions are done
    const allSessionsDone = weekData.sessions.every(done => done);
    weekData.done = allSessionsDone;
    
    newProgress.weeks[weekNumber] = weekData;
    setProgress(newProgress);
  };

  const toggleWeek = (weekNumber: number, sessionsCount: number) => {
    const newProgress = { ...progress };
    if (!newProgress.weeks[weekNumber]) {
      newProgress.weeks[weekNumber] = { done: false, sessions: [] };
    }
    const weekData = { ...newProgress.weeks[weekNumber] };
    const newDoneState = !weekData.done;
    weekData.done = newDoneState;
    weekData.sessions = Array(sessionsCount).fill(newDoneState);
    newProgress.weeks[weekNumber] = weekData;
    setProgress(newProgress);
  };

  const getWeekProgress = (weekNumber: number) => {
    return progress.weeks[weekNumber] || { done: false, sessions: [] };
  };

  const getOverallProgress = (totalWeeks: number, sessionsPerWeek: number) => {
    const totalSessions = totalWeeks * sessionsPerWeek;
    let completedSessions = 0;
    
    for (let week = 1; week <= totalWeeks; week++) {
      const weekData = progress.weeks[week];
      if (weekData?.sessions) {
        completedSessions += weekData.sessions.filter(done => done).length;
      }
    }
    
    return {
      completedSessions,
      totalSessions,
      percentage: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
    };
  };

  return {
    progress,
    setProgress,
    toggleSession,
    toggleWeek,
    getWeekProgress,
    getOverallProgress
  };
};