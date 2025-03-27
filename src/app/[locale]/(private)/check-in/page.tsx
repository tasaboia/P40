"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { format, differenceInDays, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Separator
} from "@p40/components/ui";
import {
  CalendarCheck,
  Clock,
  Calendar,
  MapPin,
  Users,
  ChevronRight
} from "lucide-react";

// Tipo para os check-ins
type CheckIn = {
  id: string;
  prayerTurnId: string;
  eventId: string;
  createdAt: string;
  prayerTurn: {
    startTime: string;
    endTime: string;
    weekday: number;
  };
  event: {
    id: string;
    name: string;
  };
};

export default function CheckInHistory() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    events: new Set<string>(),
    weekdayCounts: [0, 0, 0, 0, 0, 0, 0], // Dom, Seg, Ter, Qua, Qui, Sex, Sáb
  });
  const [currentTab, setCurrentTab] = useState('todos');

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/check-in/login");
      return;
    }

    fetchCheckIns();
  }, [status, router]);

  const fetchCheckIns = async () => {
    try {
      if (!session?.user?.id) return;
      
      setLoading(true);
      const response = await fetch(`/api/check-in?userId=${session.user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          const checkInsData = data.data;
          setCheckIns(checkInsData);
          calculateStats(checkInsData);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar check-ins:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (checkInsData: CheckIn[]) => {
    const today = new Date();
    const events = new Set<string>();
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
    let thisMonthCount = 0;

    checkInsData.forEach(checkIn => {
      events.add(checkIn.event.id);
      
      const date = new Date(checkIn.createdAt);
      weekdayCounts[date.getDay()]++;
      
      if (isSameMonth(date, today)) {
        thisMonthCount++;
      }
    });

    setStats({
      total: checkInsData.length,
      thisMonth: thisMonthCount,
      events,
      weekdayCounts
    });
  };

  // Obter o nome do dia da semana
  const getWeekdayName = (day: number) => {
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return weekdays[day];
  };

  // Obter o dia com mais check-ins
  const getMostActiveDay = () => {
    let max = 0;
    let dayIndex = 0;
    
    stats.weekdayCounts.forEach((count, index) => {
      if (count > max) {
        max = count;
        dayIndex = index;
      }
    });
    
    return { day: getWeekdayName(dayIndex), count: max };
  };

  // Filtrar check-ins baseado na aba selecionada
  const getFilteredCheckIns = () => {
    const now = new Date();
    
    switch (currentTab) {
      case 'mes':
        return checkIns.filter(checkIn => 
          isSameMonth(new Date(checkIn.createdAt), now)
        );
      case 'eventos':
        // Agrupar por evento
        const eventGroups: Record<string, CheckIn[]> = {};
        checkIns.forEach(checkIn => {
          const eventId = checkIn.event.id;
          if (!eventGroups[eventId]) {
            eventGroups[eventId] = [];
          }
          eventGroups[eventId].push(checkIn);
        });
        
        // Pegar o último check-in de cada evento
        return Object.values(eventGroups).map(group => 
          group.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        );
      default:
        return checkIns;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
        <Card className="w-full max-w-lg shadow-sm border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-lg font-medium">Carregando seu histórico...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredCheckIns = getFilteredCheckIns();
  const mostActiveDay = getMostActiveDay();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg mb-4"
      >
        {/* Cartão de Resumo */}
        <Card className="bg-white shadow-sm border mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Resumo de Presença</CardTitle>
            <CardDescription>
              Registro de suas participações
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border rounded-lg p-3 flex flex-col items-center bg-white">
                <div className="text-xl font-semibold text-gray-800">{stats.total}</div>
                <div className="text-xs text-gray-600 text-center">Total de presenças</div>
              </div>
              
              <div className="border rounded-lg p-3 flex flex-col items-center bg-white">
                <div className="text-xl font-semibold text-gray-800">{stats.events.size}</div>
                <div className="text-xs text-gray-600 text-center">Eventos diferentes</div>
              </div>
              
             
            </div>

            {mostActiveDay.count > 0 && (
              <div className="mt-4 border rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dia mais frequente</p>
                    <p className="text-xs text-gray-600">
                      {mostActiveDay.day} ({mostActiveDay.count} presenças)
                    </p>
                  </div>
                  <Calendar className="text-gray-500" size={18} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Check-ins */}
        <Card className="bg-white shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle>Histórico de Presenças</CardTitle>
            <CardDescription>
              {stats.total > 0 
                ? `Você tem ${stats.total} presenças registradas` 
                : "Você ainda não possui presenças registradas"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="todos" className="mb-4" onValueChange={setCurrentTab}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="mes">Este mês</TabsTrigger>
                <TabsTrigger value="eventos">Por evento</TabsTrigger>
              </TabsList>
              
              <TabsContent value="todos" className="mt-4">
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {filteredCheckIns.length > 0 ? (
                    filteredCheckIns.map((checkIn) => (
                      <CheckInListItem key={checkIn.id} checkIn={checkIn} />
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p>Nenhum registro encontrado</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="mes" className="mt-4">
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {filteredCheckIns.length > 0 ? (
                    filteredCheckIns.map((checkIn) => (
                      <CheckInListItem key={checkIn.id} checkIn={checkIn} />
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p>Nenhum registro neste mês</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="eventos" className="mt-4">
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {filteredCheckIns.length > 0 ? (
                    filteredCheckIns.map((checkIn) => (
                      <CheckInEventItem key={checkIn.id} checkIn={checkIn} />
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p>Nenhum evento encontrado</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
         
        </Card>
      </motion.div>
    </div>
  );
}

// Componente para item de check-in na lista
function CheckInListItem({ checkIn }: { checkIn: CheckIn }) {
  return (
    <div className="flex items-center gap-3 border p-3 rounded-md hover:bg-gray-50 transition-colors">
      <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
        <CalendarCheck size={18} className="text-gray-700" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{checkIn.event.name}</p>
        
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center text-xs text-gray-500">
            <Clock size={12} className="mr-1" />
            <span>{checkIn.prayerTurn.startTime}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <Calendar size={12} className="mr-1" />
            <span>{format(new Date(checkIn.createdAt), "dd/MM/yyyy")}</span>
          </div>
        </div>
      </div>
      
      <ChevronRight size={16} className="text-gray-400" />
    </div>
  );
}

// Componente para item de evento na lista
function CheckInEventItem({ checkIn }: { checkIn: CheckIn }) {
  return (
    <div className="border p-3 rounded-md hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
          <MapPin size={18} className="text-gray-700" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{checkIn.event.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Última presença em {format(new Date(checkIn.createdAt), "dd/MM/yyyy")}
          </p>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <div className="flex items-center">
            <Users size={12} className="mr-1" />
            <span>Dia frequente: {getWeekdayName(checkIn.prayerTurn.weekday)}</span>
          </div>
          
          <div className="flex items-center">
            <Clock size={12} className="mr-1" />
            <span>{checkIn.prayerTurn.startTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Função auxiliar para obter nome do dia
function getWeekdayName(day: number): string {
  const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  return days[day];
}
