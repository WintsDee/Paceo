import jsPDF from 'jspdf';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

interface TrainingSession {
  type: string;
  duration: string;
  pace: string;
  description: string;
}

interface WeekProgram {
  week: number;
  phase: string;
  volume: number;
  sessions: TrainingSession[];
}

interface ProgramData {
  race: string;
  goalTime: string;
  goalPace: string;
  sessionsPerWeek: number;
  effectiveWeeks: number;
  program: WeekProgram[];
  isMetric: boolean;
  speedValue: number;
}

export const generateProgramPDF = (programData: ProgramData): string => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const lineHeight = 7;
  let currentY = margin;

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number = 20) => {
    if (currentY + requiredSpace > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }
  };

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Programme d\'entraînement', pageWidth / 2, currentY, { align: 'center' });
  currentY += lineHeight * 2;

  // Goal information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const goalInfo = [
    `Objectif: ${programData.race} - ${programData.goalTime} (${programData.goalPace}/${programData.isMetric ? 'km' : 'mi'})`,
    `Sessions/semaine: ${programData.sessionsPerWeek} • Durée: ${programData.effectiveWeeks} semaines`,
    `Vitesse: ${programData.speedValue.toFixed(1)} ${programData.isMetric ? 'km/h' : 'mph'}`
  ];

  goalInfo.forEach(line => {
    doc.text(line, margin, currentY);
    currentY += lineHeight;
  });

  currentY += lineHeight;

  // Program weeks
  programData.program.forEach((week) => {
    checkNewPage(50); // Ensure space for week header and first sessions

    // Week header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Semaine ${week.week} - ${week.phase} (${week.volume}${programData.isMetric ? 'km' : 'mi'})`, margin, currentY);
    currentY += lineHeight * 1.5;

    // Sessions
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    week.sessions.forEach((session, index) => {
      checkNewPage(15); // Ensure space for session

      const sessionText = `${index + 1}. ${session.type} - ${session.duration} - ${session.pace}`;
      doc.text(sessionText, margin + 5, currentY);
      currentY += lineHeight;

      // Session description (wrapped text)
      const description = session.description;
      const splitDescription = doc.splitTextToSize(description, pageWidth - margin * 2 - 10);
      splitDescription.forEach((line: string) => {
        checkNewPage();
        doc.text(line, margin + 10, currentY);
        currentY += lineHeight * 0.8;
      });

      currentY += lineHeight * 0.3; // Small gap between sessions
    });

    currentY += lineHeight; // Gap between weeks
  });

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Généré par PacePilot Pro', pageWidth / 2, footerY, { align: 'center' });

  return doc.output('datauristring');
};

export const shareProgram = async (programData: ProgramData): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Generate PDF
      const pdfDataUri = generateProgramPDF(programData);
      
      // Extract base64 data from data URI
      const base64Data = pdfDataUri.split(',')[1];
      
      // Share using Capacitor Share plugin
      await Share.share({
        title: 'Programme d\'entraînement',
        text: `Mon programme d'entraînement ${programData.race}`,
        url: pdfDataUri
      });
      
      return true;
    } else {
      // Fallback for web: download PDF
      const pdfDataUri = generateProgramPDF(programData);
      const link = document.createElement('a');
      link.href = pdfDataUri;
      link.download = `programme-${programData.race.toLowerCase()}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    }
  } catch (error) {
    console.error('Error sharing program:', error);
    return false;
  }
};

export const shareWeek = async (week: WeekProgram, raceInfo: { race: string; goalPace: string; isMetric: boolean }): Promise<boolean> => {
  try {
    const weekText = `Semaine ${week.week} - ${week.phase} (${week.volume}${raceInfo.isMetric ? 'km' : 'mi'})\n\n${week.sessions.map((session, index) => `${index + 1}. ${session.type} - ${session.duration}\n   ${session.description}`).join('\n\n')}`;
    
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        title: `Semaine ${week.week} - Programme d'entraînement`,
        text: weekText
      });
    } else if (navigator.share) {
      await navigator.share({
        title: `Semaine ${week.week} - Programme d'entraînement`,
        text: weekText
      });
    } else {
      await navigator.clipboard.writeText(weekText);
    }
    
    return true;
  } catch (error) {
    console.error('Error sharing week:', error);
    return false;
  }
};