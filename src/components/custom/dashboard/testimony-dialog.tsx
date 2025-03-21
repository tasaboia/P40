"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquareQuote, CheckCircle, XCircle } from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@p40/components/ui/tabs";
import type { Shift, Testimony } from "./types";

interface TestimonyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
  testimonies: Testimony[];
  onApproveTestimony?: (testimonyId: string) => void;
  onRejectTestimony?: (testimonyId: string) => void;
}

export function TestimonyDialog({
  open,
  onOpenChange,
  shift,
  testimonies,
  onApproveTestimony,
  onRejectTestimony,
}: TestimonyDialogProps) {
  const [activeTab, setActiveTab] = useState("all");

  // Filter testimonies based on active tab
  const filteredTestimonies = testimonies.filter((testimony) => {
    if (activeTab === "all") return true;
    if (activeTab === "approved") return testimony.approved;
    if (activeTab === "pending") return !testimony.approved;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Testemunhos do Turno</DialogTitle>
          <DialogDescription>
            Testemunhos relacionados ao turno de{" "}
            {format(shift.date, "dd/MM/yyyy", { locale: ptBR })}
            das {shift.startTime} às {shift.endTime}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="approved">Aprovados</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredTestimonies.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4 -mr-4">
                <div className="space-y-4">
                  {filteredTestimonies.map((testimony) => (
                    <div
                      key={testimony.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {testimony.leaderName}
                        </div>
                        <Badge
                          variant={testimony.approved ? "outline" : "secondary"}
                          className={
                            testimony.approved
                              ? "bg-success/10 text-success"
                              : ""
                          }
                        >
                          {testimony.approved ? "Aprovado" : "Pendente"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(testimony.date, "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </div>
                      <p className="text-sm">{testimony.content}</p>
                      {!testimony.approved &&
                        onApproveTestimony &&
                        onRejectTestimony && (
                          <div className="flex space-x-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => onApproveTestimony(testimony.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-destructive"
                              onClick={() => onRejectTestimony(testimony.id)}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Recusar
                            </Button>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquareQuote className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">
                  Nenhum testemunho encontrado
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  {activeTab === "all"
                    ? "Este turno ainda não possui testemunhos registrados pelos líderes."
                    : activeTab === "approved"
                    ? "Não há testemunhos aprovados para este turno."
                    : "Não há testemunhos pendentes para este turno."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
