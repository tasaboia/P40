"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OccurrenceType } from "@prisma/client";
import { Button } from "@p40/components/ui/button";
import { Textarea } from "@p40/components/ui/textarea";
import { Input } from "@p40/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@p40/components/ui/select";
import { toast } from "@p40/hooks/use-toast";
import { Calendar, AlertTriangle, User, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@p40/components/ui/scroll-area";

interface Leader {
  id: string;
  name: string;
  imageUrl?: string;
  churchName?: string;
  shifts: {
    weekday: number;
    startTime: string;
    endTime: string;
  }[];
}

interface PrayerTurn {
  id: string;
  startTime: string;
  endTime: string;
  weekday: number;
}

const LEADERS_CACHE_KEY = "cached_leaders";
const CACHE_EXPIRY_TIME = 1000 * 60 * 30; // 30 minutos

// Componente otimizado para a descrição da ocorrência
const DescriptionField = memo(({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void 
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="content" className="text-sm font-medium">
        Descrição
      </label>
      <Textarea
        id="content"
        value={value}
        onChange={onChange}
        placeholder="Descreva a ocorrência em detalhes..."
        className="min-h-[200px]"
        required
      />
    </div>
  );
});
DescriptionField.displayName = 'DescriptionField';

// Componente otimizado para a seleção de líder
const LeaderSelector = memo(({ 
  leaders, 
  isLoading, 
  selectedId, 
  onSelect 
}: { 
  leaders: Leader[]; 
  isLoading: boolean; 
  selectedId: string; 
  onSelect: (id: string) => void;
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="leader" className="text-sm font-medium">
        Líder Relacionado
      </label>
      
      {isLoading ? (
        <div className="flex items-center gap-2 p-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando líderes...</span>
        </div>
      ) : (
        <Select
          value={selectedId}
          onValueChange={onSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um líder" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <ScrollArea className="h-[300px]">
              {leaders.length === 0 ? (
                <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                  Nenhum líder disponível
                </div>
              ) : (
                leaders.map((leader) => (
                  <SelectItem key={leader.id} value={leader.id} className="py-2">
                    <div className="flex items-center gap-2">
                      {leader.imageUrl ? (
                        <img
                          src={leader.imageUrl}
                          alt={leader.name}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-3 w-3" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span>{leader.name}</span>
                        {leader.churchName && (
                          <span className="text-xs text-muted-foreground">
                            {leader.churchName}
                          </span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </ScrollArea>
          </SelectContent>
        </Select>
      )}
    </div>
  );
});
LeaderSelector.displayName = 'LeaderSelector';

export default function NewOccurrencePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [type, setType] = useState<OccurrenceType>(OccurrenceType.TECHNICAL_ISSUE);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(false);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>("");

  // Função para buscar líderes do cache ou da API
  const fetchLeaders = useCallback(async () => {
    if (type !== OccurrenceType.LEADER_ABSENCE && type !== OccurrenceType.LEADER_DELAY) return;
    
    try {
      setIsLoadingLeaders(true);
      
      // Verificar se existem dados em cache válidos
      const cachedData = localStorage.getItem(LEADERS_CACHE_KEY);
      if (cachedData) {
        try {
          const { data, timestamp, churchId } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > CACHE_EXPIRY_TIME;
          const isSameChurch = churchId === session?.user?.churchId;
          
          if (!isExpired && isSameChurch && data.length > 0) {
            console.log("Usando dados em cache");
            setLeaders(data);
            setIsLoadingLeaders(false);
            return;
          }
        } catch (error) {
          console.error("Erro ao processar dados em cache:", error);
          localStorage.removeItem(LEADERS_CACHE_KEY); // Remove cache inválido
        }
      }

      // Dados em cache inválidos ou expirados, buscar da API
      console.log("Buscando líderes da API...");
      const response = await fetch(`/api/leaders`, {
        headers: {
          "churchId": session?.user?.churchId || ''
        }
      });
      
      const responseData = await response.json();
      
      if (responseData.success && responseData.data.length > 0) {
        setLeaders(responseData.data);
        
        // Salvar no cache
        localStorage.setItem(LEADERS_CACHE_KEY, JSON.stringify({
          data: responseData.data,
          timestamp: Date.now(),
          churchId: session?.user?.churchId
        }));
      } else {
        setLeaders([]);
        toast({
          title: "Nenhum líder encontrado",
          description: "Não foi possível encontrar líderes para esta igreja.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar líderes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de líderes",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLeaders(false);
    }
  }, [type, session?.user?.churchId, toast]);

  // Carregar líderes do cache imediatamente ao mudar o tipo
  useEffect(() => {
    if (type === OccurrenceType.LEADER_ABSENCE || type === OccurrenceType.LEADER_DELAY) {
      setIsLoadingLeaders(true);
      
      // Tentar usar cache imediatamente
      try {
        const cachedData = localStorage.getItem(LEADERS_CACHE_KEY);
        if (cachedData) {
          const { data, timestamp, churchId } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > CACHE_EXPIRY_TIME;
          const isSameChurch = churchId === session?.user?.churchId;
          
          if (!isExpired && isSameChurch && data.length > 0) {
            setLeaders(data);
            setIsLoadingLeaders(false);
            return;
          }
        }
      } catch (e) {
        console.log("Erro ao carregar do cache:", e);
      }
      
      // Se não tiver cache válido, continuar com a busca
      fetchLeaders();
    }
  }, [type, session?.user?.churchId, fetchLeaders]);

  const handleTypeChange = (value: OccurrenceType) => {
    setType(value);
    if (value !== OccurrenceType.LEADER_ABSENCE && value !== OccurrenceType.LEADER_DELAY) {
      setSelectedLeaderId("");
      setLeaders([]);
    }
  };

  // Manipuladores de eventos memorizados para evitar re-renderização
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  const handleLeaderSelect = useCallback((id: string) => {
    setSelectedLeaderId(id);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!session?.user?.id || !session?.user?.churchId) {
      toast({
        title: "Erro",
        description: "Dados do usuário não encontrados",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Obter o prayerTurnId atual
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      const weekday = now.getDay();
      
      // Formatar a hora atual
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
      
      // Buscar o turno atual
      const currentPrayerTurnResponse = await fetch(`/api/prayer-turns/current?weekday=${weekday}&time=${currentTime}`);
      const currentPrayerTurnData = await currentPrayerTurnResponse.json();
      
      if (!currentPrayerTurnData.success || !currentPrayerTurnData.data) {
        toast({
          title: "Erro",
          description: "Não foi possível determinar o turno atual",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const prayerTurnId = currentPrayerTurnData.data.id;

      const response = await fetch("/api/occurrences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          type,
          userId: session.user.id,
          churchId: session.user.churchId,
          prayerTurnId,
          relatedLeaderId: type === OccurrenceType.LEADER_ABSENCE || type === OccurrenceType.LEADER_DELAY 
            ? selectedLeaderId 
            : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Ocorrência registrada",
          description: "Sua ocorrência foi registrada com sucesso.",
        });
        router.push("/schedule");
      } else {
        throw new Error(data.error || "Erro ao registrar ocorrência");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao registrar ocorrência",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [content, type, selectedLeaderId, session, router, toast]);

  // Verificar se o formulário pode ser enviado
  const isSubmitDisabled = useMemo(() => {
    return isLoading || 
      (((type === OccurrenceType.LEADER_ABSENCE || type === OccurrenceType.LEADER_DELAY) && !selectedLeaderId) || 
      !content);
  }, [isLoading, type, selectedLeaderId, content]);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nova Ocorrência</h1>
        <p className="text-sm text-muted-foreground">
          Registre uma nova ocorrência relacionada ao turno de oração
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            Tipo de Ocorrência
          </label>
          <Select
            value={type}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de ocorrência" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={OccurrenceType.TECHNICAL_ISSUE}>Problema Técnico</SelectItem>
              <SelectItem value={OccurrenceType.LEADER_ABSENCE}>Ausência de Líder</SelectItem>
              <SelectItem value={OccurrenceType.LEADER_DELAY}>Atraso de Líder</SelectItem>
              <SelectItem value={OccurrenceType.OTHER}>Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(type === OccurrenceType.LEADER_ABSENCE || type === OccurrenceType.LEADER_DELAY) && (
          <LeaderSelector 
            leaders={leaders}
            isLoading={isLoadingLeaders}
            selectedId={selectedLeaderId}
            onSelect={handleLeaderSelect}
          />
        )}

        <DescriptionField 
          value={content}
          onChange={handleContentChange}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitDisabled}
            className="min-w-[180px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Registrando...</span>
              </div>
            ) : (
              "Registrar Ocorrência"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 