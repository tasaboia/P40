"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Users, Info, Search, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { Button } from "@p40/components/ui/button";
import { ScrollArea } from "@p40/components/ui/scroll-area";
import { Badge } from "@p40/components/ui/badge";
import { Input } from "@p40/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@p40/components/ui/select";
import type { ShiftReport } from "./types";

interface ReportListProps {
  reports: ShiftReport[];
  onViewReportDetails: (reportId: string) => void;
}

export function ReportList({ reports, onViewReportDetails }: ReportListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Filter reports based on search term and date filter
  const filteredReports = reports.filter((report) => {
    // Search filter
    const searchMatch =
      searchTerm === "" ||
      report.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(report.date, "dd/MM/yyyy").includes(searchTerm);

    // Date filter
    let dateMatch = true;
    if (dateFilter !== "all") {
      const today = new Date();
      const reportDate = new Date(report.date);

      if (dateFilter === "today") {
        dateMatch =
          reportDate.getDate() === today.getDate() &&
          reportDate.getMonth() === today.getMonth() &&
          reportDate.getFullYear() === today.getFullYear();
      } else if (dateFilter === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        dateMatch =
          reportDate.getDate() === yesterday.getDate() &&
          reportDate.getMonth() === yesterday.getMonth() &&
          reportDate.getFullYear() === yesterday.getFullYear();
      } else if (dateFilter === "thisWeek") {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        dateMatch = reportDate >= startOfWeek && reportDate <= endOfWeek;
      }
    }

    return searchMatch && dateMatch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios de Turno</CardTitle>
        <CardDescription>
          Informações reportadas pelos líderes após cada turno
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por líder ou conteúdo..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as datas</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="thisWeek">Esta semana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredReports.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4 -mr-4">
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="border rounded-lg p-4 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onViewReportDetails(report.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {format(report.date, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <Badge variant="outline" className="bg-primary/10">
                        <Users className="h-3 w-3 mr-1" />
                        {report.attendees} participantes
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reportado por: {report.leaderName}
                    </div>
                    <p className="text-sm line-clamp-2">{report.notes}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <div className="flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        <span>Relatório do turno</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">
                Nenhum relatório encontrado
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                {searchTerm || dateFilter !== "all"
                  ? "Nenhum relatório corresponde aos critérios de busca."
                  : "Não há relatórios registrados pelos líderes."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
