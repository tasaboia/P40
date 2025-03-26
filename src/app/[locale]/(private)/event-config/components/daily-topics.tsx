"use client";
import React, { useEffect, useState } from "react";
import * as UI from "@p40/components/ui/index";
import { DailyPrayerTopic } from "@p40/common/contracts/daily-topics/daily-topics";
import { EventConfigClient } from "@p40/services/event-config/event-config-client";
import { format, addDays, parse, isWithinInterval } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Info, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { toast } from "@p40/hooks/use-toast";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

interface DailyTopicsProps {
  eventConfigData: {
    id: string;
    startDate: Date;
    endDate: Date;
  };
}

export default function DailyTopics({ eventConfigData }: DailyTopicsProps) {
  const eventConfigClient = new EventConfigClient();
  const router = useRouter();
  const [prayerTopics, setPrayerTopics] = useState<DailyPrayerTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [eventConfig] = useState(eventConfigData);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDate, setSearchDate] = useState("");
  const itemsPerPage = 5;
  const [uploadProgress, setUploadProgress] = useState(0);

  const totalDays = Math.ceil(
    (eventConfig.endDate.getTime() - eventConfig.startDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    const loadPrayerTopics = async () => {
      try {
        setIsLoading(true);
        const response = await eventConfigClient.getDailyTopics(eventConfig.id);
        if (!response?.data) {
          throw new Error("Erro ao carregar as pautas de oração.");
        }
        // Garante que todas as pautas tenham uma data válida
        const formattedTopics = response.data.map(topic => ({
          ...topic,
          date: topic.date || format(new Date(), "yyyy-MM-dd")
        }));
        setPrayerTopics(formattedTopics);
      } catch (err) {
        toast({
          title: "Erro ao carregar pautas",
          description: "Não foi possível carregar as pautas de oração.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPrayerTopics();
  }, [eventConfig.id]);

  // Simula o progresso do upload
  useEffect(() => {
    if (isLoading) {
      setUploadProgress(0);
      const timer = setInterval(() => {
        setUploadProgress((oldProgress) => {
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 95);
        });
      }, 300);

      return () => {
        clearInterval(timer);
        setUploadProgress(0);
      };
    } else {
      // Quando termina, rapidamente vai a 100% e some
      setUploadProgress(100);
      const timer = setTimeout(() => {
        setUploadProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleAddTopic = () => {
    const nextDay = prayerTopics.length + 1;
    if (nextDay > totalDays) {
      toast({
        title: "Limite atingido",
        description: `Este evento tem apenas ${totalDays} dias.`,
        variant: "destructive",
      });
      return;
    }

    const topicDate = addDays(eventConfig.startDate, nextDay - 1);
    const newTopic: DailyPrayerTopic = {
      id: uuidv4(),
      date: format(topicDate, "yyyy-MM-dd"),
      imageUrl: null,
      eventId: eventConfig.id,
      description: "",
    };

    setPrayerTopics((prev) => {
      const newTopics = [...prev, newTopic];
      // Calcula a nova página baseado na posição do novo item
      const newPage = Math.ceil(newTopics.length / itemsPerPage);
      // Atualiza a página apenas se for diferente da atual
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
      return newTopics;
    });

    // Limpa qualquer filtro de data que possa estar ativo
    setSearchDate("");

    toast({
      title: "Pauta adicionada",
      description: "Nova pauta criada com sucesso.",
    });
  };

  const handleRemoveTopic = async (id: string) => {
    try {
      setIsLoading(true);
      await eventConfigClient.removeDailyTopic(id);
      setPrayerTopics((prev) => prev.filter((topic) => topic.id !== id));
      toast({
        title: "Pauta removida",
        description: "A pauta foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a pauta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicUpdate = async (topic: DailyPrayerTopic) => {
    try {
      setIsLoading(true);
      await eventConfigClient.uploadDailyTopicImage({
        id: topic.id,
        eventId: topic.eventId,
        description: topic.description || "",
        date: topic.date,
        imageUrl: topic.imageUrl || "",
      });
      setPrayerTopics((prev) =>
        prev.map((t) => (t.id === topic.id ? topic : t))
      );
      toast({
        title: "Pauta atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (topicId: string, file: File) => {
    try {
      setIsLoading(true);
      const newBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      const topic = prayerTopics.find((t) => t.id === topicId);
      if (!topic) return;

      const updatedTopic = {
        ...topic,
        imageUrl: newBlob.url,
      };

      await handleTopicUpdate(updatedTopic);
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtra as pautas por data
  const filteredTopics = prayerTopics.filter((topic) => {
    if (!searchDate) return true;
    return topic.date === searchDate;
  });

  // Calcula a paginação
  const totalPages = Math.ceil(filteredTopics.length / itemsPerPage);
  const paginatedTopics = filteredTopics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <>
      {/* Barra de Progresso */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {uploadProgress > 0 && (
          <div className="w-full h-1 bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ 
                width: `${uploadProgress}%`,
                transition: isLoading ? 'width 300ms ease-in-out' : 'width 200ms ease-out'
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-4 pb-16 relative min-h-screen">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Pautas Diárias de Oração</h2>
            <p className="text-muted-foreground">
              Configure as pautas de oração para cada dia do evento
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Evento com {totalDays} dias. {prayerTopics.length} pautas configuradas.
              </span>
            </div>

            {/* Busca por Data */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <UI.Input
                type="date"
                value={searchDate}
                onChange={(e) => {
                  setSearchDate(e.target.value);
                  setCurrentPage(1);
                }}
                min={format(eventConfig.startDate, "yyyy-MM-dd")}
                max={format(eventConfig.endDate, "yyyy-MM-dd")}
                className="w-full sm:w-auto"
                placeholder="Selecione uma data"
              />
              {searchDate && (
                <UI.Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchDate("");
                    setCurrentPage(1);
                  }}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </UI.Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {paginatedTopics.map((topic) => (
            <UI.Card key={topic.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Área da Imagem */}
                <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-muted">
                  {topic.imageUrl ? (
                    <img
                      src={topic.imageUrl}
                      alt="Imagem da pauta"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <UI.Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`topic-image-${topic.id}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(topic.id, file);
                    }}
                  />
                  <UI.Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      document.getElementById(`topic-image-${topic.id}`)?.click()
                    }
                    className="absolute bottom-2 right-2"
                  >
                    {topic.imageUrl ? "Alterar" : "Adicionar*"}
                  </UI.Button>
                </div>

                {/* Área de Conteúdo */}
                <div className="p-4 flex-1">
                  <div className="flex flex-col gap-4">
                    {/* Data */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <UI.Input
                        type="date"
                        value={topic.date || format(new Date(), "yyyy-MM-dd")}
                        onChange={(e) => {
                          const updatedTopic = {
                            ...topic,
                            date: e.target.value,
                          };
                          handleTopicUpdate(updatedTopic);
                        }}
                        min={format(eventConfig.startDate, "yyyy-MM-dd")}
                        max={format(eventConfig.endDate, "yyyy-MM-dd")}
                        className="w-full sm:w-auto"
                      />
                      <span className="text-sm text-muted-foreground hidden sm:block">
                        {format(new Date(topic.date || new Date()), "EEEE", { locale: ptBR })}
                      </span>
                    </div>

                    {/* Descrição (Opcional) */}
                    <div>
                      <UI.Label htmlFor={`description-${topic.id}`} className="text-sm text-muted-foreground mb-2">
                        Descrição (opcional)
                      </UI.Label>
                      <UI.Textarea
                        id={`description-${topic.id}`}
                        value={topic.description || ""}
                        onChange={(e) => {
                          const updatedTopic = {
                            ...topic,
                            description: e.target.value,
                          };
                          handleTopicUpdate(updatedTopic);
                        }}
                        placeholder="Ex: Família, Nação, Igreja..."
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Botão Remover */}
                <div className="p-4 sm:p-2">
                  <UI.Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTopic(topic.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </UI.Button>
                </div>
              </div>
            </UI.Card>
          ))}

          {filteredTopics.length === 0 && (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground">
                {searchDate 
                  ? "Nenhuma pauta encontrada para esta data."
                  : "Nenhuma pauta configurada. Clique em \"Nova Pauta\" para começar."}
              </p>
            </div>
          )}
        </div>

        {/* Paginação */}
        {filteredTopics.length > 0 && (
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} até{" "}
              {Math.min(currentPage * itemsPerPage, filteredTopics.length)} de{" "}
              {filteredTopics.length} pautas
            </div>
            <div className="flex items-center gap-2">
              <UI.Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </UI.Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <UI.Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </UI.Button>
                ))}
              </div>
              <UI.Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </UI.Button>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground mt-4">
          * A imagem é obrigatória para cada pauta
        </div>

        {/* Botão flutuante de Nova Pauta */}
        <div className="fixed bottom-4 right-4 z-50">
          <UI.Button
            onClick={handleAddTopic}
            disabled={isLoading || prayerTopics.length >= totalDays}
            size="lg"
            className="shadow-lg rounded-full h-14 px-6"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Pauta
          </UI.Button>
        </div>
      </div>
    </>
  );
}
