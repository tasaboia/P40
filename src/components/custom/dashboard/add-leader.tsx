"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, UserPlus, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@p40/components/ui/dialog";
import { Button } from "@p40/components/ui/button";
import { Input } from "@p40/components/ui/input";
import { ScrollArea } from "@p40/components/ui/scroll-area";
import { Church, Leader, Shift } from "./types";

interface AddLeaderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
  leaders: Leader[];
  churches: Church[];
  onAddLeader: (leaderId: string) => void;
}

export function AddLeaderDialog({
  open,
  onOpenChange,
  shift,
  leaders,
  churches,
  onAddLeader,
}: AddLeaderDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);

  // Filter leaders based on search term
  const filteredLeaders = leaders.filter(
    (leader) =>
      leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLeaderChurch(leader.id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Get leader church name
  const getLeaderChurch = (leaderId: string) => {
    const leader = leaders.find((l) => l.id === leaderId);
    if (!leader) return "";

    const church = churches.find((c) => c.id === leader.church);
    return church?.name || "";
  };

  // Handle add leader
  const handleAddLeader = () => {
    if (selectedLeaderId) {
      onAddLeader(selectedLeaderId);
      setSelectedLeaderId(null);
      setSearchTerm("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Líder ao Turno</DialogTitle>
          <DialogDescription>
            Selecione um líder para adicionar ao turno de{" "}
            {format(shift.date, "dd/MM/yyyy", { locale: ptBR })}
            das {shift.startTime} às {shift.endTime}
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, email ou igreja..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[300px] pr-4 -mr-4">
          <div className="space-y-2">
            {filteredLeaders.length > 0 ? (
              filteredLeaders.map((leader) => (
                <div
                  key={leader.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedLeaderId === leader.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedLeaderId(leader.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{leader.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {leader.email}
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Building className="h-3 w-3 mr-1" />
                      {getLeaderChurch(leader.id)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum líder disponível encontrado
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddLeader}
            disabled={!selectedLeaderId}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Adicionar Líder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
