"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TestimonyType } from "@prisma/client";
import { Button } from "@p40/components/ui/button";
import { Textarea } from "@p40/components/ui/textarea";
import { ChevronLeft, Calendar, Clock, Heart, Unlock, RefreshCw, Cross, Star, Package, Sparkles, MessageCircle, Shield, Cloud } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@p40/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@p40/hooks/use-toast";
import { cn } from "@p40/lib/utils";
import { motion } from "framer-motion";

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

const getTestimonyTypeIcon = (type: TestimonyType) => {
  const icons: Record<TestimonyType, React.ElementType> = {
    [TestimonyType.HEALING]: Heart,
    [TestimonyType.DELIVERANCE]: Unlock,
    [TestimonyType.TRANSFORMATION]: RefreshCw,
    [TestimonyType.SALVATION]: Cross,
    [TestimonyType.BLESSING]: Star,
    [TestimonyType.PROVISION]: Package,
    [TestimonyType.MIRACLE]: Sparkles,
    [TestimonyType.ENCOURAGEMENT]: MessageCircle,
    [TestimonyType.FAITH]: Shield,
    [TestimonyType.PEACE]: Cloud,
  };
  
  const IconComponent = icons[type];
  return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
};

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

const TestimonyTypeSelector = ({ testimony, setTestimony }) => {
  const types = [
    {
      type: TestimonyType.FAITH,
      icon: Shield,
      label: "Fé"
    },
    {
      type: TestimonyType.HEALING,
      icon: Heart,
      label: "Cura"
    },
    {
      type: TestimonyType.DELIVERANCE,
      icon: Unlock,
      label: "Libertação"
    },
    {
      type: TestimonyType.TRANSFORMATION,
      icon: RefreshCw,
      label: "Transformação"
    },
    {
      type: TestimonyType.SALVATION,
      icon: Cross,
      label: "Salvação"
    },
    {
      type: TestimonyType.BLESSING,
      icon: Star,
      label: "Bênção"
    },
    {
      type: TestimonyType.PROVISION,
      icon: Package,
      label: "Provisão"
    },
    {
      type: TestimonyType.MIRACLE,
      icon: Sparkles,
      label: "Milagre"
    },
    {
      type: TestimonyType.ENCOURAGEMENT,
      icon: MessageCircle,
      label: "Encorajamento"
    },
    {
      type: TestimonyType.PEACE,
      icon: Cloud,
      label: "Paz"
    }
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Tipo de Testemunho</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {types.map(({ type, icon: Icon, label }) => (
          <Button
            key={type}
            variant={testimony.type === type ? "default" : "outline"}
            className={cn(
              "h-auto py-3 flex flex-col items-center gap-2",
              testimony.type === type && "bg-primary"
            )}
            onClick={() => setTestimony(prev => ({ ...prev, type }))}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

const getTestimonyTypeDescription = (type: TestimonyType) => {
  const descriptions = {
    [TestimonyType.HEALING]: "Testemunho de cura física ou espiritual",
    [TestimonyType.DELIVERANCE]: "Libertação de vícios ou opressões",
    [TestimonyType.TRANSFORMATION]: "Mudança de vida e comportamento",
    [TestimonyType.SALVATION]: "Experiência de salvação pessoal",
    [TestimonyType.BLESSING]: "Bênçãos recebidas",
    [TestimonyType.PROVISION]: "Provisão divina em necessidades",
    [TestimonyType.MIRACLE]: "Milagres extraordinários",
    [TestimonyType.ENCOURAGEMENT]: "Palavras de encorajamento",
    [TestimonyType.FAITH]: "Fortalecimento na fé",
    [TestimonyType.PEACE]: "Paz em meio às circunstâncias"
  };
  return descriptions[type];
};

export default function NewTestimonyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [testimony, setTestimony] = useState({
    content: "",
    type: TestimonyType.FAITH as TestimonyType,
    weekday: new Date().getDay(),
    time: format(new Date(), "HH:mm"),
    date: format(new Date(), "yyyy-MM-dd"),
    leaderId: ""
  });
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      setIsLoadingLeaders(true);
      try {
        const response = await fetch("/api/leaders", {
          headers: {
            "churchId": session?.user?.churchId
          }
        });
        
        if (!response.ok) {
          setLeaders([]);
          return;
        }

        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          const filteredLeaders = isCustomDate 
            ? data.data.filter((leader: Leader) => 
                leader.shifts.some(shift => shift.weekday === testimony.weekday)
              )
            : data.data;

          setLeaders(filteredLeaders);
        } else {
          setLeaders([]);
        }
      } catch (error) {
        setLeaders([]);
      } finally {
        setIsLoadingLeaders(false);
      }
    };

    if (session?.user?.churchId) {
      fetchLeaders();
    }
  }, [isCustomDate, testimony.weekday, session?.user?.churchId]);

  const submitTestimony = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Não autorizado",
        description: "Você precisa estar logado para enviar um testemunho",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (!testimony.content.trim()) {
      toast({
        title: "Testemunho vazio",
        description: "Por favor, escreva seu testemunho antes de enviar",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let testimonialDate: Date;
      
      if (isCustomDate) {
        const [hours, minutes] = testimony.time.split(':').map(Number);
        testimonialDate = new Date(testimony.date);
        testimonialDate.setHours(hours, minutes);
      } else {
        testimonialDate = new Date();
      }

      const response = await fetch("/api/testimony", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: testimony.content,
          type: testimony.type,
          userId: session.user.id,
          churchId: session.user.churchId,
          date: testimonialDate.toISOString(),
          leaderId: testimony.leaderId || undefined,
          weekday: testimonialDate.getDay(),
          time: format(testimonialDate, "HH:mm")
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao enviar testemunho");
      }

      toast({
        title: "Testemunho enviado para aprovação",
        description: "Seu testemunho foi enviado e será revisado em breve",
      });

      router.push("/testimonies");
      
    } catch (error) {
      console.error("Erro ao enviar testemunho:", error);
      toast({
        title: "Erro ao enviar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao enviar seu testemunho",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isCustomDate) {
      const now = new Date();
      setTestimony(prev => ({
        ...prev,
        weekday: now.getDay(),
        time: format(now, "HH:mm"),
        date: format(now, "yyyy-MM-dd")
      }));
    }
  }, [isCustomDate]);

  const weekdays = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado"
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto pb-24 px-4 space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="flex items-center gap-2 w-full"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          <h1 className="text-sm font-semibold">Voltar para lista de testemunhos</h1>

          </Button>
        </div>

        <TestimonyTypeSelector 
          testimony={testimony} 
          setTestimony={setTestimony}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Seu Testemunho</label>
          <Textarea
            placeholder="Compartilhe seu testemunho..."
            value={testimony.content}
            onChange={(e) => 
              setTestimony(prev => ({ ...prev, content: e.target.value }))
            }
            rows={6}
            className="resize-none"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Quando aconteceu?</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCustomDate(!isCustomDate)}
              className="text-primary"
            >
              {isCustomDate ? "Usar hora atual" : "Escolher outra data/hora"}
            </Button>
          </div>

          {isCustomDate ? (
            <div className="space-y-4">
              <Select
                value={testimony.weekday.toString()}
                onValueChange={(value) => 
                  setTestimony(prev => ({ ...prev, weekday: parseInt(value) }))
                }
              >
                <SelectTrigger className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekdays.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                type="time"
                value={testimony.time}
                onChange={(e) => 
                  setTestimony(prev => ({ ...prev, time: e.target.value }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">
                  {format(new Date(), "EEEE", { locale: ptBR })}
                </p>
                <p className="text-muted-foreground">
                  {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground ml-auto" />
              <span className="text-sm font-medium">
                {format(new Date(), "HH:mm")}
              </span>
            </div>
          )}
        </div>

        {leaders.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              Líder do turno
              <span className="text-xs text-muted-foreground">(opcional)</span>
            </label>
            <Select
              value={testimony.leaderId}
              onValueChange={(value) => 
                setTestimony(prev => ({ ...prev, leaderId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o líder" />
              </SelectTrigger>
              <SelectContent>
                {leaders.map((leader) => (
                  <SelectItem 
                    key={leader.id} 
                    value={leader.id}
                  >
                    {leader.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="container max-w-2xl mx-auto">
            <Button 
              className="w-full" 
              size="lg"
              onClick={submitTestimony}
              disabled={isSubmitting || !testimony.content.trim()}
            >
              {isSubmitting ? "Enviando..." : "Enviar Testemunho"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 

 