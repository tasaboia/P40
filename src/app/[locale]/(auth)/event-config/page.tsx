"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  Clock,
  Save,
  X,
  Upload,
  Plus,
  Trash2,
  Info,
  Building,
  Users,
} from "lucide-react";
import { toast } from "@p40/hooks/use-toast";
import * as UI from "@p40/components/ui/index";
import { cn } from "@p40/lib/utils";
import { EventConfigClient } from "@p40/services/event-config/event-config-client.service";
import { Church, PrayerTopic } from "@p40/services/event-config/types";

export default function EventConfigPage() {
  const router = useRouter();
  const eventConfigClient = new EventConfigClient();

  // Estado para os dados do evento
  const [eventConfig, setEventConfig] = useState({
    id: "",
    name: "",
    description: "",
    churchId: "",
    churchName: "",
    startDate: new Date(),
    endDate: new Date(),
    leadersPerShift: 0,
    allowShiftChange: true,
    eventType: "",
    shiftDuration: 0,
  });

  // Estado para as pautas de oração
  const [prayerTopics, setPrayerTopics] = useState<PrayerTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [church, setChurch] = useState<Church | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eventConfigData] = await Promise.all([
          eventConfigClient.getEventConfig(),
        ]);
        setEventConfig({
          ...eventConfigData.data,
          startDate: new Date(eventConfigData.data.startDate),
          endDate: new Date(eventConfigData.data.endDate),
        });
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  // Carregar dados simulados
  useEffect(() => {
    // Simular carregamento de dados da igreja
    setChurch({
      id: "1",
      name: "Igreja Zion Central",
      location: "São Paulo, SP",
    });

    // Simular carregamento de pautas
    const mockTopics: PrayerTopic[] = Array.from({ length: 10 }, (_, i) => {
      const topicDate = new Date(eventConfig.startDate);
      topicDate.setDate(topicDate.getDate() + i);

      return {
        id: `topic-${i + 1}`,
        day: i + 1,
        title: `Pauta ${i + 1}: ${i % 2 === 0 ? "Família" : "Nação"}`,
        description: `Descrição da pauta de oração para o dia ${i + 1}`,
        imageUrl: i % 3 === 0 ? `/placeholder.svg?height=200&width=300` : null,
        date: topicDate,
      };
    });

    setPrayerTopics(mockTopics);
  }, []);

  // Calcular o número total de dias do evento
  const totalDays = Math.ceil(
    (eventConfig.endDate.getTime() - eventConfig.startDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Manipuladores de eventos
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEventConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Number.parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setEventConfig((prev) => ({ ...prev, [name]: numValue }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setEventConfig((prev) => ({ ...prev, allowShiftChange: checked }));
  };

  const handleSelectChange = (value: string) => {
    setEventConfig((prev) => ({
      ...prev,
      eventType: value as "SHIFT" | "CLOCK",
    }));
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setEventConfig((prev) => ({ ...prev, startDate: date }));
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setEventConfig((prev) => ({ ...prev, endDate: date }));
    }
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

  const handleAddTopic = () => {
    const newDay = prayerTopics.length + 1;
    const topicDate = new Date(eventConfig.startDate);
    topicDate.setDate(topicDate.getDate() + newDay - 1);

    const newTopic: PrayerTopic = {
      id: `topic-${Date.now()}`,
      day: newDay,
      title: `Nova Pauta ${newDay}`,
      description: "",
      imageUrl: null,
      date: topicDate,
    };

    setPrayerTopics((prev) => [...prev, newTopic]);
  };

  const handleRemoveTopic = (id: string) => {
    setPrayerTopics((prev) => {
      const filtered = prev.filter((topic) => topic.id !== id);
      // Reordenar os dias
      return filtered.map((topic, index) => ({
        ...topic,
        day: index + 1,
      }));
    });
  };

  const handleImageUpload = (
    topicId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulando upload - em produção, você enviaria para um servidor
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        handleTopicChange(topicId, "imageUrl", imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);

    try {
      // Validações
      if (eventConfig.startDate >= eventConfig.endDate) {
        toast({
          title: "Erro de validação",
          description: "A data de início deve ser anterior à data de término",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (eventConfig.leadersPerShift <= 0) {
        toast({
          title: "Erro de validação",
          description: "O número de líderes por turno deve ser maior que zero",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Simulando envio para API
      console.log("Enviando configurações:", { eventConfig, prayerTopics });

      // Simular tempo de resposta
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Configurações salvas",
        description: "As configurações do evento foram salvas com sucesso",
      });

      // router.push('/admin/events')
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-3 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          {church && (
            <div className="flex items-center space-x-2 bg-muted/40 px-3 py-2 rounded-md">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{church.name}</p>
                <p className="text-xs text-muted-foreground">
                  {church.location}
                </p>
              </div>
            </div>
          )}
        </div>

        <UI.Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <UI.TabsList className="grid grid-cols-2 w-full md:w-auto">
            <UI.TabsTrigger value="general">Gerais</UI.TabsTrigger>
            <UI.TabsTrigger value="topics">Pautas Diárias</UI.TabsTrigger>
          </UI.TabsList>

          <UI.TabsContent value="general" className="space-y-6">
            <UI.Card>
              <UI.CardHeader>
                <UI.CardTitle>Configurações Gerais</UI.CardTitle>
                <UI.CardDescription>
                  Configure os parâmetros básicos do evento de oração
                </UI.CardDescription>
              </UI.CardHeader>
              <UI.CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Data de Início */}
                  <div className="space-y-2">
                    <UI.Label htmlFor="startDate">
                      Data e Hora de Início
                    </UI.Label>
                    <div className="flex">
                      <UI.Popover>
                        <UI.PopoverTrigger asChild>
                          <UI.Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !eventConfig.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {eventConfig.startDate ? (
                              format(eventConfig.startDate, "PPP", {
                                locale: ptBR,
                              })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </UI.Button>
                        </UI.PopoverTrigger>
                        <UI.PopoverContent className="w-auto p-0">
                          <UI.Calendar
                            mode="single"
                            selected={eventConfig.startDate}
                            onSelect={handleStartDateChange}
                            initialFocus
                          />
                        </UI.PopoverContent>
                      </UI.Popover>
                    </div>
                  </div>

                  {/* Data de Término */}
                  <div className="space-y-2">
                    <UI.Label htmlFor="endDate">
                      Data e Hora de Término
                    </UI.Label>
                    <div className="flex">
                      <UI.Popover>
                        <UI.PopoverTrigger asChild>
                          <UI.Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !eventConfig.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {eventConfig.endDate ? (
                              format(eventConfig.endDate, "PPP", {
                                locale: ptBR,
                              })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </UI.Button>
                        </UI.PopoverTrigger>
                        <UI.PopoverContent className="w-auto p-0">
                          <UI.Calendar
                            mode="single"
                            selected={eventConfig.endDate}
                            onSelect={handleEndDateChange}
                            initialFocus
                          />
                        </UI.PopoverContent>
                      </UI.Popover>
                    </div>
                  </div>

                  {/* Número de Líderes por Turno */}
                  <div className="space-y-2">
                    <UI.Label htmlFor="leadersPerShift">
                      Número de Líderes por Turno
                    </UI.Label>
                    <UI.Input
                      id="leadersPerShift"
                      name="leadersPerShift"
                      type="number"
                      min="1"
                      value={eventConfig.leadersPerShift}
                      onChange={handleNumberInputChange}
                    />
                  </div>

                  {/* Tipo de Evento */}
                  <div className="space-y-2">
                    <UI.Label htmlFor="eventType">Tipo de Evento</UI.Label>
                    <UI.Select
                      value={eventConfig.eventType}
                      onValueChange={handleSelectChange}
                    >
                      <UI.SelectTrigger>
                        <UI.SelectValue placeholder="Selecione o tipo" />
                      </UI.SelectTrigger>
                      <UI.SelectContent>
                        <UI.SelectItem value="SHIFT">Turnos</UI.SelectItem>
                        <UI.SelectItem value="CLOCK">
                          Relógio de Oração
                        </UI.SelectItem>
                      </UI.SelectContent>
                    </UI.Select>
                    <p className="text-xs text-muted-foreground">
                      Turnos fixos | Horários flexíveis
                    </p>
                  </div>

                  {/* Duração do Turno */}
                  <div className="space-y-2">
                    <UI.Label htmlFor="shiftDuration">
                      Duração do Turno (minutos)
                    </UI.Label>
                    <div className="flex items-center space-x-2">
                      <UI.Input
                        id="shiftDuration"
                        name="shiftDuration"
                        type="number"
                        min="15"
                        step="15"
                        value={eventConfig.shiftDuration}
                        onChange={handleNumberInputChange}
                      />
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          {Math.floor(eventConfig.shiftDuration / 60) > 0 &&
                            `${Math.floor(eventConfig.shiftDuration / 60)}h`}
                          {eventConfig.shiftDuration % 60 > 0 &&
                            `${eventConfig.shiftDuration % 60}min`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <UI.Label htmlFor="allowShiftChange">
                        Permitir Troca de Turno
                      </UI.Label>
                      <UI.Switch
                        id="allowShiftChange"
                        checked={eventConfig.allowShiftChange}
                        onCheckedChange={handleSwitchChange}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Se ativado, os líderes poderão trocar de turno após o
                      início do evento
                    </p>
                  </div>
                </div>

                {/* Descrição do Evento */}
                <div className="space-y-2">
                  <UI.Label htmlFor="description">Descrição do Evento</UI.Label>
                  <UI.Textarea
                    id="description"
                    name="description"
                    value={eventConfig.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Descreva o propósito e detalhes do evento..."
                  />
                </div>

                {/* Informações do Evento */}
                <div className="bg-muted/30 p-4 rounded-md flex items-start space-x-3">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-medium">Informações do Evento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Duração total:
                        </span>{" "}
                        <UI.Badge variant="outline">{totalDays} dias</UI.Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Total de turnos por semana:
                        </span>{" "}
                        <UI.Badge variant="outline">{7 * 24}</UI.Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Líderes necessário para evento totalmente preenchido:
                        </span>{" "}
                        <UI.Badge variant="outline" className="bg-primary/10">
                          <Users className="h-3 w-3 mr-1" />
                          {eventConfig.leadersPerShift * 7 * 24}
                        </UI.Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </UI.CardContent>
            </UI.Card>
          </UI.TabsContent>

          <UI.TabsContent value="topics" className="space-y-6">
            {/* <UI.Card>
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
              <UI.CardContent>
                <div className="text-sm text-muted-foreground mb-4 flex items-center space-x-2">
                  <Info className="h-4 w-4" />
                  <span>
                    Você pode adicionar até {totalDays} pautas para este evento
                    de {totalDays} dias.
                  </span>
                </div>

                <div className="space-y-6">
                  {prayerTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="border rounded-md p-4 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <UI.Badge variant="outline" className="bg-primary/5">
                            Dia {topic.day}
                          </UI.Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(topic.date, "EEEE, dd/MM", {
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
                          <UI.Label htmlFor={`topic-title-${topic.id}`}>
                            Título da Pauta
                          </UI.Label>
                          <UI.Input
                            id={`topic-title-${topic.id}`}
                            value={topic.title}
                            onChange={(e) =>
                              handleTopicChange(
                                topic.id,
                                "title",
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
                              {topic.imageUrl
                                ? "Alterar imagem"
                                : "Upload de imagem"}
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

                      <div className="space-y-2">
                        <UI.Label htmlFor={`topic-description-${topic.id}`}>
                          Descrição da Pauta
                        </UI.Label>
                        <UI.Textarea
                          id={`topic-description-${topic.id}`}
                          value={topic.description}
                          onChange={(e) =>
                            handleTopicChange(
                              topic.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Descreva o tema de oração para este dia..."
                          rows={3}
                        />
                      </div>

                      {topic.imageUrl && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-2">
                            Prévia da imagem:
                          </p>
                          <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-md border">
                            <img
                              src={topic.imageUrl || "/placeholder.svg"}
                              alt={`Imagem para ${topic.title}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {prayerTopics.length === 0 && (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-muted-foreground">
                        Nenhuma pauta adicionada. Clique em "Adicionar Pauta"
                        para começar.
                      </p>
                    </div>
                  )}
                </div>
              </UI.CardContent>
            </UI.Card> */}
          </UI.TabsContent>
        </UI.Tabs>

        <div className="mt-6 flex justify-end space-x-4">
          <UI.Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </UI.Button>
          <UI.Button onClick={handleSaveConfig} disabled={isLoading}>
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
      </motion.div>
    </div>
  );
}
