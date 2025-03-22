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

interface TestimonyListProps {
  onApproveTestimony: (testimonyId: string) => void;
  onRejectTestimony: (testimonyId: string) => void;
}

export function TestimonyList({
  onApproveTestimony,
  onRejectTestimony,
}: TestimonyListProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { testimonies } = useDashboard();
  // Filter testimonies based on active tab and search term
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
                            variant={
                              testimony.approved ? "outline" : "secondary"
                            }
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
                        {!testimony.approved && (
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
  );
}
