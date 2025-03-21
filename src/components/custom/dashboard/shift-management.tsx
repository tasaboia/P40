"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search,
  ChevronDown,
  UserPlus,
  UserMinus,
  MessageSquareQuote,
  FileText,
  Clock,
  Calendar,
  AlertCircle,
  X,
  UserCheck,
  Building,
} from "lucide-react";
import { Button } from "@p40/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@p40/components/ui/dropdown-menu";
import { Badge } from "@p40/components/ui/badge";
import type {
  Shift,
  Leader,
  Church,
  FilterOptions,
  ShiftReport,
  Testimony,
} from "./types";
import { RemoveLeaderDialog } from "./remove-leader-dialog";
import { ShiftReportDialog } from "./shift-report-dialog";
import { TestimonyDialog } from "./testimony-dialog";
import { AddLeaderDialog } from "./add-leader";

interface ShiftManagementProps {
  shifts: Shift[];
  leaders: Leader[];
  churches: Church[];
  reports: ShiftReport[];
  testimonies: Testimony[];
  onAddLeader: (shiftId: string, leaderId: string) => void;
  onRemoveLeader: (shiftId: string, leaderId: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  onExportShifts: () => void;
}

export function ShiftManagement({
  shifts,
  leaders,
  churches,
  reports,
  testimonies,
  onAddLeader,
  onRemoveLeader,
  onFilterChange,
  onExportShifts,
}: ShiftManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [churchFilter, setChurchFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showSingleLeaderShifts, setShowSingleLeaderShifts] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Dialogs state
  const [addLeaderDialogOpen, setAddLeaderDialogOpen] = useState(false);
  const [removeLeaderDialogOpen, setRemoveLeaderDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [testimonyDialogOpen, setTestimonyDialogOpen] = useState(false);

  // Filtered shifts based on current filters
  const filteredShifts = shifts.filter((shift) => {
    // Filter logic implementation
    // Search filter
    const searchMatch =
      searchTerm === "" ||
      shift.leaders.some((leader) =>
        leader.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      format(shift.date, "dd/MM/yyyy").includes(searchTerm) ||
      shift.startTime.includes(searchTerm) ||
      shift.endTime.includes(searchTerm);

    // Church filter
    const churchMatch =
      churchFilter === "all" ||
      shift.leaders.some((leader) => {
        const leaderFull = leaders.find((l) => l.id === leader.id);
        return leaderFull?.church === churchFilter;
      });

    // Date filter
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

    // Status filter
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "empty" && shift.status === "empty") ||
      (statusFilter === "partial" && shift.status === "partial") ||
      (statusFilter === "full" && shift.status === "full");

    return searchMatch && churchMatch && dateMatch && statusMatch;
  });

  // Single leader shifts
  const singleLeaderShifts = shifts.filter(
    (shift) => shift.leaders.length === 1
  );

  // Display shifts based on filter
  const displayShifts = showSingleLeaderShifts
    ? singleLeaderShifts
    : filteredShifts;

  // Apply filters
  const applyFilters = () => {
    onFilterChange({
      searchTerm,
      churchFilter,
      dateFilter,
      statusFilter,
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setChurchFilter("all");
    setDateFilter("all");
    setStatusFilter("all");
    setShowSingleLeaderShifts(false);

    onFilterChange({
      searchTerm: "",
      churchFilter: "all",
      dateFilter: "all",
      statusFilter: "all",
    });
  };

  // Handle add leader
  const handleAddLeader = (leaderId: string) => {
    if (selectedShift) {
      onAddLeader(selectedShift.id, leaderId);
      setAddLeaderDialogOpen(false);
    }
  };

  // Handle remove leader
  const handleRemoveLeader = (leaderId: string) => {
    if (selectedShift) {
      onRemoveLeader(selectedShift.id, leaderId);
      setRemoveLeaderDialogOpen(false);
    }
  };

  // Get shift reports
  const getShiftReports = (shiftId: string) => {
    return reports.filter((report) => report.shiftId === shiftId);
  };

  // Get shift testimonies
  const getShiftTestimonies = (shiftId: string) => {
    // In a real app, you would link testimonies to shifts
    // For now, we'll just return some testimonies for demo purposes
    return testimonies.slice(0, 3);
  };

  // Get leader church name
  const getLeaderChurch = (leaderId: string) => {
    const leader = leaders.find((l) => l.id === leaderId);
    if (!leader) return "";

    const church = churches.find((c) => c.id === leader.church);
    return church?.name || "";
  };

  // Render shift status badge
  const renderShiftStatus = (status: string) => {
    switch (status) {
      case "empty":
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            <X className="h-3 w-3 mr-1" />
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
            <UserCheck className="h-3 w-3 mr-1" />
            Completo
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                applyFilters();
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setShowSingleLeaderShifts(!showSingleLeaderShifts)}
            >
              {showSingleLeaderShifts ? "Mostrar Todos" : "Só Um Líder"}
            </Button>

            <Select
              value={dateFilter}
              onValueChange={(value) => {
                setDateFilter(value);
                applyFilters();
              }}
            >
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
              onValueChange={(value) => {
                setStatusFilter(value);
                applyFilters();
              }}
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

            <Select
              value={churchFilter}
              onValueChange={(value) => {
                setChurchFilter(value);
                applyFilters();
              }}
            >
              <SelectTrigger className="h-9 flex-1 min-w-[120px]">
                <Building className="h-4 w-4 mr-2 md:mr-1" />
                <SelectValue placeholder="Igreja" />
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

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 ml-auto"
              onClick={resetFilters}
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
                {displayShifts.slice(0, 10).map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>
                      <div className="font-medium">
                        {format(shift.date, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(shift.date, "EEEE", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {shift.startTime} - {shift.endTime}
                    </TableCell>
                    <TableCell>{renderShiftStatus(shift.status)}</TableCell>
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
                          <DropdownMenuLabel>Gerenciar Turno</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedShift(shift);
                              setAddLeaderDialogOpen(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Adicionar líder
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedShift(shift);
                              setRemoveLeaderDialogOpen(true);
                            }}
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remover líder
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedShift(shift);
                              setReportDialogOpen(true);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver relatórios
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedShift(shift);
                              setTestimonyDialogOpen(true);
                            }}
                          >
                            <MessageSquareQuote className="h-4 w-4 mr-2" />
                            Ver testemunhos
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
            {displayShifts.slice(0, 10).map((shift) => (
              <div key={shift.id} className="p-4 border-b last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-sm">
                      {format(shift.date, "dd/MM/yyyy", { locale: ptBR })}
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
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedShift(shift);
                            setAddLeaderDialogOpen(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar líder
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedShift(shift);
                            setRemoveLeaderDialogOpen(true);
                          }}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remover líder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedShift(shift);
                            setReportDialogOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Ver relatórios
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedShift(shift);
                            setTestimonyDialogOpen(true);
                          }}
                        >
                          <MessageSquareQuote className="h-4 w-4 mr-2" />
                          Ver testemunhos
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
                  <div className="text-xs font-medium mb-1">Líderes:</div>
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
            Mostrando {Math.min(10, displayShifts.length)} de{" "}
            {displayShifts.length} turnos
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

      {/* Add Leader Dialog */}
      {selectedShift && (
        <AddLeaderDialog
          open={addLeaderDialogOpen}
          onOpenChange={setAddLeaderDialogOpen}
          shift={selectedShift}
          leaders={leaders.filter(
            (leader) => !selectedShift.leaders.some((l) => l.id === leader.id)
          )}
          churches={churches}
          onAddLeader={handleAddLeader}
        />
      )}

      {/* Remove Leader Dialog */}
      {selectedShift && (
        <RemoveLeaderDialog
          open={removeLeaderDialogOpen}
          onOpenChange={setRemoveLeaderDialogOpen}
          shift={selectedShift}
          onRemoveLeader={handleRemoveLeader}
        />
      )}

      {/* Shift Report Dialog */}
      {selectedShift && (
        <ShiftReportDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          shift={selectedShift}
          reports={getShiftReports(selectedShift.id)}
        />
      )}

      {/* Testimony Dialog */}
      {selectedShift && (
        <TestimonyDialog
          open={testimonyDialogOpen}
          onOpenChange={setTestimonyDialogOpen}
          shift={selectedShift}
          testimonies={getShiftTestimonies(selectedShift.id)}
        />
      )}
    </Card>
  );
}
