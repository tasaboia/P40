"use client";

import { useState, useEffect } from "react";
import { format, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Send,
  MessageSquare,
} from "lucide-react";
import { Button } from "@p40/components/ui/button";
import { Card, CardContent } from "@p40/components/ui/card";
import { Textarea } from "@p40/components/ui/textarea";
import { Skeleton } from "@p40/components/ui/skeleton";
import { toast } from "@p40/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { DailyPrayerTopic } from "@p40/common/contracts/daily-topics/daily-topics";
import { EventConfigClient } from "@p40/services/event-config/event-config-client";
import { TestimonyType } from "@prisma/client";

export default function DailyTopicPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventConfigClient = new EventConfigClient();

  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [topics, setTopics] = useState<DailyPrayerTopic[]>([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [testimony, setTestimony] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTestimonyForm, setShowTestimonyForm] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsResponse = await eventConfigClient.getDailyTopics(
          params.id
        );
        topicsResponse.data.sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return parseISO(b.date).getTime() - parseISO(a.date).getTime();
        });

        setTopics(topicsResponse.data);

        const todayIndex = topicsResponse.data.findIndex((topic) => {
          if (!topic.date) return false;
          const topicDate = startOfDay(parseISO(topic.date));
          const today = startOfDay(new Date());
          return topicDate.getTime() === today.getTime();
        });

        setCurrentTopicIndex(todayIndex !== -1 ? todayIndex : 0);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar tópicos:", error);
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const goToPreviousTopic = () => {
    if (currentTopicIndex < topics.length - 1) {
      setCurrentTopicIndex(currentTopicIndex + 1);
    }
  };

  const goToNextTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(currentTopicIndex - 1);
    }
  };

  const isCurrentTopicToday = () => {
    if (!topics[currentTopicIndex]?.date) return false;
    const topicDate = startOfDay(parseISO(topics[currentTopicIndex].date!));
    const today = startOfDay(new Date());
    return topicDate.getTime() === today.getTime();
  };

  const isCurrentTopicFuture = () => {
    if (!topics[currentTopicIndex]?.date) return false;
    const topicDate = startOfDay(parseISO(topics[currentTopicIndex].date!));
    const today = startOfDay(new Date());
    return isAfter(topicDate, today);
  };

  // Verificar se o tópico atual é do passado
  const isCurrentTopicPast = () => {
    if (!topics[currentTopicIndex]?.date) return false;
    const topicDate = startOfDay(parseISO(topics[currentTopicIndex].date!));
    const today = startOfDay(new Date());
    return isBefore(topicDate, today);
  };

  // Enviar testemunho
  const submitTestimony = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Você precisa estar logado",
        description: "Faça login para compartilhar seu testemunho",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (!testimony.trim()) {
      toast({
        title: "Testemunho vazio",
        description: "Por favor, escreva seu testemunho antes de enviar",
        variant: "destructive",
      });
      return;
    }

    // Verificar se temos o tópico atual
    if (!topics[currentTopicIndex]?.id) {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível identificar o tópico de oração",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/testimony", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: testimony,
          type: TestimonyType.FAITH,
          userId: session.user.id,
          churchId: session.user.churchId,
          date: new Date().toISOString(),
          approved: false
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar testemunho");
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Testemunho enviado",
          description: "Seu testemunho foi enviado e será revisado em breve",
        });

        setTestimony("");
        setShowTestimonyForm(false);
      } else {
        throw new Error(data.message || "Erro ao enviar testemunho");
      }
    } catch (error) {
      console.error("Erro ao enviar testemunho:", error);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao enviar seu testemunho. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatar data do tópico
  const formatTopicDate = (dateString?: string) => {
    if (!dateString) return "";
    return format(parseISO(dateString), "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  // Renderizar esqueleto de carregamento
  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-[500px] w-full rounded-lg" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  // Obter tópico atual
  const currentTopic = topics[currentTopicIndex];

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTopic?.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-1"
        >
          {/* Cabeçalho com navegação */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousTopic}
              disabled={currentTopicIndex >= topics.length - 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="text-center">
              <h1 className="text-xl font-bold">Pauta de Oração</h1>
              {currentTopic?.date && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatTopicDate(currentTopic.date)}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextTopic}
              disabled={currentTopicIndex <= 0}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Indicador de tópico atual/passado/futuro */}
          <div className="flex justify-center">
            {isCurrentTopicToday() ? (
              <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">
                Tópico de Hoje
              </div>
            ) : isCurrentTopicPast() ? (
              <div className="bg-muted/50 text-muted-foreground px-3 py-1 rounded-full text-sm">
                Tópico Anterior
              </div>
            ) : (
              <div className="bg-muted/50 text-muted-foreground px-3 py-1 rounded-full text-sm">
                Tópico Futuro
              </div>
            )}
          </div>

          <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg border shadow-sm">
            {currentTopic?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTopic.imageUrl}
                alt="Tópico de oração"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4">
                  <Calendar className="h-12 w-12 text-primary/40 mx-auto" />
                  <h3 className="text-lg font-semibold text-primary/80">
                    Em breve
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                    {isCurrentTopicFuture() 
                      ? "O tópico de oração para este dia será revelado em breve."
                      : "Não há imagem disponível no momento."}
                  </p>
                </div>
              </div>
            )}

             
          </div>

          { currentTopic?.imageUrl  && 
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => setShowTestimonyForm(!showTestimonyForm)}
                variant="outline"
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {showTestimonyForm ? "Cancelar" : "Compartilhar Testemunho"}
              </Button>
            </div>
          }

          {/* Formulário de testemunho */}
          {showTestimonyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <Card>
                <CardContent className="pt-4">
                  <Textarea
                    placeholder="Compartilhe seu testemunho sobre este tópico de oração..."
                    value={testimony}
                    onChange={(e) => setTestimony(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <Button
                      onClick={submitTestimony}
                      disabled={isSubmitting || !testimony.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground text-center">
                Seu testemunho será revisado antes de ser publicado.
              </p>
            </motion.div>
          )}

          {/* <div className="text-center mt-6">
            <Button variant="link" onClick={() => router.push("/testimonies")}>
              Ver todos os testemunhos
            </Button>
          </div> */}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
