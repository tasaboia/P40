"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatInTimeZone } from 'date-fns-tz';
import { motion, AnimatePresence } from "framer-motion";
import {
  // ChevronLeft,  // Comentado temporariamente
  // ChevronRight, // Comentado temporariamente
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
              
        if (!topicsResponse.data || topicsResponse.data.length === 0) {
          setIsLoading(false);
          return;
        }

        // Ordenar do mais antigo para o mais recente
        const sortedTopics = [...topicsResponse.data].sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return parseISO(a.date).getTime() - parseISO(b.date).getTime();
        });

        setTopics(sortedTopics);

        // Encontrar o índice do tópico de hoje
        const today = format(new Date(), 'yyyy-MM-dd');
        
        console.log('DEBUG - Data de hoje:', today);

        // Procurar o tópico de hoje
        const todayIndex = sortedTopics.findIndex((topic) => {
          if (!topic.date) return false;
          // Pegar apenas a data (yyyy-MM-dd) ignorando o horário
          const topicDateStr = topic.date.split('T')[0];
          
          console.log('Comparando tópico:', {
            topicId: topic.id,
            topicDate: topic.date,
            topicDateStr,
            today,
            isMatch: topicDateStr === today
          });
          
          return topicDateStr === today;
        });

        console.log('Índice do tópico de hoje:', todayIndex);
        setCurrentTopicIndex(todayIndex !== -1 ? todayIndex : -1);
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao buscar tópicos:', error);
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [params.id]);

  // Funções de navegação comentadas temporariamente
  /*
  const goToPreviousTopic = () => {
    let prevIndex = currentTopicIndex - 1;
    while (prevIndex >= 0 && topics[prevIndex]?.date === topics[currentTopicIndex]?.date) {
      prevIndex--;
    }
    if (prevIndex >= 0) {
      setCurrentTopicIndex(prevIndex);
    }
  };

  const goToNextTopic = () => {
    let nextIndex = currentTopicIndex + 1;
    while (nextIndex < topics.length && topics[nextIndex]?.date === topics[currentTopicIndex]?.date) {
      nextIndex++;
    }
    if (nextIndex < topics.length) {
      setCurrentTopicIndex(nextIndex);
    }
  };
  */

  const isCurrentTopicToday = () => {
    if (!topics[currentTopicIndex]?.date) return false;
    const now = new Date();
    const saoPauloTime = formatInTimeZone(now, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss');
    const today = format(new Date(), 'yyyy-MM-dd');
    const topicDate = format(new Date(topics[currentTopicIndex].date!), 'yyyy-MM-dd');
    return topicDate === today;
  };

  // Funções de verificação de data comentadas temporariamente
  /*
  const isCurrentTopicFuture = () => {
    if (!topics[currentTopicIndex]?.date) return false;
    const now = new Date();
    const saoPauloTime = formatInTimeZone(now, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss');
    const today = format(new Date(), 'yyyy-MM-dd');
    const topicDate = format(new Date(topics[currentTopicIndex].date!), 'yyyy-MM-dd');
    return topicDate > today;
  };

  const isCurrentTopicPast = () => {
    if (!topics[currentTopicIndex]?.date) return false;
    const now = new Date();
    const saoPauloTime = formatInTimeZone(now, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss');
    const today = format(new Date(), 'yyyy-MM-dd');
    const topicDate = format(new Date(topics[currentTopicIndex].date!), 'yyyy-MM-dd');
    return topicDate < today;
  };
  */

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
        description: "Não foi possível identificar a pauta de oração",
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
    // Pegar apenas a data do tópico, ignorando o horário
    const date = parseISO(dateString.split('T')[0]);
    
    console.log('Formatando data do tópico:', {
      original: dateString,
      dateSemHora: dateString.split('T')[0],
      formatted: format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })
    });
    
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  // Obter tópico atual de forma segura
  const currentTopic = topics[currentTopicIndex] || null;

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

  // Se não houver tópicos, mostrar mensagem
  if (topics.length === 0 || currentTopicIndex === -1) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="text-center space-y-4">
          <Calendar className="h-12 w-12 text-primary/40 mx-auto" />
          <h3 className="text-lg font-semibold text-primary/80">
            Nenhuma pauta disponível
          </h3>
          <p className="text-sm text-muted-foreground">
            Não há pauta de oração para hoje.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTopic?.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Cabeçalho */}
          <div className="text-center">
            <h1 className="text-xl font-bold">Pauta de Oração</h1>
            {currentTopic?.date && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatTopicDate(currentTopic.date)}
              </p>
            )}
          </div>

          {/* Lista de imagens do dia */}
          <div className="space-y-4">
            {topics.filter(topic => 
              topic.date === currentTopic?.date && topic.imageUrl
            ).map((topic, index) => (
              <div 
                key={topic.id}
                className="relative aspect-[9/16] w-full overflow-hidden rounded-lg border shadow-sm"
              >
                <img
                  src={topic.imageUrl}
                  alt={`Pautas de oração ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}

            {/* Mostrar placeholder se não houver imagens */}
            {!topics.some(topic => 
              topic.date === currentTopic?.date && topic.imageUrl
            ) && (
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg border shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 flex flex-col items-center justify-center p-4">
                  <div className="text-center space-y-4">
                    <Calendar className="h-12 w-12 text-primary/40 mx-auto" />
                    <h3 className="text-lg font-semibold text-primary/80">
                      Nenhuma imagem disponível
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                      Não há imagens disponíveis para a pauta de hoje.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botão de testemunho */}
          {topics.some(topic => 
            topic.date === currentTopic?.date && topic.imageUrl
          ) && (
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
          )}

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
                    placeholder="Compartilhe seu testemunho sobre a pauta de oração..."
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
