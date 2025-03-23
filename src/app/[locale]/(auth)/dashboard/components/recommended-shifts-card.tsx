import { useState } from "react";
import { RenderShiftStatus } from "./render-shift-status";
import * as UI from "@p40/components/ui/index";
import { useDashboard } from "@p40/common/context/dashboard-context";
import { Helpers } from "@p40/common/utils/helpers";

export default function RecommendedShiftsCard() {
  const { getRecommendedShifts } = useDashboard();

  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 5; // número de itens por página

  const allShifts = getRecommendedShifts();
  const totalPages = Math.ceil(allShifts.length / pageSize);

  const paginatedShifts = allShifts.slice(
    pageIndex * pageSize,
    pageIndex * pageSize + pageSize
  );

  return (
    <UI.Card>
      <UI.CardHeader>
        <UI.CardTitle>Horários Recomendados</UI.CardTitle>
        <UI.CardDescription>Sugestões para priorizar</UI.CardDescription>
      </UI.CardHeader>
      <UI.CardContent className="p-0">
        <div className="px-4 py-2 space-y-2">
          {paginatedShifts.map((shift) => (
            <div
              key={shift.id}
              className="py-2 border-b last:border-0 flex justify-between items-center"
            >
              <div>
                <div className="font-medium">
                  {Helpers.getWeekdayName(shift.weekday)} • {shift.startTime} -{" "}
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
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 pt-2">
            <UI.Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
              disabled={pageIndex === 0}
            >
              Anterior
            </UI.Button>
            <span className="text-xs text-muted-foreground">
              Página {pageIndex + 1} de {totalPages}
            </span>
            <UI.Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPageIndex((p) => Math.min(p + 1, totalPages - 1))
              }
              disabled={pageIndex >= totalPages - 1}
            >
              Próximo
            </UI.Button>
          </div>
        )}
      </UI.CardContent>
    </UI.Card>
  );
}
