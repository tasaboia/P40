"use client";

import { Download, FileText, Users, MessageSquareQuote } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { Button } from "@p40/components/ui/button";
import type { Shift, Leader, Testimony } from "./types";

interface ExportDataProps {
  shifts: Shift[];
  leaders: Leader[];
  testimonies: Testimony[];
  onExportShifts: () => void;
  onExportLeaders: () => void;
  onExportTestimonies: () => void;
}

export function ExportData({
  shifts,
  leaders,
  testimonies,
  onExportShifts,
  onExportLeaders,
  onExportTestimonies,
}: ExportDataProps) {
  return (
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
            onClick={onExportShifts}
            className="flex items-center justify-center h-10"
          >
            <FileText className="h-4 w-4 mr-2" />
            Exportar Turnos ({shifts.length})
          </Button>
          <Button
            variant="outline"
            onClick={onExportLeaders}
            className="flex items-center justify-center h-10"
          >
            <Users className="h-4 w-4 mr-2" />
            Exportar Líderes ({leaders.length})
          </Button>
          <Button
            variant="outline"
            onClick={onExportTestimonies}
            className="flex items-center justify-center h-10"
          >
            <MessageSquareQuote className="h-4 w-4 mr-2" />
            Exportar Testemunhos ({testimonies.length})
          </Button>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm">
          <p className="flex items-center">
            <Download className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              Os arquivos serão exportados em formato CSV, compatível com Excel
              e Google Sheets.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
