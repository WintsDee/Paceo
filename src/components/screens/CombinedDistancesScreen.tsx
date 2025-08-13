import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickDistancesScreen } from "./QuickDistancesScreen";
import { SplitsScreen } from "./SplitsScreen";

interface CombinedDistancesScreenProps {
  isMetric: boolean;
  speedValue: number;
}

export const CombinedDistancesScreen = ({ isMetric, speedValue }: CombinedDistancesScreenProps) => {
  return (
    <div className="space-y-4 pb-20 animate-fade-in-up">
      <div className="text-center py-2">
        <h2 className="text-xl font-semibold">Splits & Distances</h2>
        <p className="text-muted-foreground text-sm">Calculez vos temps et allures</p>
      </div>

      <Tabs defaultValue="splits" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="splits">Splits</TabsTrigger>
          <TabsTrigger value="distances">Distances</TabsTrigger>
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
};