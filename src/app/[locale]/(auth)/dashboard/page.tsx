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

interface Leader {
  id: string;
  name: string;
  email: string;
  phone: string;
  church: string;
  shifts: Shift[];
  registeredAt: Date;
}

interface Shift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  leaders: Leader[];
  status: "empty" | "partial" | "full";
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

// Componente principal
export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<EventStats | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [singleLeaderShifts, setSingleLeaderShifts] = useState<Shift[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [reports, setReports] = useState<ShiftReport[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSingleLeaderShifts, setShowSingleLeaderShifts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [churchFilter, setChurchFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const csvLinkRef = useRef<HTMLAnchorElement>(null);

  // Carregar dados simulados
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simular carregamento de dados
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Dados simulados de igrejas
        const mockChurches: Church[] = [
          { id: "1", name: "Igreja Zion Central", location: "São Paulo" },
          { id: "2", name: "Igreja Zion Norte", location: "São Paulo" },
          { id: "3", name: "Igreja Zion Sul", location: "São Paulo" },
        ];

        // Dados simulados de líderes
        const mockLeaders: Leader[] = Array.from({ length: 85 }, (_, i) => {
          const churchIndex = Math.floor(Math.random() * mockChurches.length);
          return {
            id: `leader-${i + 1}`,
            name: `Líder ${i + 1}`,
            email: `lider${i + 1}@exemplo.com`,
            phone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(
              Math.random() * 10000
            )}`,
            church: mockChurches[churchIndex].id,
            shifts: [],
            registeredAt: new Date(2024, 2, Math.floor(Math.random() * 30) + 1),
          };
        });

        // Dados simulados de turnos
        const startDate = new Date(2024, 3, 1); // 1 de abril de 2024
        const mockShifts: Shift[] = [];

        // Criar turnos para 40 dias, 24 horas por dia, turnos de 1 hora
        for (let day = 0; day < 40; day++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + day);

          for (let hour = 0; hour < 24; hour++) {
            const startTime = `${hour.toString().padStart(2, "0")}:00`;
            const endTime = `${((hour + 1) % 24)
              .toString()
              .padStart(2, "0")}:00`;

            // Distribuir líderes aleatoriamente
            const randomLeaders: Leader[] = [];
            const maxLeaders = 2; // Máximo de líderes por turno

            // Decidir quantos líderes terá este turno (0, 1 ou 2)
            const leaderCount = Math.floor(Math.random() * 3);

            // Selecionar líderes aleatórios
            if (leaderCount > 0) {
              const availableLeaders = [...mockLeaders];
              for (
                let i = 0;
                i < leaderCount && availableLeaders.length > 0;
                i++
              ) {
                const randomIndex = Math.floor(
                  Math.random() * availableLeaders.length
                );
                randomLeaders.push(availableLeaders[randomIndex]);
                availableLeaders.splice(randomIndex, 1);
              }
            }

            // Determinar o status do turno
            let status: "empty" | "partial" | "full" = "empty";
            if (randomLeaders.length === maxLeaders) {
              status = "full";
            } else if (randomLeaders.length > 0) {
              status = "partial";
            }

            const shift: Shift = {
              id: `shift-${day}-${hour}`,
              date: currentDate,
              startTime,
              endTime,
              leaders: randomLeaders,
              status,
            };

            mockShifts.push(shift);

            // Adicionar o turno aos líderes
            randomLeaders.forEach((leader) => {
              const leaderIndex = mockLeaders.findIndex(
                (l) => l.id === leader.id
              );
              if (leaderIndex !== -1) {
                mockLeaders[leaderIndex].shifts.push(shift);
              }
            });
          }
        }

        // Encontrar turnos com apenas um líder
        const mockSingleLeaderShifts = mockShifts.filter(
          (shift) => shift.leaders.length === 1
        );

        // Dados simulados de testemunhos
        const mockTestimonies: Testimony[] = Array.from(
          { length: 15 },
          (_, i) => {
            const randomLeaderIndex = Math.floor(
              Math.random() * mockLeaders.length
            );
            return {
              id: `testimony-${i + 1}`,
              leaderId: mockLeaders[randomLeaderIndex].id,
              leaderName: mockLeaders[randomLeaderIndex].name,
              date: new Date(2024, 3, Math.floor(Math.random() * 30) + 1),
              content: `Este é um testemunho de como a oração impactou minha vida e a vida de outras pessoas. ${
                i % 2 === 0
                  ? "Deus é fiel!"
                  : "Muitas vidas foram transformadas durante este tempo de oração."
              }`,
              approved: Math.random() > 0.3, // 70% aprovados
            };
          }
        );

        // Dados simulados de relatórios
        const mockReports: ShiftReport[] = Array.from(
          { length: 25 },
          (_, i) => {
            const randomShiftIndex = Math.floor(
              Math.random() * mockShifts.length
            );
            const randomShift = mockShifts[randomShiftIndex];
            const randomLeader = randomShift.leaders[0] || mockLeaders[0];
            return {
              id: `report-${i + 1}`,
              shiftId: randomShift.id,
              date: randomShift.date,
              leaderId: randomLeader.id,
              leaderName: randomLeader.name,
              attendees: Math.floor(Math.random() * 10) + 1,
              notes: `Relatório do turno de oração. ${
                i % 2 === 0
                  ? "Tivemos um bom tempo de intercessão."
                  : "Várias pessoas compartilharam pedidos de oração."
              }`,
            };
          }
        );

        // Calcular estatísticas
        const totalLeaders = mockLeaders.length;
        const totalShifts = mockShifts.length;
        const filledShifts = mockShifts.filter(
          (shift) => shift.status === "full"
        ).length;
        const partialShifts = mockShifts.filter(
          (shift) => shift.status === "partial"
        ).length;
        const emptyShifts = mockShifts.filter(
          (shift) => shift.status === "empty"
        ).length;
        const leadersPercentage = (totalLeaders / 120) * 100; // Supondo uma meta de 120 líderes
        const shiftsPercentage =
          ((filledShifts + partialShifts) / totalShifts) * 100;

        const mockStats: EventStats = {
          totalLeaders,
          totalShifts,
          filledShifts,
          partialShifts,
          emptyShifts,
          leadersPercentage,
          shiftsPercentage,
        };

        // Atualizar o estado
        setChurches(mockChurches);
        setLeaders(mockLeaders);
        setShifts(mockShifts);
        setSingleLeaderShifts(mockSingleLeaderShifts);
        setTestimonies(mockTestimonies);
        setReports(mockReports);
        setStats(mockStats);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setIsLoading(false);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do dashboard",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

  // Filtrar turnos
  const filteredShifts = shifts.filter((shift) => {
    // Filtro de busca
    const searchMatch =
      searchTerm === "" ||
      shift.leaders.some((leader) =>
        leader.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      format(shift.date, "dd/MM/yyyy").includes(searchTerm) ||
      shift.startTime.includes(searchTerm) ||
      shift.endTime.includes(searchTerm);

    // Filtro de igreja
    const churchMatch =
      churchFilter === "all" ||
      shift.leaders.some((leader) => {
        const leaderFull = leaders.find((l) => l.id === leader.id);
        return leaderFull?.church === churchFilter;
      });

    // Filtro de data
    let dateMatch = true;
    if (dateFilter !== "all") {
      const today = new Date();
      const shiftDate = new Date(shift.date);

      if (dateFilter === "today") {
        dateMatch =
          shiftDate.getDate() === today.getDate() &&
          shiftDate.getMonth() === today.getMonth() &&
          shiftDate.getFullYear() === today.getFullYear();
      } else if (dateFilter === "tomorrow") {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        dateMatch =
          shiftDate.getDate() === tomorrow.getDate() &&
          shiftDate.getMonth() === tomorrow.getMonth() &&
          shiftDate.getFullYear() === tomorrow.getFullYear();
      } else if (dateFilter === "thisWeek") {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        dateMatch = shiftDate >= startOfWeek && shiftDate <= endOfWeek;
      }
    }

    // Filtro de status
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "empty" && shift.status === "empty") ||
      (statusFilter === "partial" && shift.status === "partial") ||
      (statusFilter === "full" && shift.status === "full");

    return searchMatch && churchMatch && dateMatch && statusMatch;
  });

  // Exportar para CSV
  const exportToCSV = () => {
    // Cabeçalhos do CSV
    const headers = ["Data", "Horário", "Status", "Líderes", "Igreja"];

    // Dados formatados para CSV
    const csvData = filteredShifts.map((shift) => {
      const date = format(shift.date, "dd/MM/yyyy");
      const time = `${shift.startTime} - ${shift.endTime}`;
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
          const church = churches.find((c) => c.id === leaderFull?.church);
          return church?.name || "";
        })
        .filter((name) => name !== "")
        .join(", ");

      return [date, time, status, leaderNames, churchNames];
    });

    // Combinar cabeçalhos e dados
    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Criar link e clicar nele para iniciar o download
    if (csvLinkRef.current) {
      csvLinkRef.current.href = url;
      csvLinkRef.current.download = `relatorio-turnos-${format(
        new Date(),
        "dd-MM-yyyy"
      )}.csv`;
      csvLinkRef.current.click();
    }

    // Limpar URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Recomendar horários
  const getRecommendedShifts = () => {
    // Lógica para recomendar horários com base em vários critérios
    // 1. Priorizar horários vazios
    // 2. Depois, horários com apenas um líder
    // 3. Considerar distribuição ao longo da semana

    const emptyShifts = shifts.filter((shift) => shift.status === "empty");
    const partialShifts = shifts.filter((shift) => shift.status === "partial");

    // Priorizar horários noturnos vazios (geralmente mais difíceis de preencher)
    const nightEmptyShifts = emptyShifts.filter((shift) => {
      const hour = Number.parseInt(shift.startTime.split(":")[0]);
      return hour >= 22 || hour <= 5;
    });

    // Priorizar fins de semana com apenas um líder
    const weekendPartialShifts = partialShifts.filter((shift) => {
      const day = shift.date.getDay();
      return day === 0 || day === 6; // 0 = domingo, 6 = sábado
    });

    // Combinar recomendações (limitando a 5 de cada categoria)
    const recommended = [
      ...nightEmptyShifts.slice(0, 5),
      ...weekendPartialShifts.slice(0, 5),
      ...emptyShifts
        .filter((shift) => !nightEmptyShifts.includes(shift))
        .slice(0, 5),
    ];

    return recommended.slice(0, 10); // Limitar a 10 recomendações no total
  };

  // Renderizar status do turno
  const renderShiftStatus = (status: string) => {
    switch (status) {
      case "empty":
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Vazio
          </Badge>
        );
      case "partial":
        return (
          <Badge
            variant="outline"
            className="bg-warning/10 text-warning border-warning/20"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Parcial
          </Badge>
        );
      case "full":
        return (
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success/20"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completo
          </Badge>
        );
      default:
        return null;
    }
  };

  // Renderizar igreja do líder
  const getLeaderChurch = (leaderId: string) => {
    const leader = leaders.find((l) => l.id === leaderId);
    if (!leader) return "";

    const church = churches.find((c) => c.id === leader.church);
    return church?.name || "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-primary"></div>
          <p className="text-sm md:text-base text-muted-foreground">
            Carregando dashboard...
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Preparando estatísticas e dados do evento 40 Dias de Oração
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
            <Select value={churchFilter} onValueChange={setChurchFilter}>
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
            </Select>

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
                  <DropdownMenuItem>
                    <Calendar className="h-4 w-4 mr-2" />
                    Relatório completo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Link oculto para download de CSV */}
        <a ref={csvLinkRef} style={{ display: "none" }} />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="grid grid-cols-4 w-full min-w-[400px]">
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
              <TabsTrigger value="reports" className="text-xs md:text-sm">
                <FileText className="h-4 w-4 mr-1 md:mr-2" />
                <span>Relatórios</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Cards de estatísticas */}
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
                      Meta: 120
                    </div>
                  </div>
                  <Progress
                    value={stats?.leadersPercentage || 0}
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round(stats?.leadersPercentage || 0)}% da meta
                    atingida
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
                      {stats?.filledShifts || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total: {stats?.totalShifts || 0}
                    </div>
                  </div>
                  <Progress
                    value={
                      ((stats?.filledShifts || 0) / (stats?.totalShifts || 1)) *
                      100
                    }
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round(
                      ((stats?.filledShifts || 0) / (stats?.totalShifts || 1)) *
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
                      {stats?.partialShifts || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total: {stats?.totalShifts || 0}
                    </div>
                  </div>
                  <Progress
                    value={
                      ((stats?.partialShifts || 0) /
                        (stats?.totalShifts || 1)) *
                      100
                    }
                    className="h-2 mt-2"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-muted-foreground">
                      {Math.round(
                        ((stats?.partialShifts || 0) /
                          (stats?.totalShifts || 1)) *
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
                      {stats?.emptyShifts || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total: {stats?.totalShifts || 0}
                    </div>
                  </div>
                  <Progress
                    value={
                      ((stats?.emptyShifts || 0) / (stats?.totalShifts || 1)) *
                      100
                    }
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round(
                      ((stats?.emptyShifts || 0) / (stats?.totalShifts || 1)) *
                        100
                    )}
                    % dos horários sem líderes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos e recomendações */}
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
                          {stats?.filledShifts || 0}
                        </span>
                      </div>
                      <div className="h-5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success"
                          style={{
                            width: `${
                              ((stats?.filledShifts || 0) /
                                (stats?.totalShifts || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Parciais</span>
                        <span className="font-medium">
                          {stats?.partialShifts || 0}
                        </span>
                      </div>
                      <div className="h-5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warning"
                          style={{
                            width: `${
                              ((stats?.partialShifts || 0) /
                                (stats?.totalShifts || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Vazios</span>
                        <span className="font-medium">
                          {stats?.emptyShifts || 0}
                        </span>
                      </div>
                      <div className="h-5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-destructive"
                          style={{
                            width: `${
                              ((stats?.emptyShifts || 0) /
                                (stats?.totalShifts || 1)) *
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
                      {/* Círculo de progresso simulado */}
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
                      {getRecommendedShifts().map((shift) => (
                        <div
                          key={shift.id}
                          className="py-2 border-b last:border-0 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium">
                              {format(shift.date, "dd/MM", { locale: ptBR })} •{" "}
                              {shift.startTime}-{shift.endTime}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {shift.status === "empty"
                                ? "Sem líderes"
                                : `${shift.leaders.length} líder(es)`}
                            </div>
                          </div>
                          <div>{renderShiftStatus(shift.status)}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="border-t px-4 py-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Líderes
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Testemunhos recentes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Testemunhos Recentes</CardTitle>
                  <CardDescription>
                    Relatos dos líderes durante os turnos
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
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

          {/* Tab: Turnos */}
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
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por líder, data ou horário..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

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
                      <SelectTrigger className="h-9 flex-1 min-w-[120px]">
                        <Calendar className="h-4 w-4 mr-2 md:mr-1" />
                        <SelectValue placeholder="Data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as datas</SelectItem>
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="tomorrow">Amanhã</SelectItem>
                        <SelectItem value="thisWeek">Esta semana</SelectItem>
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
                  {/* Versão para desktop */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Horário</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Líderes</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
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
                                  {format(shift.date, "dd/MM/yyyy", {
                                    locale: ptBR,
                                  })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(shift.date, "EEEE", { locale: ptBR })}
                                </div>
                              </TableCell>
                              <TableCell>
                                {shift.startTime} - {shift.endTime}
                              </TableCell>
                              <TableCell>
                                {renderShiftStatus(shift.status)}
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
                                          {getLeaderChurch(leader.id)}
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
                              <TableCell className="text-right">
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
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Versão para mobile (cards) */}
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
                                {format(shift.date, "dd/MM/yyyy", {
                                  locale: ptBR,
                                })}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(shift.date, "EEEE", { locale: ptBR })}
                              </div>
                            </div>
                            <div className="flex items-center">
                              {renderShiftStatus(shift.status)}
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
                              </DropdownMenu>
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
                                      {getLeaderChurch(leader.id)}
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

          {/* Tab: Líderes */}
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
                    <Select defaultValue="all">
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
                    </Select>

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
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaders.slice(0, 10).map((leader) => (
                        <TableRow key={leader.id}>
                          <TableCell>
                            <div className="font-medium">{leader.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Registrado em{" "}
                              {format(leader.registeredAt, "dd/MM/yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{getLeaderChurch(leader.id)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{leader.email}</div>
                            <div className="text-xs text-muted-foreground">
                              {leader.phone}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge>{leader.shifts.length}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
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
                          </TableCell>
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

          {/* Tab: Relatórios */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

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
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal para horários com apenas um líder */}
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
                {/* Versão para desktop */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead>Líder Atual</TableHead>
                        <TableHead>Igreja</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {singleLeaderShifts.slice(0, 10).map((shift) => (
                        <TableRow key={shift.id}>
                          <TableCell>
                            <div className="font-medium">
                              {format(shift.date, "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(shift.date, "EEEE", { locale: ptBR })}
                            </div>
                          </TableCell>
                          <TableCell>
                            {shift.startTime} - {shift.endTime}
                          </TableCell>
                          <TableCell>
                            {shift.leaders[0]?.name || "Sem líder"}
                          </TableCell>
                          <TableCell>
                            {getLeaderChurch(shift.leaders[0]?.id || "")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Adicionar Líder
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Versão para mobile (cards) */}
                <div className="md:hidden">
                  {singleLeaderShifts.slice(0, 10).map((shift) => (
                    <div
                      key={shift.id}
                      className="p-3 border-b last:border-b-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-sm">
                            {format(shift.date, "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(shift.date, "EEEE", { locale: ptBR })}
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
                          {getLeaderChurch(shift.leaders[0]?.id || "")}
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
