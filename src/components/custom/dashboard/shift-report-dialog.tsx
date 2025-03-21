"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Users, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@p40/components/ui/dialog";
import { Button } from "@p40/components/ui/button";
import { ScrollArea } from "@p40/components/ui/scroll-area";
import { Badge } from "@p40/components/ui/badge";
import type { Shift, ShiftReport } from "./types";

interface ShiftReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
  reports: ShiftReport[];
}

export function ShiftReportDialog({
  open,
  onOpenChange,
  shift,
  reports,
}: ShiftReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Relatórios do Turno</DialogTitle>
          <DialogDescription>
            Relatórios do turno de{" "}
            {format(shift.date, "dd/MM/yyyy", { locale: ptBR })}
            das {shift.startTime} às {shift.endTime}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {reports.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4 -mr-4">
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {format(report.date, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <Badge variant="outline" className="bg-primary/10">
                        <Users className="h-3 w-3 mr-1" />
                        {report.attendees} participantes
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reportado por: {report.leaderName}
                    </div>
                    <p className="text-sm">{report.notes}</p>
                    <div className="flex items-center text-xs text-muted-foreground pt-1">
                      <Info className="h-3 w-3 mr-1" />
                      <span>Relatório do turno</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">
                Nenhum relatório encontrado
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Este turno ainda não possui relatórios registrados pelos
                líderes.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
