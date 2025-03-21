"use client";

import { useState, useRef } from "react";
import { format } from "date-fns";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@p40/components/ui/tabs";
import { ShiftManagement } from "./shift-management";
import { ExportData } from "./export-data";
import { TestimonyList } from "./testimony-list";
import { ReportList } from "./report-list";
import { DashboardFilters } from "./dashboard-filters";
import type {
  Shift,
  Leader,
  Church,
  ShiftReport,
  Testimony,
  FilterOptions,
} from "./types";
import { toast } from "@p40/hooks/use-toast";

interface DashboardPageProps {
  initialShifts: Shift[];
  initialLeaders: Leader[];
  initialChurches: Church[];
  initialReports: ShiftReport[];
  initialTestimonies: Testimony[];
}

export function DashboardPage({
  initialShifts,
  initialLeaders,
  initialChurches,
  initialReports,
  initialTestimonies,
}: DashboardPageProps) {
  // State
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [leaders, setLeaders] = useState<Leader[]>(initialLeaders);
  const [reports, setReports] = useState<ShiftReport[]>(initialReports);
  const [testimonies, setTestimonies] =
    useState<Testimony[]>(initialTestimonies);
  const [activeTab, setActiveTab] = useState("shifts");
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    churchFilter: "all",
    dateFilter: "all",
    statusFilter: "all",
  });

  // Refs
  const csvLinkRef = useRef<HTMLAnchorElement>(null);

  // Add leader to shift
  const handleAddLeader = (shiftId: string, leaderId: string) => {
    // Find the shift and leader
    const shift = shifts.find((s) => s.id === shiftId);
    const leader = leaders.find((l) => l.id === leaderId);

    if (!shift || !leader) return;

    // Check if leader is already in the shift
    if (shift.leaders.some((l) => l.id === leaderId)) {
      toast({
        title: "Líder já adicionado",
        description: `${leader.name} já está neste turno.`,
        variant: "destructive",
      });
      return;
    }

    // Update shift status
    let newStatus = shift.status;
    if (shift.leaders.length === 0) {
      newStatus = "partial";
    } else if (shift.leaders.length === 1) {
      newStatus = "full";
    }

    // Update shifts
    setShifts((prevShifts) =>
      prevShifts.map((s) =>
        s.id === shiftId
          ? {
              ...s,
              leaders: [...s.leaders, leader],
              status: newStatus,
            }
          : s
      )
    );

    // Update leader's shifts
    setLeaders((prevLeaders) =>
      prevLeaders.map((l) =>
        l.id === leaderId ? { ...l, shifts: [...l.shifts, shift] } : l
      )
    );

    toast({
      title: "Líder adicionado",
      description: `${leader.name} foi adicionado ao turno com sucesso.`,
    });
  };

  // Remove leader from shift
  const handleRemoveLeader = (shiftId: string, leaderId: string) => {
    // Find the shift and leader
    const shift = shifts.find((s) => s.id === shiftId);
    const leader = leaders.find((l) => l.id === leaderId);

    if (!shift || !leader) return;

    // Update shift status
    let newStatus = shift.status;
    if (shift.leaders.length === 2) {
      newStatus = "partial";
    } else if (shift.leaders.length === 1) {
      newStatus = "empty";
    }

    // Update shifts
    setShifts((prevShifts) =>
      prevShifts.map((s) =>
        s.id === shiftId
          ? {
              ...s,
              leaders: s.leaders.filter((l) => l.id !== leaderId),
              status: newStatus,
            }
          : s
      )
    );

    // Update leader's shifts
    setLeaders((prevLeaders) =>
      prevLeaders.map((l) =>
        l.id === leaderId
          ? { ...l, shifts: l.shifts.filter((s) => s.id !== shiftId) }
          : l
      )
    );

    toast({
      title: "Líder removido",
      description: `${leader.name} foi removido do turno com sucesso.`,
    });
  };

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

  // View report details
  const handleViewReportDetails = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    // In a real app, you would show a modal with the report details
    toast({
      title: "Detalhes do relatório",
      description: `Visualizando relatório de ${
        report.leaderName
      } do dia ${format(report.date, "dd/MM/yyyy")}.`,
    });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
      churchFilter: "all",
      dateFilter: "all",
      statusFilter: "all",
    });
  };

  const handleExportShifts = () => {
    const headers = [
      "Data",
      "Dia da Semana",
      "Horário",
      "Status",
      "Líderes",
      "Igreja",
    ];

    // Format data for CSV
    const csvData = shifts.map((shift) => {
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
          const church = initialChurches.find((c) => c.id === leader.church);
          return church?.name || "";
        })
        .filter((name) => name !== "")
        .join(", ");

      return [date, time, status, leaderNames, churchNames];
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
      csvLinkRef.current.download = `turnos-oracao-${format(
        new Date(),
        "dd-MM-yyyy"
      )}.csv`;
      csvLinkRef.current.click();
    }

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);

    toast({
      title: "Exportação concluída",
      description: "Os dados dos turnos foram exportados com sucesso.",
    });
  };

  // Export leaders to CSV
  const handleExportLeaders = () => {
    // Headers for the CSV
    const headers = [
      "Nome",
      "Email",
      "Telefone",
      "Igreja",
      "Turnos",
      "Data de Registro",
    ];

    // Format data for CSV
    const csvData = leaders.map((leader) => {
      const name = leader.name;
      const email = leader.email;
      const phone = leader.phone;
      const church =
        initialChurches.find((c) => c.id === leader.church)?.name || "";
      const shiftsCount = leader.shifts.length;
      const registeredAt = format(leader.registeredAt, "dd/MM/yyyy");

      return [name, email, phone, church, shiftsCount.toString(), registeredAt];
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
      csvLinkRef.current.download = `lideres-oracao-${format(
        new Date(),
        "dd-MM-yyyy"
      )}.csv`;
      csvLinkRef.current.click();
    }

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);

    toast({
      title: "Exportação concluída",
      description: "Os dados dos líderes foram exportados com sucesso.",
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

  return (
    <div className="container px-3 md:px-6 py-4 md:py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard Administrativo
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            40 Dias de Oração - Visão geral e estatísticas
          </p>
        </div>
      </div>

      {/* Hidden link for CSV download */}
      <a ref={csvLinkRef} style={{ display: "none" }} />

      <DashboardFilters
        churches={initialChurches}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="overflow-x-auto pb-2">
          <TabsList className="grid grid-cols-4 w-full min-w-[400px]">
            <TabsTrigger value="shifts" className="text-xs md:text-sm">
              Turnos
            </TabsTrigger>
            <TabsTrigger value="testimonies" className="text-xs md:text-sm">
              Testemunhos
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs md:text-sm">
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs md:text-sm">
              Exportar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="shifts" className="mt-0">
          <ShiftManagement
            shifts={shifts}
            leaders={leaders}
            churches={initialChurches}
            reports={reports}
            testimonies={testimonies}
            onAddLeader={handleAddLeader}
            onRemoveLeader={handleRemoveLeader}
            onFilterChange={handleFilterChange}
            onExportShifts={handleExportShifts}
          />
        </TabsContent>

        <TabsContent value="testimonies" className="mt-0">
          <TestimonyList
            testimonies={testimonies}
            onApproveTestimony={handleApproveTestimony}
            onRejectTestimony={handleRejectTestimony}
          />
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          <ReportList
            reports={reports}
            onViewReportDetails={handleViewReportDetails}
          />
        </TabsContent>

        <TabsContent value="export" className="mt-0">
          <ExportData
            shifts={shifts}
            leaders={leaders}
            testimonies={testimonies}
            onExportShifts={handleExportShifts}
            onExportLeaders={handleExportLeaders}
            onExportTestimonies={handleExportTestimonies}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
