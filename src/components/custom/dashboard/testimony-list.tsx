"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquareQuote, CheckCircle, XCircle, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { Button } from "@p40/components/ui/button";
import { ScrollArea } from "@p40/components/ui/scroll-area";
import { Badge } from "@p40/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@p40/components/ui/tabs";
import { Input } from "@p40/components/ui/input";
import { useDashboard } from "@p40/common/context/dashboard-context";
import { toast } from "@p40/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@p40/components/ui/alert-dialog";

export function TestimonyList() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    testimonyId: string | null;
    action: "approve" | "reject" | null;
  }>({
    isOpen: false,
    testimonyId: null,
    action: null,
  });

  const { testimonies, updateTestimony } = useDashboard();

  const handleAction = async (testimonyId: string, action: "approve" | "reject") => {
    setIsLoading(testimonyId);
    try {
      const response = await fetch(`/api/testimony`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, testimonyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao processar testemunho");
      }

      updateTestimony(testimonyId, { approved: action === "approve" });
      
      toast({
        title: action === "approve" ? "Testemunho aprovado" : "Testemunho recusado",
        description: action === "approve" 
          ? "O testemunho foi aprovado e será exibido publicamente"
          : "O testemunho foi recusado e não será exibido",
      });

    } catch (error) {
      console.error(`Erro ao ${action === "approve" ? "aprovar" : "recusar"} testemunho:`, error);
      toast({
        title: "Erro ao processar",
        description: "Não foi possível processar o testemunho. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
      setConfirmDialog({ isOpen: false, testimonyId: null, action: null });
    }
  };

  const openConfirmDialog = (testimonyId: string, action: "approve" | "reject") => {
    setConfirmDialog({
      isOpen: true,
      testimonyId,
      action,
    });
  };

  const filteredTestimonies = testimonies.filter((testimony) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "approved" && testimony.approved) ||
      (activeTab === "pending" && !testimony.approved);

    const matchesSearch =
      searchTerm === "" ||
      testimony.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimony.content.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Testemunhos</CardTitle>
          <CardDescription>
            Relatos dos líderes durante os turnos de oração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por líder ou conteúdo..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="all">
                  Todos ({testimonies.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Aprovados ({testimonies.filter((t) => t.approved).length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pendentes ({testimonies.filter((t) => !t.approved).length})
                </TabsTrigger>
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
                              className={testimony.approved ? "bg-success/10 text-success" : ""}
                            >
                              {testimony.approved ? "Aprovado" : "Pendente"}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(testimony.date), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </div>
                          <p className="text-sm">{testimony.content}</p>
                          {!testimony.approved && (
                            <div className="flex space-x-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => openConfirmDialog(testimony.id, "approve")}
                                disabled={isLoading === testimony.id}
                              >
                                {isLoading === testimony.id ? (
                                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                                ) : (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                )}
                                Aprovar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs text-destructive"
                                onClick={() => openConfirmDialog(testimony.id, "reject")}
                                disabled={isLoading === testimony.id}
                              >
                                {isLoading === testimony.id ? (
                                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
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
                      {searchTerm
                        ? "Nenhum testemunho corresponde aos critérios de busca."
                        : activeTab === "all"
                        ? "Não há testemunhos registrados."
                        : activeTab === "approved"
                        ? "Não há testemunhos aprovados."
                        : "Não há testemunhos pendentes."}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(isOpen) => 
          !isOpen && setConfirmDialog({ isOpen: false, testimonyId: null, action: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "approve" 
                ? "Aprovar Testemunho" 
                : "Recusar Testemunho"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "approve"
                ? "Tem certeza que deseja aprovar este testemunho? Ele será exibido publicamente após a aprovação."
                : "Tem certeza que deseja recusar este testemunho? Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => 
                confirmDialog.testimonyId && 
                confirmDialog.action && 
                handleAction(confirmDialog.testimonyId, confirmDialog.action)
              }
              className={confirmDialog.action === "reject" ? "bg-destructive" : ""}
            >
              {confirmDialog.action === "approve" ? "Aprovar" : "Recusar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
