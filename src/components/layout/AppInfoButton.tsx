import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";

export const AppInfoButton = () => {
  const APP_VERSION = "v1.0.0";
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
            <DialogTitle>Réglages</DialogTitle>
            <DialogDescription>
              Produit par Aenean — Paceo {APP_VERSION}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
