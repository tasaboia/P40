"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TestimonyType } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@p40/components/ui/avatar";
import { Card, CardContent } from "@p40/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@p40/components/ui/select";
import { Skeleton } from "@p40/components/ui/skeleton";
import { Badge } from "@p40/components/ui/badge";
import { Calendar, MessageSquare, Plus, ChevronLeft, ChevronRight } from "lucide-react";
 
import { Button } from "@p40/components/ui/button";
import { Textarea } from "@p40/components/ui/textarea";
import { toast } from "@p40/hooks/use-toast";
import React from "react";
import Link from "next/link";

interface Testimony {
  id: string;
  content: string;
  type: TestimonyType;
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
}

interface PrayerTurn {
  id: string;
  startTime: string;
  endTime: string;
  weekday: number;
}

const getTestimonyTypeLabel = (type: TestimonyType) => {
  const labels = {
    [TestimonyType.HEALING]: "Cura",
    [TestimonyType.DELIVERANCE]: "Libertação",
    [TestimonyType.TRANSFORMATION]: "Transformação",
    [TestimonyType.SALVATION]: "Salvação",
    [TestimonyType.BLESSING]: "Bênção",
    [TestimonyType.PROVISION]: "Provisão",
    [TestimonyType.MIRACLE]: "Milagre",
    [TestimonyType.ENCOURAGEMENT]: "Encorajamento",
    [TestimonyType.FAITH]: "Fé",
    [TestimonyType.PEACE]: "Paz"
  };
  return labels[type] || type;
};

const getTestimonyTypeBadgeColor = (type: TestimonyType) => {
  const colors = {
    [TestimonyType.HEALING]: "bg-green-500/10 text-green-500",
    [TestimonyType.DELIVERANCE]: "bg-purple-500/10 text-purple-500",
    [TestimonyType.TRANSFORMATION]: "bg-blue-500/10 text-blue-500",
    [TestimonyType.SALVATION]: "bg-red-500/10 text-red-500",
    [TestimonyType.BLESSING]: "bg-yellow-500/10 text-yellow-500",
    [TestimonyType.PROVISION]: "bg-orange-500/10 text-orange-500",
    [TestimonyType.MIRACLE]: "bg-indigo-500/10 text-indigo-500",
    [TestimonyType.ENCOURAGEMENT]: "bg-pink-500/10 text-pink-500",
    [TestimonyType.FAITH]: "bg-cyan-500/10 text-cyan-500",
    [TestimonyType.PEACE]: "bg-teal-500/10 text-teal-500"
  };
  return colors[type] || "bg-gray-500/10 text-gray-500";
};

export default function TestimoniesPage() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<TestimonyType | "ALL">("ALL");
  const ITEMS_PER_PAGE = 10;

  const fetchTestimonies = useCallback(async (page = 1) => {
    try {
      setIsLoadingMore(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(filter !== "ALL" && { type: filter })
      }).toString();

      const response = await fetch(`/api/testimony?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        if (page === 1) {
          setTestimonies(data.data);
        } else {
          setTestimonies(prev => [...prev, ...data.data]);
        }
        setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error("Erro ao carregar testemunhos:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filter]);

  useEffect(() => {
    setCurrentPage(1);
    fetchTestimonies(1);
  }, [fetchTestimonies]);

  const loadMore = useCallback(() => {
    if (currentPage < totalPages && !isLoadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchTestimonies(nextPage);
    }
  }, [currentPage, totalPages, isLoadingMore, fetchTestimonies]);

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <div className="flex flex-col items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-bold">Testemunhos</h1>
          <p className="text-sm text-muted-foreground">
            Testemunhos compartilhados durante os turnos de oração
          </p>
        </div>
        <div className="flex  gap-2">
         
          <Select
            value={filter}
            onValueChange={(value: TestimonyType | "ALL") => setFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os tipos</SelectItem>
              {Object.values(TestimonyType).map((type) => (
                <SelectItem key={type} value={type}>
                  {getTestimonyTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/testimonies/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Testemunho
            </Button>
          </Link>

        </div>
      </div>

      <div className="space-y-4">
        {testimonies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-semibold">
                Nenhum testemunho encontrado
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Não há testemunhos aprovados para exibir no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {testimonies.map((testimony) => (
              <TestimonyCard key={testimony.id} testimony={testimony} />
            ))}
            
            {currentPage < totalPages && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full max-w-sm"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Carregando mais...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Carregar mais testemunhos</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            )}

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Mostrando {testimonies.length} de {totalPages * ITEMS_PER_PAGE} testemunhos
            </div>
          </>
        )}
      </div>

      <div className="h-20" />
    </div>
  );
}

const TestimonyCard = React.memo(({ testimony }: { testimony: Testimony }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={testimony.user.imageUrl} />
            <AvatarFallback>
              {testimony.user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold capitalize">{testimony.user.name.toLowerCase()}</h3>
                {testimony.church && (
                  <p className="text-sm text-muted-foreground">
                    {testimony.church.name}
                  </p>
                )}
              </div>
              <Badge className={getTestimonyTypeBadgeColor(testimony.type)}>
                {getTestimonyTypeLabel(testimony.type)}
              </Badge>
            </div>
            <p className="mt-3 text-sm">{testimony.content}</p>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(testimony.date), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
              <span className="mx-2">•</span>
              Turno: {testimony.prayerTurn.startTime} - {testimony.prayerTurn.endTime}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TestimonyCard.displayName = 'TestimonyCard'; 