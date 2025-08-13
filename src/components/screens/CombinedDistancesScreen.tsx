import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickDistancesScreen } from "./QuickDistancesScreen";
import { SplitsScreen } from "./SplitsScreen";
import { useLanguage } from "@/contexts/LanguageContext";

interface CombinedDistancesScreenProps {
  isMetric: boolean;
  speedValue: number;
}

export const CombinedDistancesScreen = React.memo(({ isMetric, speedValue }: CombinedDistancesScreenProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4 pb-20 animate-fade-in-up">
      <div className="text-center py-2">
        <h2 className="text-xl font-semibold">{t("Splits & Distances")}</h2>
        <p className="text-muted-foreground text-sm">{t("Calculez vos temps et allures")}</p>
      </div>

      <Tabs defaultValue="splits" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="splits">{t("Splits")}</TabsTrigger>
          <TabsTrigger value="distances">{t("Distances")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="splits" className="mt-4">
          <div className="space-y-4">
            <SplitsScreen isMetric={isMetric} speedValue={speedValue} />
          </div>
        </TabsContent>
        
        <TabsContent value="distances" className="mt-4">
          <div className="space-y-4">
            <QuickDistancesScreen isMetric={isMetric} speedValue={speedValue} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});
CombinedDistancesScreen.displayName = "CombinedDistancesScreen";