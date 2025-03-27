"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@p40/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@p40/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, Users, TrendingUp, Filter, Download, Printer } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@p40/components/ui/select";
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@p40/components/ui/button";
import { Separator } from "@p40/components/ui/separator";
import { ScrollArea } from "@p40/components/ui/scroll-area";

// Tipos para os dados de check-in
type CheckInData = {
  id: string;
  userId: string;
  eventId: string;
  prayerTurnId: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    whatsapp?: string;
    churchId?: string;
    otherChurch?: string;
    leaderLink?: string;
  };
  event: {
    name: string;
  };
  prayerTurn: {
    startTime: string;
    endTime: string;
  };
};

type CheckInStats = {
  total: number;
  today: number;
  week: number;
  month: number;
  byHour: { hour: string; count: number }[];
  byDay: { day: string; count: number }[];
  byChurch: { name: string; count: number }[];
  returningUsers: number;
  newUsers: number;
};

export default function CheckinOverview() {
  const [loading, setLoading] = useState(true);
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [stats, setStats] = useState<CheckInStats>({
    total: 0,
    today: 0,
    week: 0,
    month: 0,
    byHour: [],
    byDay: [],
    byChurch: [],
    returningUsers: 0,
    newUsers: 0
  });
  const [filter, setFilter] = useState('7dias');
  const [activeTab, setActiveTab] = useState('geral');

  // Cores para os gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Buscar dados de check-in
  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/check-in/stats');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCheckIns(data.data.checkIns || []);
            processStats(data.data.checkIns || []);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas de check-in:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckIns();
  }, []);

  // Processar estatísticas
  const processStats = (data: CheckInData[]) => {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const weekStart = format(startOfWeek(now), 'yyyy-MM-dd');
    const monthStart = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
    
    // Estatísticas básicas
    const todayCheckins = data.filter(c => c.createdAt.startsWith(today));
    const weekCheckins = data.filter(c => {
      const date = new Date(c.createdAt);
      return date >= startOfWeek(now) && date <= endOfWeek(now);
    });
    const monthCheckins = data.filter(c => c.createdAt >= monthStart);
    
    // Contagem por hora
    const hourCounts: Record<string, number> = {};
    data.forEach(checkin => {
      const hour = new Date(checkin.createdAt).getHours();
      const hourKey = `${hour}:00`;
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    });
    
    // Contagem por dia da semana
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayCounts: Record<string, number> = {};
    data.forEach(checkin => {
      const day = new Date(checkin.createdAt).getDay();
      const dayName = dayNames[day];
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    });
    
    // Contagem por igreja
    const churchCounts: Record<string, number> = {};
    data.forEach(checkin => {
      const churchName = checkin.user.otherChurch || 'Zion';
      churchCounts[churchName] = (churchCounts[churchName] || 0) + 1;
    });
    
    // Usuários únicos
    const uniqueUsers = new Set(data.map(c => c.userId));
    const uniqueUsersToday = new Set(todayCheckins.map(c => c.userId));
    
    // Converter para formato de array para os gráficos
    const byHour = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
      
    const byDay = Object.entries(dayCounts)
      .map(([day, count]) => ({ day, count }));
      
    const byChurch = Object.entries(churchCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    setStats({
      total: data.length,
      today: todayCheckins.length,
      week: weekCheckins.length,
      month: monthCheckins.length,
      byHour,
      byDay,
      byChurch,
      returningUsers: uniqueUsers.size - uniqueUsersToday.size,
      newUsers: uniqueUsersToday.size
    });
  };

  // Filtrar dados por período
  const handleFilterChange = (value: string) => {
    setFilter(value);
    setLoading(true);
    
    const now = new Date();
    let filteredData: CheckInData[] = [];
    
    // Aplicar filtro baseado no período selecionado
    switch (value) {
      case '7dias':
        // Filtrar check-ins dos últimos 7 dias
        filteredData = checkIns.filter(checkin => {
          const checkinDate = new Date(checkin.createdAt);
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          return checkinDate >= sevenDaysAgo;
        });
        break;
        
      case '15dias':
        // Filtrar check-ins dos últimos 15 dias
        filteredData = checkIns.filter(checkin => {
          const checkinDate = new Date(checkin.createdAt);
          const fifteenDaysAgo = new Date(now);
          fifteenDaysAgo.setDate(now.getDate() - 15);
          return checkinDate >= fifteenDaysAgo;
        });
        break;
        
      case '40dias':
        // Filtrar check-ins dos últimos 40 dias
        filteredData = checkIns.filter(checkin => {
          const checkinDate = new Date(checkin.createdAt);
          const fortyDaysAgo = new Date(now);
          fortyDaysAgo.setDate(now.getDate() - 40);
          return checkinDate >= fortyDaysAgo;
        });
        break;
        
      case 'todos':
      default:
        // Usar todos os check-ins disponíveis
        filteredData = [...checkIns];
        break;
    }
    
    // Recalcular estatísticas com os dados filtrados
    processStats(filteredData);
    setLoading(false);
  };

  // Mostrar loading enquanto os dados são buscados
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 space-y-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Dashboard de Check-ins</h1>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={filter} onValueChange={handleFilterChange} >
            <SelectTrigger className="h-9 text-sm">
              <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7dias">Últimos 7 dias</SelectItem>
              <SelectItem value="15dias">Últimos 15 dias</SelectItem>
              <SelectItem value="40dias">Últimos 40 dias</SelectItem>
              <SelectItem value="todos">Todos os registros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Total</CardTitle>
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg sm:text-xl font-bold">{stats.total}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Check-ins registrados</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg sm:text-xl font-bold">{stats.today}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {format(new Date(), "dd/MM", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Novos</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg sm:text-xl font-bold">{stats.newUsers}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Primeira visita</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Retornos</CardTitle>
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg sm:text-xl font-bold">{stats.returningUsers}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Participantes ativos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full text-xs">
        <TabsList className="grid grid-cols-4 h-9 mb-4 text-xs">
          <TabsTrigger className="text-xs px-2"   value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger className="text-xs px-2" value="horarios">Horários</TabsTrigger>
          <TabsTrigger className="text-xs px-2" value="igrejas">Igrejas</TabsTrigger>
          <TabsTrigger className="text-xs px-2" value="recentes">Recentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="mt-0">
          <Card className="shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Check-ins por Dia da Semana</CardTitle>
              <CardDescription className="text-xs">Distribuição ao longo da semana</CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-4">
              <div className="h-60 md:h-80 w-full p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byDay} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="count" name="Check-ins" fill="#8884d8" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="horarios" className="mt-0">
          <Card className="shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Check-ins por Horário</CardTitle>
              <CardDescription className="text-xs">Distribuição ao longo do dia</CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-4">
              <div className="h-60 md:h-80 w-full p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byHour} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="count" name="Check-ins" fill="#82ca9d" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="igrejas" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium">Distribuição por Igreja</CardTitle>
                <CardDescription className="text-xs">Check-ins por congregação</CardDescription>
              </CardHeader>
              <CardContent className="p-0 md:p-4">
                <div className="h-60 md:h-72 w-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Pie
                        data={stats.byChurch}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="count"
                        label={({ name, percent }) => 
                          percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                        }
                        labelLine={false}
                      >
                        {stats.byChurch.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        wrapperStyle={{ fontSize: 11, paddingLeft: 10 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium">Top Igrejas</CardTitle>
                <CardDescription className="text-xs">Igrejas com mais check-ins</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ScrollArea className="h-52 md:h-64 pr-4">
                  <div className="space-y-3">
                    {stats.byChurch.slice(0, 10).map((church, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <div className="flex items-center">
                          <div 
                            className="w-2 h-2 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-xs font-medium truncate max-w-[160px]">
                            {church.name}
                          </span>
                        </div>
                        <span className="text-xs font-medium">{church.count}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="recentes" className="mt-0">
          <Card className="shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Check-ins Recentes</CardTitle>
              <CardDescription className="text-xs">Últimas presenças registradas</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] md:h-[500px]">
                <div className="px-4">
                  {checkIns.slice(0, 20).map((checkin) => (
                    <div key={checkin.id} className="py-3 border-b border-border last:border-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{checkin.user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{checkin.user.email}</p>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-800 rounded-full shrink-0">
                          {checkin.event.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center mt-2 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{checkin.prayerTurn.startTime} - {checkin.prayerTurn.endTime}</span>
                        <span className="mx-2">•</span>
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{format(new Date(checkin.createdAt), "dd/MM/yyyy HH:mm")}</span>
                      </div>
                    </div>
                  ))}
                  
                  {checkIns.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      Nenhum check-in encontrado
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      
    </div>
  );
}
