import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RaceGoal } from "@/components/calculator/RaceGoalCalculator";
import { Heart, Trash2, Play, Eye, Copy, Share2, Printer } from "lucide-react";
import { useAppNotifications } from "@/hooks/useAppNotifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FavoritesScreenProps {
  favorites: RaceGoal[];
  onDeleteFavorite: (id: string) => void;
  onUseFavorite: (goal: RaceGoal) => void;
}

export const FavoritesScreen = ({ favorites, onDeleteFavorite, onUseFavorite }: FavoritesScreenProps) => {
  const { notifications } = useAppNotifications();
  const { t } = useLanguage();

  const handleDelete = (id: string, distance: string) => {
    onDeleteFavorite(id);
    notifications.favoriteDeleted(distance);
  };

  const handleUse = (goal: RaceGoal) => {
    onUseFavorite(goal);
    notifications.favoriteLoaded(goal.distance);
  };

  const handleCopyProgram = async (goal: RaceGoal) => {
    if (!goal.program) return;
    
    try {
      const programText = `Programme ${goal.distance} - ${goal.targetTime}\n\n` +
        `Objectif: ${goal.distance} en ${goal.targetTime}\n` +
        `Allure: ${goal.pace}/${goal.isMetric ? 'km' : 'mi'}\n` +
        `Vitesse: ${goal.speed} ${goal.isMetric ? 'km/h' : 'mph'}\n` +
        `VMA: ${goal.vmaKmh?.toFixed(1)} km/h\n\n` +
        `Programme: ${goal.program.sessionsPerWeek} sessions/semaine sur ${goal.program.weeksBeforeRace} semaines\n\n` +
        goal.program.weeks.map(week => 
          `Semaine ${week.week} (${week.phase}) - ${week.volume}km\n` +
          week.sessions.map(session => `  • ${session.type}: ${session.description}`).join('\n')
        ).join('\n\n');
      
      await navigator.clipboard.writeText(programText);
      notifications.programCopied();
    } catch (error) {
      notifications.loadingError("copier le programme");
    }
  };

  const handleShareProgram = async (goal: RaceGoal) => {
    if (!goal.program) return;
    
    try {
      const shareData = {
        title: `Programme ${goal.distance} - ${goal.targetTime}`,
        text: `Mon programme d'entraînement ${goal.distance} pour courir en ${goal.targetTime}`,
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      }
      notifications.programShared();
    } catch (error) {
      notifications.loadingError("partager le programme");
    }
  };

  const handlePrintProgram = (goal: RaceGoal) => {
    if (!goal.program) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const programHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Programme ${goal.distance} - ${goal.targetTime}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .goal-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px; }
            .week { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .week-header { font-weight: bold; margin-bottom: 10px; background: #f5f5f5; padding: 10px; margin: -15px -15px 15px -15px; }
            .session { margin-left: 20px; margin-bottom: 8px; }
            .session-type { font-weight: bold; color: #666; }
            @media print { body { font-size: 12px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Programme d'Entraînement</h1>
            <h2>${goal.distance} - Objectif: ${goal.targetTime}</h2>
          </div>
          
          <div class="goal-info">
            <div><strong>Allure:</strong> ${goal.pace}/${goal.isMetric ? 'km' : 'mi'}</div>
            <div><strong>Vitesse:</strong> ${goal.speed} ${goal.isMetric ? 'km/h' : 'mph'}</div>
            <div><strong>Distance:</strong> ${goal.distanceKm} km</div>
            <div><strong>VMA:</strong> ${goal.vmaKmh?.toFixed(1)} km/h</div>
          </div>

          <h3>Programme: ${goal.program.sessionsPerWeek} sessions/semaine sur ${goal.program.weeksBeforeRace} semaines</h3>
          
          ${goal.program.weeks.map(week => `
            <div class="week">
              <div class="week-header">
                Semaine ${week.week} - ${week.phase} (${week.volume}km)
              </div>
              ${week.sessions.map(session => `
                <div class="session">
                  <span class="session-type">${session.type}:</span> ${session.description}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </body>
      </html>
    `;
    
    printWindow.document.write(programHtml);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      notifications.programPrinted();
    }, 500);
  };

  const renderProgramPreview = (program: any) => {
    if (!program || !program.weeks) return null;

    return (
      <div className="space-y-3 max-h-80 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">{t("Sessions/sem.")}:</span> {program.sessionsPerWeek}
          </div>
          <div>
            <span className="font-medium">{t("Durée")}:</span> {program.weeksBeforeRace} {t("semaines")}
          </div>
        </div>
        
        <div className="space-y-2">
          {program.weeks.slice(0, 5).map((week: any, index: number) => (
            <div key={index} className="border border-border/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Semaine {week.week}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{week.phase}</Badge>
                  <span className="text-sm text-muted-foreground">{week.volume}km</span>
                </div>
              </div>
              <div className="space-y-1">
                {week.sessions.map((session: any, sessionIndex: number) => (
                  <div key={sessionIndex} className="text-xs flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{session.type}</Badge>
                    <span className="text-muted-foreground">{session.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {program.weeks.length > 5 && (
            <div className="text-center text-sm text-muted-foreground">
              ... et {program.weeks.length - 5} semaines supplémentaires
            </div>
          )}
        </div>
      </div>
    );
  };

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t("Aucun favori")}</h2>
        <p className="text-muted-foreground max-w-sm">
          {t("Enregistrez vos objectifs de course depuis le calculateur pour les retrouver ici.")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center py-2">
        <h2 className="text-xl font-semibold">{t("Favoris")}</h2>
        <p className="text-muted-foreground text-sm">{t("Vos objectifs sauvegardés")}</p>
      </div>

      <div className="space-y-4">
        {favorites.map((goal, index) => (
          <Card key={goal.id} className="glass-card p-4 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{goal.distance}</h3>
                  <span className="text-2xl font-bold mono-numbers text-primary">
                    {goal.targetTime}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Allure: </span>
                    <span className="mono-numbers font-medium">{goal.pace}</span>
                    <span className="text-muted-foreground ml-1">
                      {goal.isMetric ? 'min/km' : 'min/mi'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vitesse: </span>
                    <span className="mono-numbers font-medium">{goal.speed}</span>
                    <span className="text-muted-foreground ml-1">
                      {goal.isMetric ? 'km/h' : 'mph'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Distance: </span>
                    <span className="mono-numbers font-medium">{goal.distanceKm} km</span>
                    <span className="text-muted-foreground ml-1">(≈ {goal.distanceMiles} mi)</span>
                  </div>
                  {goal.vmaKmh && (
                    <div>
                      <span className="text-muted-foreground">VMA: </span>
                      <span className="mono-numbers font-medium">{goal.vmaKmh.toFixed(1)} km/h</span>
                    </div>
                  )}
                </div>

                {goal.program && (
                  <div className="mt-3 p-3 bg-background/40 rounded-lg">
                    <div className="text-sm font-medium mb-2">Programme d'entraînement</div>
                    <div className="text-xs text-muted-foreground">
                      {goal.program.sessionsPerWeek} sessions/sem • {goal.program.weeksBeforeRace} semaines
                    </div>
                  </div>
                )}

                {goal.vmaCoherence && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Cohérence vs VMA: {goal.vmaCoherence.pct}% — attendu {goal.vmaCoherence.expectedLow}-{goal.vmaCoherence.expectedHigh}% ({goal.vmaCoherence.status})
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
                {goal.program && (
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="btn-glass p-2"
                          title="Voir le programme détaillé"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                        <DialogHeader>
                          <DialogTitle>Programme - {goal.distance} en {goal.targetTime}</DialogTitle>
                        </DialogHeader>
                        <div className="flex gap-2 mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyProgram(goal)}
                            className="btn-glass"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShareProgram(goal)}
                            className="btn-glass"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Partager
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintProgram(goal)}
                            className="btn-glass"
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimer
                          </Button>
                        </div>
                        {renderProgramPreview(goal.program)}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyProgram(goal)}
                      className="btn-glass p-2"
                      title="Copier le programme"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareProgram(goal)}
                      className="btn-glass p-2"
                      title="Partager le programme"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUse(goal)}
                    className="btn-glass p-2"
                    title="Charger cet objectif"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(goal.id, goal.distance)}
                    className="btn-glass p-2 hover:text-destructive"
                    title="Supprimer ce favori"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};