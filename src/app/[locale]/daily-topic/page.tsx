"use client";

import { useState, useEffect, Suspense } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@p40/components/ui/skeleton";
import { EventConfigClient } from "@p40/services/event-config/event-config-client";
import { DailyPrayerTopic } from "@p40/common/contracts/daily-topics/daily-topics";
import DailyTopicHeader from "@p40/components/custom/daily-topic-header";

function DailyTopicContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');
  const eventConfigClient = new EventConfigClient();

  const [isLoading, setIsLoading] = useState(true);
  const [topics, setTopics] = useState<DailyPrayerTopic[]>([]);
  const [todayTopics, setTodayTopics] = useState<DailyPrayerTopic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!eventId) {
        setIsLoading(false);
        return;
      }

      try {
        const topicsResponse = await eventConfigClient.getDailyTopics(eventId);
              
        if (!topicsResponse.data || topicsResponse.data.length === 0) {
          setIsLoading(false);
          return;
        }

        const sortedTopics = [...topicsResponse.data].sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        setTopics(sortedTopics);

        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Encontrar todas as pautas de hoje
        const todaysTopics = sortedTopics.filter((topic) => {
          if (!topic.date) return false;
          const topicDateStr = topic.date.split('T')[0];
          return topicDateStr === today;
        });

        // Se não houver pautas para hoje, pegue a primeira pauta do evento
        if (todaysTopics.length === 0 && sortedTopics.length > 0) {
          setTodayTopics([sortedTopics[0]]);
        } else {
          setTodayTopics(todaysTopics);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao buscar tópicos:', error);
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [eventId]);

  const formatTopicDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <main className="container max-w-md mx-auto px-4 pb-10">
      {isLoading ? (
        <div className="py-6 space-y-4">
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      ) : !eventId || topics.length === 0 || todayTopics.length === 0 ? (
        <div className="py-6 text-center space-y-2">
          <h3 className="text-lg font-semibold text-[#1a1a1a]">
            Nenhuma pauta disponível
          </h3>
          <p className="text-sm text-[#666666]">
            Não há pauta de oração para hoje.
          </p>
        </div>
      ) : (
        <div>
          {/* Título e Data */}
          <div className="py-6 text-center">
            <h2 className="text-xl font-bold text-[#1a1a1a]">Pauta de Oração</h2>
            <p className="text-[15px] text-[#666666] mt-1 capitalize">
              {formatTopicDate(todayTopics[0].date)}
            </p>
          </div>

          {/* Lista de Pautas */}
          <div className="space-y-6">
            {todayTopics.map((topic, index) => (
              <div key={topic.id} className="w-full px-4">
                <img
                  src={topic.imageUrl}
                  alt={`Pauta de oração ${index + 1}`}
                  className="w-full rounded-xl"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export default function DailyTopicPage() {
  return (
    <div className="min-h-screen bg-white">
      <DailyTopicHeader />
      <Suspense fallback={
        <div className="container max-w-md mx-auto px-4 pb-10">
          <div className="py-6 space-y-4">
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-[500px] w-full rounded-lg" />
          </div>
        </div>
      }>
        <DailyTopicContent />
      </Suspense>
    </div>
  );
}
