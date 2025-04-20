"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OccurrenceType } from "@prisma/client";
import * as UI from "@p40/components/ui/index";
import * as Icons from "lucide-react";
import { useDashboard } from "@p40/common/context/dashboard-context";
import { useSession } from "next-auth/react";

// Define o tipo de dados para ocorrências
interface Occurrence {
  id: string;
  content: string;
  type: OccurrenceType;
  date: string;
  createdAt: string;
  user: {
    name: string;
    imageUrl: string;
  };
  church?: {
    name: string;
  };
  prayerTurn: {
    startTime: string;
    endTime: string;
  };
  relatedLeader?: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

// Mapeia os tipos de ocorrência para rótulos amigáveis
const getOccurrenceTypeLabel = (type: OccurrenceType) => {
  const labels = {
    [OccurrenceType.TESTIMONY]: "Testemunho",
    [OccurrenceType.TECHNICAL_ISSUE]: "Problema Técnico",
    [OccurrenceType.LEADER_ABSENCE]: "Ausência de Líder",
    [OccurrenceType.LEADER_DELAY]: "Atraso de Líder",
    [OccurrenceType.OTHER]: "Outros"
  };
  return labels[type] || type;
};

// Mapeia os tipos de ocorrência para cores
const getOccurrenceTypeBadgeColor = (type: OccurrenceType) => {
  const colors = {
    [OccurrenceType.TESTIMONY]: "bg-blue-500/10 text-blue-500",
    [OccurrenceType.TECHNICAL_ISSUE]: "bg-red-500/10 text-red-500",
    [OccurrenceType.LEADER_ABSENCE]: "bg-yellow-500/10 text-yellow-500",
    [OccurrenceType.LEADER_DELAY]: "bg-orange-500/10 text-orange-500",
    [OccurrenceType.OTHER]: "bg-gray-500/10 text-gray-500"
  };
  return colors[type] || "bg-gray-500/10 text-gray-500";
};

export default function OccurrencesList() {
  const { data: session } = useSession();
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<OccurrenceType | "ALL">("ALL");
  const ITEMS_PER_PAGE = 10;

  const fetchOccurrences = async (page = 1) => {
    try {
      setIsLoading(true);
      const churchId = session?.user?.churchId;
      
      if (!churchId) {
        console.error("ChurchId não encontrado");
        return;
      }
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        churchId,
        ...(filter !== "ALL" && { type: filter })
      }).toString();

      const response = await fetch(`/api/occurrences?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setOccurrences(data.data);
        setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
      } else {
        console.error("Erro ao buscar ocorrências:", data.error);
      }
    } catch (error) {
      console.error("Erro ao buscar ocorrências:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.churchId) {
      fetchOccurrences(1);
    }
  }, [session, filter]);

  const handleFilterChange = (value: string) => {
    if (value === "ALL" || Object.values(OccurrenceType).includes(value as OccurrenceType)) {
      setFilter(value as OccurrenceType | "ALL");
      setCurrentPage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchOccurrences(newPage);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <UI.Card>
          <UI.CardHeader>
            <UI.CardTitle>Ocorrências</UI.CardTitle>
            <UI.CardDescription>
              Lista de ocorrências registradas durante os turnos de oração
            </UI.CardDescription>
          </UI.CardHeader>
          <UI.CardContent>
            <div className="flex justify-between items-center mb-6">
              <UI.Skeleton className="h-10 w-[200px]" />
              <UI.Skeleton className="h-10 w-[200px]" />
            </div>
            {Array(3).fill(0).map((_, i) => (
              <UI.Skeleton key={i} className="h-[120px] w-full mb-4" />
            ))}
          </UI.CardContent>
        </UI.Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <UI.Card>
        <UI.CardHeader>
          <UI.CardTitle>Ocorrências</UI.CardTitle>
          <UI.CardDescription>
            Lista de ocorrências registradas durante os turnos de oração
          </UI.CardDescription>
        </UI.CardHeader>
        <UI.CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <UI.Select
              value={filter}
              onValueChange={handleFilterChange}
            >
              <UI.SelectTrigger className="w-[200px]">
                <UI.SelectValue placeholder="Filtrar por tipo" />
              </UI.SelectTrigger>
              <UI.SelectContent>
                <UI.SelectItem value="ALL">Todos os tipos</UI.SelectItem>
                {Object.values(OccurrenceType).map((type) => (
                  <UI.SelectItem key={type} value={type}>
                    {getOccurrenceTypeLabel(type)}
                  </UI.SelectItem>
                ))}
              </UI.SelectContent>
            </UI.Select>

            <UI.Button variant="outline" onClick={() => fetchOccurrences(1)}>
              <Icons.RefreshCcw className="h-4 w-4 mr-2" />
              Atualizar
            </UI.Button>
          </div>

          {occurrences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Icons.AlertCircle className="h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-semibold">
                Nenhuma ocorrência encontrada
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Não há ocorrências registradas para exibir com os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {occurrences.map((occurrence) => (
                <UI.Card key={occurrence.id}>
                  <UI.CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <UI.Avatar>
                        <UI.AvatarImage src={occurrence.user.imageUrl} />
                        <UI.AvatarFallback>
                          {occurrence.user.name.substring(0, 2).toUpperCase()}
                        </UI.AvatarFallback>
                      </UI.Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold capitalize">{occurrence.user.name.toLowerCase()}</h3>
                            {occurrence.church && (
                              <p className="text-sm text-muted-foreground">
                                {occurrence.church.name}
                              </p>
                            )}
                          </div>
                          <UI.Badge className={getOccurrenceTypeBadgeColor(occurrence.type)}>
                            {getOccurrenceTypeLabel(occurrence.type)}
                          </UI.Badge>
                        </div>
                        <p className="mt-3 text-sm">{occurrence.content}</p>
                        {occurrence.relatedLeader && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Líder relacionado:</span>
                            <div className="flex items-center gap-1">
                              <UI.Avatar className="h-4 w-4">
                                <UI.AvatarImage src={occurrence.relatedLeader.imageUrl} />
                                <UI.AvatarFallback>
                                  {occurrence.relatedLeader.name.substring(0, 2).toUpperCase()}
                                </UI.AvatarFallback>
                              </UI.Avatar>
                              <span>{occurrence.relatedLeader.name}</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                          <Icons.Calendar className="h-3.5 w-3.5" />
                          {format(new Date(occurrence.date), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                          <span className="mx-2">•</span>
                          Turno: {occurrence.prayerTurn.startTime} - {occurrence.prayerTurn.endTime}
                        </div>
                      </div>
                    </div>
                  </UI.CardContent>
                </UI.Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <UI.Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <Icons.ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </UI.Button>
              
              <div className="text-sm">
                Página {currentPage} de {totalPages}
              </div>
              
              <UI.Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <Icons.ChevronRight className="h-4 w-4 ml-2" />
              </UI.Button>
            </div>
          )}
        </UI.CardContent>
      </UI.Card>
    </div>
  );
} 