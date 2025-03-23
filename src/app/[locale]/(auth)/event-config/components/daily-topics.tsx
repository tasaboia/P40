"use client";
import React, { useEffect, useState } from "react";
import * as UI from "@p40/components/ui/index";
import { DailyPrayerTopic } from "@p40/common/contracts/daily-topics/daily-topics";
import { EventConfigClient } from "@p40/services/event-config/event-config-client";
import { format } from "date-fns";
import { Helpers } from "@p40/common/utils/helpers";
import { Info, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { PrayerTopic } from "@p40/common/contracts/config/config";
import { ptBR } from "date-fns/locale";
import { toast } from "@p40/hooks/use-toast";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function DailyTopics({ eventConfigData }) {
  const eventConfigClient = new EventConfigClient();
  const router = useRouter();
  const [prayerTopics, setPrayerTopics] = useState<DailyPrayerTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [eventConfig, setEventConfig] = useState(eventConfigData);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const totalPages = Math.ceil(prayerTopics.length / pageSize);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const paginatedTopics = prayerTopics.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    const getPrayerTopics = async () => {
      try {
        setEventConfig(eventConfig);
        const topicsResponse = await eventConfigClient.getDailyTopics(
          eventConfig.id
        );
        if (!topicsResponse || !topicsResponse.data) {
          throw new Error("Erro ao carregar os tópicos de oração.");
        }

        setPrayerTopics(topicsResponse.data);
      } catch (err) {
        toast({
          title: "Erro na busca de Tópicos",
          description: "Erro ao buscar o tópico desse evento",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getPrayerTopics();
  }, []);

  const totalDays = Math.ceil(
    (eventConfig.endDate.getTime() - eventConfig.startDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const handleAddTopic = () => {
    const newDay = prayerTopics.length + 1;
    const topicDate = new Date(eventConfig.startDate);
    topicDate.setDate(topicDate.getDate() + newDay - 1);

    const formattedDate = format(topicDate, "yyyy-MM-dd");

    const newTopic: DailyPrayerTopic = {
      id: uuidv4(),
      date: formattedDate,
      imageUrl: null,
      eventId: eventConfig.id,
    };

    setPrayerTopics((prev) => [...prev, newTopic]);
  };

  const handleRemoveTopic = (id: string) => {
    setPrayerTopics((prev) => {
      const filtered = prev.filter((topic) => topic.id !== id);
      return filtered.map((topic, index) => ({
        ...topic,
        day: index + 1,
      }));
    });
  };

  const handleTopicChange = (
    id: string,
    field: keyof PrayerTopic,
    value: string | null
  ) => {
    setPrayerTopics((prev) =>
      prev.map((topic) =>
        topic.id === id ? { ...topic, [field]: value } : topic
      )
    );
  };

  const handleImageUpload = (
    topicId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        handleTopicChange(topicId, "imageUrl", imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSaveTopics = async (topicId: string, file: File | null) => {
    console.log(file);
    if (file) {
      setIsLoading(true);

      try {
        const newBlob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });

        const imageUrl = newBlob.url;

        handleTopicChange(topicId, "imageUrl", imageUrl);
        const newTopic = prayerTopics.find((topic) => (topic.id = topicId));

        await eventConfigClient.uploadDailyTopicImage({
          id: newTopic.id,
          eventId: newTopic.eventId,
          description: newTopic.description,
          date: newTopic.date,
          imageUrl,
        });

        toast({
          title: "Imagem salva com sucesso",
          description: "A imagem foi carregada e salva.",
        });
      } catch (error) {
        console.error("Erro ao fazer upload", error);
        toast({
          title: "Erro ao salvar",
          description: "Houve um erro ao fazer o upload da imagem.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <React.Fragment>
      <UI.Card>
        <UI.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <UI.CardTitle>Pautas Diárias de Oração</UI.CardTitle>
            <UI.CardDescription>
              Configure as pautas para cada dia do evento
            </UI.CardDescription>
          </div>
          <UI.Button onClick={handleAddTopic} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Pauta
          </UI.Button>
        </UI.CardHeader>
        <UI.CardContent className="max-h-[400px] overflow-y-auto">
          <div className="text-sm text-muted-foreground mb-4 flex items-center space-x-2">
            <Info className="h-4 w-4" />
            <span>
              Você pode adicionar até {totalDays} pautas para este evento de{" "}
              {totalDays} dias.
            </span>
          </div>

          <div className="space-y-6">
            {paginatedTopics.map((topic) => (
              <div key={topic.id} className="border rounded-md p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <UI.Badge variant="outline" className="bg-primary/5">
                      Dia{" "}
                      {topic?.date
                        ? Helpers.formatDate(new Date(topic?.date))
                        : format(new Date(), "dd/MM/yyyy")}
                    </UI.Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(topic.date), "EEEE, dd/MM", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <UI.Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTopic(topic.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </UI.Button>
                </div>

                <UI.Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <UI.Label htmlFor={`topic-description-${topic.id}`}>
                      Tópicos da Pauta
                    </UI.Label>
                    <UI.Input
                      id={`topic-description-${topic.id}`}
                      value={topic.description}
                      onChange={(e) =>
                        handleTopicChange(
                          topic.id,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Ex: Família, Nação, Igreja..."
                    />
                  </div>

                  <div className="space-y-2">
                    <UI.Label htmlFor={`topic-image-${topic.id}`}>
                      Imagem (opcional)
                    </UI.Label>
                    <div className="flex items-center space-x-2">
                      <UI.Input
                        id={`topic-image-${topic.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(topic.id, e)}
                      />
                      <UI.Button
                        variant="outline"
                        onClick={() =>
                          document
                            .getElementById(`topic-image-${topic.id}`)
                            ?.click()
                        }
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {topic.imageUrl ? "Alterar imagem" : "Upload de imagem"}
                      </UI.Button>

                      {topic.imageUrl && (
                        <UI.Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleTopicChange(topic.id, "imageUrl", null)
                          }
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <X className="h-4 w-4" />
                        </UI.Button>
                      )}
                    </div>
                  </div>
                </div>

                {topic.imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Prévia da imagem:
                    </p>
                    <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-md border">
                      <img
                        src={topic.imageUrl || "/placeholder.svg"}
                        alt={`Imagem de tópico`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}
                <div className="mt-6 flex justify-end space-x-4">
                  <UI.Button variant="outline" onClick={() => router.back()}>
                    Cancelar
                  </UI.Button>
                  <UI.Button
                    onClick={() =>
                      handleSaveTopics(
                        topic.id,
                        (
                          document.getElementById(
                            `topic-image-${topic.id}`
                          ) as HTMLInputElement
                        )?.files?.[0] || null
                      )
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Configurações
                      </>
                    )}
                  </UI.Button>
                </div>
              </div>
            ))}

            {prayerTopics.length === 0 && (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">
                  Nenhuma pauta adicionada. Clique em "Adicionar Pauta" para
                  começar.
                </p>
              </div>
            )}
          </div>
        </UI.CardContent>
      </UI.Card>
    </React.Fragment>
  );
}
