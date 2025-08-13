import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RaceGoal } from "@/components/calculator/RaceGoalCalculator";
import { Heart, Trash2, Play, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FavoritesScreenProps {
  favorites: RaceGoal[];
  onDeleteFavorite: (id: string) => void;
  onUseFavorite: (goal: RaceGoal) => void;
}

export const FavoritesScreen = ({ favorites, onDeleteFavorite, onUseFavorite }: FavoritesScreenProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleDelete = (id: string, distance: string) => {
    onDeleteFavorite(id);
    toast({
      title: "Favori supprimé",
      description: `Objectif ${distance} retiré de vos favoris`,
    });
  };

  const handleUse = (goal: RaceGoal) => {
    onUseFavorite(goal);
    toast({
      title: "Objectif chargé",
      description: `Objectif ${goal.distance} et son programme chargés`,
    });
  };

  const renderProgramPreview = (program: any) => {
    if (!program || !program.weeks) return null;

    return (
      <div className="space-y-3 max-h-80 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Sessions/semaine:</span> {program.sessionsPerWeek}
          </div>
          <div>
            <span className="font-medium">Durée:</span> {program.weeksBeforeRace} semaines
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
        <h2 className="text-xl font-semibold mb-2">Aucun favori</h2>
        <p className="text-muted-foreground max-w-sm">
          Enregistrez vos objectifs de course depuis le calculateur pour les retrouver ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-foreground">Favoris</h1>
        <p className="text-muted-foreground mt-2">
          Vos objectifs sauvegardés
        </p>
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
              
              <div className="flex gap-2 ml-4">
                {goal.program && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-glass p-2"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle>Programme - {goal.distance} en {goal.targetTime}</DialogTitle>
                      </DialogHeader>
                      {renderProgramPreview(goal.program)}
                    </DialogContent>
                  </Dialog>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUse(goal)}
                  className="btn-glass p-2"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(goal.id, goal.distance)}
                  className="btn-glass p-2 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};