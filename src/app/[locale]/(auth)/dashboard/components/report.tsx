import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDashboard } from "@p40/common/context/dashboard-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  ScrollArea,
} from "@p40/components/ui";
import { ExportData } from "@p40/components/custom/dashboard/export-data";

export default function Report() {
  const { testimonies } = useDashboard();
  return (
    <>
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
                    <div className="font-medium">{testimony.name}</div>
                    <Badge
                      variant={testimony.approved ? "outline" : "secondary"}
                      className={
                        testimony.approved ? "bg-success/10 text-success" : ""
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
      <ExportData />
    </>
  );
}
