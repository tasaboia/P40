"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Users,
  Calendar,
  AlertCircle,
  Download,
  Filter,
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
  UserCog,
  MessageSquareQuote,
  FileText,
  RefreshCcw,
  Info,
  ArrowUpRight,
  Building,
  UserCheck,
  UserMinus,
  UserPlus,
  X,
  BarChart3,
  Clock,
} from "lucide-react";
import { Button } from "@p40/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@p40/components/ui/tabs";
import { Badge } from "@p40/components/ui/badge";
import { Progress } from "@p40/components/ui/progress";
import { Input } from "@p40/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@p40/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@p40/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@p40/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@p40/components/ui/dropdown-menu";
import { ScrollArea } from "@p40/components/ui/scroll-area";
import { toast } from "@p40/hooks/use-toast";
import { DashboardClient } from "@p40/services/dashboard/dashboard-client";
import {
  DashboadLeader,
  LeadersDashboardResponse,
  Shift,
  Stats,
} from "@p40/common/contracts/dashboard/dashboard";
import { RenderShiftStatus } from "./components/render-shift-status";
import { Weekday } from "@p40/common/contracts/week/schedule";
import { Avatar, AvatarFallback, AvatarImage } from "@p40/components/ui";
import { Helpers } from "@p40/common/utils/helpers";
import { TestimonyList } from "@p40/components/custom/dashboard/testimony-list";

interface Leader {
  id: string;
  name: string;
  email: string;
  phone: string;
  church: string;
  shifts: Shift[];
  registeredAt: Date;
}

interface Church {
  id: string;
  name: string;
  location: string;
}

interface EventStats {
  totalLeaders: number;
  totalShifts: number;
  filledShifts: number;
  partialShifts: number;
  emptyShifts: number;
  leadersPercentage: number;
  shiftsPercentage: number;
}

interface Testimony {
  id: string;
  leaderId: string;
  leaderName: string;
  date: Date;
  content: string;
  approved: boolean;
}

interface ShiftReport {
  id: string;
  shiftId: string;
  date: Date;
  leaderId: string;
  leaderName: string;
  attendees: number;
  notes: string;
}

export default function AdminDashboard() {
  const dashboardClient = new DashboardClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<Stats>(null);
  const [leaders, setLeaders] = useState<DashboadLeader[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [singleLeaderShifts, setSingleLeaderShifts] = useState<Shift[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [reports, setReports] = useState<ShiftReport[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSingleLeaderShifts, setShowSingleLeaderShifts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [churchFilter, setChurchFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("0");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const csvLinkRef = useRef<HTMLAnchorElement>(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          statsData,
          eventsData,
          weekdayData,
          activitiesData,
          shiftsData,
          singleLeaderShiftsData,
          leadersData,
          testemunyData,
        ] = await Promise.all([
          dashboardClient.getStats(),
          dashboardClient.getEventStats(),
          dashboardClient.getWeekdayDistribution(),
          dashboardClient.getRecentActivity(),
          dashboardClient.getEventTurns(),
          dashboardClient.getSingleLeaderAndEmptyShifts(),
          dashboardClient.getEventLeaders(),
          dashboardClient.getTestemuny(),
        ]);

        setStats(statsData.data);
        setEvents(eventsData);
        setShifts(shiftsData.data);
        setSingleLeaderShifts(singleLeaderShiftsData.data);
        setLeaders(leadersData.data);
        setTestimonies(testemunyData.data);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredShifts = shifts.filter((shift) => {
    const searchMatch =
      searchTerm === "" ||
      shift.leaders.some((leader) =>
        leader.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      shift.startTime.includes(searchTerm) ||
      shift.endTime.includes(searchTerm);

    // const churchMatch =
    //   churchFilter === "all" ||
    //   shift.leaders.some((leader) => {
    //     const leaderFull = leaders.find((l) => l.id === leader.id);
    //     return leaderFull?.church === churchFilter;
    //   });

    let weekdayMatch = true;
    if (dateFilter !== "all") {
      weekdayMatch = shift.weekday === parseInt(dateFilter);
    }

    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "empty" && shift.status === "empty") ||
      (statusFilter === "partial" && shift.status === "partial") ||
      (statusFilter === "full" && shift.status === "full");

    return searchMatch && weekdayMatch && statusMatch; //churchMatch
  });

  const exportToCSV = () => {
    const headers = ["Dia da Semana", "Horário", "Status", "Líderes", "Igreja"];

    const csvData = filteredShifts.map((shift) => {
      const time = `${shift.startTime} - ${shift.endTime}`;
      const weekday = shift.weekday;
      const status =
        shift.status === "empty"
          ? "Vazio"
          : shift.status === "partial"
          ? "Parcial"
          : "Completo";
      const leaderNames = shift.leaders.map((leader) => leader.name).join(", ");
      const churchNames = shift.leaders
        .map((leader) => {
          const leaderFull = leaders.find((l) => l.id === leader.id);
          // Verifica se o líder foi encontrado antes de acessar a propriedade 'church'
          return leaderFull && leaderFull.church ? leaderFull.church.name : "";
        })
        .filter((name) => name !== "")
        .join(", ");

      return [weekday, time, status, leaderNames, churchNames];
    });

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    if (csvLinkRef.current) {
      csvLinkRef.current.href = url;
      csvLinkRef.current.download = `relatorio-turnos-${format(
        new Date(),
        "dd-MM-yyyy"
      )}.csv`;
      csvLinkRef.current.click();
    }

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  const exportLeadersToCSV = () => {
    const headers = ["Nome", "Email", "WhatsApp", "Igreja"];

    const csvData = leaders.map((leader) => {
      const churchName = leader.church?.name || ""; // Usar o nome da igreja do líder
      return [leader.name, leader.email, leader.whatsapp, churchName];
    });

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    if (csvLinkRef.current) {
      csvLinkRef.current.href = url;
      csvLinkRef.current.download = `relatorio-lideres-${format(
        new Date(),
        "dd-MM-yyyy"
      )}.csv`;
      csvLinkRef.current.click();
    }

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  const exportTestimoniesToCSV = () => {
    const headers = ["Líder", "Data", "Conteúdo", "Aprovado"];

    const csvData = testimonies.map((testimony) => {
      return [
        testimony.leaderName, // Certifique-se de que o nome do líder esteja incluído no testemunho
        format(testimony.date, "dd/MM/yyyy"),
        testimony.content,
        testimony.approved ? "Sim" : "Não",
      ];
    });

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    if (csvLinkRef.current) {
      csvLinkRef.current.href = url;
      csvLinkRef.current.download = `relatorio-testemunhos-${format(
        new Date(),
        "dd-MM-yyyy"
      )}.csv`;
      csvLinkRef.current.click();
    }

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  const getRecommendedShifts = () => {
    const emptyShifts = shifts.filter((shift) => shift.status === "empty");
    const partialShifts = shifts.filter((shift) => shift.status === "partial");

    const nightEmptyShifts = emptyShifts.filter((shift) => {
      const hour = Number.parseInt(shift.startTime.split(":")[0]);
      return hour >= 0 && hour <= 5; // Horários entre 00:00 e 05:00
    });

    const singleLeaderShifts = partialShifts.filter(
      (shift) => shift.leaders.length === 1
    );

    // Combinar recomendações:
    // 1. Começar pelos turnos vazios da madrugada
    // 2. Depois, considerar turnos com apenas um líder
    // 3. Incluir turnos vazios durante a semana (exceto madrugadas)
    const recommended = [
      ...nightEmptyShifts.slice(0, 5),
      ...singleLeaderShifts.slice(0, 5),
      ...emptyShifts
        .filter(
          (shift) =>
            !nightEmptyShifts.includes(shift) && shift.leaders.length === 0
        )
        .slice(0, 5),
    ];

    return recommended.slice(0, 10);
  };

  // const getLeaderChurch = (leaderId: string) => {
  //   const leader = leaders.find((l) => l.id === leaderId);
  //   if (!leader) return "";

  //   const church = churches.find((c) => c.id === leader.church);
  //   return church?.name || "";
  // };

  // Approve testimony
  const handleApproveTestimony = (testimonyId: string) => {
    setTestimonies((prevTestimonies) =>
      prevTestimonies.map((t) =>
        t.id === testimonyId ? { ...t, approved: true } : t
      )
    );

    toast({
      title: "Testemunho aprovado",
      description: "O testemunho foi aprovado com sucesso.",
    });
  };

  // Reject testimony
  const handleRejectTestimony = (testimonyId: string) => {
    // In a real app, you might want to add a reason for rejection
    // Here we'll just remove the testimony
    setTestimonies((prevTestimonies) =>
      prevTestimonies.filter((t) => t.id !== testimonyId)
    );

    toast({
      title: "Testemunho recusado",
      description: "O testemunho foi recusado e removido.",
    });
  };

  // Export testimonies to CSV
  const handleExportTestimonies = () => {
    // Headers for the CSV
    const headers = ["Líder", "Data", "Conteúdo", "Status"];

    // Format data for CSV
    const csvData = testimonies.map((testimony) => {
      const leader = testimony.leaderName;
      const date = format(testimony.date, "dd/MM/yyyy");
      const content = `"${testimony.content.replace(/"/g, '""')}"`; // Escape quotes for CSV
      const status = testimony.approved ? "Aprovado" : "Pendente";

      return [leader, date, content, status];
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    if (csvLinkRef.current) {
      csvLinkRef.current.href = url;
      csvLinkRef.current.download = `testemunhos-oracao-${format(
        new Date(),
        "dd-MM-yyyy"
      )}.csv`;
      csvLinkRef.current.click();
    }

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);

    toast({
      title: "Exportação concluída",
      description: "Os testemunhos foram exportados com sucesso.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-primary"></div>
          <p className="text-sm md:text-base text-muted-foreground">
            Carregando Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-3 md:px-6 py-4 md:py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Dashboard Administrativo
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              40 Dias de Oração - Visão geral e estatísticas
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
            {/* <Select value={churchFilter} onValueChange={setChurchFilter}>
              <SelectTrigger className="w-full md:w-[180px] h-9">
                <SelectValue placeholder="Filtrar por igreja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as igrejas</SelectItem>
                {churches.map((church) => (
                  <SelectItem key={church.id} value={church.id}>
                    {church.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}

            <div className="flex gap-2 ml-auto md:ml-0">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => window.location.reload()}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9">
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Exportar dados</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar para CSV
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                    <Calendar className="h-4 w-4 mr-2" />
                    Relatório completo
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <a ref={csvLinkRef} style={{ display: "none" }} />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="grid grid-cols-5 w-full ">
              <TabsTrigger value="overview" className="text-xs md:text-sm">
                <BarChart3 className="h-4 w-4 mr-1 md:mr-2" />
                <span>Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="shifts" className="text-xs md:text-sm">
                <Clock className="h-4 w-4 mr-1 md:mr-2" />
                <span>Turnos</span>
              </TabsTrigger>
              <TabsTrigger value="leaders" className="text-xs md:text-sm">
                <Users className="h-4 w-4 mr-1 md:mr-2" />
                <span>Líderes</span>
              </TabsTrigger>
              <TabsTrigger value="testimonies" className="text-xs md:text-sm">
                <FileText className="h-4 w-4 mr-1 md:mr-2" />
                <span>Testemunhos</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-xs md:text-sm">
                <FileText className="h-4 w-4 mr-1 md:mr-2" />
                <span>Relatórios</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Líderes Inscritos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">
                      {stats?.totalLeaders || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Meta mínima: {stats.totalPrayerTurns}
                    </div>
                  </div>
                  <Progress
                    value={Math.round(
                      ((stats?.totalLeaders || 0) /
                        (stats?.totalPrayerTurns || 1)) *
                        100
                    )}
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round(
                      ((stats?.totalLeaders || 0) /
                        (stats?.totalPrayerTurns || 1)) *
                        100
                    ) ?? 0}
                    % da meta atingida
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Horários Preenchidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">
                      {stats?.filledPrayerTurns || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total: {stats?.totalPrayerTurns || 0}
                    </div>
                  </div>
                  <Progress
                    value={stats.shiftsPercentage}
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round(
                      ((stats?.filledPrayerTurns || 0) /
                        (stats?.totalPrayerTurns || 1)) *
                        100
                    )}
                    % dos horários completos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Horários com Só Um Líder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">
                      {stats?.partialPrayerTurns || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total: {stats?.totalPrayerTurns || 0}
                    </div>
                  </div>
                  <Progress
                    value={
                      ((stats?.partialPrayerTurns || 0) /
                        (stats?.totalPrayerTurns || 1)) *
                      100
                    }
                    className="h-2 mt-2"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-muted-foreground">
                      {Math.round(
                        ((stats?.partialPrayerTurns || 0) /
                          (stats?.totalPrayerTurns || 1)) *
                          100
                      )}
                      % dos horários
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setShowSingleLeaderShifts(true)}
                    >
                      Ver detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Horários Vazios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">
                      {stats?.emptyPrayerTurns || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total: {stats?.totalPrayerTurns || 0}
                    </div>
                  </div>
                  <Progress
                    value={
                      ((stats?.emptyPrayerTurns || 0) /
                        (stats?.totalPrayerTurns || 1)) *
                      100
                    }
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round(
                      ((stats?.emptyPrayerTurns || 0) /
                        (stats?.totalPrayerTurns || 1)) *
                        100
                    )}
                    % dos horários sem líderes
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Distribuição de Horários</CardTitle>
                  <CardDescription>
                    Visão geral da ocupação dos turnos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-auto md:h-[300px] flex flex-col md:flex-row items-center justify-center gap-6 py-4">
                    <div className="w-full md:flex-1 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Completos</span>
                        <span className="font-medium">
                          {stats?.filledPrayerTurns || 0}
                        </span>
                      </div>
                      <div className="h-5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success"
                          style={{
                            width: `${
                              ((stats?.filledPrayerTurns || 0) /
                                (stats?.totalPrayerTurns || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Parciais</span>
                        <span className="font-medium">
                          {stats?.partialPrayerTurns || 0}
                        </span>
                      </div>
                      <div className="h-5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warning"
                          style={{
                            width: `${
                              ((stats?.partialPrayerTurns || 0) /
                                (stats?.totalPrayerTurns || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Vazios</span>
                        <span className="font-medium">
                          {stats?.emptyPrayerTurns || 0}
                        </span>
                      </div>
                      <div className="h-5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-destructive"
                          style={{
                            width: `${
                              ((stats?.emptyPrayerTurns || 0) /
                                (stats?.totalPrayerTurns || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl font-bold">
                            {Math.round(stats?.shiftsPercentage || 0)}%
                          </div>
                          <div className="text-xs md:text-sm text-muted-foreground">
                            Preenchimento
                          </div>
                        </div>
                      </div>
                      <svg width="100%" height="100%" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="10"
                          strokeDasharray="251.2"
                          strokeDashoffset={
                            251.2 -
                            (251.2 * (stats?.shiftsPercentage || 0)) / 100
                          }
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Horários Recomendados</CardTitle>
                  <CardDescription>Sugestões para priorizar</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[300px]">
                    <div className="px-4 py-2">
                      {getRecommendedShifts().map((shift) => {
                        return (
                          <div
                            key={shift.id}
                            className="py-2 border-b last:border-0 flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium">
                                {Weekday[shift.weekday]} • {shift.startTime} -{" "}
                                {shift.endTime}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {shift.status === "empty"
                                  ? "Sem líderes"
                                  : `${shift.leaders.length} líder(es)`}
                              </div>
                            </div>
                            <RenderShiftStatus status={shift.status} />
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
                {/* <CardFooter className="border-t px-4 py-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Líderes
                  </Button>
                </CardFooter> */}
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Testemunhos Recentes</CardTitle>
                  <CardDescription>
                    Relatos dos líderes durante os turnos
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => setActiveTab("testimonies")}
                >
                  <span>Ver todos</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testimonies
                    .filter((testimony) => testimony.approved)
                    .slice(0, 3)
                    .map((testimony) => (
                      <div
                        key={testimony.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm md:text-base">
                            {testimony.leaderName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(testimony.date, "dd/MM/yyyy")}
                          </div>
                        </div>
                        <p className="text-xs md:text-sm line-clamp-3">
                          {testimony.content}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MessageSquareQuote className="h-3 w-3 mr-1" />
                          <span>Testemunho aprovado</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shifts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Turnos</CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os turnos do evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4">
                  {/* <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por líder, data ou horário..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div> */}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={() =>
                        setShowSingleLeaderShifts(!showSingleLeaderShifts)
                      }
                    >
                      {showSingleLeaderShifts ? "Mostrar Todos" : "Só Um Líder"}
                    </Button>

                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="h-9 flex-1 ">
                        <Calendar className="h-4 w-4 mr-2 md:mr-1" />
                        <SelectValue placeholder="Data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value={"0"}>Domingo</SelectItem>
                        <SelectItem value={"1"}>Segunda</SelectItem>
                        <SelectItem value={"2"}>Terça</SelectItem>
                        <SelectItem value="3">Quarta</SelectItem>
                        <SelectItem value="4">Quinta</SelectItem>
                        <SelectItem value="5">Sexta</SelectItem>
                        <SelectItem value="6">Sábado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="h-9 flex-1 min-w-[120px]">
                        <AlertCircle className="h-4 w-4 mr-2 md:mr-1" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="empty">Vazios</SelectItem>
                        <SelectItem value="partial">Parciais</SelectItem>
                        <SelectItem value="full">Completos</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 ml-auto"
                      onClick={() => {
                        setSearchTerm("");
                        setDateFilter("all");
                        setStatusFilter("all");
                        setChurchFilter("all");
                        setShowSingleLeaderShifts(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border overflow-hidden">
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dias da Semana</TableHead>
                          <TableHead>Horário</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Líderes</TableHead>
                          {/* <TableHead className="text-right">Ações</TableHead> */}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(showSingleLeaderShifts
                          ? singleLeaderShifts
                          : filteredShifts
                        )
                          .slice(0, 10)
                          .map((shift) => (
                            <TableRow key={shift.id}>
                              <TableCell>
                                <div className="font-medium">
                                  {Helpers.getWeekdayName(shift.weekday)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {shift.startTime} - {shift.endTime}
                              </TableCell>
                              <TableCell>
                                <RenderShiftStatus status={shift.status} />
                              </TableCell>
                              <TableCell>
                                {shift.leaders.length > 0 ? (
                                  <div className="space-y-1">
                                    {shift.leaders.map((leader) => (
                                      <div
                                        key={leader.id}
                                        className="flex items-center space-x-1"
                                      >
                                        <Badge
                                          variant="outline"
                                          className="text-xs py-0 px-1"
                                        >
                                          <UserCheck className="h-3 w-3 mr-1" />
                                          {leader.name}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {/* {getLeaderChurch(leader.id)} */}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">
                                    Sem líderes designados
                                  </div>
                                )}
                              </TableCell>
                              {/* <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <UserPlus className="h-4 w-4 mr-2" />
                                      Adicionar líder
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <UserMinus className="h-4 w-4 mr-2" />
                                      Remover líder
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <MessageSquareQuote className="h-4 w-4 mr-2" />
                                      Ver relatórios
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell> */}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="md:hidden">
                    {(showSingleLeaderShifts
                      ? singleLeaderShifts
                      : filteredShifts
                    )
                      .slice(0, 10)
                      .map((shift) => (
                        <div
                          key={shift.id}
                          className="p-4 border-b last:border-b-0"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium text-sm">
                                {Helpers.getWeekdayName(shift.weekday)}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <RenderShiftStatus status={shift.status} />
                              {/* 
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 ml-1"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Adicionar líder
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Remover líder
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <MessageSquareQuote className="h-4 w-4 mr-2" />
                                    Ver relatórios
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu> */}
                            </div>
                          </div>

                          <div className="flex items-center text-sm mb-2">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>
                              {shift.startTime} - {shift.endTime}
                            </span>
                          </div>

                          <div className="mt-2">
                            <div className="text-xs font-medium mb-1">
                              Líderes:
                            </div>
                            {shift.leaders.length > 0 ? (
                              <div className="space-y-1">
                                {shift.leaders.map((leader) => (
                                  <div
                                    key={leader.id}
                                    className="flex items-center space-x-1"
                                  >
                                    <Badge
                                      variant="outline"
                                      className="text-xs py-0 px-1"
                                    >
                                      <UserCheck className="h-3 w-3 mr-1" />
                                      {leader.name}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {/* {getLeaderChurch(leader.id)} */}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                Sem líderes designados
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando{" "}
                    {Math.min(
                      10,
                      (showSingleLeaderShifts
                        ? singleLeaderShifts
                        : filteredShifts
                      ).length
                    )}{" "}
                    de{" "}
                    {
                      (showSingleLeaderShifts
                        ? singleLeaderShifts
                        : filteredShifts
                      ).length
                    }{" "}
                    turnos
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm">
                      Próximo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Líderes Inscritos</CardTitle>
                <CardDescription>
                  Gerenciamento de líderes e suas atribuições
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por nome, email ou igreja..."
                      className="pl-8"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por igreja" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as igrejas</SelectItem>
                        {churches.map((church) => (
                          <SelectItem key={church.id} value={church.id}>
                            {church.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select> */}

                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Mais filtros
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Igreja</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Turnos</TableHead>
                        {/* <TableHead className="text-right">Ações</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaders.slice(0, 10).map((leader) => (
                        <TableRow key={leader.id}>
                          <TableCell>
                            <div className="font-medium">{leader.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Registrado em{" "}
                              {/* {format(leader.registeredAt, "dd/MM/yyyy")} */}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{leader.church.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{leader.email}</div>
                            <div className="text-xs text-muted-foreground">
                              {leader.whatsapp}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge>{leader.userShifts.length}</Badge>
                          </TableCell>
                          {/* <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <UserCog className="h-4 w-4 mr-2" />
                                  Editar líder
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Ver turnos
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <MessageSquareQuote className="h-4 w-4 mr-2" />
                                  Testemunhos
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando 10 de {leaders.length} líderes
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm">
                      Próximo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="testimonies" className="mt-0">
            <TestimonyList
              testimonies={testimonies}
              onApproveTestimony={handleApproveTestimony}
              onRejectTestimony={handleRejectTestimony}
            />
          </TabsContent>
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Testemunhos</CardTitle>
                <CardDescription>
                  Relatos dos líderes durante os turnos de oração
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {testimonies.map((testimony) => (
                      <div
                        key={testimony.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {testimony.leaderName}
                          </div>
                          <Badge
                            variant={
                              testimony.approved ? "outline" : "secondary"
                            }
                            className={
                              testimony.approved
                                ? "bg-success/10 text-success"
                                : ""
                            }
                          >
                            {testimony.approved ? "Aprovado" : "Pendente"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(testimony.date, "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </div>
                        <p className="text-sm">{testimony.content}</p>
                        {!testimony.approved && (
                          <div className="flex space-x-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              Aprovar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-destructive"
                            >
                              Recusar
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            {/*

              <Card>
                <CardHeader>
                  <CardTitle>Relatórios de Turno</CardTitle>
                  <CardDescription>
                    Informações reportadas pelos líderes após cada turno
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">
                              {format(report.date, "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </div>
                            <Badge variant="outline" className="bg-primary/10">
                              <Users className="h-3 w-3 mr-1" />
                              {report.attendees} participantes
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Reportado por: {report.leaderName}
                          </div>
                          <p className="text-sm">{report.notes}</p>
                          <div className="flex items-center text-xs text-muted-foreground pt-1">
                            <Info className="h-3 w-3 mr-1" />
                            <span>Relatório do turno</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>*/}
            {/* <Card>
              <CardHeader>
                <CardTitle>Exportar Dados</CardTitle>
                <CardDescription>
                  Gere relatórios e exporte dados para análise externa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={exportToCSV}
                    className="flex items-center justify-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar Turnos (CSV)
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Exportar Líderes (CSV)
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center"
                  >
                    <MessageSquareQuote className="h-4 w-4 mr-2" />
                    Exportar Testemunhos (CSV)
                  </Button>
                </div>
              </CardContent>
            </Card> */}
            <Card>
              <CardHeader>
                <CardTitle>Exportar Dados</CardTitle>
                <CardDescription>
                  Gere relatórios e exporte dados para análise externa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={exportToCSV} // Exportar turnos
                    className="flex items-center justify-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar Turnos (CSV)
                  </Button>
                  <Button
                    onClick={exportLeadersToCSV} // Exportar líderes
                    variant="outline"
                    className="flex items-center justify-center"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Exportar Líderes (CSV)
                  </Button>
                  <Button
                    onClick={exportTestimoniesToCSV} // Exportar testemunhos
                    variant="outline"
                    className="flex items-center justify-center"
                  >
                    <MessageSquareQuote className="h-4 w-4 mr-2" />
                    Exportar Testemunhos (CSV)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog
          open={showSingleLeaderShifts}
          onOpenChange={setShowSingleLeaderShifts}
        >
          <DialogContent className="max-w-4xl w-[95vw] p-4 md:p-6">
            <DialogHeader>
              <DialogTitle>Horários com Apenas Um Líder</DialogTitle>
              <DialogDescription>
                Estes horários precisam de mais um líder para estarem completos
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="rounded-md border overflow-hidden">
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dia da Semana</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead>Líder Atual</TableHead>
                        {/* <TableHead className="text-right">Ações</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {singleLeaderShifts.slice(0, 10).map((shift) => (
                        <TableRow key={shift.id}>
                          <TableCell>
                            <div className="font-medium">
                              {Helpers.getWeekdayName(shift.weekday)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {shift.startTime} - {shift.endTime}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2  items-center font-medium">
                              <Avatar className="h-8 w-8 rounded-full">
                                <AvatarImage src={shift.leaders[0].imageUrl} />
                                <AvatarFallback className="rounded-full">
                                  {Helpers.getInitials(shift.leaders[0].name)}
                                </AvatarFallback>
                              </Avatar>
                              {shift.leaders[0]?.name || "Sem líder"}
                            </div>
                          </TableCell>
                          {/*  precisa criar a funcionalidade para adicionar lider */}
                          {/* <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Adicionar Líder
                            </Button>
                          </TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="md:hidden">
                  {singleLeaderShifts.slice(0, 10).map((shift) => (
                    <div
                      key={shift.id}
                      className="p-3 border-b last:border-b-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-sm">
                            {Helpers.getWeekdayName(shift.weekday)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Weekday[shift.weekday]}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-warning/10 text-warning border-warning/20"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Parcial
                        </Badge>
                      </div>

                      <div className="flex items-center text-sm mb-2">
                        <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>
                          {shift.startTime} - {shift.endTime}
                        </span>
                      </div>

                      <div className="flex items-center text-sm mb-2">
                        <UserCheck className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>{shift.leaders[0]?.name || "Sem líder"}</span>
                      </div>

                      <div className="flex items-center text-xs text-muted-foreground mb-3">
                        <Building className="h-3 w-3 mr-1" />
                        <span>
                          aqui
                          {/* {getLeaderChurch(shift.leaders[0]?.id || "")} */}
                        </span>
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Líder
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-4">
                <div className="text-xs md:text-sm text-muted-foreground">
                  Mostrando 10 de {singleLeaderShifts.length} turnos com apenas
                  um líder
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm">
                    Próximo
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSingleLeaderShifts(false)}
                className="w-full sm:w-auto"
              >
                Fechar
              </Button>
              <Button onClick={exportToCSV} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Exportar Lista (CSV)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
