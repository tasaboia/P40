"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UserMinus, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@p40/components/ui/dialog";
import { Button } from "@p40/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@p40/components/ui/radio-group";
import { Label } from "@p40/components/ui/label";
import type { Shift } from "./types";

interface RemoveLeaderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
  onRemoveLeader: (leaderId: string) => void;
}

export function RemoveLeaderDialog({
  open,
  onOpenChange,
  shift,
  onRemoveLeader,
}: RemoveLeaderDialogProps) {
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);

  // Handle remove leader
  const handleRemoveLeader = () => {
    if (selectedLeaderId) {
      onRemoveLeader(selectedLeaderId);
      setSelectedLeaderId(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Remover Líder do Turno</DialogTitle>
          <DialogDescription>
            Selecione um líder para remover do turno de{" "}
            {format(shift.date, "dd/MM/yyyy", { locale: ptBR })}
            das {shift.startTime} às {shift.endTime}
          </DialogDescription>
        </DialogHeader>

        {shift.leaders.length > 0 ? (
          <>
            <div className="py-4">
              <RadioGroup
                value={selectedLeaderId || ""}
                onValueChange={setSelectedLeaderId}
              >
                {shift.leaders.map((leader) => (
                  <div
                    key={leader.id}
                    className="flex items-center space-x-2 py-2"
                  >
                    <RadioGroupItem
                      value={leader.id}
                      id={`leader-${leader.id}`}
                    />
                    <Label
                      htmlFor={`leader-${leader.id}`}
                      className="cursor-pointer"
                    >
                      {leader.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {shift.leaders.length === 1 && (
              <div className="flex items-start p-3 bg-warning/10 rounded-md text-sm">
                <AlertTriangle className="h-5 w-5 text-warning mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Atenção</p>
                  <p className="text-muted-foreground">
                    Este é o único líder deste turno. Removê-lo deixará o turno
                    vazio.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Este turno não possui líderes para remover.
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemoveLeader}
            disabled={!selectedLeaderId || shift.leaders.length === 0}
            className="gap-2"
          >
            <UserMinus className="h-4 w-4" />
            Remover Líder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
