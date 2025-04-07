"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useMemo,
} from "react";
import { format } from "date-fns";
import * as Contracts from "../contracts/dashboard/dashboard";
import { toast } from "@p40/hooks/use-toast";
import * as XLSX from 'xlsx';
import { ExportService } from "@p40/services/export/export.service";

interface DashboardContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: Contracts.Stats;
  leaders: Contracts.DashboadLeader[];
  shifts: Contracts.Shift[];
  singleLeaderShifts: Contracts.Shift[];
  testimonies: any[];
  reports: any[];
  searchTerm: string;
  dateFilter: string;
  statusFilter: string;
  setTestimonies: (value: any[]) => void;
  filteredShifts: Contracts.Shift[];
  exportToCSV: () => void;
  exportLeadersToCSV: () => void;
  exportTestimoniesToCSV: () => void;
  exportSingleLeaderShiftsToCSV: () => void;
  exportExportShifts: () => void;
  getRecommendedShifts: () => Contracts.Shift[];
  handleApproveTestimony: (id: string) => void;
  handleRejectTestimony: (id: string) => void;
  setSearchTerm: (value: string) => void;
  setDateFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  updateTestimony: (id: string, data: Partial<Contracts.Testimony>) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard deve ser usado dentro do DashboardProvider");
  }
  return context;
}

export function DashboardProvider({
  children,
  statsData,
  shiftsData,
  singleLeaderShiftsData,
  leadersData,
  testimoniesData,
}: {
  children: ReactNode;
  statsData: Contracts.DashboardStatsResponse;
  shiftsData: Contracts.ShiftResponse;
  singleLeaderShiftsData: Contracts.SingleLeaderShiftResponse;
  leadersData: Contracts.LeadersDashboardResponse;
  testimoniesData: Contracts.TestimonyDashboardResponse;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats] = useState(statsData.data);
  const [leaders] = useState(leadersData.data);
  const [shifts] = useState(shiftsData.data);
  const [singleLeaderShifts] = useState(singleLeaderShiftsData.data);
  const [testimonies, setTestimonies] = useState<Contracts.Testimony[]>(
    testimoniesData.data
  );
  const [reports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("0");
  const [statusFilter, setStatusFilter] = useState("all");
  const csvLinkRef = useRef<HTMLAnchorElement>(null);

  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const searchMatch =
        searchTerm === "" ||
        shift.leaders.some((leader) =>
          leader.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const weekdayMatch =
        dateFilter === "all" || shift.weekday === parseInt(dateFilter);
      const statusMatch =
        statusFilter === "all" || shift.status === statusFilter;
      return searchMatch && weekdayMatch && statusMatch;
    });
  }, [shifts, searchTerm, dateFilter, statusFilter]);

  const exportToCSV = () => {
    const headers = ["Dia da Semana", "Horário", "Status", "Líderes"];
    const csvData = filteredShifts.map((shift) => {
      const time = `${shift.startTime} - ${shift.endTime}`;
      const weekday = shift.weekday;
      const status = shift.status;
      const leaderNames = shift.leaders.map((l) => l.name).join(", ");
      return [weekday, time, status, leaderNames];
    });
    const csvContent = [headers, ...csvData].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    if (csvLinkRef.current) {
      csvLinkRef.current.href = url;
      csvLinkRef.current.download = `relatorio-${format(
        new Date(),
        "dd-MM-yyyy"
      )}.csv`;
      csvLinkRef.current.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const exportLeadersToCSV = async () => {
    try {
      await ExportService.exportLeadersToExcel(leaders);
      toast({
        title: "Exportação concluída",
        description: "Os dados dos líderes foram exportados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao exportar líderes:", error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados dos líderes.",
        variant: "destructive",
      });
    }
  };

  const exportSingleLeaderShiftsToCSV = () => {
    const url = ExportService.exportSingleLeaderShiftsToCSV(singleLeaderShifts);
    if (csvLinkRef.current) {
      csvLinkRef.current.href = url;
      csvLinkRef.current.download = `lideres-${format(new Date(), "dd-MM-yyyy")}.csv`;
      csvLinkRef.current.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 100);

    toast({
      title: "Exportação concluída",
      description: "Os dados dos líderes foram exportados com sucesso.",
    });
  };

  const exportTestimoniesToCSV = () => {
    const url = ExportService.exportTestimoniesToCSV(testimonies);
    if (csvLinkRef.current) {
      csvLinkRef.current.href = url;
      csvLinkRef.current.download = `testemunhos-${format(new Date(), "dd-MM-yyyy")}.csv`;
      csvLinkRef.current.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 100);

    toast({
      title: "Exportação concluída",
      description: "Os testemunhos foram exportados com sucesso.",
    });
  };

  const exportExportShifts = () => {
    const url = ExportService.exportShiftsToCSV(shifts);
    if (csvLinkRef.current) {
      csvLinkRef.current.href = url;
      csvLinkRef.current.download = `turnos-oracao-${format(new Date(), "dd-MM-yyyy")}.csv`;
      csvLinkRef.current.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 100);

    toast({
      title: "Exportação concluída",
      description: "Os dados dos turnos foram exportados com sucesso.",
    });
  };

  const getRecommendedShifts = () => {
    const emptyShifts = shifts.filter((s) => s.status === "empty");
    const partialShifts = shifts.filter((s) => s.status === "partial");
    const nightEmpty = emptyShifts.filter((s) => {
      const hour = parseInt(s.startTime.split(":")[0]);
      return hour >= 0 && hour <= 5;
    });
    const singleLeader = partialShifts.filter((s) => s.leaders.length === 1);
    return [
      ...nightEmpty,
      ...singleLeader,
      ...emptyShifts.filter((s) => !nightEmpty.includes(s)),
    ].slice(0, 10);
  };

  const handleApproveTestimony = (id: string) => {
    setTestimonies((prev) =>
      prev.map((t) => (t.id === id ? { ...t, approved: true } : t))
    );
    toast({ title: "Testemunho aprovado" });
  };

  const handleRejectTestimony = (id: string) => {
    setTestimonies((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Testemunho recusado" });
  };

  const updateTestimony = (id: string, data: Partial<Contracts.Testimony>) => {
    setTestimonies(prev => 
      prev.map(testimony => 
        testimony.id === id 
          ? { ...testimony, ...data }
          : testimony
      )
    );
  };

  return (
    <DashboardContext.Provider
      value={{
        activeTab,
        setActiveTab,
        stats,
        leaders,
        shifts,
        singleLeaderShifts,
        testimonies,
        reports,
        setTestimonies,
        filteredShifts,
        exportToCSV,
        exportLeadersToCSV,
        exportTestimoniesToCSV,
        exportSingleLeaderShiftsToCSV,
        exportExportShifts,
        getRecommendedShifts,
        handleApproveTestimony,
        handleRejectTestimony,
        dateFilter,
        searchTerm,
        setDateFilter,
        setSearchTerm,
        setStatusFilter,
        statusFilter,
        updateTestimony,
      }}
    >
      {children}
      <a ref={csvLinkRef} style={{ display: "none" }} />
    </DashboardContext.Provider>
  );
}
