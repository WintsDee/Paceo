import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/translations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AppInfoButtonProps {
  isMetric: boolean;
  onToggleUnits: () => void;
}

export const AppInfoButton = ({ isMetric, onToggleUnits }: AppInfoButtonProps) => {
  const APP_VERSION = "v1.0.0";
  const { language, setLanguage, t } = useLanguage();
  
  const languages: { code: Language; name: string }[] = [
    { code: 'fr', name: t('Français') },
    { code: 'en', name: t('English') },
    { code: 'es', name: t('Español') },
    { code: 'de', name: t('Deutsch') },
  ];

  return (
    <div className="fixed top-3 right-3 md:top-4 md:right-4 z-[60]">
      <Dialog>
        <DialogTrigger asChild>
          <Button aria-label="Réglages" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('Réglages')}</DialogTitle>
            <DialogDescription>
              {t('Produit par Aenean — Paceo')} {APP_VERSION}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Units Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('Unités')}</Label>
              <RadioGroup 
                value={isMetric ? "metric" : "imperial"} 
                onValueChange={(value) => {
                  if ((value === "metric") !== isMetric) {
                    onToggleUnits();
                  }
                }}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="metric" id="metric" />
                  <Label htmlFor="metric" className="text-sm">{t('Métrique (km/h)')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="imperial" id="imperial" />
                  <Label htmlFor="imperial" className="text-sm">{t('Impérial (mph)')}</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Language Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('Langue')}</Label>
              <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
