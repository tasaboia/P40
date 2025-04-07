import * as XLSX from 'xlsx';
import { format } from "date-fns";
import type { DashboadLeader, Shift, Testimony } from "@p40/common/contracts/dashboard/dashboard";
import { DashboardService } from "@p40/services/dashboard/dashboard.service";

export class ExportService {
  static async exportLeadersToExcel(leaders: DashboadLeader[]) {
    // Primeiro, vamos buscar todas as áreas de serviço disponíveis
    const dashboardService = new DashboardService();
    const allServiceAreas = await dashboardService.getAllServiceAreas();

    // Preparar os dados para o Excel
    const data = leaders.map((l) => {
      // Dados básicos do líder
      const baseData = {
        "Nome": l.name?.trim() || "",
        "Email": l.email?.trim() || "",
        "WhatsApp": l.whatsapp?.trim() || "",
        "Tem Turnos": l.userShifts?.length > 0 ? "Sim" : "Não",
        "Quantidade de Turnos": l.userShifts?.length || 0,
      };

      // Adicionar uma coluna para cada área de serviço
      const serviceAreasColumns = allServiceAreas.reduce((acc, area) => {
        const hasArea = l.serviceAreas?.some(
          sa => sa.serviceArea.id === area.id
        );
        acc[area.name] = hasArea ? "✓" : "";
        return acc;
      }, {} as Record<string, string>);

      // Combinar dados básicos com as colunas de áreas
      return {
        ...baseData,
        ...serviceAreasColumns
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Líderes");

    // Ajustando largura das colunas
    const colWidths = [
      { wch: 30 }, // Nome
      { wch: 35 }, // Email
      { wch: 20 }, // WhatsApp
      { wch: 15 }, // Tem Turnos
      { wch: 20 }, // Quantidade de Turnos
      ...allServiceAreas.map(() => ({ wch: 15 })) // Largura para cada área de serviço
    ];
    ws["!cols"] = colWidths;

    // Salvando o arquivo
    const fileName = `lideres-${format(new Date(), "dd-MM-yyyy")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  static exportShiftsToCSV(shifts: Shift[]) {
    const headers = ["Data", "Dia da Semana", "Horário", "Status", "Líderes", "Igreja"];
    const csvData = shifts.map((shift) => {
      const weekday = shift.weekday;
      const time = `${shift.startTime} - ${shift.endTime}`;
      const status = this.translateStatus(shift.status);
      const leaderNames = shift.leaders.map((leader) => leader.name).join(", ");
      const churchNames = shift.church?.name || "Sem igreja";

      return [weekday, time, status, leaderNames, churchNames];
    });

    return this.generateCSVFile(csvData, headers, "turnos-oracao");
  }

  static exportTestimoniesToCSV(testimonies: Testimony[]) {
    const headers = ["Líder", "Data", "Conteúdo", "Aprovado"];
    const csvData = testimonies.map((t) => [
      t.user.name,
      format(t.date, "dd/MM/yyyy"),
      t.content,
      t.approved ? "Sim" : "Não",
    ]);

    return this.generateCSVFile(csvData, headers, "testemunhos");
  }

  static exportSingleLeaderShiftsToCSV(shifts: Shift[]) {
    const headers = ["Nome", "Email", "WhatsApp", "Inicio do turno", "Fim do turno"];
    const csvData = shifts.flatMap((shift) => {
      return (shift.leaders || []).map((leader) => [
        leader.name || "Sem nome",
        leader.email || "Sem email",
        leader.whatsapp || "Sem WhatsApp",
        shift.prayerTurn?.startTime || "",
        shift.prayerTurn?.endTime || "",
      ]);
    });

    return this.generateCSVFile(csvData, headers, "lideres");
  }

  private static translateStatus(status?: string): string {
    switch (status) {
      case "empty":
        return "Vazio";
      case "partial":
        return "Parcial";
      case "full":
        return "Completo";
      default:
        return "Desconhecido";
    }
  }

  private static generateCSVFile(data: any[], headers: string[], filePrefix: string): string {
    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    return URL.createObjectURL(blob);
  }
} 